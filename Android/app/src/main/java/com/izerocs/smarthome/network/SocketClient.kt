package com.izerocs.smarthome.network

import android.content.Context
import android.util.Log
import com.github.nkzawa.socketio.client.IO
import com.github.nkzawa.socketio.client.Socket
import com.izerocs.smarthome.model.EspItem
import com.izerocs.smarthome.preferences.AppPreferences
import org.json.JSONArray
import org.json.JSONObject

class SocketClient(val context : Context) {
    private val scheme : String = "http://"
    private val host   : String = "izerocs.com"
    private val port   : String = "3180"

    private var socket = initSocket()
    private val options = IO.Options().apply { forceNew = true }
    private val espModules : MutableMap<String, EspItem> = mutableMapOf()
    private val roomTypes  : MutableMap<String, Int>     = mutableMapOf()
    private val roomList   : MutableMap<String, Int>     = mutableMapOf()
    private var eventListener : OnEventListener? = null
    private var authFailedCount : Int = 0

    interface OnEventListener {
        fun onConnect(client : SocketClient) {}
        fun onAuthorized(client : SocketClient) {}
        fun onDisconnect(client : SocketClient) {}
        fun onEspModules(client : SocketClient, espModules: MutableMap<String, EspItem>) {}
        fun onRoomTypes(client : SocketClient, roomTypes : MutableMap<String, Int>) {}
        fun onRoomList(client : SocketClient, roomList : MutableMap<String, Int>) {}
    }

    companion object {
        const val TAG = "SocketConnectivity"
        const val DEBUG = true
        const val AUTH_FAILED_DELAY = 5

        const val EVENT_AUTHENTICATE = "authenticate"
        const val EVENT_ROOM_TYPES   = "room.types"
        const val EVENT_ROOM_LIST    = "room.list"
        const val EVENT_ESP_LIST     = "esp.list"
    }

    fun connect(makeSocket : Boolean = false) {
        if (makeSocket)
            socket = initSocket()

        socket.connect()
        socket.run {
            on(Socket.EVENT_CONNECT)    { onConnect(it)      }
            on(Socket.EVENT_DISCONNECT) { onDisconnect(it)   }
            on(EVENT_AUTHENTICATE)      { onAuthenticate(it) }
            on(EVENT_ESP_LIST)          { onEspList(it)      }
            on(EVENT_ROOM_TYPES)        { onRoomTypes(it)    }
            on(EVENT_ROOM_LIST)         { onRoomList(it)     }
        }
    }

    fun disconnect() {
        socket.disconnect()
    }

    fun setOnEventListener(eventListener : OnEventListener) {
        this.eventListener = eventListener
    }

    fun getSocket() : Socket = this.socket
    fun getEspModules() : MutableMap<String, EspItem> = this.espModules
    fun getRoomTypes()  : MutableMap<String, Int>     = this.roomTypes
    fun getRoomList()   : MutableMap<String, Int>     = this.roomList

    private fun initSocket() : Socket = IO.socket("$scheme$host:$port", options)

    private fun onConnect(data : Array<Any>) {
        if (DEBUG)
            Log.d(TAG, "onConnect")

        val appPreferences = AppPreferences(context)
        val appID          = appPreferences.getAppID()
        val appToken       = appPreferences.getAppToken()

        socket.emit("authenticate", JSONObject(mapOf("id" to appID, "token" to appToken)))
        eventListener?.onConnect(this)
    }

    private fun onDisconnect(data : Array<Any>) {
        if (DEBUG)
            Log.d(TAG, "onDisconnect")

        eventListener?.onDisconnect(this)
    }

    private fun onAuthenticate(data : Array<Any>) {
        if (DEBUG)
            Log.d(TAG, "onAuthenticate")

        if (data.isNotEmpty() && data[0] == "authorized") {
            socket.emit(EVENT_ROOM_TYPES)
            socket.emit(EVENT_ROOM_LIST)
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
        if (DEBUG)
            Log.d(TAG, "onEspList")

        if (data.isEmpty() || data[0] !is JSONObject)
            return

        val lists = data[0] as JSONObject

        lists.keys().forEach { id ->
            val espID     = id.toString()
            val espObj    = lists.getJSONObject(espID)

            if (!espObj.has("pins") || !espObj.has("detail"))
                return

            val espItem   = getCreateEspItem(espID)
            val espPins   = espObj.getJSONObject("pins")
            val espDetail = espObj.getJSONObject("detail")

            espItem.run {
                espModules[espID] = this

                setFilter(true)
                getListPins().let { listPins ->
                    listPins.clear()

                    for (i in 0 until espPins.getJSONArray("data").length()) {
                        if (espPins.has(i.toString())) {
                            val pin = espPins.getJSONObject(i.toString())
                            val status = pin.getInt("status") == 1
                            val input = pin.getInt("input")
                            val outputType = pin.getInt("outputType")
                            val outputPrimary = pin.getInt("outputPrimary")
                            val outputSecondary = pin.getInt("outputSecondary")

                            listPins.add(EspItem.EspDataPin(input, outputType,
                                outputPrimary, outputSecondary, status))
                        }
                    }
                }
            }

            espDetail.run {
                if (!has("data"))
                    return

                val detail = getJSONObject("data")

                if (detail.has("rssi"))
                    espItem.setSignal(detail.getInt("rssi"))
            }

            if (espObj.has("online"))
                espItem.setOnline(espObj.getBoolean("online"))
            else
                espItem.setOnline(false)
        }

        espModules.entries.retainAll { entry -> entry.value.isFilterSet() }
        eventListener?.onEspModules(this, espModules)
    }

    private fun onRoomTypes(data : Array<Any>) {
        if (DEBUG)
            Log.d(TAG, "onRoomTypes")

        if (data.isEmpty() || data[0] !is JSONArray)
            return

        (data[0] as JSONArray).let { types ->
            roomTypes.clear()

            for (i in 0 until types.length()) {
                if (types[i] is JSONObject) {
                    val room = types.getJSONObject(i)

                    if (room.has("name") && room.has("type"))
                        roomTypes[room.getString("name")] = room.getInt("type")
                }
            }

            eventListener?.onRoomTypes(this, roomTypes)
        }
    }

    private fun onRoomList(data : Array<Any>) {
        if (DEBUG)
            Log.d(TAG, "onRoomList")

        Log.d(TAG, data.toList().toString())

        if (data.isEmpty() || data[0] !is JSONArray)
            return

        (data[0] as JSONArray).let { list ->
            roomList.clear()

            for (i in 0 until list.length()) {
                if (list[i] is JSONObject) {
                    val room = list.getJSONObject(i)

                    if (room.has("name") && room.has("type"))
                        roomList[room.getString("name")] = room.getInt("type")
                }
            }

            eventListener?.onRoomList(this, roomList)
        }
    }

    private fun getCreateEspItem(espID : String) : EspItem {
        if (espModules.containsKey(espID))
            return espModules[espID] as EspItem

        return EspItem(espID)
    }

}