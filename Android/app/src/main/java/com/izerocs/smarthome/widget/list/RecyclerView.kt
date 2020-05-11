package com.izerocs.smarthome.widget.list

import android.annotation.SuppressLint
import android.content.Context
import android.util.AttributeSet
import android.view.View
import com.izerocs.smarthome.R
import androidx.recyclerview.widget.RecyclerView as ParentRecyclerView

/**
 * Created by IzeroCs on 2020-04-11
 */
@SuppressLint("Recycle")
abstract class RecyclerView(context : Context, attributeSet : AttributeSet) : ParentRecyclerView(context, attributeSet) {

    private var emptyObserver : AdapterDataObserver? = null
    private var emptyView : View? = null
    private var emptyId   : Int = 0

    abstract class Adapter<T : ViewHolder>() : ParentRecyclerView.Adapter<T>() {
        open fun getSpanSize(position : Int) : Int {
            return 1
        }
    }

    abstract class ViewHolder(view : View) : ParentRecyclerView.ViewHolder(view) {}

    init {
        val typedArray = context.obtainStyledAttributes(attributeSet, R.styleable.RecyclerView, 0, 0)

        typedArray.run {
            emptyId = getResourceId(R.styleable.RecyclerView_empty, 0)
        }
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()

        if (emptyId > 0)
            setEmptyList((parent as View).findViewById(emptyId))
    }

    override fun setAdapter(adapter : androidx.recyclerview.widget.RecyclerView.Adapter<*>?) {
        super.setAdapter(adapter)

        if (adapter != null && emptyObserver == null) {
            emptyObserver = object : AdapterDataObserver() {
                override fun onChanged() {
                    if (this@RecyclerView.adapter == null || emptyView == null)
                        return

                    if (this@RecyclerView.adapter?.itemCount!! >= 0)
                        emptyView?.visibility = View.GONE
                    else
                        emptyView?.visibility = View.VISIBLE
                }
            }
        }

        if (adapter != null)
            emptyObserver?.let { adapter.registerAdapterDataObserver(it) }

        emptyObserver?.onChanged()
    }

    fun setEmptyList(view : View) {
        emptyView = view

        emptyView.run {
            if (adapter == null || adapter?.itemCount!! <= 0)
                this?.visibility = View.VISIBLE
            else
                this?.visibility = View.GONE
        }
    }
}