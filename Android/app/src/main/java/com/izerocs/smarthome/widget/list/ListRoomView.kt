package com.izerocs.smarthome.widget.list

import android.content.Context
import android.util.AttributeSet
import androidx.recyclerview.widget.RecyclerView
import com.izerocs.smarthome.R
import com.izerocs.smarthome.adapter.ListRoomAdapter
import com.izerocs.smarthome.model.RoomItem
import com.izerocs.smarthome.widget.manager.GridLayoutManager

/**
 * Created by IzeroCs on 2020-04-01
 */
class ListRoomView(context: Context, attributeSet: AttributeSet) : RecyclerView(context, attributeSet) {

    init {
        clipChildren = false
        clipToPadding = false
        adapter = ListRoomAdapter(context)
        layoutManager =
            GridLayoutManager(
                context,
                2,
                adapter
            )

        addItemDecoration(
            GridLayoutManager.GridSpacesItemDecoration(
                resources.getDimensionPixelSize(
                    R.dimen.listRoomSpacing
                ), true
            )
        )
        setHasFixedSize(true)
        setItemViewCacheSize(20)
    }

    fun clear() : Unit = getCatchAdapter().clear()
    fun add(room : RoomItem) : Boolean = getCatchAdapter().add(room)
    fun addAll(rooms : MutableList<RoomItem>) : Boolean = getCatchAdapter().addAll(rooms)
    fun get(position : Int) : RoomItem = getCatchAdapter().get(position)
    fun notifyDataSetChanged() : Unit = getCatchAdapter().notifyDataSetChanged()

    fun setOnItemClickListener(listener: ListRoomAdapter.OnItemClickListener?) : Unit =
        getCatchAdapter().setOnItemClickListener(listener)

    private fun getCatchAdapter() : ListRoomAdapter = adapter as ListRoomAdapter
}