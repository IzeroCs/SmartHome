package com.izerocs.smarthome.activity

import android.app.Activity
import android.app.Application
import android.os.Bundle
import android.util.Log
import com.github.nkzawa.socketio.client.IO
import com.github.nkzawa.socketio.client.Socket

/**
 * Created by IzeroCs on 2020-04-01
 */
class SmartApplication : Application() {
    private val socketToken : String = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9." +
            "eyJuYW1lIjoiSXplcm9DcyIsInN1YiI6IkFQUCIsImlhdCI6NDEwMjQ0NDgwMH0." +
            "W6z51k56Q374LIpEWoaHJkWErMEeMht8J1clLTc9-JewEgsEbNa-rCcoHUr_NKuNzu6H9CQqqAe_j5EEAfayl8nECVMuTJxlc4e0vPqehVQGORicfvF9KUyw8xvzKLQlAu-uzynu3AnCYvJhSICT_kyIXtEoSZdj70mb5e5AGL9NvO27mfCamItF-q8nlsQEPquBf3jPRxjdVog8_t4Sa1hznrhJsgGeJjXAEXK5AqM_7ahCRLbKdG4azENRxrSuN8BBoxO_UdBKvlyL931Zq8Zs1pQAFdebdODk2FNnkzVTRowEn1zfOq0K4Tj06hDXawrO7qdaK-fYsCWJCa7hwg"

    private var currentActivity : BaseActivity? = null
    private var currentSocket   : Socket        = IO.socket("http://192.168.31.104:3180").apply {
        on(Socket.EVENT_CONNECT_ERROR) {
            Log.e(this::class.java.toString(), "Connect Error") }
        on(Socket.EVENT_CONNECT_TIMEOUT) {
            Log.e(this::class.java.toString(), "Connect Timeout") }
        on(Socket.EVENT_RECONNECTING) {
            Log.d(this::class.java.toString(), "Reconnecting") }
        on(Socket.EVENT_RECONNECT_ATTEMPT) {
            Log.d(this::class.java.toString(), "Reconnect Attemp") }
        on(Socket.EVENT_RECONNECT_ERROR) {
            Log.d(this::class.java.toString(), "Reconnect Error")  }
        on(Socket.EVENT_RECONNECT_FAILED) {
            Log.e(this::class.java.toString(), "Reconnect Failed") }
        on(Socket.EVENT_DISCONNECT) {
            Log.d(this::class.java.toString(), "Disconnect") }

        on(Socket.EVENT_CONNECT) {
            Log.d(this::class.java.toString(), "Connect")

            emit("authenticate", "id", "APP", "token", socketToken)

//            if (currentActivity is BaseActivity)
//                currentActivity?.onSocketConnect(this)
        }

        on(Socket.EVENT_RECONNECT) {
            Log.d(this::class.java.toString(), "Reconnect")
        }

        on(Socket.EVENT_ERROR) {
            Log.e(this::class.java.toString(), "Error")
            Log.d(this::class.java.toString(), it.toList().toString())
        }

        on(Socket.EVENT_MESSAGE) {
            Log.d(this::class.java.toString(), "Message send")
            Log.d(this::class.java.toString(), it.toList().toString())
        }

        on("authenticate") {
            Log.d(this::class.java.toString(), "Authenticate")
        }
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