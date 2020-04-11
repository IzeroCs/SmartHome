package com.izerocs.smarthome.widget

import android.content.Context
import android.util.AttributeSet
import android.widget.ScrollView

/**
 * Created by IzeroCs on 2020-04-04
 */
class FormLayoutWrapper(context: Context, attributeSet: AttributeSet) : ScrollView(context, attributeSet) {
    init {
        isClickable = true
        isFocusable = true
    }
}