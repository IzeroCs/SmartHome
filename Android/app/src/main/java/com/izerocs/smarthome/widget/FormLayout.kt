package com.izerocs.smarthome.widget

import android.content.Context
import android.util.AttributeSet
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import androidx.core.view.children
import com.izerocs.smarthome.R

/**
 * Created by IzeroCs on 2020-04-04
 */
class FormLayout(context : Context, attributeSet : AttributeSet) : LinearLayout(context, attributeSet) {
    interface FormElement {
        fun onInitElement(formLayout : FormLayout)
    }

    interface FormListener {
        fun onKeypadEnter()
    }

    interface OnKeypadEnterListener {
        fun onKeypadEnterListener(view : View?)
    }

    private var onKeypadEnterListener : OnKeypadEnterListener? = null

    init {
        orientation = VERTICAL
        isClickable = true
        isFocusable = true

        setPadding(
            resources.getDimensionPixelSize(R.dimen.formPaddingHorizontal),
            resources.getDimensionPixelSize(R.dimen.formPaddingVertical),
            resources.getDimensionPixelSize(R.dimen.formPaddingHorizontal),
            resources.getDimensionPixelSize(R.dimen.formPaddingVertical)
        )
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        initElement(this)
    }

    private fun initElement(child : View?) {
        if (child is FormElement)
            child.onInitElement(this)

        if (child is ViewGroup) {
            child.children.forEach {
                initElement(it)
            }
        }
    }

    private fun clearStatus(child : View?) {
        if (child is InputLayout)
            child.clearStatus()

        if (child is ViewGroup) {
            child.children.forEach {
                clearStatus(it)
            }
        }
    }

    private fun enterListener(child : View?) {
        if (child is FormListener)
            child.onKeypadEnter()

        if (child is ViewGroup) {
            child.children.forEach {
                enterListener(it)
            }
        }
    }

    fun setOnKeypadEnterListener(l : OnKeypadEnterListener?) {
        onKeypadEnterListener = l
    }

    fun clearStatusElement()  : Unit = clearStatus(this)
    fun enterKeypadListener(view : View?) : Unit {
        enterListener(this)
        onKeypadEnterListener?.onKeypadEnterListener(view)
    }

}