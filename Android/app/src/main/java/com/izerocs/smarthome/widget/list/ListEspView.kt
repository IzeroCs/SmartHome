package com.izerocs.smarthome.widget.list

import android.content.Context
import android.util.AttributeSet
import com.izerocs.smarthome.R
import com.izerocs.smarthome.adapter.ListEspAdapter
import com.izerocs.smarthome.model.EspItem
import com.izerocs.smarthome.widget.manager.LinearLayoutManager

/**
 * Created by IzeroCs on 2020-05-03
 */
class ListEspView(context : Context, attributeSet: AttributeSet) : RecyclerView(context, attributeSet) {
    init {
        adapter = ListEspAdapter(context)
        layoutManager = LinearLayoutManager(context).apply {
            orientation = VERTICAL
        }

        setHasFixedSize(true)
        setItemViewCacheSize(20)
        addItemDecoration(LinearLayoutManager.SpacesItemDecortion(
            resources.getDimensionPixelSize(
                R.dimen.listEspSpacing
            )
        ))
    }

    fun add(item : EspItem) : Boolean = (adapter as ListEspAdapter).add(item)

    fun clear() : Unit = (adapter as ListEspAdapter).clear()

    fun get(position : Int) : EspItem {
        return (adapter as ListEspAdapter).get(position)
    }

    fun setOnItemClickListener(listener : ListEspAdapter.OnItemClickListener) :
            Unit = (adapter as ListEspAdapter).setOnItemClickListener(listener)

    fun notifyDataSetChanged() : Unit = (adapter as ListEspAdapter).notifyDataSetChanged()
}