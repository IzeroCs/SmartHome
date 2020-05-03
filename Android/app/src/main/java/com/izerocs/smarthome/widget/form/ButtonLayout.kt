package com.izerocs.smarthome.widget.form

import android.content.Context
import android.util.AttributeSet
import com.izerocs.smarthome.R

/**
 * Created by IzeroCs on 2020-04-05
 */
class ButtonLayout(context : Context, attributeSet : AttributeSet) : android.widget.RelativeLayout(context, attributeSet) {
    init {
        setPadding(0, resources.getDimensionPixelSize(R.dimen.formButtonPaddingVertical), 0, 0)
    }
}