package com.izerocs.smarthome.network.websocket

import android.net.Network
import android.util.Base64
import com.izerocs.smarthome.network.websocket.exceptions.IllegalSchemeException
import com.izerocs.smarthome.network.websocket.exceptions.InvalidServerHandshakeException
import com.izerocs.smarthome.network.websocket.exceptions.UnknownOpcodeException
import okhttp3.internal.notify
import okhttp3.internal.wait
import org.apache.commons.codec.digest.DigestUtils
import org.apache.http.HttpException
import org.apache.http.HttpResponse
import org.apache.http.StatusLine
import org.apache.http.impl.conn.DefaultHttpResponseParser
import org.apache.http.impl.io.HttpTransportMetricsImpl
import org.apache.http.impl.io.SessionInputBufferImpl
import org.apache.http.io.HttpMessageParser
import java.io.BufferedInputStream
import java.io.BufferedOutputStream
import java.io.IOException
import java.io.InputStream
import java.net.InetSocketAddress
import java.net.Socket
import java.net.URI
import java.nio.charset.Charset
import java.security.SecureRandom
import java.util.*
import javax.net.SocketFactory

/**
 * Created by IzeroCs on 2020-05-16
 */
class WebSocketClient {
    private var autoReconnect : Boolean = true
    private var pendingMessages : Boolean = false
    private var isRunning : Boolean = false
    private var isClosed : Boolean = false

    private var globalLock : Any = Any()
    private var internalLock : Any = Any()
    private var uriClient : URI? = null
    private var socket : Socket? = null
    private var network : Network? = null
    private var socketFactory : SocketFactory? = null
    private var socketEvent : WebSocketEvent? = null
    private var secureRandom : SecureRandom = SecureRandom()
    private var outBuffer : LinkedList<WebSocketPayload> = LinkedList()
    private var headers : Map<String, String> = mutableMapOf()

    private var reconnectThread : Thread? = null
    private var writeThread : Thread = makeWriteThread()

    private var bufferedInputStream : BufferedInputStream? = null
    private var bufferedOutputStream : BufferedOutputStream? = null

    private var readTimeout : Long = 20000
    private var connectTimeout : Long = 60000
    private var waitReconnectTime : Long = 5000

    companion object {
        const val GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

        const val OPCODE_CONTINUATION = 0x0
        const val OPCODE_TEXT         = 0x1
        const val OPCODE_BINARY       = 0x2
        const val OPCODE_CLOSE        = 0x8
        const val OPCODE_PING         = 0x9
        const val OPCODE_PONG         = 0xA
    }

    constructor(host : String) : this(host, 80)
    constructor(host : String, port : Int) : this(URI("$host:$port"))

    constructor(uri : URI) {
        uriClient = uri
    }

    fun connect() {
        synchronized(globalLock) {
            if (isRunning)
                throw IllegalStateException("WebSocketClient is not reusable")

            isRunning = true
            createStartConnectThread()
        }
    }

    private fun createStartConnectThread() {
        Thread {
            try {
                if (createSocket())
                    startConnect()
            } catch (e : Exception) {
                if (!isClosed)
                    e.printStackTrace()

                synchronized(globalLock) {
                    if (isRunning)
                        closeInternal()

                    socketEvent?.onException(this, e)

                    if (e is IOException && autoReconnect && !isClosed)
                        createStartReconnectThread()
                }
            }
        }.start()
    }

    private fun createStartReconnectThread() {
        reconnectThread = Thread {
            try {
                Thread.sleep(waitReconnectTime)

                synchronized(globalLock) {
                    if (isRunning) {
                        writeThread = makeWriteThread()

                        if (isClosed) {
                            if (socket?.isClosed == false)
                                socket?.close()

                            isClosed = false
                        }

                        createStartConnectThread()
                    }
                }
            } catch (e : InterruptedException) {
                e.printStackTrace()
            }
        }

        reconnectThread?.start()
    }

    @Throws(IOException::class)
    private fun createSocket() : Boolean {
        synchronized(internalLock) {
            if (isClosed)
                return false

            uriClient?.let {
                if (it.scheme == null)
                    return@createSocket throw IllegalSchemeException("The scheme component of the URI cannot be null")

                if (it.scheme != "ws")
                    return@createSocket throw IllegalSchemeException("The scheme component of the URI should be ws or wss")

                if (socketFactory == null)
                    socketFactory = SocketFactory.getDefault()

                socket = socketFactory?.createSocket()
                network?.bindSocket(socket)
                socket?.run{
                    soTimeout = readTimeout.toInt()

                    if (it.port == -1)
                        connect(InetSocketAddress(it.host, 80), connectTimeout.toInt())
                    else
                        connect(InetSocketAddress(it.host, it.port), connectTimeout.toInt())

                    return@createSocket true
                }
            }

            return false
        }
    }

    private fun notifyOnOpen() {
        synchronized(globalLock) {
            if (isRunning)
                socketEvent?.onOpen(this)
        }
    }

    private fun notifyOnTextReceived(message : String) {
        synchronized(globalLock) {
            if(isRunning)
                socketEvent?.onTextReceived(this, message)
        }
    }

    private fun notifyOnBinaryReceived(data : ByteArray) {
        synchronized(globalLock) {
            if(isRunning)
                socketEvent?.onBinaryReceived(this, data)
        }
    }

    private fun notifyOnPingReceived(data : ByteArray) {
        synchronized(globalLock) {
            if(isRunning)
                socketEvent?.onPingReceived(this, data)
        }
    }

    private fun notifyOnPongReceived(data : ByteArray) {
        synchronized(globalLock) {
            if(isRunning)
                socketEvent?.onPongReceived(this, data)
        }
    }

    private fun notifyOnException(e : java.lang.Exception) {
        synchronized(globalLock) {
            if (isRunning)
                socketEvent?.onException(this, e)
        }
    }

    private fun notifyOnCloseReceived() {
        synchronized(globalLock) {
            if(isRunning)
                socketEvent?.onCloseReceived(this)
        }
    }

    private fun makeWriteThread() : Thread {
        return Thread {
            synchronized(internalLock) {
                while (true) {
                    if (!pendingMessages) {
                        try {
                            internalLock.wait()
                        } catch (e : InterruptedException) {
                            e.printStackTrace()
                        }
                    }

                    pendingMessages = false

                    if (socket?.isClosed!!)
                        return@Thread

                    while (outBuffer.size > 0) {
                        val payload = outBuffer.removeFirst()
                        val opcode = payload.getOpcode()
                        val data = payload.getData()

                        try {
                            send(opcode, data)
                        } catch (e : IOException) {
                            e.printStackTrace()
                        }
                    }
                }
            }
        }
    }

    @Throws(IOException::class)
    private fun startConnect() {
        socket?.run {
            val base64Key = WebSocketHandshake.createBase64Key()

            bufferedOutputStream = BufferedOutputStream(getOutputStream(), 65536)
            bufferedOutputStream?.run {
                write(WebSocketHandshake.createHandshake(uriClient!!, base64Key, headers))
                flush()
            }

            val inputStream = getInputStream()
            verifyServerHandshake(inputStream, base64Key)
            writeThread.start()
            notifyOnOpen()
            sendPong(byteArrayOf())

            bufferedInputStream = BufferedInputStream(getInputStream(), 65536)
            readStream()
        }
    }

    @Throws(IOException::class)
    private fun verifyServerHandshake(inputStream : InputStream, webSocketKey : String) {
        try {
            SessionInputBufferImpl(HttpTransportMetricsImpl(), 8192).let { sessionImpl ->
                sessionImpl.bind(inputStream)

                val parser : HttpMessageParser<HttpResponse> = DefaultHttpResponseParser(sessionImpl)
                val response : HttpResponse = parser.parse()
                val statusLine : StatusLine = response.statusLine

                verifyStatusCode(statusLine.statusCode)
                verifyHeader(response, "Upgrade", "websocket")
                verifyHeader(response, "Connection", "upgrade")
                verifyAccept(response, webSocketKey)
            }
        } catch (e : HttpException) {
            throw InvalidServerHandshakeException(e.message);
        }
    }

    @Throws(InvalidServerHandshakeException::class)
    private fun verifyStatusCode(statusCode : Int) {
        if (statusCode != 101)
            throw InvalidServerHandshakeException(
                    "Invalid status code. Expected 101, received: $statusCode")
    }

    @Throws(InvalidServerHandshakeException::class)
    private fun verifyHeader(response : HttpResponse, key : String, match : String?) {
        val header = response.getHeaders(key)

        if (header.size <= 0)
            throw InvalidServerHandshakeException("There is no header named $key")

        if (header[0].value == null)
            throw InvalidServerHandshakeException("There is no value for header $key")

        if (match == null)
            return

        val value = header[0].value.toLowerCase(Locale.ROOT)

        if (value != match)
            throw InvalidServerHandshakeException(
                "Invalid value for header Connection. Expected: ${match.toLowerCase(Locale.ROOT)}, received $value")
    }

    @Throws(InvalidServerHandshakeException::class)
    private fun verifyAccept(response : HttpResponse, webSocketKey : String) {
        verifyHeader(response, "Sec-WebSocket-Accept", null)

        val keyConcat = webSocketKey + GUID
        val hash = DigestUtils.sha1(keyConcat)
        val webSocketAccept = Base64.encodeToString(hash, Base64.DEFAULT).trim()
        val webSocketAcceptValue = response.getHeaders("Sec-WebSocket-Accept")[0].value

        if (webSocketAccept != webSocketAcceptValue)
            throw InvalidServerHandshakeException(
                "Invalid value for header Sec-WebSocket-Accept. Expected: $webSocketAccept, received: $webSocketAcceptValue");
    }

    fun send(message : String) {
        val data = message.toByteArray(Charset.forName("UTF-8"))
        val payload = WebSocketPayload(OPCODE_TEXT, data)

        sendThread(payload)
    }

    fun send(data : ByteArray?) {
        sendThread(WebSocketPayload(OPCODE_BINARY, data as ByteArray))
    }

    fun sendPing(data : ByteArray?) {
        sendThread(WebSocketPayload(OPCODE_PING, data as ByteArray))
    }

    fun sendPong(data : ByteArray?) {
        sendThread(WebSocketPayload(OPCODE_PONG, data as ByteArray))
    }

    private fun sendThread(payload : WebSocketPayload) {
        Thread {
            sendInternal(payload)
        }.start()
    }

    @Throws(IOException::class)
    private fun send(opcode : Int, data : ByteArray?) {
        var nextPosition : Int = 0
        var frame = byteArrayOf()
        val mask = ByteArray(4)
        var length : Int = 0

        if (data != null)
            length = data.size

        if (length < 126) {
            frame = ByteArray(length.plus(6))
            frame[0] = opcode.or(-128).toByte()
            frame[1] = length.or(-128).toByte()

            nextPosition = 2
        } else if (length < 65536) {
            frame = ByteArray(length.plus(8))
            frame[0] = opcode.or(-128).toByte()
            frame[1] = -2

            WebSocketUtils.to2ByteArray(length).let {
                frame[2] = it[0]
                frame[3] = it[1]

                nextPosition = 4
            }
        } else {
            frame = ByteArray(length.plus(14))
            frame[0] = opcode.or(-128).toByte()
            frame[1] = -1

            WebSocketUtils.to8ByteArray(length).let {
                for (i in 0 until 8)
                    frame[i.plus(2)] = it[i]
            }

            nextPosition = 10
        }

        secureRandom.nextBytes(mask)
        frame.let {
            it[nextPosition] = mask[0]
            it[nextPosition.plus(1)] = mask[1]
            it[nextPosition.plus(2)] = mask[2]
            it[nextPosition.plus(3)] = mask[3]

            nextPosition += 4
        }

        for (i in 0 until length) {
            frame[nextPosition] = (data!![i].toInt().xor(mask[i % 4].toInt())).toByte()
            nextPosition++
        }

        bufferedOutputStream?.run {
            write(frame)
            flush()
        }
    }

    @Throws(IOException::class)
    private fun readStream() {
        bufferedInputStream?.let {
            var firstByte : Int = 0

            do {
                firstByte = it.read()

                if (firstByte == -1)
                    break

                val opcode : Int = firstByte.shl(28).ushr(28)
                val secondByte : Int = it.read()
                var payloadLength : Int = secondByte.shl(25).ushr(25)

                if (payloadLength == 126) {
                    val nextToBytes = ByteArray(2)

                    for (i in 0 until 2)
                        nextToBytes[i] = it.read().toByte()

                    payloadLength = WebSocketUtils
                        .fromByteArray(byteArrayOf(0, 0, nextToBytes[0], nextToBytes[1]))
                } else if (payloadLength == 127) {
                    val nextEightBytes = ByteArray(8)

                    for (i in 0 until 8)
                        nextEightBytes[i] = it.read().toByte()

                    payloadLength = WebSocketUtils
                        .fromByteArray(byteArrayOf(nextEightBytes[4], nextEightBytes[5],
                            nextEightBytes[6], nextEightBytes[7]))
                }

                val data = ByteArray(payloadLength)

                for (i in 0 until payloadLength)
                    data[i] = it.read().toByte()

                when (opcode) {
                    OPCODE_CONTINUATION -> sendPong(byteArrayOf())
                    OPCODE_TEXT -> notifyOnTextReceived(String(data, Charset.forName("UTF-8")))
                    OPCODE_BINARY -> notifyOnBinaryReceived(data)
                    OPCODE_PONG -> notifyOnPongReceived(data)

                    OPCODE_CLOSE -> {
                        closeInternal()
                        notifyOnCloseReceived()
                        return@readStream
                    }

                    OPCODE_PING -> {
                        notifyOnPingReceived(data)
                        sendPong(data)
                    }

                    else -> {
                        close()
                        notifyOnException(
                            UnknownOpcodeException("Unknown opcode: 0x" + Integer
                            .toHexString(opcode))
                        )

                        return@readStream
                    }
                }
            } while (true)

            throw IOException("Unexpected end of stream")
        }
    }

    private fun sendInternal(payload : WebSocketPayload) {
        synchronized(internalLock) {
            outBuffer.addLast(payload)
            pendingMessages = true
            internalLock.notify()
        }
    }

    fun close() {
        Thread {
            synchronized(globalLock) {
                isRunning = false

                if (reconnectThread != null)
                    reconnectThread?.interrupt()

                closeInternal()
            }
        }.start()
    }

    private fun closeInternal() {
        try {
            synchronized(internalLock) {
                if (isClosed)
                    return

                isClosed = true

                if (socket == null)
                    return

                socket?.close()
                pendingMessages = true
                internalLock.notify()
            }
        } catch (e : IOException) {
            e.printStackTrace()
        }
    }

    fun setReadTimeout(time : Int) {
        readTimeout = time.toLong()
    }

    fun getReadTimeout() : Int {
        return readTimeout.toInt()
    }

    fun setConnectTimeout(time : Int) {
        connectTimeout = time.toLong()
    }

    fun getConnectTimeout() : Int {
        return connectTimeout.toInt()
    }

    fun setOnWebSocketEvent(event : WebSocketEvent) {
        socketEvent = event
    }

    fun setNetwork(net : Network) {
        network = net
    }

    fun getNetwork() : Network? {
        return network
    }

    fun setSocketFactory(factory : SocketFactory) {
        socketFactory = factory
    }

    fun getSocketFactory() : SocketFactory? {
        return socketFactory
    }

    fun getSocket() : Socket? {
        return socket
    }
}