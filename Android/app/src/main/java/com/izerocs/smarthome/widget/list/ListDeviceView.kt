package com.izerocs.smarthome.widget.list

import android.content.Context
import android.util.AttributeSet
import com.izerocs.smarthome.R
import com.izerocs.smarthome.adapter.ListDeviceAdapter
import com.izerocs.smarthome.model.RoomDeviceModel
import com.izerocs.smarthome.widget.manager.GridLayoutManager

/**
 * Created by IzeroCs on 2020-03-26
 */
class ListDeviceView(context : Context, attributeSet: AttributeSet) : RecyclerView(context, attributeSet) {
    init {
        adapter = ListDeviceAdapter(context)
        layoutManager =
            GridLayoutManager(
                context,
                2,
                adapter
            )

        setHasFixedSize(true)
        setItemViewCacheSize(20)
        addItemDecoration(
            GridLayoutManager.GridSpacesItemDecoration(
                resources.getDimensionPixelSize(
                    R.dimen.listDeviceSpacing
                ), true
            )
        )
    }

    fun clear() : Unit = getCastAdapter().clear()
    fun add(itemRoom : RoomDeviceModel) : Boolean = getCastAdapter().add(itemRoom)
    fun addAll(elements : MutableList<RoomDeviceModel>) : Boolean = getCastAdapter().addAll(elements)
    fun get(position : Int) : RoomDeviceModel? = getCastAdapter().get(position)
    fun notifyDataSetChanged() : Unit = getCastAdapter().notifyDataSetChanged()
    fun getCastAdapter() : ListDeviceAdapter = adapter as ListDeviceAdapter

    fun setOnItemClickListener(listener : ListDeviceAdapter.OnItemClickListener) :
            Unit = (adapter as ListDeviceAdapter).setOnItemClickListener(listener)
}