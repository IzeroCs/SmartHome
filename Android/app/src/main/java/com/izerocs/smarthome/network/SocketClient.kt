package com.izerocs.smarthome.network

import android.content.Context
import android.util.Log
import com.github.nkzawa.socketio.client.IO
import com.github.nkzawa.socketio.client.Socket
import com.google.gson.Gson
import com.izerocs.smarthome.model.EspModuleModel
import com.izerocs.smarthome.model.RoomDeviceModel
import com.izerocs.smarthome.model.RoomListModel
import com.izerocs.smarthome.model.RoomTypeModel
import com.izerocs.smarthome.preferences.AppPreferences
import org.json.JSONArray
import org.json.JSONObject

class SocketClient(val context : Context) {
    private val scheme    : String = "http://"
    private val host      : String = "192.168.31.104"
    private val port      : String = "3000"
    private val namesapce : String = "/platform-app"

    private var gson   = Gson()
    private var socket = initSocket()
    private val options = IO.Options().apply {
        forceNew = true
    }

    private val espModules      : MutableMap<String, EspModuleModel>   = mutableMapOf()
    private val roomTypes       : MutableList<RoomTypeModel>           = mutableListOf()
    private val roomLists       : MutableList<RoomListModel>           = mutableListOf()
    private var eventListener   : OnEventListener?                     = null
    private var authFailedCount : Int                                  = 0

    interface OnEventListener {
        fun onConnect(client : SocketClient) {}
        fun onConnectError(client : SocketClient) {}
        fun onDisconnect(client : SocketClient) {}
        fun onAuthorized(client : SocketClient) {}
        fun onEspModules(client : SocketClient, espModules: MutableMap<String, EspModuleModel>) {}
        fun onRoomTypes(client : SocketClient, roomTypes : MutableList<RoomTypeModel>) {}
        fun onRoomList(client : SocketClient, roomLists : MutableList<RoomListModel>) {}
    }

    companion object {
        const val TAG = "SocketClient"
        const val DEBUG = true
        const val AUTH_FAILED_DELAY = 5

        const val EVENT_AUTH         = "auth"
        const val EVENT_ROOM_TYPES   = "room-type"
        const val EVENT_ROOM_LIST    = "room-list"
        const val EVENT_ROOM_DEVICE  = "room-device"
        const val EVENT_ESP_LIST     = "esp-list"

        const val EVENT_COMMIT_ROOM_DEVICE = "commit-room-device"
    }

    fun connect(makeSocket : Boolean = false) {
        if (makeSocket)
            socket = initSocket()

        socket.connect()
        socket.run {
            off()
            on(Socket.EVENT_CONNECT)       { onConnect() }
            on(Socket.EVENT_CONNECT_ERROR) { onConnectError() }
            on(Socket.EVENT_DISCONNECT)    { onDisconnect() }
            on(EVENT_AUTH)                 { onAuth(it) }
            on(EVENT_ESP_LIST)             { onEspList(it)      }
            on(EVENT_ROOM_TYPES)           { onRoomTypes(it)    }
            on(EVENT_ROOM_LIST)            { onRoomList(it)     }
            on(EVENT_ROOM_DEVICE)          { onRoomDevice(it)   }
        }
    }

    fun disconnect() {
        socket.disconnect()
    }

    fun clear() {
        espModules.clear()
        roomTypes.clear()
        roomLists.clear()
    }

    fun setOnEventListener(eventListener : OnEventListener) {
        this.eventListener = eventListener
    }

    fun commitRoomDevice(roomDevice : RoomDeviceModel, response : ((status : Boolean) -> Unit?)? = null) {
        socket.once(EVENT_COMMIT_ROOM_DEVICE) {
            Log.d(TAG, it[0].toString())
        }.emit(EVENT_COMMIT_ROOM_DEVICE, JSONObject(gson.toJson(roomDevice)))
    }

    fun queryRoomDeviceList(roomId : Int, callback : (list: MutableList<RoomDeviceModel>) -> Unit) {
        if (DEBUG)
            Log.d(TAG, "queryRoomDevice: $roomId")

        socket.once(EVENT_ROOM_DEVICE) {
            if (it[0] !is JSONArray)
                return@once

            val data = it[0] as JSONArray
            val list = mutableListOf<RoomDeviceModel>()

            for (i in 0 until  data.length()) {
                val deviceObject = data.getJSONObject(i)
                val deviceModel  = gson.fromJson(deviceObject.toString(), RoomDeviceModel::class.java)

                list.add(deviceModel)
            }

            callback(list)
        }.emit(EVENT_ROOM_DEVICE, JSONObject(mapOf("id" to roomId)))
    }

    fun getSocket()     : Socket                             = this.socket
    fun getEspModules() : MutableMap<String, EspModuleModel> = this.espModules
    fun getRoomTypes()  : MutableList<RoomTypeModel>         = this.roomTypes
    fun getRoomLists()  : MutableList<RoomListModel>         = this.roomLists

    private fun initSocket() : Socket = IO.socket("$scheme$host:$port$namesapce", options)

    private fun onConnect() {
        if (DEBUG)
            Log.d(TAG, "onConnect")

        val appPreferences = AppPreferences(context)
        val appID          = appPreferences.getAppID()
        val appToken       = appPreferences.getAppToken()

        socket.emit("auth", JSONObject(mapOf("id" to appID, "token" to appToken)))
        eventListener?.onConnect(this)
    }

    private fun onConnectError() {
        if (DEBUG)
            Log.d(TAG, "onConnectError")

        eventListener?.onConnectError(this)
    }

    private fun onDisconnect() {
        if (DEBUG)
            Log.d(TAG, "onDisconnect")

        eventListener?.onDisconnect(this)
    }

    private fun onAuth(data : Array<Any>) {
        if (DEBUG)
            Log.d(TAG, "onAuth")

        if (data.isNotEmpty() && data[0] == "authorized") {
            socket.emit(EVENT_ROOM_TYPES)
            socket.emit(EVENT_ROOM_LIST)
            eventListener?.onAuthorized(this)

            queryRoomDeviceList(1) { list ->
                commitRoomDevice(list[0].copy(
                    status = RoomDeviceModel.STATUS_ON
                ))
            }

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

    private fun onEspList(it : Array<Any>) {
        if (DEBUG)
            Log.d(TAG, "onEspList")

        if (it[0] !is JSONObject)
            return

        val maps = mutableMapOf<String, EspModuleModel>()
        val data = it[0] as JSONObject

        data.keys().forEach { id ->
            val espID    = id.toString()
            val espObj   = data.getJSONObject(espID)
            val espModel = gson.fromJson(espObj.toString(), EspModuleModel::class.java)

            maps[espID] = espModel
        }

        espModules.clear()
        espModules.putAll(maps)

        eventListener?.onEspModules(this, espModules)
    }

    private fun onRoomTypes(it : Array<Any>) {
        if (DEBUG)
            Log.d(TAG, "onRoomTypes")

        if (it[0] !is JSONArray)
            return

        val list = mutableListOf<RoomTypeModel>()
        val data = it[0] as JSONArray

        for (i in 0 until data.length()) {
            val obj   = data.getJSONObject(i)
            val model = gson.fromJson(obj.toString(), RoomTypeModel::class.java)

            list.add(model)
        }

        roomTypes.clear()
        roomTypes.addAll(list)
        eventListener?.onRoomTypes(this, roomTypes)
    }

    private fun onRoomList(it : Array<Any>) {
        if (DEBUG)
            Log.d(TAG, "onRoomList")

        if (it[0] !is JSONArray)
            return

        val list = mutableListOf<RoomListModel>()
        val data = it[0] as JSONArray

        for (i in 0 until data.length()) {
            val obj = data.getJSONObject(i)
            val model = gson.fromJson(obj.toString(), RoomListModel::class.java)

            list.add(model)
        }

        roomLists.clear()
        roomLists.addAll(list)
        eventListener?.onRoomList(this, roomLists)
    }

    private fun onRoomDevice(data : Array<Any>) {
        if (DEBUG)
            Log.d(TAG, "onRoomDevice")
    }

}