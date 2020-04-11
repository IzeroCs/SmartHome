package com.izerocs.smarthome.widget

import android.content.Context
import android.graphics.Rect
import android.view.View
import androidx.recyclerview.widget.GridLayoutManager as ParentGridLayoutManager
import androidx.recyclerview.widget.GridLayoutManager.SpanSizeLookup as ParentSpanSizeLookup
import androidx.recyclerview.widget.RecyclerView as ParentRecyclerView
import androidx.recyclerview.widget.RecyclerView.Adapter as ParentAdapter
import androidx.recyclerview.widget.RecyclerView.ViewHolder as ParentViewHolder
/**
 * Created by IzeroCs on 2020-04-11
 */
class GridLayoutManager(context : Context, spanCount : Int, adapter : ParentAdapter<ParentViewHolder>?) : ParentGridLayoutManager(context, spanCount) {
    private class SpanSizeLookup(private val adapter : ParentAdapter<ParentViewHolder>?) : ParentSpanSizeLookup()
    {

        override fun getSpanSize(position : Int) : Int {
            if (adapter is RecyclerView.Adapter)
                return adapter.getSpanSize(position)

            return 1
        }

    }

    class GridSpacesItemDecoration(private val spacing : Int, private val includeEdge : Boolean) : ParentRecyclerView.ItemDecoration() {

        override fun getItemOffsets(outRect : Rect, view : View, parent : ParentRecyclerView, state : ParentRecyclerView.State) {
            super.getItemOffsets(outRect, view, parent, state)

            if (parent.layoutManager is GridLayoutManager) {
                val layoutManager = parent.layoutManager as GridLayoutManager
                val position       = parent.getChildAdapterPosition(view)
                val spanCount      = layoutManager.spanCount
                val spanIndex      = layoutManager.spanSizeLookup.getSpanIndex(position, spanCount)
                val spanGroupIndex = layoutManager.spanSizeLookup.getSpanGroupIndex(position, spanCount)

                if (includeEdge) {
                    outRect.left = spacing - spanIndex * spacing / spanCount
                    outRect.right = (spanIndex + 1) * spacing / spanCount

                    if (spanGroupIndex == 0)
                        outRect.top = spacing

                    outRect.bottom = spacing
                } else {
                    outRect.left  = spanIndex * spacing / spanCount
                    outRect.right = spacing - (spanIndex + 1) * spacing / spanCount

                    if (spanGroupIndex > 0)
                        outRect.top = spacing
                }
            }
        }
    }


    init {
        spanSizeLookup = SpanSizeLookup(adapter)
    }
}