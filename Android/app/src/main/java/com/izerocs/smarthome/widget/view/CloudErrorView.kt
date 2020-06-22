package com.izerocs.smarthome.widget.view

import android.annotation.SuppressLint
import android.content.Context
import android.util.AttributeSet
import android.view.View
import android.widget.LinearLayout
import com.izerocs.smarthome.R
import kotlinx.android.synthetic.main.cloud_error_layout.view.*

@SuppressLint("Recycle")
class CloudErrorView(context : Context, attributeSet : AttributeSet) : LinearLayout(context, attributeSet) {
    private var listId   : Int = 0
    private var listView : View? = null

    init {
        val typedArray = context.obtainStyledAttributes(attributeSet, R.styleable.CloudErrorView,
            0, 0)

        typedArray.run {
            listId = getResourceId(R.styleable.CloudErrorView_list, -1)
            orientation = VERTICAL
            visibility = View.GONE

            addView(View.inflate(context, R.layout.cloud_error_layout, null),
                LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
        }
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()

        if (listId > 0)
            listView = (parent as View).findViewById(listId)
    }

    fun setVisibility(isVisible : Boolean, type : String? = null) {
        if (type == "error")
            cloudErrorText.text = context.getText(R.string.cloudErrorServerConnect)
        else if (type == "disconnect")
            cloudErrorText.text = context.getText(R.string.cloudErrorServerDisconnect)

        if (isVisible) {
            listView?.visibility = View.GONE
            visibility = View.VISIBLE
        } else {
            listView?.visibility = View.VISIBLE
            visibility = View.GONE
        }
    }
}