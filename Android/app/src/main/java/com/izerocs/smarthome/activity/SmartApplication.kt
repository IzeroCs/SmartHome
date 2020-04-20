package com.izerocs.smarthome.activity

import android.app.Activity
import android.app.Application
import android.os.Bundle
import android.util.Log
import com.github.nkzawa.emitter.Emitter
import com.github.nkzawa.socketio.client.IO
import com.github.nkzawa.socketio.client.Socket

/**
 * Created by IzeroCs on 2020-04-01
 */
class SmartApplication : Application() {
    private var currentActivity : BaseActivity? = null
    private var currentSocket   : Socket        = IO.socket("http://192.168.42.244:80").apply {
        on(Socket.EVENT_CONNECT_ERROR, Emitter.Listener { Log.e(this::class.java.toString(), "Connect Error") })
        on(Socket.EVENT_CONNECT_TIMEOUT, Emitter.Listener { Log.e(this::class.java.toString(), "Connect Timeout") })
        on(Socket.EVENT_RECONNECTING, Emitter.Listener { Log.d(this::class.java.toString(), "Reconnecting") })
        on(Socket.EVENT_RECONNECT_ATTEMPT, Emitter.Listener { Log.d(this::class.java.toString(), "Reconnect Attemp") })
        on(Socket.EVENT_RECONNECT_ERROR, Emitter.Listener { Log.d(this::class.java.toString(), "Reconnect Error") })
        on(Socket.EVENT_RECONNECT_FAILED, Emitter.Listener { Log.e(this::class.java.toString(), "Reconnect Failed") })
        on(Socket.EVENT_DISCONNECT, Emitter.Listener { Log.d(this::class.java.toString(), "Disconnect") })

        on(Socket.EVENT_RECONNECT, Emitter.Listener {
            Log.d(this::class.java.toString(), "Reconnect")

            if (currentActivity is BaseActivity)
                currentActivity?.onSocketReconnect()
        })

        on(Socket.EVENT_ERROR, Emitter.Listener {
            Log.e(this::class.java.toString(), "Error")
            Log.d(this::class.java.toString(), it.toList().toString())
        })

        on(Socket.EVENT_MESSAGE, Emitter.Listener {
            Log.d(this::class.java.toString(), "Message send")
            Log.d(this::class.java.toString(), it.toList().toString())
        })
    }

    companion object {
        private var self : SmartApplication? = null

        fun getInstance() : SmartApplication? = self
    }

    override fun onCreate() {
        super.onCreate()
        lifecycle()
        self = this
        currentSocket.connect()
    }

    private fun lifecycle() {
        registerActivityLifecycleCallbacks(object : ActivityLifecycleCallbacks {
            override fun onActivityPaused(activity : Activity) { }
            override fun onActivityStarted(activity : Activity) { }

            override fun onActivityDestroyed(activity : Activity) {
                if (activity is SmartActivity) {
                    currentSocket.disconnect()
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
        currentActivity = activity
    }

    fun getCurrentActivity() : BaseActivity? {
        return currentActivity
    }

    fun getSocket() : Socket {
        return currentSocket
    }
}