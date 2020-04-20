package com.izerocs.smarthome.model

import android.content.Context
import com.github.nkzawa.emitter.Emitter
import com.github.nkzawa.socketio.client.Socket
import com.izerocs.smarthome.R
import com.izerocs.smarthome.activity.BaseActivity
import org.json.JSONArray
import java.util.*
import kotlin.collections.ArrayList
import kotlin.reflect.KFunction1

/**
 * Created by IzeroCs on 2020-04-17
 */
class RoomType {
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

        private var types = mutableListOf<Int>()

        fun fetchTypes(context : Context, socket : Socket, callback : KFunction1<Int, Unit>) {
            if (types.isNotEmpty())
                return

            socket.on("room/types", Emitter.Listener {
                println("Array types fetch")
                println(it[0])
                (it[0] as JSONArray).run {
                    for (i in 0 until length())
                        types.add(stringToType(getString(i)))

                    callback(BaseActivity.FETCH_ROOM_TYPE)
                }
            }).emit("room/types")
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