package com.izerocs.smarthome.network

import android.content.Context
import com.github.nkzawa.emitter.Emitter
import com.github.nkzawa.socketio.client.IO
import com.github.nkzawa.socketio.client.Socket
import com.google.gson.Gson
import com.izerocs.smarthome.model.*
import com.izerocs.smarthome.preferences.AppPreferences
import org.json.JSONArray
import org.json.JSONObject

typealias PassHandler<T> = (model : T) -> Unit
typealias CatchHandler<T> = (error : T) -> Unit
typealias ListenerHandler<T> = (out : T) -> Unit

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
        fun onEspModules(client : SocketClient, espModules : MutableMap<String, EspModuleModel>) {}
        fun onEspDevices(client : SocketClient, espDevices : MutableList<RoomDeviceModel>) {}
        fun onRoomTypes(client : SocketClient, roomTypes : MutableList<RoomTypeModel>) {}
        fun onRoomList(client : SocketClient, roomLists : MutableList<RoomListModel>) {}
        fun onRoomDevice(client : SocketClient, roomDevices : MutableList<RoomDeviceModel>) {}
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
        const val EVENT_ESP_DEVICES  = "esp-devices"

        const val EVENT_QUERY_ROOM_DEVICE  = "query-room-device"
        const val EVENT_COMMIT_ROOM_DEVICE = "commit-room-device"
        const val EVENT_COMMIT_STATUS_ROOM_DEVICE = "commit-status-room-device"
    }

    fun connect(makeSocket : Boolean = false) {
        if (makeSocket)
            socket = initSocket()

        socket.connect()
        socket.run {
            off()
            on(Socket.EVENT_CONNECT)       { onConnect() }
            on(Socket.EVENT_CONNECT_ERROR) { eventListener?.onConnectError(this@SocketClient) }
            on(Socket.EVENT_DISCONNECT)    { eventListener?.onDisconnect(this@SocketClient) }
        }

        on<String>    (EVENT_AUTH)       { onAuth(it) }
        on<JSONObject>(EVENT_ESP_LIST)   { onEspList(it) }
        on<JSONArray>(EVENT_ROOM_TYPES)  { onRoomTypes(it) }
        on<JSONArray>(EVENT_ROOM_LIST)   { onRoomList(it) }
        on<JSONArray>(EVENT_ESP_DEVICES) { onEspDevices(it) }
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

    fun commitRoomDevice(
        roomDevice : RoomDeviceModel,
        pass : PassHandler<RoomDeviceModel>? = null,
        catch : CatchHandler<ErrorModel>? = null)
    {
        once<JSONObject>(EVENT_COMMIT_ROOM_DEVICE, roomDevice) { out ->
            parseOut<RoomDeviceModel>(out,
                { model -> if (model is RoomDeviceModel && pass != null) pass(model) },
                { error -> if (error is ErrorModel && catch != null) catch(error) })
        }
    }

    fun commitStatusRoomDevice(
        roomDevice : RoomDeviceModel,
        pass : PassHandler<RoomDeviceModel>? = null,
        catch : CatchHandler<ErrorModel>? = null)
    {
        once<JSONObject>(EVENT_COMMIT_STATUS_ROOM_DEVICE, roomDevice) { out ->
            parseOut<RoomDeviceModel>(out,
                { model -> if (model is RoomDeviceModel && pass != null) pass(model) },
                { error -> if (error is ErrorModel && catch != null) catch(error) })
        }
    }

    fun queryRoomDevice(
        roomDevice : RoomDeviceModel,
        pass : PassHandler<RoomDeviceModel>? = null,
        catch : CatchHandler<ErrorModel>? = null)
    {
        once<JSONObject>(EVENT_QUERY_ROOM_DEVICE, roomDevice) { out ->
            parseOut<RoomDeviceModel>(out,
                { model -> if (model is RoomDeviceModel && pass != null) pass(model) },
                { error -> if (error is ErrorModel && catch != null) catch(error) })
        }
    }

    fun queryRoomDeviceList(roomId : Int, callback : ((list: MutableList<RoomDeviceModel>) -> Unit)? = null) {
        if (callback == null) {
            emit(EVENT_ROOM_DEVICE, mapOf("id" to roomId))
            return
        }

        once<JSONArray>(EVENT_ROOM_DEVICE, mapOf("id" to roomId)) { out ->
            val list = mutableListOf<RoomDeviceModel>()

            for (i in 0 until  out.length()) {
                val deviceObject = out.getJSONObject(i)
                val deviceModel  = gson.fromJson(deviceObject.toString(), RoomDeviceModel::class.java)

                list.add(deviceModel)
            }

            callback(list)
        }
    }

    fun getSocket()     : Socket                             = this.socket
    fun getEspModules() : MutableMap<String, EspModuleModel> = this.espModules
    fun getRoomTypes()  : MutableList<RoomTypeModel>         = this.roomTypes
    fun getRoomLists()  : MutableList<RoomListModel>         = this.roomLists

    private fun initSocket() : Socket {
        var host = this.host
        val netType = NetworkProvider.getConnectType(context)

        if (netType == NetworkProvider.CONNECT_TYPE_MOBILE)
            host = "izerocs.com"
        
        return IO.socket("$scheme$host:$port$namesapce", options)
    }

    private fun onConnect() {
        val appPreferences = AppPreferences(context)
        val appID          = appPreferences.getAppID()
        val appToken       = appPreferences.getAppToken()

        emit(EVENT_AUTH, mapOf("id" to appID, "token" to appToken))
        eventListener?.onConnect(this)
    }

    private fun onAuth(auth: String) {
        if (auth == "authorized") {
            emit(EVENT_ROOM_TYPES).emit(EVENT_ROOM_LIST)
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

    private fun onEspList(out : JSONObject) {
        val maps = mutableMapOf<String, EspModuleModel>()

        out.keys().forEach { id ->
            val espID    = id.toString()
            val espObj   = out.getJSONObject(espID)
            val espModel = gson.fromJson(espObj.toString(), EspModuleModel::class.java)

            maps[espID] = espModel
        }

        espModules.clear()
        espModules.putAll(maps)

        eventListener?.onEspModules(this, espModules)
    }

    private fun onRoomTypes(out : JSONArray) {
        parseList<RoomTypeModel>(out) { list ->
            synchronized(roomTypes) {
                roomTypes.clear()
                roomTypes.addAll(list)
                eventListener?.onRoomTypes(this, roomTypes)
            }
        }
    }

    private fun onRoomList(out : JSONArray) {
        parseList<RoomListModel>(out) { list ->
            synchronized(roomLists) {
                roomLists.clear()
                roomLists.addAll(list)
                eventListener?.onRoomList(this, roomLists)
            }
        }
    }

    private fun onEspDevices(out : JSONArray) {
        parseList<RoomDeviceModel>(out) { list ->
            eventListener?.onEspDevices(this, list)
        }
    }

    private fun emit(event : String) : Emitter
            = socket.emit(event)

    private fun emit(event : String, model : BaseModel) : Emitter
            = emit(event, JSONObject(Gson().toJson(model)))

    private fun emit(event : String, map : Map<String, Any>) : Emitter
            = emit(event, JSONObject(map))

    private fun emit(event : String, json : String) : Emitter
            = emit(event, JSONObject(json))

    private fun emit(event : String, json : JSONObject) : Emitter
            = socket.emit(event, json)

    private inline fun <reified JSON : Any> once(
        event : String,
        crossinline listener : ListenerHandler<JSON>) : Emitter
            = once<JSON>(event, null, listener)

    private inline fun <reified JSON : Any> once(
        event : String, model : BaseModel,
        crossinline listener : ListenerHandler<JSON>) : Emitter
            = once(event, JSONObject(Gson().toJson(model)), listener)

    private inline fun <reified JSON : Any> once(
        event : String, map : Map<String, Any>,
        crossinline listener : ListenerHandler<JSON>) : Emitter
            = once(event, JSONObject(map), listener)

    private inline fun <reified JSON : Any> once(
        event : String, json : String,
        crossinline listener : ListenerHandler<JSON>) : Emitter
            = once(event, JSONObject(json), listener)

    private inline fun <reified JSON : Any> once(
        event : String, json : JSONObject?,
        crossinline listener : ListenerHandler<JSON>) : Emitter
    {
        val emitter = socket.once(event) {
            if (it[0] is JSON)
                listener(it[0] as JSON)
        }

        json?.let { emitter.emit(event, json) }
        return emitter
    }

    private fun off() : Emitter = socket.off()
    private fun off(event : String) : Emitter = socket.off(event)

    private inline fun <reified JSON : Any> on(
        event : String,
        crossinline listener : ListenerHandler<JSON>) : Emitter
            = on<JSON>(event, null, listener)

    private inline fun <reified JSON : Any> on(
        event : String, model : BaseModel,
        crossinline listener : ListenerHandler<JSON>) : Emitter
            = on(event, JSONObject(Gson().toJson(model)), listener)

    private inline fun <reified JSON : Any> on(
        event : String, map : Map<String, Any>,
        crossinline listener : ListenerHandler<JSON>) : Emitter
            = on(event, JSONObject(map), listener)

    private inline fun <reified JSON : Any> on(
        event : String, json : String,
        crossinline listener : ListenerHandler<JSON>) : Emitter
            = on(event, JSONObject(json), listener)

    private inline fun <reified JSON : Any> on(
        event : String, json : JSONObject?,
        crossinline listener : ListenerHandler<JSON>) : Emitter
    {
        val emitter = socket.on(event) {
            if (it[0] is JSON)
                listener(it[0] as JSON)
        }

        json?.let { emitter.emit(event, json) }
        return emitter
    }

    private inline fun <reified Model : BaseModel> parseOut(
        out : Any,
        pass : (model : Model?) -> Unit)
    {
        return parseOut<Model>(out, pass) {}
    }

    private inline fun <reified Model : BaseModel> parseOut(
        out   : Any,
        pass  : (model : Model?) -> Unit,
        catch : (error : BaseErrorModel) -> Unit)
    {
        if (out !is JSONObject)
            return

        val gson       : Gson = Gson()
        var model      : Model? = null
        var errorModel : BaseErrorModel? = null

        if (out.has("error")) {
            val error = out.get("error")

            if (error is String && error == "ErrorModel")
                errorModel = gson.fromJson(out.toString(), ErrorModel::class.java)
        }

        if (errorModel != null)
            return catch(errorModel)

        model = gson.fromJson(out.toString(), Model::class.java)

        if (model is Model)
            pass(model)
        else
            pass(null)
    }

    private inline fun <reified Model : BaseModel> parseList(
        out  : Any,
        pass : (list : MutableList<Model>) -> Unit
    ) {
        if (out !is JSONArray)
            return pass(mutableListOf())

        val list = mutableListOf<Model>()

        for (i in 0 until out.length()) {
            val obj   = out.getJSONObject(i)
            val model = gson.fromJson(obj.toString(), Model::class.java)

            list.add(model)
        }

        pass(list)
    }
}