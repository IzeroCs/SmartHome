package com.izerocs.smarthome.model

import com.google.gson.annotations.SerializedName

data class EspPinModel(
    @SerializedName("id") val id : Int,
    @SerializedName("name") val name : String?,
    @SerializedName("input") val input : IOPin?,
    @SerializedName("outputType") val outputType : IOPin?,
    @SerializedName("outputPrimary") val outputPrimary : IOPin?,
    @SerializedName("outputSecondary") val outputSecondary : IOPin?,
    @SerializedName("dualToggleCount") val dualToggleCount : IOPin?,
    @SerializedName("statusCloud") var statusCloud : StatusCloud?,
    @SerializedName("status") var status : Boolean
) : BaseModel() {
    enum class IOPin() {
        @SerializedName("0") PIN_0,
        @SerializedName("1") PIN_1,
        @SerializedName("2") PIN_2,
        @SerializedName("3") PIN_3,
        @SerializedName("4") PIN_4,
        @SerializedName("5") PIN_5,
        @SerializedName("6") PIN_6,
        @SerializedName("7") PIN_7,
    }

    enum class StatusCloud() {
        @SerializedName("0") IDLE,
        @SerializedName("1") ON,
        @SerializedName("2") OFF
    }
}