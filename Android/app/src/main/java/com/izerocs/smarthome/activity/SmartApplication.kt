package com.izerocs.smarthome.activity

import android.app.Activity
import android.app.Application
import android.os.Bundle
import com.izerocs.smarthome.network.SocketClient
import com.izerocs.smarthome.network.SocketClient.OnEventListener

/**
 * Created by IzeroCs on 2020-04-01
 */
class SmartApplication : Application() {
    private var activityCurrent : BaseActivity? = null
    private val socketClient    : SocketClient  = SocketClient()
    private val socketEvent     : OnEventListener = object : OnEventListener {
        
    }

    companion object {
        const val TAG = "SmartApplication"
        const val DEBUG = true

        private var self : SmartApplication? = null

        fun getInstance() : SmartApplication? = self
    }

    override fun onCreate() {
        super.onCreate()
        lifecycle()
        self = this
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
        activityCurrent = activity
    }

    fun getActivityCurrent() : BaseActivity? {
        return activityCurrent
    }

    fun getSocketClient() : SocketClient {
        return socketClient
    }
}