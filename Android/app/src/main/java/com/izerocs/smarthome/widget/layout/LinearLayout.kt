package com.izerocs.smarthome.widget.layout

import android.annotation.SuppressLint
import android.content.Context
import android.content.res.TypedArray
import android.graphics.Canvas
import android.graphics.Path
import android.graphics.Rect
import android.graphics.RectF
import android.util.AttributeSet
import android.util.TypedValue
import com.izerocs.smarthome.R

/**
 * Created by IzeroCs on 2020-04-03
 */
class LinearLayout(context: Context, attrs: AttributeSet) : android.widget.LinearLayout(context, attrs) {
    private val clipPath     : Path = Path()
    private var borderRadius : Float = 0F

    init {
        val typedArray = context.obtainStyledAttributes(attrs, R.styleable.LinearLayout, 0, 0)

        typedArray.run {
            borderRadius = getBackgroundColorAttr(this)
            recycle()
        }

    }

    @SuppressLint("DrawAllocation")
    override fun onLayout(changed : Boolean, l : Int, t : Int, r : Int, b : Int) {
        super.onLayout(changed, l, t, r, b)

        if (changed) {
            clipBounds = Rect(0, 0, measuredWidth, measuredHeight)
            clipPath.run {
                reset()
                addRoundRect(RectF(clipBounds), borderRadius, borderRadius, Path.Direction.CW)
            }
        }
    }

    override fun draw(canvas: Canvas?) {
        canvas?.clipPath(clipPath)
        super.draw(canvas)
    }

    private fun getBackgroundColorAttr(typedArray: TypedArray) : Float {
        val colorValue = TypedValue()

        if (typedArray.getValue(R.styleable.LinearLayout_borderRadius, colorValue)) {
            if (colorValue.type == TypedValue.TYPE_FLOAT)
                return typedArray.getFloat(R.styleable.LinearLayout_borderRadius, 0F)
            else if (colorValue.type == TypedValue.TYPE_DIMENSION)
                return typedArray.getDimension(R.styleable.LinearLayout_borderRadius, 0F)
        }

        return 0F
    }
}