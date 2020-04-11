package com.izerocs.smarthome.widget

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Canvas
import android.graphics.Path
import android.graphics.Rect
import android.graphics.RectF
import android.util.AttributeSet
import android.util.TypedValue
import android.view.View
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.core.content.res.ResourcesCompat
import com.izerocs.smarthome.R

/**
 * Created by IzeroCs on 2020-04-04
 */
class InputLayout(context: Context, attributeSet: AttributeSet) : LinearLayout(context, attributeSet) {
    private val labelView  = TextView(context)
    private val statusView = TextView(context)
    private var pathClip     : Path = Path()
    private var borderRadius : Float = 0F

    init {
        val padding = resources.getDimensionPixelSize(R.dimen.formElementPadding)
        val typedArray = context.obtainStyledAttributes(attributeSet, R.styleable.InputLayout, 0, 0)

        orientation = VERTICAL
        borderRadius = resources.getDimension(R.dimen.formElementBorderRadius)
        setBackgroundColor(ContextCompat.getColor(context, R.color.formElementBackground))
        setPadding(padding, padding, padding, 0)

        typedArray.run {
            labelView.run {
                text = getString(R.styleable.InputLayout_label)
                typeface = ResourcesCompat.getFont(context,
                    getResourceId(R.styleable.InputLayout_labelFamily, R.font.ubuntu))

                layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT).apply {
                    bottomMargin = this@InputLayout.paddingBottom
                }

                setTextSize(TypedValue.COMPLEX_UNIT_PX,
                    getDimension(R.styleable.InputLayout_labelSize, resources.getDimension(R.dimen.formLabelTextSize)))

                setTextColor(getColor(R.styleable.InputLayout_labelColor,
                    ContextCompat.getColor(context, R.color.formLabel)))
            }

            recycle()
        }

        if (labelView.text.isNotEmpty())
            addView(labelView, 0)

        statusView.run {
            visibility   = View.GONE
            layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT).apply {
                bottomMargin = resources.getDimensionPixelSize(R.dimen.formElementPadding)
            }

            setTextSize(TypedValue.COMPLEX_UNIT_PX, resources.getDimension(R.dimen.formStatusTextSize))
            setPadding(resources.getDimensionPixelSize(R.dimen.formElementPadding), 0,
                resources.getDimensionPixelSize(R.dimen.formElementPadding), 0)
        }
    }

    override fun onAttachedToWindow() {
        addView(statusView)
        super.onAttachedToWindow()
    }

    @SuppressLint("DrawAllocation")
    override fun onLayout(changed : Boolean, l : Int, t : Int, r : Int, b : Int) {
        super.onLayout(changed, l, t, r, b)

        if (changed) {
            clipBounds = Rect(0, 0, measuredWidth, measuredHeight)

            pathClip.run {
                reset()
                addRoundRect(RectF(clipBounds), borderRadius, borderRadius, Path.Direction.CW)
            }
        }
    }

    override fun draw(canvas: Canvas?) {
        canvas?.clipPath(pathClip)
        super.draw(canvas)
    }

    fun setStatus(status : String, colorResId : Int) {
        statusView.run {
            text = status
            visibility = View.VISIBLE

            setTextColor(ContextCompat.getColor(context, colorResId))
        }
    }

    fun clearStatus() {
        statusView.run {
            text = ""
            visibility = GONE

            invalidate()
        }
    }

    fun setStatusInfo(text : String)    : Unit = setStatus(text, R.color.formStatusInfoText)
    fun setStatusError(text : String)   : Unit = setStatus(text, R.color.formStatusErrorText)
    fun setStatusWarning(text : String) : Unit = setStatus(text, R.color.formStatusWarningText)
    fun setStatusSuccess(text : String) : Unit = setStatus(text, R.color.formStatusSuccessText)

    fun setStatusInfo(resTextId : Int) : Unit    = setStatusInfo(context.getString(resTextId))
    fun setStatusError(resTextId : Int) : Unit   = setStatusError(context.getString(resTextId))
    fun setStatusWarning(resTextId : Int) : Unit = setStatusWarning(context.getString(resTextId))
    fun setStatusSuccess(resTextId : Int) : Unit = setStatusSuccess(context.getString(resTextId))
}