package com.izerocs.smarthome.model

import android.content.Context
import android.graphics.drawable.Drawable

/**
 * Created by IzeroCs on 2020-04-01
 */
class RoomItem {
    private var context : Context? = null
    private var name  : String = ""
    private var type  : Int = 0
    private var deviceCount : Int = 0

    data class RoomItemData(val name : String, val type : Int)

    private fun getDefaultName(type : Int) : String {
        return RoomType.typeToName(context as Context, type)
    }

    constructor(context: Context, nameRoom : String, typeRoom : Int) {
        this.context = context
        this.name    = nameRoom
        this.type    = typeRoom
    }

    constructor(context: Context, nameRoom : String, typeRoom : String) {
        this.context = context
        this.name    = nameRoom
        this.type    = RoomType.stringToType(typeRoom)
    }

    constructor(context: Context, typeRoom: Int) {
        this.context = context
        this.type    = typeRoom
        this.name    = getDefaultName(this.type)
    }

    constructor(context: Context, typeRoom: String) {
        this.context = context
        this.type    = RoomType.stringToType(typeRoom)
        this.name    = getDefaultName(this.type)
    }

    fun getName() : String {
        return this.name
    }

    fun getType() : Int {
        return this.type
    }

    fun getDeviceCount() : Int {
        return this.deviceCount
    }

    fun getIconResource() : Int {
        return RoomType.getIconResource(this.type)
    }

    fun getIconDrawable() : Drawable? {
        return context?.getDrawable(getIconResource())
    }

    fun toData() : RoomItemData {
        return RoomItemData(name, type)
    }

}
