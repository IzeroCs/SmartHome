package com.izerocs.smarthome.model

import android.content.Context
import androidx.core.content.ContextCompat
import com.izerocs.smarthome.R

/**
 * Created by IzeroCs on 2020-03-26
 */
class DeviceItem {
    private var context    : Context? = null
    private var name       : String   = ""
    private var type       : Int      = 0
    private var color      : Int      = 0
    private var widgetSize : Int      = 0

    companion object {
        const val TYPE_LIGHT  = 1
        const val TYPE_FAN    = 2
        const val TYPE_HEATER = 3

        const val WIDGET_SIZE_SMALL = 0
        const val WIDGET_SIZE_LARGE = 1
    }

    constructor(context : Context, nameDevice : String, typeDevice : Int) {
        DeviceItem(context, nameDevice, typeDevice, WIDGET_SIZE_SMALL)
    }

    constructor(context : Context, nameDevice : String, typeDevice : Int, widgetSizeDevice : Int) {
        this.context    = context
        this.name       = nameDevice
        this.type       = typeDevice
        this.widgetSize = widgetSizeDevice

        this.parseColor()
    }

    private fun parseColor() {
        var resColor = 0

        when (this.type) {
            TYPE_LIGHT  -> resColor = R.color.deviceLight
            TYPE_FAN    -> resColor = R.color.deviceFan
            TYPE_HEATER -> resColor = R.color.deviceHeater
        }

        if (resColor > 0)
            this.color = ContextCompat.getColor(context!!, resColor)
    }

    fun getName() : String {
        return this.name
    }

    fun getType() : Int {
        return this.type
    }

    fun getTypeString() : String {
        var resString = 0

        when (this.type) {
            TYPE_LIGHT  -> resString = R.string.deviceLight
            TYPE_FAN    -> resString = R.string.deviceFan
            TYPE_HEATER -> resString = R.string.deviceHeater
        }

        if (resString > 0)
            return context?.getString(resString) as String

        return ""
    }

    fun getWidgetSize() : Int {
        return this.widgetSize
    }
}