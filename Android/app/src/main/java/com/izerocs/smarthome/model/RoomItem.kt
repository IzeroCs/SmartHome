package com.izerocs.smarthome.model

import android.content.Context
import android.graphics.drawable.Drawable
import com.izerocs.smarthome.R
import java.util.*
import kotlin.collections.ArrayList

/**
 * Created by IzeroCs on 2020-04-01
 */
class RoomItem {
    private var context : Context? = null
    private var name  : String = ""
    private var type  : Int = 0
    private var deviceCount : Int = 0

    data class RoomItemData(val name : String, val type : Int)

    companion object {
        const val TYPE_LIVING_ROOM    : Int = 1 // Phong khach
        const val TYPE_BED_ROOM       : Int = 2 // Phong ngu
        const val TYPE_KITCHEN_ROOM   : Int = 3 // Phong an
        const val TYPE_BATH_ROOM      : Int = 4 // Phong tam
        const val TYPE_BALCONY_ROOM   : Int = 5 // Ban cong
        const val TYPE_FENCE_ROOM     : Int = 6 // San nha
        const val TYPE_MEZZANINE_ROOM : Int = 7 // Gac lung
        const val TYPE_ROOF_ROOM      : Int = 8 // Gac mai
        const val TYPE_STAIRS_ROOM    : Int = 9 // Cau thang - Hanh lang

        fun getTypes() : IntArray {
            return intArrayOf(
                TYPE_LIVING_ROOM,
                TYPE_BED_ROOM,
                TYPE_KITCHEN_ROOM,
                TYPE_BATH_ROOM,
                TYPE_BALCONY_ROOM,
                TYPE_STAIRS_ROOM,
                TYPE_FENCE_ROOM,
                TYPE_MEZZANINE_ROOM,
                TYPE_ROOF_ROOM
            )
        }

        fun getTypeItems(context : Context) : ArrayList<RoomItem> {
            return ArrayList<RoomItem>().apply {
                getTypes().forEach { add(RoomItem(context, it)) }
            }
        }

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
            return getIconResource(parseTypeFromString(type))
        }

        fun isTypeValid(typeRoom : Int) : Boolean {
            return getTypes().contains(typeRoom)
        }

        private fun parseTypeFromString(type : String) : Int {
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

    private fun getDefaultName(type : Int) : String {
        return Companion.typeToName(context as Context, type)
    }

    constructor(context: Context, nameRoom : String, typeRoom : Int) {
        this.context = context
        this.name    = nameRoom
        this.type    = typeRoom
    }

    constructor(context: Context, nameRoom : String, typeRoom : String) {
        this.context = context
        this.name    = nameRoom
        this.type    = parseTypeFromString(typeRoom)
    }

    constructor(context: Context, typeRoom: Int) {
        this.context = context
        this.type    = typeRoom
        this.name    = getDefaultName(this.type)
    }

    constructor(context: Context, typeRoom: String) {
        this.context = context
        this.type    = parseTypeFromString(typeRoom)
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
        return getIconResource(this.type)
    }

    fun getIconDrawable() : Drawable? {
        return context?.getDrawable(getIconResource())
    }

    fun toData() : RoomItemData {
        return RoomItemData(name, type)
    }

}
