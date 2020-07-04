package com.izerocs.smarthome.item

import android.content.Context

/**
 * Created by IzeroCs on 2020-04-01
 */
class RoomListItem {
    private var context : Context? = null
    private var id      : String   = ""
    private var name    : String   = ""
    private var type    : Int      = 0
    private var iconRes : Int      = 0
    private var deviceCount : Int  = 0

    data class RoomItemData(val id : String, val name : String, val type : Int)

    constructor(context : Context, idRoom: String, nameRoom : String, typeRoom : Int) {
        this.context = context
        this.id      = idRoom
        this.name    = nameRoom
        this.type    = typeRoom
        this.iconRes = RoomTypeItem.getIconResource(typeRoom)
    }

    constructor(context : Context, idRoom : String, nameRoom : String, typeRoom : String) :
            this(context, idRoom, nameRoom, RoomTypeItem.stringToType(typeRoom))

    constructor(context : Context, roomItemData : RoomItemData) :
            this(context, roomItemData.id, roomItemData.name, roomItemData.type)

    fun getId() : String = this.id
    fun getName() : String = this.name
    fun getType() : Int = this.type
    fun getDeviceCount() : Int = this.deviceCount
    fun getIconResource() : Int = this.iconRes
    fun toData() : RoomItemData = RoomItemData(id, name, type)

    override fun toString() : String {
        return "${super.toString()} " +
                "{ id: $id, name: $name, type: $type }"
    }

}
