package com.izerocs.smarthome.widget.form

import android.content.Context
import android.graphics.Canvas
import android.graphics.Path
import android.graphics.Rect
import android.graphics.RectF
import android.util.AttributeSet
import android.util.TypedValue
import android.view.View
import androidx.appcompat.widget.AppCompatButton
import androidx.core.content.ContextCompat
import androidx.core.view.setPadding
import com.izerocs.smarthome.R
import com.izerocs.smarthome.activity.SmartApplication
import com.izerocs.smarthome.utils.Util

/**
 * Created by IzeroCs on 2020-04-05
 */
class ButtonView(context : Context, attributeSet : AttributeSet) : AppCompatButton(context, attributeSet),
    FormLayout.FormElement,
    View.OnClickListener
{
    private var borderRadius  : Float = 0F
    private var pathClip      : Path  = Path()
    private var clickListener : OnClickListener = this
    private var formLayout    : FormLayout? = null

    init {
        borderRadius      = resources.getDimension(R.dimen.formElementBorderRadius)
        background        = context.getDrawable(R.drawable.form_button_selectable)
        stateListAnimator = null
        isClickable       = true
        isFocusable       = true
        isAllCaps         = false

        setTextSize(TypedValue.COMPLEX_UNIT_PX, resources.getDimension(R.dimen.formButtonTextSize))
        setTextColor(ContextCompat.getColor(context, R.color.formButtonText))
        setPadding(resources.getDimensionPixelSize(R.dimen.formElementPadding))
        super.setOnClickListener(this)
    }

    override fun onInitElement(formLayout : FormLayout) {
        this.formLayout = formLayout
    }

    override fun onSizeChanged(w : Int, h : Int, oldw : Int, oldh : Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        clipBounds = Rect(0, 0, measuredWidth, measuredHeight)
        pathClip.addRoundRect(RectF(clipBounds), borderRadius, borderRadius, Path.Direction.CW)
    }

    override fun onClick(v : View?) {
        formLayout?.clearStatusElement()
        Util.hideSoftInput(v).run {
            (context.applicationContext as SmartApplication).getActivityCurrent()?.
                    currentFocus?.clearFocus()
        }

        if (clickListener != this)
            clickListener.onClick(v)
    }

    override fun draw(canvas : Canvas?) {
        canvas?.clipPath(pathClip)
        super.draw(canvas)
    }

    override fun setOnClickListener(l : OnClickListener?) {
        clickListener = l ?: this
    }

}