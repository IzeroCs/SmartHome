package com.izerocs.smarthome.model

import android.content.Context
import com.izerocs.smarthome.R
import java.util.*

/**
 * Created by IzeroCs on 2020-04-17
 */
class RoomType {
    private var context : Context? = null
    private var id      : String   = ""
    private var name    : String   = ""
    private var title   : String   = ""
    private var type    : Int      = 0
    private var iconRes : Int      = 0

    companion object {
        private const val TYPE_LIVING_ROOM    : Int = 1 // Phong khach
        private const val TYPE_BED_ROOM       : Int = 2 // Phong ngu
        private const val TYPE_KITCHEN_ROOM   : Int = 3 // Phong an
        private const val TYPE_BATH_ROOM      : Int = 4 // Phong tam
        private const val TYPE_BALCONY_ROOM   : Int = 5 // Ban cong
        private const val TYPE_FENCE_ROOM     : Int = 6 // San nha
        private const val TYPE_MEZZANINE_ROOM : Int = 7 // Gac lung
        private const val TYPE_ROOF_ROOM      : Int = 8 // Gac mai
        private const val TYPE_STAIRS_ROOM    : Int = 9 // Cau thang - Hanh lang

        fun typeToName(context : Context, type : Int) : String {
            var resIdName : Int = -1

            when (type) {
                TYPE_LIVING_ROOM    -> resIdName = R.string.livingRoomName
                TYPE_BED_ROOM       -> resIdName = R.string.bedRoomName
                TYPE_KITCHEN_ROOM   -> resIdName = R.string.kitchenRoomName
                TYPE_BATH_ROOM      -> resIdName = R.string.bathRoomName
                TYPE_BALCONY_ROOM   -> resIdName = R.string.balconyRoomName
                TYPE_FENCE_ROOM     -> resIdName = R.string.fenceRoomName
                TYPE_MEZZANINE_ROOM -> resIdName = R.string.mezzanineRoomName
                TYPE_ROOF_ROOM      -> resIdName = R.string.roofRoomName
                TYPE_STAIRS_ROOM    -> resIdName = R.string.stairsRoomName
            }

            if (resIdName != -1)
                return context.getString(resIdName)

            return ""
        }

        fun getIconResource(type : Int) : Int {
            var resIconId : Int = -1

            when (type) {
                TYPE_LIVING_ROOM    -> resIconId = R.drawable.ic_living_room
                TYPE_BED_ROOM       -> resIconId = R.drawable.ic_bed_room
                TYPE_KITCHEN_ROOM   -> resIconId = R.drawable.ic_kitchen_room
                TYPE_BATH_ROOM      -> resIconId = R.drawable.ic_bath_room
                TYPE_BALCONY_ROOM   -> resIconId = R.drawable.ic_balcony_room
                TYPE_FENCE_ROOM     -> resIconId = R.drawable.ic_fence_room
                TYPE_MEZZANINE_ROOM -> resIconId = R.drawable.ic_mezzanine_room
                TYPE_ROOF_ROOM      -> resIconId = R.drawable.ic_roof_room
                TYPE_STAIRS_ROOM    -> resIconId = R.drawable.ic_stairs_room
            }

            return resIconId
        }

        fun getIconResource(type : String) : Int {
            return getIconResource(stringToType(type))
        }

        fun stringToType(type : String) : Int {
            var typeInt = 0

            when (type.toLowerCase(Locale.ROOT)) {
                "living_room"    -> typeInt = TYPE_LIVING_ROOM
                "bed_room"       -> typeInt = TYPE_BED_ROOM
                "kitchen_room"   -> typeInt = TYPE_KITCHEN_ROOM
                "bath_room"      -> typeInt = TYPE_BATH_ROOM
                "balcony_room"   -> typeInt = TYPE_BALCONY_ROOM
                "fence_room"     -> typeInt = TYPE_FENCE_ROOM
                "mezzanine_room" -> typeInt = TYPE_MEZZANINE_ROOM
                "roof_room"      -> typeInt = TYPE_ROOF_ROOM
                "stairs_room"    -> typeInt = TYPE_STAIRS_ROOM
            }

            return typeInt
        }
    }

    data class RoomTypeData(val id : String, val name : String, val type : Int)

    constructor(context : Context, idRoom: String, nameRoom : String, typeRoom : Int) {
        this.context = context
        this.id      = idRoom
        this.name    = nameRoom
        this.type    = typeRoom
        this.title   = typeToName(context, typeRoom)
        this.iconRes = RoomType.getIconResource(typeRoom)
    }

    constructor(context : Context, roomTypeData : RoomTypeData) :
        this(context, roomTypeData.id, roomTypeData.name, roomTypeData.type)

    fun getId() : String = this.id
    fun getName() : String = this.name
    fun getTitle() : String = this.title
    fun getType() : Int = this.type
    fun getIconResource() : Int = this.iconRes
    fun toData() : RoomTypeData = RoomTypeData(id, name, type)

    override fun toString() : String {
        return "${super.toString()} " +
                "{ id: $id, name: $name, type: $type }"
    }
}