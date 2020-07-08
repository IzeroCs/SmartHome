package com.izerocs.smarthome.model

import com.google.gson.annotations.SerializedName
import com.izerocs.smarthome.R

data class RoomDeviceModel(
    @SerializedName("id") val id : Int,
    @SerializedName("name") val name : String,
    @SerializedName("descriptor") val descriptor : String,
    @SerializedName("widget") val widget : Int,
    @SerializedName("status") var status : Int,
    @SerializedName("type") val type : DeviceTypeModel,
    @SerializedName("esp") val esp : EspModuleModel,
    @SerializedName("room") val room : RoomListModel
) : BaseModel() {
    val color : Int
        get() = parseColor()

    val icon  : Int
        get() = parseIcon()

    companion object {
        const val TYPE_LIGHT  = 1
        const val TYPE_FAN    = 2
        const val TYPE_HEATER = 3

        const val WIDGET_SIZE_SMALL = 0
        const val WIDGET_SIZE_LARGE = 1

        const val STATUS_OFF = 0
        const val STATUS_ON  = 1
    }

    fun modifyStatus(status : Int) {
        if (status != STATUS_OFF && status != STATUS_ON)
            this.status = STATUS_OFF

        this.status = status
    }

    fun toggleStatus() {
        if (status == STATUS_ON)
            this.status = STATUS_OFF
        else
            this.status = STATUS_ON
    }

    private fun parseColor() : Int {
        if (color != -1)
            return color

        when (type.type) {
            TYPE_LIGHT  -> return R.color.deviceLight
            TYPE_FAN    -> return R.color.deviceFan
            TYPE_HEATER -> return R.color.deviceHeater
        }

        return 0
    }

    private fun parseIcon() : Int {
        when (type.type) {
            TYPE_LIGHT  -> return R.drawable.ic_device_light
            TYPE_FAN    -> return R.drawable.ic_device_fan
            TYPE_HEATER -> return R.drawable.ic_device_heater
        }

        return 0
    }
}