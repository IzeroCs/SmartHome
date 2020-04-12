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
    private var descriptor : String   = ""
    private var type       : Int      = 0
    private var color      : Int      = 0
    private var widgetSize : Int      = 0
    private var icon       : Int      = 0

    companion object {
        const val TYPE_LIGHT  = 1
        const val TYPE_FAN    = 2
        const val TYPE_HEATER = 3

        const val WIDGET_SIZE_SMALL = 0
        const val WIDGET_SIZE_LARGE = 1
    }

    constructor(context : Context) {
        this.context = context
    }

    constructor(context : Context, nameDevice : String, typeDevice : Int) :
    this(context, nameDevice, typeDevice, WIDGET_SIZE_SMALL) {}

    constructor(context : Context, nameDevice : String, typeDevice : Int, widgetSizeDevice : Int) {
        this.context    = context
        this.name       = nameDevice
        this.type       = typeDevice
        this.widgetSize = widgetSizeDevice

        this.parseColor()
        this.parseIcon()
    }

    private fun parseColor() {
        var resColor = 0

        when (this.type) {
            TYPE_LIGHT  -> resColor = R.color.deviceLight
            TYPE_FAN    -> resColor = R.color.deviceFan
            TYPE_HEATER -> resColor = R.color.deviceHeater
        }

        if (resColor != 0 && context != null)
            this.color = ContextCompat.getColor(context!!, resColor)
    }

    private fun parseIcon() {
        var resIcon = 0

        when (this.type) {
            TYPE_LIGHT  -> resIcon = R.drawable.ic_device_light
            TYPE_FAN    -> resIcon = R.drawable.ic_device_fan
            TYPE_HEATER -> resIcon = R.drawable.ic_device_heater
        }

        this.icon = resIcon
    }

    fun getName() : String {
        return this.name
    }

    fun setName(nameDevice : String) : DeviceItem {
        this.name = nameDevice
        return this
    }

    fun getDescriptor() : String {
        return this.descriptor
    }

    fun setDescriptor(descriptorDevice : String) : DeviceItem {
        this.descriptor = descriptorDevice
        return this
    }

    fun getType() : Int {
        return this.type
    }

    fun setType(typeDevice : Int) : DeviceItem {
        this.type = typeDevice
        this.parseColor()
        this.parseIcon()

        return this
    }

    fun getTypeString() : String {
        var resString = 0

        when (this.type) {
            TYPE_LIGHT  -> resString = R.string.deviceLight
            TYPE_FAN    -> resString = R.string.deviceFan
            TYPE_HEATER -> resString = R.string.deviceHeater
        }

        if (resString != 0)
            return context?.getString(resString) as String

        return ""
    }

    fun getColor() : Int {
        return this.color
    }

    fun setColor(color : Int) : DeviceItem {
        this.color = color
        return this
    }

    fun getWidgetSize() : Int {
        return this.widgetSize
    }

    fun setWidgetSize(widgetSizeDevice : Int) : DeviceItem {
        if (widgetSizeDevice != WIDGET_SIZE_SMALL && widgetSizeDevice != WIDGET_SIZE_LARGE)
            this.widgetSize = WIDGET_SIZE_SMALL

        this.widgetSize = widgetSizeDevice
        return this
    }

    fun getResourceIcon() : Int {
        return this.icon
    }

    fun setResourceIcon(resIcon : Int) : DeviceItem {
        this.icon = resIcon
        return this
    }
}