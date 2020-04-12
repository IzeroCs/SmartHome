package com.izerocs.smarthome.widget

import android.content.Context
import android.util.AttributeSet
import androidx.recyclerview.widget.RecyclerView
import com.izerocs.smarthome.R
import com.izerocs.smarthome.adapter.ListRoomAdapter
import com.izerocs.smarthome.model.RoomItem

/**
 * Created by IzeroCs on 2020-04-01
 */
class ListRoomView(context: Context, attributeSet: AttributeSet) : RecyclerView(context, attributeSet) {

    init {
        clipChildren = false
        clipToPadding = false
        adapter = ListRoomAdapter(context)
        layoutManager = GridLayoutManager(context, 2, adapter)

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

    fun add(room : RoomItem) : Unit = (adapter as ListRoomAdapter).add(room)
    fun clear() : Unit = (adapter as ListRoomAdapter).clear()

    fun get(position : Int) : RoomItem {
        return (adapter as ListRoomAdapter).get(position)
    }

    fun setOnItemClickListener(listener: ListRoomAdapter.OnItemClickListener?) : Unit =
        (adapter as ListRoomAdapter).setOnItemClickListener(listener)
}