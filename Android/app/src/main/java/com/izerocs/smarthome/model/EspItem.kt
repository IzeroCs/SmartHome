package com.izerocs.smarthome.model

import android.net.wifi.ScanResult
import android.net.wifi.WifiConfiguration
import android.net.wifi.WifiManager

/**
 * Created by IzeroCs on 2020-05-03
 */
class EspItem {
    private var ssid   : String = ""
    private var sn     : String = ""
    private var sc     : String = ""
    private var level  : Int    = 0
    private var signal : Int    = 0
    private var capabilities : String = ""

    data class EspDataItem(val ssid : String, val level : Int, val capabilities : String)

    companion object {
        const val SIGNAL_MIN = 0
        const val SIGNAL_MAX = 4

        private val patternSsid = "^(ESP[a-z0-9]+)(SC[a-z0-9]+)$".toRegex(RegexOption.IGNORE_CASE)

        fun isMatchEsp(ssid : String) : Boolean {
            return patternSsid.matches(ssid)
        }

        fun calculateSignalLevel(level : Int) : Int {
            return WifiManager.calculateSignalLevel(level, SIGNAL_MAX)
        }
    }

    constructor(scan : ScanResult) : this(scan.SSID, scan.level, scan.capabilities)

    constructor(ssid : String, level : Int, capabilities : String) {
        this.ssid   = ssid
        this.level  = level
        this.signal = calculateSignalLevel(level)
        this.capabilities = capabilities

        patternSsid.find(ssid)?.run {
            val (sn, sc) = this.destructured

            this@EspItem.sn = sn
            this@EspItem.sc = sc
        }
    }

    fun getSsid() : String {
        return ssid
    }

    fun getSignal() : Int {
        return signal
    }

    fun getSn() : String {
        return sn
    }

    fun getSc() : String {
        return sc
    }

    fun addNetwork(wifiManager : WifiManager?) {
        @Suppress("DEPRECATION")
        val wifi = WifiConfiguration().apply {
            this.SSID = "\"$ssid\""
            this.preSharedKey = "\"$sc\""
            this.status = WifiConfiguration.Status.ENABLED

            this.allowedGroupCiphers.set(WifiConfiguration.GroupCipher.TKIP)
            this.allowedGroupCiphers.set(WifiConfiguration.GroupCipher.CCMP)
            this.allowedKeyManagement.set(WifiConfiguration.KeyMgmt.WPA_PSK)
            this.allowedPairwiseCiphers.set(WifiConfiguration.PairwiseCipher.TKIP)
            this.allowedPairwiseCiphers.set(WifiConfiguration.PairwiseCipher.CCMP)
            this.allowedProtocols.set(WifiConfiguration.Protocol.RSN)
        }

        println(wifi)
        @Suppress("DEPRECATION")
        wifiManager?.run {
            val id = this.addNetwork(wifi)

            println("Id add: $id")
            disconnect()
            wifiManager.enableNetwork(id, false)
            reconnect()
        }
    }

    fun toData() : EspDataItem {
        return EspDataItem(ssid, level, capabilities)
    }

    override fun toString() : String {
        return "${super.toString()} { ssid: $ssid, sn: $sn, sc: $sc, level: $level, signal: $signal, capabilities: $capabilities }"
    }
}