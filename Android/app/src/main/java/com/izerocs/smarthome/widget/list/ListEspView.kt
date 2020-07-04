package com.izerocs.smarthome.widget.list

import android.content.Context
import android.util.AttributeSet
import com.izerocs.smarthome.R
import com.izerocs.smarthome.adapter.ListEspAdapter
import com.izerocs.smarthome.model.EspModuleModel
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

    fun clear() : Unit = (adapter as ListEspAdapter).clear()
    fun add(item : EspModuleModel) : Boolean = (adapter as ListEspAdapter).add(item)
    fun addAll(lists : MutableList<EspModuleModel>) : Boolean = (adapter as ListEspAdapter).addAll(lists)
    fun get(position : Int) : EspModuleModel = (adapter as ListEspAdapter).get(position)
    fun size() : Int = (adapter as ListEspAdapter).itemCount
    fun notifyDataSetChanged() : Unit = (adapter as ListEspAdapter).notifyDataSetChanged()

    fun setOnItemClickListener(listener : ListEspAdapter.OnItemClickListener) :
            Unit = (adapter as ListEspAdapter).setOnItemClickListener(listener)

}