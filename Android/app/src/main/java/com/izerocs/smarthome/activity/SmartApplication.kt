package com.izerocs.smarthome.activity

import android.app.Activity
import android.app.Application
import android.os.Bundle
import com.izerocs.smarthome.item.RoomListItem
import com.izerocs.smarthome.item.RoomTypeItem
import com.izerocs.smarthome.model.EspModuleModel
import com.izerocs.smarthome.network.SocketClient
import com.izerocs.smarthome.network.SocketClient.OnEventListener
import com.izerocs.smarthome.preferences.AppPreferences

/**
 * Created by IzeroCs on 2020-04-01
 */
class SmartApplication : Application() {
    private var activityCurrent : BaseActivity?   = null
    private var appPreferences  : AppPreferences? = null
    private val socketClient    : SocketClient    = SocketClient(this)
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

        override fun onEspModules(client : SocketClient, espModules : MutableMap<String, EspModuleModel>) {
            activityCurrent?.onEspModules(client, espModules.toMutableMap())
        }

        override fun onRoomTypes(client : SocketClient, roomTypeItems : MutableList<RoomTypeItem>) {
            activityCurrent?.onRoomTypes(client, roomTypeItems.toMutableList())
        }

        override fun onRoomList(client : SocketClient, roomListList : MutableList<RoomListItem>) {
            activityCurrent?.onRoomList(client, roomListList.toMutableList())
        }
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
        socketClient.setOnEventListener(socketEvent)
        socketClient.connect()
    }

    private fun lifecycle() {
        registerActivityLifecycleCallbacks(object : ActivityLifecycleCallbacks {
            override fun onActivityPaused(activity : Activity) { }
            override fun onActivityStarted(activity : Activity) { }

            override fun onActivityDestroyed(activity : Activity) {
                if (activity is SmartActivity) {
                    socketClient.disconnect()
                    socketClient.clear()
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
            onSocketConnect(socketClient)
            onRoomTypes(socketClient, socketClient.getRoomTypes())
            onRoomList(socketClient, socketClient.getRoomList())
            onEspModules(socketClient, socketClient.getEspModules())
        }
    }

    fun getActivityCurrent() : BaseActivity? {
        return activityCurrent
    }

    fun getSocketClient() : SocketClient {
        return socketClient
    }
}