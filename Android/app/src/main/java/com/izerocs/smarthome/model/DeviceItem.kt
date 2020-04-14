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
    private var status     : Int      = 0

    companion object {
        const val TYPE_LIGHT  = 1
        const val TYPE_FAN    = 2
        const val TYPE_HEATER = 3

        const val WIDGET_SIZE_SMALL = 0
        const val WIDGET_SIZE_LARGE = 1

        const val STATUS_OFF = 0
        const val STATUS_ON  = 1

        fun getTypes() : IntArray {
            return intArrayOf(TYPE_LIGHT, TYPE_FAN, TYPE_HEATER)
        }

        fun getTypeString(context : Context?, type : Int) : String {
            var resString = 0

            when (type) {
                TYPE_LIGHT  -> resString = R.string.deviceLight
                TYPE_FAN    -> resString = R.string.deviceFan
                TYPE_HEATER -> resString = R.string.deviceHeater
            }

            if (resString != 0)
                return context?.getString(resString) as String

            return ""
        }

         fun getResourceIcon(type : Int) : Int {
            var resIcon = 0

            when (type) {
                TYPE_LIGHT  -> resIcon = R.drawable.ic_device_light
                TYPE_FAN    -> resIcon = R.drawable.ic_device_fan
                TYPE_HEATER -> resIcon = R.drawable.ic_device_heater
            }

            return resIcon
        }

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
        this.icon = Companion.getResourceIcon(this.type)
    }

    fun getName() : String {
        return this.name
    }

    fun setName(nameDevice : String) {
        this.name = nameDevice
    }

    fun getDescriptor() : String {
        return this.descriptor
    }

    fun setDescriptor(descriptorDevice : String) {
        this.descriptor = descriptorDevice
    }

    fun getType() : Int {
        return this.type
    }

    fun setType(typeDevice : Int) {
        this.type = typeDevice
        this.parseColor()
        this.parseIcon()
    }

    fun getTypeString() : String {
       return Companion.getTypeString(this.context, this.type)
    }

    fun getColor() : Int {
        return this.color
    }

    fun setColor(color : Int) {
        this.color = color
    }

    fun getWidgetSize() : Int {
        return this.widgetSize
    }

    fun setWidgetSize(widgetSizeDevice : Int) {
        if (widgetSizeDevice != WIDGET_SIZE_SMALL && widgetSizeDevice != WIDGET_SIZE_LARGE)
            this.widgetSize = WIDGET_SIZE_SMALL

        this.widgetSize = widgetSizeDevice
    }

    fun getResourceIcon() : Int {
        return this.icon
    }

    fun setResourceIcon(resIcon : Int) {
        this.icon = resIcon
    }

    fun getStatus() : Int {
        return this.status
    }

    fun setStatus(status : Int) {
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
}