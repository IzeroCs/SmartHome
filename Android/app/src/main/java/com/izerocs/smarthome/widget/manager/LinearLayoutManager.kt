package com.izerocs.smarthome.widget.manager

import android.content.Context
import android.graphics.Rect
import android.view.View
import androidx.recyclerview.widget.RecyclerView as ParentRecyclerView

/**
 * Created by IzeroCs on 2020-05-04
 */
class LinearLayoutManager(context : Context) : androidx.recyclerview.widget.LinearLayoutManager(context) {
    class SpacesItemDecortion(private val spacing : Int) : ParentRecyclerView.ItemDecoration() {
        override fun getItemOffsets(
            outRect : Rect,
            view : View,
            parent : androidx.recyclerview.widget.RecyclerView,
            state : androidx.recyclerview.widget.RecyclerView.State
        ) {
            super.getItemOffsets(outRect, view, parent, state)

            if (parent.layoutManager is LinearLayoutManager) {
                outRect.left   = spacing
                outRect.top    = spacing
                outRect.right  = spacing
                outRect.bottom = 0
            }
        }
    }
}