package com.izerocs.smarthome.activity

import android.app.Activity
import android.app.Application
import android.os.Bundle
import android.util.Log
import com.github.nkzawa.socketio.client.IO
import com.github.nkzawa.socketio.client.Socket
import com.izerocs.smarthome.model.EspItem
import org.json.JSONObject

/**
 * Created by IzeroCs on 2020-04-01
 */
class SmartApplication : Application() {
    private val socketToken : String = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9." +
            "eyJuYW1lIjoiSXplcm9DcyIsInN1YiI6IkFQUCIsImlhdCI6NDEwMjQ0NDgwMH0." +
            "W6z51k56Q374LIpEWoaHJkWErMEeMht8J1clLTc9-JewEgsEbNa-rCcoHUr_NKuNzu6H9CQqqAe_j5EEAfayl8nECVMuTJxlc4e0vPqehVQGORicfvF9KUyw8xvzKLQlAu-uzynu3AnCYvJhSICT_kyIXtEoSZdj70mb5e5AGL9NvO27mfCamItF-q8nlsQEPquBf3jPRxjdVog8_t4Sa1hznrhJsgGeJjXAEXK5AqM_7ahCRLbKdG4azENRxrSuN8BBoxO_UdBKvlyL931Zq8Zs1pQAFdebdODk2FNnkzVTRowEn1zfOq0K4Tj06hDXawrO7qdaK-fYsCWJCa7hwg"

    private val socketOptions = IO.Options().apply {
        forceNew = true
    }

    private var failedAuthenticate : Int        = 0
    private val maxAuthenticate    : Int        = 5

    private var currentActivity : BaseActivity? = null
    private var currentSocket   : Socket        = initSocket()
    private val espModules      : MutableMap <String,
            EspItem> = mutableMapOf()

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

    private fun initSocket() : Socket {
        return IO.socket("http://192.168.42.193:3180", socketOptions)
            .apply { onSocketEvent(this) }
    }

    private fun onSocketEvent(socket : Socket) {
        socket.run {
            on(Socket.EVENT_RECONNECTING) { if (DEBUG) Log.d(TAG, "Reconnecting") }
            on(Socket.EVENT_DISCONNECT)   { if (DEBUG) Log.d(TAG, "Disconnect")   }
            on(Socket.EVENT_RECONNECT)    { if (DEBUG) Log.d(TAG, "Reconnect")    }

            on(Socket.EVENT_ERROR)   { if (DEBUG) Log.e(TAG, "Error: "   + it.toList().toString()) }
            on(Socket.EVENT_MESSAGE) { if (DEBUG) Log.d(TAG, "Message: " + it.toList().toString()) }

            on(Socket.EVENT_CONNECT) {
                if (DEBUG)
                    Log.d(TAG, "Connect")

                emit("authenticate", JSONObject(mapOf("id" to "APP", "token" to socketToken)))
            }

            on("authenticate") { data ->
                Log.d(TAG, "Authenticate: " + data.toList().toString())

                if (data.isNotEmpty() && data[0] == "authorized") {
                    if (currentActivity is BaseActivity)
                        currentActivity?.onSocketConnect(this)

                    return@on
                }

                Thread {
                    try {
                        if (++failedAuthenticate >= maxAuthenticate) {
                            Thread.sleep(10000)
                            failedAuthenticate = 0
                        } else {
                            Thread.sleep(2000)
                        }
                    } catch (e : InterruptedException) {}

                    currentSocket = initSocket()
                    currentSocket.connect()
                }.run()
            }

            on("esp.list") { array ->
                if (array.isEmpty() || array[0] !is JSONObject)
                    return@on

                (array[0] as JSONObject).let { lists ->
                    lists.keys().forEach { key ->
                        val espName = key.toString()
                        val esp     = lists.getJSONObject(espName)
                        val pins    = esp.getJSONArray("pins")
                        val detail  = esp.getJSONObject("detail")
                        val item    = if (espModules.containsKey(espName))
                            espModules[espName]
                        else
                            EspItem(espName)

                        item?.run {
                            espModules[espName] = this

                            if (detail.has("signal"))
                                setSignal(detail.getInt("signal"))

                            setFilter(true)
                            getListPins().let { listPins ->
                                listPins.clear()

                                for (i in 0 until pins.length()) {
                                    val pin = pins.getJSONObject(i)

                                    var input           : Int     = 0
                                    var outputType      : Int     = 0
                                    var outputPrimary   : Int     = 0
                                    var outputSecondary : Int     = 0
                                    var status          : Boolean = false

                                    if (pin.has("input"))
                                        input = pin.getInt("input")

                                    if (pin.has("outputType"))
                                        outputType = pin.getInt("outputType")

                                    if (pin.has("outputPrimary"))
                                        outputPrimary = pin.getInt("outputPrimary")

                                    if (pin.has("outputSecondary"))
                                        outputSecondary = pin.getInt("outputSecondary")

                                    if (pin.has("status"))
                                        status = pin.getInt("status") == 1

                                    listPins.add(EspItem.EspDataPin(input, outputType,
                                        outputPrimary, outputSecondary, status))
                                }
                            }
                        }
                    }
                }

                espModules.entries.retainAll { entry -> entry.value.isFilterSet() }
                currentActivity?.onEspModules(this, espModules)
            }.emit("esp.list")
        }
    }

    fun setCurrentActivity(activity : BaseActivity?) {
        currentActivity = activity
        currentActivity?.onSocketConnect(currentSocket)
        currentActivity?.onEspModules(currentSocket, espModules)
    }

    fun getCurrentActivity() : BaseActivity? {
        return currentActivity
    }

    fun getSocket() : Socket {
        return currentSocket
    }
}