package com.izerocs.smarthome.widget

import android.content.Context
import android.util.AttributeSet
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.izerocs.smarthome.R
import com.izerocs.smarthome.adapter.ListDeviceAdapter
import com.izerocs.smarthome.model.DeviceItem
import com.izerocs.smarthome.utils.GridSpacesItemDecoration

/**
 * Created by IzeroCs on 2020-03-26
 */
class ListDeviceView(context : Context, attributeSet: AttributeSet) : RecyclerView(context, attributeSet) {
    class SpanSizeLookup(context : Context, listDeviceAdapter : ListDeviceAdapter) : GridLayoutManager.SpanSizeLookup() {

        override fun getSpanSize(position : Int) : Int {
            if (position == 0)
                return 2

            return 1
        }

    }

    init {
        adapter = ListDeviceAdapter(context)
        layoutManager = GridLayoutManager(context, 2)
//            .apply {
//            spanSizeLookup = SpanSizeLookup(context, adapter as ListDeviceAdapter)
//        }

        setHasFixedSize(true)
        setItemViewCacheSize(20)
        addItemDecoration(GridSpacesItemDecoration(resources.getDimensionPixelSize(R.dimen.listDeviceItemSpaceHorizontal), true))
    }

    fun add(item : DeviceItem) : Boolean = (adapter as ListDeviceAdapter).add(item)
}