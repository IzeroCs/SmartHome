package com.izerocs.smarthome.model

import com.google.gson.annotations.SerializedName

data class DeviceTypeModel(
    @SerializedName("id") val id : Int,
    @SerializedName("name") val name : String,
    @SerializedName("nsp") val nsp : String,
    @SerializedName("type") val type : Int
)