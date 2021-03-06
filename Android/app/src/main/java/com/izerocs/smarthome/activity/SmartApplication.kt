package com.izerocs.smarthome.activity

import android.app.Activity
import android.app.Application
import android.os.Bundle
import com.izerocs.smarthome.model.EspModuleModel
import com.izerocs.smarthome.model.RoomDeviceModel
import com.izerocs.smarthome.model.RoomListModel
import com.izerocs.smarthome.model.RoomTypeModel
import com.izerocs.smarthome.network.SocketClient
import com.izerocs.smarthome.network.SocketClient.OnEventListener
import com.izerocs.smarthome.preferences.AppPreferences

/**
 * Created by IzeroCs on 2020-04-01
 */
class SmartApplication : Application() {
    private var activityCurrent : BaseActivity?   = null
    private var appPreferences  : AppPreferences? = null
    private var socketClient    : SocketClient?   = null
    private val socketEvent     : OnEventListener = object : OnEventListener {
        override fun onConnect(client : SocketClient) {
            activityCurrent?.run {
                onSocketConnect(client)
                runOnUiThread { cloudError(false) }
            }
        }

        override fun onConnectError(client : SocketClient) {
            activityCurrent?.run {
                onSocketConnectError(client)
                runOnUiThread { cloudError(true, "error") }
            }
        }

        override fun onDisconnect(client : SocketClient) {
            activityCurrent?.run {
                onSocketDisconnect(client)
                runOnUiThread { cloudError(true, "disconnect") }
            }
        }

        override fun onEspModules(
            client : SocketClient,
            espModules : MutableMap<String, EspModuleModel>
        ) { activityCurrent?.onEspModules(client, espModules.toMutableMap()) }

        override fun onRoomTypes(
            client : SocketClient,
            roomTypes : MutableList<RoomTypeModel>
        ) { activityCurrent?.onRoomTypes(client, roomTypes.toMutableList()) }

        override fun onRoomList(
            client : SocketClient,
            roomLists : MutableList<RoomListModel>
        ) { activityCurrent?.onRoomList(client, roomLists.toMutableList()) }

        override fun onEspDevices(
            client : SocketClient,
            espDevices : MutableList<RoomDeviceModel>
        ) { activityCurrent?.onEspDevices(client, espDevices) }
    }

    companion object {
        const val TAG = "SmartApplication"
        const val DEBUG = true

        private var selfInstance : SmartApplication? = null

        fun getInstance() : SmartApplication? = selfInstance
    }

    override fun onCreate() {
        super.onCreate()
        lifecycle()
        selfInstance = this
        appPreferences = AppPreferences(this)
        socketClient = SocketClient(this)
        socketClient?.setOnEventListener(socketEvent)
        socketClient?.connect()
    }

    private fun lifecycle() {
        registerActivityLifecycleCallbacks(object : ActivityLifecycleCallbacks {
            override fun onActivityPaused(activity : Activity) { }
            override fun onActivityStarted(activity : Activity) { }

            override fun onActivityDestroyed(activity : Activity) {
                if (activity is SmartActivity) {
                    socketClient?.disconnect()
                    socketClient?.clear()
                    unregisterActivityLifecycleCallbacks(this)
                }
            }

            override fun onActivitySaveInstanceState(activity : Activity, outState : Bundle) { }
            override fun onActivityStopped(activity : Activity) {}
            override fun onActivityCreated(activity : Activity, savedInstanceState : Bundle?) {}
            override fun onActivityResumed(activity : Activity) { }
        })
    }

    fun setCurrentActivity(activity : BaseActivity?) {
        activity?.run {
            activityCurrent = this
            socketClient?.let { socket ->
                onSocketConnect(socket)
                onRoomTypes(socket, socket.getRoomTypes())
                onRoomList(socket, socket.getRoomLists())
                onEspModules(socket, socket.getEspModules())
            }
        }
    }

    fun getActivityCurrent() : BaseActivity? {
        return activityCurrent
    }

    fun getSocketClient() : SocketClient {
        return socketClient as SocketClient
    }
}