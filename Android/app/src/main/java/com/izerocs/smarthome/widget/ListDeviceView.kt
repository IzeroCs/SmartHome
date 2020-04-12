package com.izerocs.smarthome.widget

import android.content.Context
import android.util.AttributeSet
import com.izerocs.smarthome.R
import com.izerocs.smarthome.adapter.ListDeviceAdapter
import com.izerocs.smarthome.model.DeviceItem

/**
 * Created by IzeroCs on 2020-03-26
 */
class ListDeviceView(context : Context, attributeSet: AttributeSet) : RecyclerView(context, attributeSet) {
    init {
        adapter = ListDeviceAdapter(context)
        layoutManager = GridLayoutManager(context, 2, adapter)

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

    fun add(item : DeviceItem) : Boolean = (adapter as ListDeviceAdapter).add(item)
}