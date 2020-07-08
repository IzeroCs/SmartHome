package com.izerocs.smarthome.model

import com.google.gson.annotations.SerializedName

data class EspPinModel(
    @SerializedName("input") val input : Int,
    @SerializedName("outputType") val outputType : Int,
    @SerializedName("outputPrimary") val outputPrimary : Int,
    @SerializedName("outputSecondary") val outputSecondary : Int,
    @SerializedName("dualToggleCount") val dualToggleCount : Int,
    @SerializedName("status") val status : Boolean
) : BaseModel()