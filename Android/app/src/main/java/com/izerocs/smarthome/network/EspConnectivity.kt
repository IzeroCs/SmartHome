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
import java.io.FileNotFoundException
import java.net.ConnectException
import java.net.HttpURLConnection
import java.net.URL

/**
 * Created by IzeroCs on 2020-05-14
 */
class EspConnectivity(private val context : Context) {
    private val wifiManager = context.applicationContext
        .getSystemService(Context.WIFI_SERVICE) as WifiManager

    private val connectivityManager = context.applicationContext
        .getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager

    private var networkCallback : NetworkCallback? = null
    private var scanerListener : OnScanerListener? = null
    private var isNetworkChanged = false
    private var isScan = false

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
        const val PORT_SERVER = "80"
        const val PATH_WIFI_SERVER = "/wifi"

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

    fun addWifiToModule(item : EspItem) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q)
            connectNetworkAndroidQ(item)
        else
            connectNetworkPreAndroidQ(item)
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

            println("onNetworkAvailable: $network")
            println("sendWifiToModule: $ipAddress")

            if (!isMatchIP(ipAddress))
                return onNetworkUnavailable()

            println("Send wifi to module: $ipAddress")

            val url = URL("${SCHEME_SERVER}${IP_ADDRESS}:${PORT_SERVER}${PATH_WIFI_SERVER}")
            val builder = StringBuilder()

            println("Connection to: ${url.toURI()}")

            try {
                with(url.openConnection() as HttpURLConnection) {
                    requestMethod = "GET"

                    try {
                        inputStream.bufferedReader(Charsets.UTF_8).use {
                            it.forEachLine { builder.append(it) }

                            println("Builder: ${builder.toString()}")
                        }
                    } catch (e : FileNotFoundException) {
                        println("Response Code: $responseCode")
                        println("Response Message: $responseMessage")
                        e.printStackTrace()
                    }
                }
            } catch (e : ConnectException) {
                e.printStackTrace()
            }
        }
    }

    private fun onNetworkUnavailable() {
        println("onNetworkUnavailable")
    }

    private fun unregisterNetworkCallback() {
        connectivityManager.unregisterNetworkCallback(networkCallback!!)
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

    fun setOnScannerListener(listener : OnScanerListener) {
        scanerListener = listener
    }

    fun destroy() {
        connectivityManager.unregisterNetworkCallback(networkCallback)
    }

    fun isScanRunning() : Boolean {
        return isScan
    }

    fun isScanThrottleEnabled() : Boolean {
        return Settings.Global.getInt(context.contentResolver, "wifi_scan_throttle_enabled") == 1
    }

}