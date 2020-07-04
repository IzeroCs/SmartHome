package com.izerocs.smarthome.model

import com.google.gson.annotations.SerializedName
import com.izerocs.smarthome.network.Util

data class EspModuleModel(
    @SerializedName("id") val id : Int,
    @SerializedName("name") val name : String,
    @SerializedName("online") val online : Boolean,
    @SerializedName("auth") val auth : Boolean,
    @SerializedName("changed") val changed : Boolean,
    @SerializedName("pins") val pins: MutableList<EspPinModel>,
    @SerializedName("detail_rssi") val detail_rssi : String
) {
    private lateinit var sn : String
    private lateinit var sc : String
    private var signal      : Int? = null

    companion object {
        private val patternSsid = "^(ESP[a-z0-9]+)(SC[a-z0-9]+)$".toRegex(RegexOption.IGNORE_CASE)
    }

    fun getSn() : String {
        if (!this::sn.isInitialized)
            parseName()

        return this.sn
    }

    fun getSc() : String {
        if (!this::sc.isInitialized)
            parseName()

        return this.sc
    }

    fun getSignal() : Int {
        if (this.signal == null)
            this.signal = Util.calculateSignalLevel(detail_rssi.toInt())

        return this.signal as Int
    }

    private fun parseName() {
        this.sn = ""
        this.sc = ""

        patternSsid.find(name)?.run {
            val (sn, sc) = this.destructured

            this@EspModuleModel.sn = sn
            this@EspModuleModel.sc = sc
        }
    }
}