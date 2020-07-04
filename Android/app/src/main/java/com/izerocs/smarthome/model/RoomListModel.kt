package com.izerocs.smarthome.model

import com.google.gson.annotations.SerializedName

data class RoomListModel(
    @SerializedName("id") val id : Int,
    @SerializedName("name") val name : String,
    @SerializedName("enable") val enable : Boolean
)