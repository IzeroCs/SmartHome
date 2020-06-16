package com.izerocs.smarthome.model

import android.content.Context
import com.izerocs.smarthome.R
import com.izerocs.smarthome.activity.BaseActivity
import java.util.*
import kotlin.collections.ArrayList

/**
 * Created by IzeroCs on 2020-04-17
 */
class RoomType {
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

        private var types = mutableListOf<Int>()

        fun addTypes(baseActivity : BaseActivity, roomTypes : MutableMap<String, Int>) {
            if (types.isNotEmpty())
                return

            roomTypes.forEach { types.add(it.value) }
            baseActivity.onFetched(BaseActivity.FETCH_ROOM_TYPE)
        }

        fun getTypes() : MutableList<Int> {
            return types
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
            return getIconResource(stringToType(type))
        }

        fun isTypeValid(typeRoom : Int) : Boolean {
            return getTypes().contains(typeRoom)
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
}