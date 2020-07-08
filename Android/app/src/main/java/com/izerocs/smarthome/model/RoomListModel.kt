package com.izerocs.smarthome.model

import com.google.gson.annotations.SerializedName

data class RoomListModel(
    @SerializedName("id") val id : Int,
    @SerializedName("name") val name : String,
    @SerializedName("enable") val enable : Boolean,
    @SerializedName("type") val type : RoomTypeModel,
    @SerializedName("devices") val devices : MutableList<RoomDeviceModel>
) : BaseModel()