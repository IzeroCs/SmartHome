package com.izerocs.smarthome.network.websocket

import android.util.Base64
import java.net.URI
import java.nio.charset.Charset
import java.util.*

/**
 * Created by IzeroCs on 2020-05-16
 */
class WebSocketHandshake {
    companion object {
        fun createBase64Key() : String {
            return@createBase64Key Base64
                .encodeToString(generatorKey().toByteArray(), Base64.DEFAULT).trim()
        }

        fun createHandshake(uri : URI, base64Key : String, headers : Map<String, String>?) : ByteArray {
            val builder = StringBuilder()
            val path = uri.rawPath
            val query = uri.rawQuery
            var host = uri.host
            var requestUri = "/$path"

            if (query != null)
                requestUri += "?$query"

            if (uri.port != -1)
                host += ":${uri.port}"

            builder.append("GET $requestUri HTTP/1.1\r\n")
            builder.append("Host: $host\r\n")
            builder.append("Upgrade: websocket\r\n")
            builder.append("Connection: Upgrade\r\n")
            builder.append("Sec-WebSocket-Key: ${base64Key}\r\n")
            builder.append("Sec-WebSocket-Version: 13\r\n")

            headers?.forEach {
                builder.append("${it.key}: ${it.value}")
                builder.append("\r\n")
            }

            builder.append("\r\n").run {
                val handshake = toString()
                val bytes = handshake.toByteArray(Charset.forName("ASCII"))

                return@createHandshake bytes
            }
        }

        fun generatorKey(length : Int = 36) : String {
            val chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
            val builder = StringBuilder()
            val random = Random()

            for (i in 0 until length)
                builder.append(chars[random.nextInt(chars.length)])

            return builder.toString()
        }
    }
}