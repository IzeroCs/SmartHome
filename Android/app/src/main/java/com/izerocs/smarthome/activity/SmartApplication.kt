package com.izerocs.smarthome.activity

import android.app.Activity
import android.app.Application
import android.os.Bundle
import com.izerocs.smarthome.model.EspItem
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
            activityCurrent?.onSocketConnect(client)
        }

        override fun onEspModules(client : SocketClient, espModules : MutableMap<String, EspItem>) {
            activityCurrent?.onEspModules(client, espModules)
        }

        override fun onRoomTypes(client : SocketClient, roomTypes : MutableMap<String, Int>) {
            activityCurrent?.onRoomTypes(client, roomTypes)
        }

        override fun onRoomList(client : SocketClient, roomList : MutableMap<String, Int>) {
            activityCurrent?.onRoomList(client, roomList)
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
                    unregisterActivityLifecycleCallbacks(this)
                }
            }

            override fun onActivitySaveInstanceState(activity : Activity, outState : Bundle) { }
            override fun onActivityStopped(activity : Activity) {}
            override fun onActivityCreated(activity : Activity, savedInstanceState : Bundle?) { }
            override fun onActivityResumed(activity : Activity) { }
        })
    }

    fun setCurrentActivity(activity : BaseActivity?) {
        activity?.run {
            activityCurrent = this
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