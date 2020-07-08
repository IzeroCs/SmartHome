package com.izerocs.smarthome.model

import android.content.Context
import com.google.gson.annotations.SerializedName
import com.izerocs.smarthome.R

data class RoomTypeModel(
    @SerializedName("id") val id : Int,
    @SerializedName("name") val name : String,
    @SerializedName("type") val type : Int,
    @SerializedName("enable") val enable : Boolean
) : BaseModel() {
    private lateinit var title : String
    private var icon : Int? = null

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

        private fun parseTypeToName(context : Context, type : Int) : String {
            var res = 0

            when (type) {
                TYPE_LIVING_ROOM    -> res = R.string.livingRoomName
                TYPE_BED_ROOM       -> res = R.string.bedRoomName
                TYPE_KITCHEN_ROOM   -> res = R.string.kitchenRoomName
                TYPE_BATH_ROOM      -> res = R.string.bathRoomName
                TYPE_BALCONY_ROOM   -> res = R.string.balconyRoomName
                TYPE_FENCE_ROOM     -> res = R.string.fenceRoomName
                TYPE_MEZZANINE_ROOM -> res = R.string.mezzanineRoomName
                TYPE_ROOF_ROOM      -> res = R.string.roofRoomName
                TYPE_STAIRS_ROOM    -> res = R.string.stairsRoomName
            }

            return context.getString(res)
        }

        fun parseTypeToIcon(type : Int) : Int {
            when (type) {
                TYPE_LIVING_ROOM    -> return R.drawable.ic_living_room
                TYPE_BED_ROOM       -> return R.drawable.ic_bed_room
                TYPE_KITCHEN_ROOM   -> return R.drawable.ic_kitchen_room
                TYPE_BATH_ROOM      -> return R.drawable.ic_bath_room
                TYPE_BALCONY_ROOM   -> return R.drawable.ic_balcony_room
                TYPE_FENCE_ROOM     -> return R.drawable.ic_fence_room
                TYPE_MEZZANINE_ROOM -> return R.drawable.ic_mezzanine_room
                TYPE_ROOF_ROOM      -> return R.drawable.ic_roof_room
                TYPE_STAIRS_ROOM    -> return R.drawable.ic_stairs_room
            }

            return 0
        }
    }

    fun getTitle(context : Context) : String {
        if (!this::title.isInitialized)
            this.title = parseTypeToName(context, type)

        return this.title
    }

    fun getIcon() : Int {
        if (this.icon == null)
            this.icon = parseTypeToIcon(type)

        return this.icon as Int
    }
}