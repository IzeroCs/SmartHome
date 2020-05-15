package com.izerocs.smarthome.network

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.*
import android.net.ConnectivityManager.NetworkCallback
import android.net.wifi.WifiConfiguration
import android.net.wifi.WifiInfo
import android.net.wifi.WifiManager
import android.net.wifi.WifiNetworkSpecifier
import android.os.Build
import android.provider.Settings
import androidx.annotation.RequiresApi
import com.izerocs.smarthome.model.EspItem
import com.izerocs.smarthome.utils.Util
import okhttp3.*
import okio.ByteString
import java.net.URISyntaxException

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
    private var addListener : OnAddWifiToModuleListener? = null
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
                            unregisterNetworkCallback()
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
        const val IP_ADDRESS = "192.168.31.15"
        const val SCHEME_SERVER = "http://"
        const val PORT_SERVER = "81"

        fun isMatchIP(ip : String) : Boolean {
            return IP_ADDRESS == ip
        }

        fun isMatchIP(ip : Int) : Boolean {
            return isMatchIP(Util.formatIPAddress(ip))
        }
    }

    interface OnScanerListener {
        fun onScanBegin() {}
        fun onScanEnd() {}
        fun onScanSuccess(wifiManager : WifiManager) {}
        fun onScanFailed(wifiManager : WifiManager) {}
    }
    
    interface OnAddWifiToModuleListener {
        fun onAddWifiToModuleSuccess()
        fun onAddWifiToModuleFailed(message : String)
    }

    fun addWifiToModule(item : EspItem?) {
        val listener = object : WebSocketListener() {
            override fun onOpen(webSocket : WebSocket, response : Response) {
            }

            override fun onClosing(webSocket : WebSocket, code : Int, reason : String) {
                println("onClosing")
            }

            override fun onFailure(webSocket : WebSocket, t : Throwable, response : Response?) {
                println("onFailed: $response")
                t.printStackTrace()
            }

            override fun onMessage(webSocket : WebSocket, bytes : ByteString) {
                println("onMessage bytes: $bytes")
            }

            override fun onMessage(webSocket : WebSocket, text : String) {
                println("onMessage string: $text")
            }
        }

        val request = Request.Builder().url("ws://${IP_ADDRESS}:${PORT_SERVER}").build()
        val client = OkHttpClient()
        val ws = client.newWebSocket(request, listener)

        client.dispatcher.executorService.shutdown()

//        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q)
//            connectNetworkAndroidQ(item)
//        else
//            connectNetworkPreAndroidQ(item)
    }

    @Suppress("DEPRECATION")
    private fun connectNetworkPreAndroidQ(item : EspItem) {
        val wifi = WifiConfiguration().apply {
            this.SSID = "\"${item.getSsid()}\""
            this.preSharedKey = "\"${item.getSc()}\""
            this.status = WifiConfiguration.Status.ENABLED

            this.allowedGroupCiphers.set(WifiConfiguration.GroupCipher.TKIP)
            this.allowedGroupCiphers.set(WifiConfiguration.GroupCipher.CCMP)
            this.allowedKeyManagement.set(WifiConfiguration.KeyMgmt.WPA_PSK)
            this.allowedPairwiseCiphers.set(WifiConfiguration.PairwiseCipher.TKIP)
            this.allowedPairwiseCiphers.set(WifiConfiguration.PairwiseCipher.CCMP)
            this.allowedProtocols.set(WifiConfiguration.Protocol.RSN)
        }

        wifiManager.run {
            val id = this.addNetwork(wifi)

            if (id != -1) {
                disconnect()
                enableNetwork(id, true)
                reconnect()

                isNetworkChanged = true
                context.registerReceiver(networkStateReceiver, IntentFilter().apply {
                    addAction(WifiManager.NETWORK_STATE_CHANGED_ACTION)
                })
            } else {
                onNetworkUnavailable()
            }
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.Q)
    private fun connectNetworkAndroidQ(item : EspItem) {
        val specifier = WifiNetworkSpecifier.Builder()
            .setSsid(item.getSsid())
            .setWpa2Passphrase(item.getSc())
            .build()

        val request = NetworkRequest.Builder()
            .addTransportType(NetworkCapabilities.TRANSPORT_WIFI)
            .removeCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .setNetworkSpecifier(specifier)
            .build()

        networkCallback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network : Network) {
                onNetworkAvailable(network)
                unregisterNetworkCallback()
            }

            override fun onUnavailable() {
                onNetworkUnavailable()
                unregisterNetworkCallback()
            }
        }

        networkCallback?.let {
            connectivityManager.requestNetwork(request, it)
        }
    }

    private fun onNetworkAvailable(network : Network) {
        connectivityManager.bindProcessToNetwork(network)
        wifiManager.run {
            val ipAddress = Util.formatIPAddress(dhcpInfo.gateway)

            if (!isMatchIP(ipAddress))
                return onNetworkUnavailable()

            try {
                println("Open connection")
            } catch (e: URISyntaxException) {
                e.printStackTrace()
            }
        }
    }

    private fun onNetworkUnavailable() {
        println("onNetworkUnavailable")
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

    fun setOnAddWifiToModuleListener(listener : OnAddWifiToModuleListener) {
        addListener = listener
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