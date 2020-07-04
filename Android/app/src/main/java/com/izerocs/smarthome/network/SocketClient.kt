package com.izerocs.smarthome.network

import android.content.Context
import android.util.Log
import com.github.nkzawa.socketio.client.IO
import com.github.nkzawa.socketio.client.Socket
import com.google.gson.Gson
import com.izerocs.smarthome.item.RoomListItem
import com.izerocs.smarthome.item.RoomTypeItem
import com.izerocs.smarthome.model.EspModuleModel
import com.izerocs.smarthome.model.RoomDeviceModel
import com.izerocs.smarthome.preferences.AppPreferences
import org.json.JSONArray
import org.json.JSONObject

class SocketClient(val context : Context) {
    private val scheme    : String = "http://"
    private val host      : String = "192.168.31.104"
    private val port      : String = "3000"
    private val namesapce : String = "/platform-app"

    private var socket = initSocket()
    private val options = IO.Options().apply {
        forceNew = true
    }

    private val espModules : MutableMap<String, EspModuleModel> = mutableMapOf()
    private val roomTypeItems   : MutableList<RoomTypeItem>       = mutableListOf()
    private val roomListList    : MutableList<RoomListItem>       = mutableListOf()
    private var eventListener   : OnEventListener?                = null
    private var authFailedCount : Int                             = 0

    interface OnEventListener {
        fun onConnect(client : SocketClient) {}
        fun onConnectError(client : SocketClient) {}
        fun onDisconnect(client : SocketClient) {}
        fun onAuthorized(client : SocketClient) {}
        fun onEspModules(client : SocketClient, espModules: MutableMap<String, EspModuleModel>) {}
        fun onRoomTypes(client : SocketClient, roomTypeItems : MutableList<RoomTypeItem>) {}
        fun onRoomList(client : SocketClient, roomListList : MutableList<RoomListItem>) {}
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
    }

    fun connect(makeSocket : Boolean = false) {
        if (makeSocket)
            socket = initSocket()

        socket.connect()
        socket.run {
            off()
            on(Socket.EVENT_CONNECT)       { onConnect(it)      }
            on(Socket.EVENT_CONNECT_ERROR) { onConnectError(it) }
            on(Socket.EVENT_DISCONNECT)    { onDisconnect(it)   }
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
        roomTypeItems.clear()
        roomListList.clear()
    }

    fun setOnEventListener(eventListener : OnEventListener) {
        this.eventListener = eventListener
    }

    fun queryRoomDevice(roomId : String, callback : (list: MutableList<RoomDeviceModel>) -> Unit) {
        if (DEBUG)
            Log.d(TAG, "queryRoomDevice: $roomId")

        socket.off(EVENT_ROOM_DEVICE).on(EVENT_ROOM_DEVICE) { it ->
            if (it[0] !is JSONArray) {
                socket.off(EVENT_ROOM_DEVICE)
                return@on
            }

            val data = it[0] as JSONArray
            val gson = Gson()
            val list = mutableListOf<RoomDeviceModel>()

            for (i in 0 until  data.length()) {
                val deviceObject = data.getJSONObject(i)
                val deviceModel  = gson.fromJson(deviceObject.toString(), RoomDeviceModel::class.java)

                list.add(deviceModel)
            }

            socket.off(EVENT_ROOM_DEVICE)
            callback(list)
        }.emit(EVENT_ROOM_DEVICE, JSONObject(mapOf("id" to roomId)))
    }

    fun getSocket() : Socket = this.socket
    fun getEspModules() : MutableMap<String, EspModuleModel> = this.espModules
    fun getRoomTypes()  : MutableList<RoomTypeItem>       = this.roomTypeItems
    fun getRoomList()   : MutableList<RoomListItem>       = this.roomListList

    private fun initSocket() : Socket = IO.socket("$scheme$host:$port$namesapce", options)

    private fun onConnect(data : Array<Any>) {
        if (DEBUG)
            Log.d(TAG, "onConnect")

        val appPreferences = AppPreferences(context)
        val appID          = appPreferences.getAppID()
        val appToken       = appPreferences.getAppToken()

        socket.emit("auth", JSONObject(mapOf("id" to appID, "token" to appToken)))
        eventListener?.onConnect(this)
    }

    private fun onConnectError(data : Array<Any>) {
        if (DEBUG)
            Log.d(TAG, "onConnectError")

        eventListener?.onConnectError(this)
    }

    private fun onDisconnect(data : Array<Any>) {
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
        val gson = Gson()

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

    private fun onRoomTypes(data : Array<Any>) {
        if (DEBUG)
            Log.d(TAG, "onRoomTypes")

        if (data.isEmpty() || data[0] !is JSONArray)
            return

        (data[0] as JSONArray).let { types ->
            roomTypeItems.clear()

            for (i in 0 until types.length()) {
                if (types[i] is JSONObject) {
                    val room = types.getJSONObject(i)

                    if (room.has("id") && room.has("name") && room.has("type"))
                        roomTypeItems.add(RoomTypeItem(context, room.getString("id"),
                            room.getString("name"), room.getInt("type")))
                }
            }

            eventListener?.onRoomTypes(this, roomTypeItems)
        }
    }

    private fun onRoomList(data : Array<Any>) {
        if (DEBUG)
            Log.d(TAG, "onRoomList")

        if (data.isEmpty() || data[0] !is JSONArray)
            return

        (data[0] as JSONArray).let { list ->
            roomListList.clear()

            for (i in 0 until list.length()) {
                if (list[i] is JSONObject) {
                    val room = list.getJSONObject(i)

                    if (room.has("id") && room.has("name") && room.has("type"))
                        roomListList.add(RoomListItem(context, room.getString("id"),
                            room.getString("name"), room.getInt("type")))
                }
            }

            eventListener?.onRoomList(this, roomListList)
        }
    }

    private fun onRoomDevice(data : Array<Any>) {
        if (DEBUG)
            Log.d(TAG, "onRoomDevice")
    }

//    private fun getCreateEspItem(espID : String) : EspModuleModel {
//        if (espModules.containsKey(espID))
//            return espModules[espID] as EspItem
//
//        return EspItem(espID)
//    }

}