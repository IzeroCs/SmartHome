package com.izerocs.smarthome.network

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.*
import android.net.ConnectivityManager.NetworkCallback
import android.net.wifi.WifiInfo
import android.net.wifi.WifiManager
import android.os.Build
import android.provider.Settings
import android.util.Log
import androidx.annotation.RequiresApi
import com.izerocs.smarthome.model.EspModuleModel
import com.izerocs.smarthome.utils.Util
import org.json.JSONException
import org.json.JSONObject
import java.io.IOException
import java.net.*

/**
 * Created by IzeroCs on 2020-05-14
 */
class EspConnectivity(private val context : Context) {
    private val wifiManager = context.applicationContext
        .getSystemService(Context.WIFI_SERVICE) as WifiManager

    private val connectivityManager = context.applicationContext
        .getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager

    private var currentSetupSsid: String = ""
    private var currentSetupPsk:  String = ""

    private var networkCallback : NetworkCallback? = null
    private var scanerListener : OnScanerListener? = null
    private var stationListener : OnStationListener? = null
    private var isNetworkChanged = false
    private var isScan = false

    init {
        Regex("^\"(.*?)\"$").find(wifiManager.connectionInfo.ssid)?.run {
            val (ssid) = this.destructured
            currentSetupSsid = ssid
        }
    }

    private val wifiScanReceiver = object : BroadcastReceiver() {
        override fun onReceive(context : Context, intent : Intent) {
            scanerListener?.run {
                if (intent.getBooleanExtra(WifiManager.EXTRA_RESULTS_UPDATED, false))
                    onScanSuccess(wifiManager)
                else
                    onScanFailed(wifiManager)

                isScan = false
                onScanEnd()
            }

            context.unregisterReceiver(this)
        }
    }

    private val networkStateReceiver = object : BroadcastReceiver() {
        @Suppress("DEPRECATION")
        override fun onReceive(context : Context, intent : Intent) {
            val detailedState = WifiInfo
                .getDetailedStateOf(wifiManager.connectionInfo.supplicantState)

            if (isNetworkChanged && WifiManager.NETWORK_STATE_CHANGED_ACTION.equals(intent.action)) {
                val isMatchIP = isMatchIP(wifiManager.dhcpInfo.gateway)

                if (isMatchIP && detailedState == NetworkInfo.DetailedState.OBTAINING_IPADDR) {
                    isNetworkChanged = false
                    networkCallback = object : ConnectivityManager.NetworkCallback() {
                        override fun onAvailable(network : Network) {
                            onNetworkAvailable(network)
                        }

                        override fun onUnavailable() {
                            onNetworkUnavailable()
                            unregisterNetworkCallback()
                        }
                    }

                    val networkRequest = NetworkRequest.Builder()
                        .addTransportType(NetworkCapabilities.TRANSPORT_WIFI)
                        .removeCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
                        .build()

                    connectivityManager.requestNetwork(networkRequest, networkCallback as NetworkCallback)
                    context.unregisterReceiver(this)
                } else if (detailedState == NetworkInfo.DetailedState.FAILED) {
                    isNetworkChanged = false
                    onNetworkUnavailable()
                    context.unregisterReceiver(this)
                }
            }
        }
    }

    companion object {
        const val TAG = "EspConnectivity"
        const val IP_ADDRESS = "192.168.231.125"
        const val SCHEME_SERVER = "http://"
        const val PORT_SERVER = "8080"

        enum class StationStatus {
            NOT_CHANGED,
            UID_NOT_VALIDATE,
            SSID_IS_REQUIRED,
            PSK_NOT_VALIDATE,
            ERROR_CONNECT,
            WAIT_CONNECT,
            FAILED_CONNECT,
            SUCCESS_CONNECT,
            SUCCESS_CLOSE,
            COMPLETE_CHANGED,
        }

        fun isMatchIP(ip : String) : Boolean {
            return IP_ADDRESS == ip
        }

        fun isMatchIP(ip : Int) : Boolean {
            return isMatchIP(Util.formatIPAddress(ip))
        }

        fun getURL() : String {
            return SCHEME_SERVER + IP_ADDRESS + ":" + PORT_SERVER;
        }
    }

    interface OnScanerListener {
        fun onScanBegin() {}
        fun onScanEnd() {}
        fun onScanSuccess(wifiManager : WifiManager) {}
        fun onScanFailed(wifiManager : WifiManager) {}
    }
    
    interface OnStationListener {
        fun onStationStatus(status : StationStatus) {}
        fun onStationFailed(message : String) {}
        fun onStationFailed(e : Exception) {}
    }

    fun stationConnect(item : EspModuleModel) {
//        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q)
//            connectNetworkAndroidQ(item)
//        else
//            connectNetworkPreAndroidQ(item)
    }

    @Suppress("DEPRECATION")
    private fun connectNetworkPreAndroidQ(item : EspModuleModel) {
//        val wifi = WifiConfiguration().apply {
//            this.SSID = "\"${item.getSsid()}\""
//            this.preSharedKey = "\"${item.getSc()}\""
//            this.status = WifiConfiguration.Status.ENABLED
//
//            this.allowedGroupCiphers.set(WifiConfiguration.GroupCipher.TKIP)
//            this.allowedGroupCiphers.set(WifiConfiguration.GroupCipher.CCMP)
//            this.allowedKeyManagement.set(WifiConfiguration.KeyMgmt.WPA_PSK)
//            this.allowedPairwiseCiphers.set(WifiConfiguration.PairwiseCipher.TKIP)
//            this.allowedPairwiseCiphers.set(WifiConfiguration.PairwiseCipher.CCMP)
//            this.allowedProtocols.set(WifiConfiguration.Protocol.RSN)
//        }
//
//        wifiManager.run {
//            val id = this.addNetwork(wifi)
//
//            if (id != -1) {
//                disconnect()
//                enableNetwork(id, true)
//                reconnect()
//
//                isNetworkChanged = true
//                context.registerReceiver(networkStateReceiver, IntentFilter().apply {
//                    addAction(WifiManager.NETWORK_STATE_CHANGED_ACTION)
//                })
//            } else {
//                onNetworkUnavailable()
//            }
//        }
    }

    @RequiresApi(api = Build.VERSION_CODES.Q)
    private fun connectNetworkAndroidQ(item : EspModuleModel) {
//        val specifier = WifiNetworkSpecifier.Builder()
//            .setSsid(item.getSsid())
//            .setWpa2Passphrase(item.getSc())
//            .build()
//
//        val request = NetworkRequest.Builder()
//            .addTransportType(NetworkCapabilities.TRANSPORT_WIFI)
//            .removeCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
//            .setNetworkSpecifier(specifier)
//            .build()
//
//        networkCallback = object : ConnectivityManager.NetworkCallback() {
//            override fun onAvailable(network : Network) {
//                onNetworkAvailable(network)
//            }
//
//            override fun onUnavailable() {
//                onNetworkUnavailable()
//                unregisterNetworkCallback()
//            }
//        }
//
//        networkCallback?.let {
//            connectivityManager.requestNetwork(request, it)
//        }
    }

    @Throws(IOException::class, MalformedURLException::class,
        InterruptedException::class, JSONException::class)
    private fun openConnection(network : Network, url : String, callback :
        (message : String, status : String, jsonObject : JSONObject) -> Unit,
                               connectTime : Int = 5000, readTime : Int = 5000)
    {
        val builder = StringBuilder()

        with (network.openConnection(URL(url)) as HttpURLConnection) {
            requestMethod = "POST"
            connectTimeout = connectTime
            readTimeout    = readTime

            inputStream
                .bufferedReader()
                .forEachLine { line -> builder.append(line) }

            val jsonObject = JSONObject(builder.toString())
            var message    = String()
            var status     = String()

            jsonObject.run {
                if (has("message"))
                    message = get("message").toString()

                if (has("status"))
                    status = get("status").toString()
            }

            callback(message, status, jsonObject)
        }
    }

    private fun onNetworkAvailable(network : Network) {
        connectivityManager.bindProcessToNetwork(network)
        val ipAddress = Util.formatIPAddress(wifiManager.dhcpInfo.gateway)

        if (!isMatchIP(ipAddress))
            return onNetworkUnavailable()

        var uid  = String()
        val close = Thread {
            val url = "${getURL()}/station?ap_station=close&uid=$uid"

            try {
                var countLoop = 0
                val maxLoop   = 5

                while (countLoop++ < maxLoop) {
                    try {
                        Thread.sleep(1000)
                        openConnection(network, url, { _, status, _ ->
                            if (status == "CLOSE_SUCCESS") {
                                notifyOnStationStatus(StationStatus.SUCCESS_CLOSE)
                                notifyOnStationStatus(StationStatus.COMPLETE_CHANGED)

                                countLoop = maxLoop.plus(1)
                            }
                        })
                    } catch (e : IOException) {
                        countLoop++
                        Log.w(TAG, "IOException")
                    } catch (e : ConnectException) {
                        countLoop++
                        Log.w(TAG, "ConnectExpception")
                    } catch (e : SocketTimeoutException) {
                        countLoop++
                        Log.w(TAG, "SocketTimeoutException")
                    } catch (e : InterruptedException) {}
                }
            } catch (e : MalformedURLException) {
                notifyOnStationFailed(e)
            }
        }

        val wait = Thread {
            val url = "${getURL()}/station?status&uid=$uid"

            try {
                var countWait   = 0
                val maxWait     = 30
                var connectTime = 5000
                var readTime    = 5000
                var isConnected = false

                val update = {
                    if (connectTime > 1000)
                        connectTime -= 200

                    if (readTime > 1000)
                        readTime -= 200

                    countWait += 2
                }

                while (countWait++ < maxWait) {
                    Thread.sleep(1000)

                    try {
                        openConnection(network, url, { _, status, jsonObject ->
                            when (status) {
                                "UID_NOT_VALIDATE" -> {
                                    countWait = maxWait.plus(1)
                                    notifyOnStationStatus(StationStatus.UID_NOT_VALIDATE)
                                }

                                "CONNECT_FAILED" -> notifyOnStationStatus(StationStatus.FAILED_CONNECT)
                                "WAIT_CONNECT" -> notifyOnStationStatus(StationStatus.WAIT_CONNECT)

                                "CONNECTED" -> {
                                    uid = jsonObject["uid"].toString()
                                    notifyOnStationStatus(StationStatus.SUCCESS_CONNECT)
                                    close.start()

                                    isConnected = true
                                    countWait   = maxWait.plus(1)
                                }
                            }
                        })
                    } catch (e : IOException) {
                        update()
                        Log.w(TAG, "IOException")
                    } catch (e : ConnectException) {
                        update()
                        Log.w(TAG, "ConnectExpception")
                    } catch (e : SocketTimeoutException) {
                        update()
                        Log.w(TAG, "SocketTimeoutException")
                    } catch (e : InterruptedException) {}
                }

                if (!isConnected) {
                    notifyOnStationStatus(StationStatus.FAILED_CONNECT)
                    unregisterNetworkCallback()
                }
            } catch (e : MalformedURLException) {
                notifyOnStationFailed(e)
            }
        }

        Thread {
            val url = "${getURL()}/station?changed&ssid=$currentSetupSsid&psk=$currentSetupPsk"

            try {
                openConnection(network, url, { _, status, jsonObject ->
                    when (status) {
                        "STATION_SSID_IS_REQUIRED" -> notifyOnStationStatus(StationStatus.SSID_IS_REQUIRED)
                        "STATION_PSK_NOT_VALIDATE" -> notifyOnStationStatus(StationStatus.PSK_NOT_VALIDATE)
                        "STATION_NOT_CHANGED" -> notifyOnStationStatus(StationStatus.NOT_CHANGED)
                        "STATION_CONNECT" -> {
                            uid = jsonObject["uid"].toString()
                            notifyOnStationStatus(StationStatus.WAIT_CONNECT)
                            wait.start()
                        }
                    }
                })
            } catch (e : IOException) {
                notifyOnStationFailed(e)
            } catch (e : ConnectException) {
                notifyOnStationFailed(e)
            } catch (e : SocketTimeoutException) {
                notifyOnStationFailed(e)
            } catch (e : MalformedURLException) {
                notifyOnStationFailed(e)
            } catch (e : InterruptedException) {
                notifyOnStationFailed(e)
            }
        }.start()
    }

    private fun onNetworkUnavailable() {
        notifyOnStationStatus(StationStatus.ERROR_CONNECT)
    }

    private fun notifyOnStationFailed(e : Exception) {
        stationListener?.onStationFailed(e)
        unregisterNetworkCallback()
    }

    private fun notifyOnStationStatus(status : StationStatus) {
        stationListener?.onStationStatus(status)

        when (status) {
            StationStatus.WAIT_CONNECT    -> return
            StationStatus.SUCCESS_CONNECT -> return
            StationStatus.SUCCESS_CLOSE   -> return

            else -> unregisterNetworkCallback()
        }
    }

    private fun unregisterNetworkCallback() {
        if (networkCallback != null)
            connectivityManager.unregisterNetworkCallback(networkCallback as NetworkCallback)
    }

    fun startScanModule() {
        if (isScan)
            return

        scanerListener?.onScanBegin()
        context.registerReceiver(wifiScanReceiver, IntentFilter().apply {
            addAction(WifiManager.SCAN_RESULTS_AVAILABLE_ACTION)
        })

        isScan = true

        @Suppress("DEPRECATION")
        if (!wifiManager.startScan()) {
            isScan = false

            scanerListener?.onScanFailed(wifiManager)
            scanerListener?.onScanEnd()
        }
    }

    fun toggleScanModule() {
        if (!isScan)
            startScanModule()
    }

    fun setCurrentSetupSsid(ssid : String) {
        currentSetupSsid = ssid
    }

    fun getCurrentSetupSsid() : String {
        return currentSetupSsid
    }

    fun setCurrentSetupPsk(psk : String) {
        currentSetupPsk = psk
    }

    fun getCurrentSetupPsk() : String {
        return currentSetupPsk
    }

    fun setOnScannerListener(listener : OnScanerListener) {
        scanerListener = listener
    }

    fun setOnStationListener(listener : OnStationListener) {
        stationListener = listener
    }

    fun destroy() {
        if (networkCallback != null)
            connectivityManager.unregisterNetworkCallback(networkCallback as NetworkCallback)
    }

    fun isScanRunning() : Boolean {
        return isScan
    }

    fun isScanThrottleEnabled() : Boolean {
        return Settings.Global
            .getInt(context.contentResolver, "wifi_scan_throttle_enabled") == 1
    }

}