package com.izerocs.smarthome.widget

import android.content.Context
import android.util.AttributeSet
import android.view.View
import androidx.recyclerview.widget.RecyclerView as ParentRecyclerView

/**
 * Created by IzeroCs on 2020-04-11
 */
abstract class RecyclerView(context : Context, attributeSet : AttributeSet) : ParentRecyclerView(context, attributeSet) {

    abstract class Adapter<T : ViewHolder>() : ParentRecyclerView.Adapter<T>() {

        open fun getSpanSize(position : Int) : Int {
            return 1
        }

    }

    abstract class ViewHolder(view : View) : ParentRecyclerView.ViewHolder(view) {}

}