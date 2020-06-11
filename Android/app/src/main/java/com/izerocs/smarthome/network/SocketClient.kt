package com.izerocs.smarthome.network

import android.content.Context
import android.util.Log
import com.github.nkzawa.socketio.client.IO
import com.github.nkzawa.socketio.client.Socket
import com.izerocs.smarthome.model.EspItem
import com.izerocs.smarthome.preferences.AppPreferences
import org.json.JSONArray
import org.json.JSONObject
import kotlin.reflect.KFunction1

class SocketClient(val context : Context) {
    private val scheme : String = "http://"
    private val host   : String = "192.168.31.104"
    private val port   : String = "3180"

    private var socket = initSocket()
    private val options = IO.Options().apply { forceNew = true }
    private val espModules : MutableMap <String, EspItem> = mutableMapOf()
    private var eventListener : OnEventListener? = null
    private var authFailedCount : Int = 0

    interface OnEventListener {
        fun onConnect(client : SocketClient) {}
        fun onAuthorized(client : SocketClient) {}
        fun onDisconnect(client : SocketClient) {}
        fun onEspModules(client : SocketClient, espModules: MutableMap<String, EspItem>) {}
    }

    companion object {
        const val TAG = "SocketConnectivity"
        const val DEBUG = true
        const val AUTH_FAILED_DELAY = 5

        const val EVENT_AUTHENTICATE = "authenticate"
        const val EVENT_ESP_LIST     = "esp.list"
    }

    fun connect(makeSocket : Boolean = false) {
        if (makeSocket)
            socket = initSocket()

        socket.connect()
        socket.run {
            on(Socket.EVENT_CONNECT)    { onConnect(it) }
            on(Socket.EVENT_DISCONNECT) { onDisconnect(it) }
            on(EVENT_AUTHENTICATE)      { onAuthenticate(it) }
            on(EVENT_ESP_LIST)          { onEspList(it) }
        }
    }

    fun disconnect() {
        socket.disconnect()
    }

    fun setOnEventListener(eventListener : OnEventListener) {
        this.eventListener = eventListener
    }

    fun getSocket() : Socket = this.socket

    fun emitRoomTypes(callback : KFunction1<Int, Unit>) {
        socket.on("room.types") { array ->
            if (array.isEmpty() || array[0] !is JSONArray)
                return@on


        }
    }

    private fun initSocket() : Socket = IO.socket("$scheme$host:$port", options)

    private fun onConnect(data : Array<Any>) {
        if (DEBUG) Log.d(TAG, "onConnect")

        val appPreferences = AppPreferences(context)
        val appID          = appPreferences.getAppID()
        val appToken       = appPreferences.getAppToken()

        eventListener?.onConnect(this)
        socket.emit("authenticate", JSONObject(mapOf("id" to appID, "token" to appToken)))
    }

    private fun onDisconnect(data : Array<Any>) {
        if (DEBUG) Log.d(TAG, "onDisconnect")
        eventListener?.onDisconnect(this)
    }

    private fun onAuthenticate(data : Array<Any>) {
        if (DEBUG) Log.d(TAG, "onAuthenticate")

        if (data.isNotEmpty() && data[0] == "authorized") {
            eventListener?.onAuthorized(this)
            return
        }

        Thread {
            try {
                if (++authFailedCount >= AUTH_FAILED_DELAY) {
                    Thread.sleep(10000)
                    authFailedCount = 0
                } else {
                    Thread.sleep(2000)
                }
            } catch (e : InterruptedException) {}

            connect(true)
        }.run()
    }

    private fun onEspList(data : Array<Any>) {
        if (data.isEmpty() || data[0] !is JSONObject)
            return

        val lists = data[0] as JSONObject

        lists.keys().forEach { id ->
            val espID     = id.toString()
            val espObj    = lists.getJSONObject(espID)
            val espItem   = getCreateEspItem(espID)
            val espPins   = espObj.getJSONObject("pins")
            val espDetail = espObj.getJSONObject("detail")

            espItem.run {
                espModules[espID] = this

                setFilter(true)
                getListPins().let { listPins ->
                    listPins.clear()

                    for (i in 0 until espPins.getJSONArray("data").length()) {
                        val pin             = espPins.getJSONObject(i.toString())
                        val status          = pin.getInt("status") == 1
                        val input           = pin.getInt("input")
                        val outputType      = pin.getInt("outputType")
                        val outputPrimary   = pin.getInt("outputPrimary")
                        val outputSecondary = pin.getInt("outputSecondary")

                        listPins.add(EspItem.EspDataPin(input, outputType,
                            outputPrimary, outputSecondary, status))
                    }
                }
            }

            espDetail.run {
                val detail = getJSONObject("data")

                if (detail.has("rssi"))
                    espItem.setSignal(detail.getInt("rssi"))
            }
        }

        espModules.entries.retainAll { entry -> entry.value.isFilterSet() }
        eventListener?.onEspModules(this, espModules)
    }

    private fun getCreateEspItem(espID : String) : EspItem {
        if (espModules.containsKey(espID))
            return espModules[espID] as EspItem

        return EspItem(espID)
    }

}