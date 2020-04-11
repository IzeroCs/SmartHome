package com.izerocs.smarthome.widget

import android.content.Context
import android.content.res.TypedArray
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import android.util.AttributeSet
import android.util.TypedValue
import com.izerocs.smarthome.R

/**
 * Created by IzeroCs on 2020-04-03
 */
class RelativeLayout(context: Context, attrs: AttributeSet) : android.widget.RelativeLayout(context, attrs) {
    private val shadowPaint : Paint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val shadowPath : Path = Path()
    private val clipPath : Path = Path()
    private var bounds : RectF? = null

    private var borderRadius : Float = 0F

    init {
        val typedArray = context.obtainStyledAttributes(attrs, R.styleable.RelativeLayout, 0, 0)

        typedArray.run {
            shadowPaint.run {
                setShadowLayer(
                    getFloat(R.styleable.RelativeLayout_shadowRadius, 15F),
                    getFloat(R.styleable.RelativeLayout_shadowDx, 2F),
                    getFloat(R.styleable.RelativeLayout_shadowDy, 2F),
                    getColor(R.styleable.RelativeLayout_shadowColor, 0x30000000)
                )
            }

            borderRadius = getBackgroundColorAttr(this)
            recycle()
        }
    }

    override fun draw(canvas: Canvas?) {
        canvas?.run {
            if (bounds == null) {
                bounds = RectF(clipBounds)

                clipPath.addRoundRect(RectF(clipBounds), borderRadius, borderRadius, Path.Direction.CW)
                shadowPath.addRoundRect(RectF(1F, 1F,
                    (clipBounds.width() - 2).toFloat(),
                    (clipBounds.height() - 2).toFloat()),
                    borderRadius, borderRadius, Path.Direction.CW)
            }

            shadowPaint.style = Paint.Style.FILL
//            drawPath(shadowPath, shadowPaint)
            clipPath(clipPath)
        }

        super.draw(canvas)
    }

    private fun getBackgroundColorAttr(typedArray: TypedArray) : Float {
        val colorValue = TypedValue()

        if (typedArray.getValue(R.styleable.RelativeLayout_borderRadius, colorValue)) {
            if (colorValue.type == TypedValue.TYPE_FLOAT)
                return typedArray.getFloat(R.styleable.RelativeLayout_borderRadius, 0F)
            else if (colorValue.type == TypedValue.TYPE_DIMENSION)
                return typedArray.getDimension(R.styleable.RelativeLayout_borderRadius, 0F)
        }

        return 0F
    }
}