package com.izerocs.smarthome.utils

import android.graphics.Rect
import android.view.View
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView

/**
 * Created by IzeroCs on 2020-04-11
 */
class GridSpacesItemDecoration(spacing : Int, includeEdge : Boolean) : RecyclerView.ItemDecoration() {
    private val mIncludeEdge : Boolean = includeEdge
    private val mSpacing : Int = spacing

    override fun getItemOffsets(outRect : Rect, view : View, parent : RecyclerView, state : RecyclerView.State) {
        super.getItemOffsets(outRect, view, parent, state)

        if (parent.layoutManager is GridLayoutManager) {
            val layoutManager = parent.layoutManager as GridLayoutManager
            val spanCount = layoutManager.spanCount
            val position = parent.getChildAdapterPosition(view)
            val column = position % spanCount

            if (mIncludeEdge) {
                outRect.left = mSpacing - column * mSpacing / spanCount
                outRect.right = (column + 1) * mSpacing / spanCount

                if (position < spanCount)
                    outRect.top = mSpacing;

                outRect.bottom = mSpacing
            } else {
                outRect.left = column * mSpacing / spanCount
                outRect.right = mSpacing - (column + 1) * mSpacing / spanCount

                if (position >= spanCount)
                    outRect.top = mSpacing
            }
        }
    }
}
