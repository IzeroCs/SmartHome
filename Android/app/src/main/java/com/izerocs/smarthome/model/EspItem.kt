package com.izerocs.smarthome.model

import android.net.wifi.ScanResult

/**
 * Created by IzeroCs on 2020-05-03
 */
class EspItem {
    private var ssid   : String = ""
    private var sn     : String = ""
    private var sc     : String = ""

    private var rssi   : Int    = 0
    private var signal : Int    = 0

    private var isOnline     : Boolean = false
    private var isFilter     : Boolean = false
    private var capabilities : String = ""

    private var listPins     : MutableList<EspDataPin> = mutableListOf()

    data class EspDataItem(val ssid : String, val level : Int, val capabilities : String)
    data class EspDataPin(var input : Int, var outputType : Int, var outputPrimary : Int,
                          var outputSecondary : Int, var status : Boolean)

    companion object {
        const val TAG = "EspItem"
        const val SIGNAL_MIN = 0
        const val SIGNAL_MAX = 5
        const val RSSI_MIN   = -100
        const val RSSI_MAX   = -55

        private val patternSsid = "^(ESP[a-z0-9]+)(SC[a-z0-9]+)$".toRegex(RegexOption.IGNORE_CASE)

        fun isMatchEsp(ssid : String) : Boolean {
            return patternSsid.matches(ssid)
        }

        fun calculateSignalLevel(rssi : Int, numLevels : Int = SIGNAL_MAX) : Int {
            return when {
                rssi <= RSSI_MIN -> SIGNAL_MIN
                rssi >= RSSI_MAX -> numLevels - 1

                else -> {
                    val inputRange  : Float = (RSSI_MAX - RSSI_MIN).toFloat()
                    val outputRange : Float = (numLevels - 1).toFloat()

                    ((rssi - RSSI_MIN).toFloat() * outputRange / inputRange).toInt()
                }
            }
        }
    }

    constructor(scan : ScanResult) : this(scan.SSID, scan.level, scan.capabilities)

    constructor(ssid : String, rssi : Int = RSSI_MAX, capabilities : String = "") {
        this.sn     = ssid
        this.ssid   = ssid
        this.rssi   = rssi
        this.signal = calculateSignalLevel(this.rssi)
        this.capabilities = capabilities

        patternSsid.find(ssid)?.run {
            val (sn, sc) = this.destructured

            this@EspItem.sn = sn
            this@EspItem.sc = sc
        }
    }

    fun getSsid() : String = this.ssid
    fun getSignal() : Int = this.signal
    fun getSn() : String = this.sn
    fun getSc() : String = this.sc
    fun isOnline() : Boolean = this.isOnline
    fun isFilter() : Boolean = this.isFilter
    fun getListPins() : MutableList<EspDataPin> = this.listPins
    fun toData() : EspDataItem = EspDataItem(ssid, rssi, capabilities)

    fun isFilterSet() : Boolean {
        val isFilter = this.isFilter

        if (isFilter)
            this.isFilter = false

        return isFilter
    }

    fun setSsid(ssid : String) { this.ssid = ssid }
    fun setOnline(isOnline : Boolean) { this.isOnline = isOnline }
    fun setFilter(isFilter : Boolean) { this.isFilter = isFilter }
    fun setSignal(rssi : Int) {
        this.rssi   = rssi
        this.signal = calculateSignalLevel(rssi)
    }

    override fun toString() : String {
        return "${super.toString()} " +
               "{ ssid: $ssid, sn: $sn, sc: $sc, rssi: $rssi, signal: $signal, capabilities: $capabilities }"
    }
}