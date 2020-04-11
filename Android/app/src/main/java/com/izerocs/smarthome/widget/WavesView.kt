package com.izerocs.smarthome.widget

import android.annotation.SuppressLint
import android.content.Context
import android.content.res.ColorStateList
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Path
import android.graphics.Rect
import android.graphics.drawable.GradientDrawable
import android.util.AttributeSet
import android.view.Gravity
import android.view.MenuItem
import android.view.View
import android.widget.ImageView
import android.widget.RelativeLayout
import androidx.annotation.MenuRes
import androidx.annotation.NonNull
import androidx.appcompat.view.menu.MenuBuilder
import androidx.appcompat.view.menu.MenuPopupHelper
import androidx.appcompat.widget.PopupMenu
import androidx.core.content.ContextCompat
import androidx.core.content.res.ResourcesCompat
import androidx.core.view.setPadding
import com.izerocs.smarthome.R
import com.izerocs.smarthome.utils.Util
import kotlin.math.sin

/**
 * Created by IzeroCs on 2020-03-24
 */

class WavesView(context: Context, attrs: AttributeSet) : RelativeLayout(context, attrs),
    View.OnClickListener, View.OnLongClickListener, PopupMenu.OnMenuItemClickListener
{
    interface OnBackClickListener {
        fun onBack(backView : View, isLongClick : Boolean)
    }

    interface OnMenuClickListener {
        fun onMenu(menuView : View, isLongClick : Boolean)
    }

    interface OnMenuItemClickListener {
        fun onMenuItem(menuView : View, item : MenuItem?)
    }

    private var backView : ImageView = ImageView(context).apply {
        val params = LayoutParams(
            LayoutParams.WRAP_CONTENT,
            LayoutParams.WRAP_CONTENT
        ).apply {
            addRule(ALIGN_PARENT_LEFT)
            addRule(ALIGN_PARENT_TOP)

            leftMargin = resources.getDimensionPixelSize(R.dimen.waveIconMargin)
            topMargin  = Util.getStatusBarHeight(resources) + leftMargin
        }

        isClickable   = true
        isFocusable   = true
        layoutParams  = params
        imageTintList = ColorStateList.valueOf(ContextCompat.getColor(context, R.color.waveIcon))

        setPadding(resources.getDimensionPixelSize(R.dimen.waveIconPadding))
        setImageResource(R.drawable.ic_arrow_back)
        setBackgroundResource(R.drawable.wave_icon_selectable)
    }

    private val menuView : ImageView = ImageView(context).apply {
        val params = LayoutParams(
            LayoutParams.WRAP_CONTENT,
            LayoutParams.WRAP_CONTENT
        ).apply {
            addRule(ALIGN_PARENT_RIGHT)
            addRule(ALIGN_PARENT_TOP)

            rightMargin = resources.getDimensionPixelSize(R.dimen.waveIconMargin)
            topMargin  = Util.getStatusBarHeight(resources) + rightMargin
        }

        visibility    = GONE
        isClickable   = true
        isFocusable   = true
        layoutParams  = params
        imageTintList = ColorStateList.valueOf(ContextCompat.getColor(context, R.color.waveIcon))

        setPadding(resources.getDimensionPixelSize(R.dimen.waveIconPadding))
        setImageResource(R.drawable.ic_menu)
        setBackgroundResource(R.drawable.wave_icon_selectable)
        setOnClickListener(this@WavesView)
        setOnLongClickListener(this@WavesView)
    }

    private var title           : CharSequence     = ""
    private var viewWidth       : Int              = 0
    private var viewHeight      : Int              = 0
    private var titleY          : Int              = -1
    private var activeBack      : Boolean          = false
    private val wavesPath       : Path             = Path()
    private var popupMenu       : PopupMenu?       = null
    private var menuHelper : MenuPopupHelper? = null

    private var onBackClickListener     : OnBackClickListener?     = null
    private var onMenuClickListener     : OnMenuClickListener?     = null
    private var onMenuItemClickListener : OnMenuItemClickListener? = null

    private val wavesGradient = GradientDrawable().apply {
        gradientType = GradientDrawable.LINEAR_GRADIENT
        orientation = GradientDrawable.Orientation.TL_BR

        colors = intArrayOf(
            ContextCompat.getColor(context, R.color.waveGradientStart),
            ContextCompat.getColor(context, R.color.waveGradientStop)
        )
    }

    private val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        textAlign = Paint.Align.CENTER
    }

    private val wavesPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }

    init {
        val typedArray = context.obtainStyledAttributes(attrs, R.styleable.WavesView, 0, 0)

        typedArray.run {
            title = getText(R.styleable.WavesView_text)
            activeBack = getBoolean(R.styleable.WavesView_activeBack, false)

            textPaint.run {
                color = getColor(R.styleable.WavesView_textColor, ContextCompat.getColor(context, R.color.waveTitle))
                textSize = getDimension(R.styleable.WavesView_textSize, resources.getDimension(R.dimen.waveTitleSize))
                typeface = ResourcesCompat.getFont(context, getResourceId(R.styleable.WavesView_font, R.font.ubuntu))

                setShadowLayer(
                    getFloat(R.styleable.WavesView_shadowRadius, ResourcesCompat.getFloat(resources, R.dimen.waveShadowRadius)),
                    getFloat(R.styleable.WavesView_shadowDx, ResourcesCompat.getFloat(resources, R.dimen.waveShadowDx)),
                    getFloat(R.styleable.WavesView_shadowDy, ResourcesCompat.getFloat(resources, R.dimen.waveShadowDy)),
                    getColor(R.styleable.WavesView_shadowColor, ContextCompat.getColor(context, R.color.waveShadow))
                )
            }

            recycle()
        }

        if (activeBack)
            addView(backView)
        addView(menuView)
    }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec)

        val desiredWidth  : Int = suggestedMinimumWidth  + paddingLeft + paddingRight
        val desiredHeight : Int = suggestedMinimumHeight + paddingTop  + paddingBottom

        setMeasuredDimension(
            Util.measureDimension(desiredWidth, widthMeasureSpec),
            Util.measureDimension(desiredHeight, heightMeasureSpec)
        )
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)

        viewWidth = measuredWidth
        viewHeight = measuredHeight

        wavesGradient.bounds = Rect(0, 0, viewWidth, viewHeight)
        initWavePath()
    }

    override fun dispatchDraw(canvas: Canvas?) {
        canvas?.apply {
            wavesPaint.run {
                color = ContextCompat.getColor(context, R.color.accent)
                style = Paint.Style.FILL

                setShadowLayer(
                    ResourcesCompat.getFloat(resources, R.dimen.waveShadowRadius),
                    ResourcesCompat.getFloat(resources, R.dimen.waveShadowDx),
                    ResourcesCompat.getFloat(resources, R.dimen.waveShadowDy),
                    ContextCompat.getColor(context, R.color.waveShadow)
                )
                drawPath(wavesPath, wavesPaint)
                clipPath(wavesPath)

                save()
                wavesGradient.draw(canvas)
                restore()
            }

            if (title.isNotEmpty()) {
                textPaint.run {
                    val textHeight : Float = descent() - ascent()
                    val textOffset : Float = (textHeight / 2) - descent()

                    drawText(title.toString(),(width / 2).toFloat(), (titleY / 2).toFloat() + textOffset, textPaint)
                }
            }
        }

        super.dispatchDraw(canvas)
    }

    @SuppressLint("RestrictedApi")
    override fun onClick(v: View?) {
        if (v == backView) {
            onBackClickListener?.onBack(backView, false)
        } else if (v == menuView) {
            menuHelper?.show()
            onMenuClickListener?.onMenu(menuView, false)
        }
    }

    @SuppressLint("RestrictedApi")
    override fun onLongClick(v: View?) : Boolean {
        if (v == backView) {
            onBackClickListener?.onBack(backView, true)
        } else if (v == menuView) {
            menuHelper?.show()
            onMenuClickListener?.onMenu(menuView, true)
        }

        return true
    }

    override fun onMenuItemClick(item : MenuItem?) : Boolean {
        onMenuItemClickListener?.onMenuItem(menuView, item)
        return false
    }

    private fun initWavePath() {
        val wavePerWidth: Int = 1
        val waveWidth: Int = viewWidth
        val waveHeight: Int = viewHeight - 80
        val amplitude: Int = 50

        wavesPath.run {
            val pi2: Double = Math.PI * 2
            val totValue: Double = pi2 * wavePerWidth
            var nValue: Double
            var xPos: Float
            var yPos: Float

            reset()
            moveTo(0F, 0F)

            for (x in 0..200) {
                nValue = totValue * x / 100.0
                xPos = (waveWidth * x.toDouble() / 100.0).toFloat()
                yPos = (sin(nValue) * amplitude + waveHeight).toFloat()

                if (titleY <= -1 && xPos >= width / 2)
                    titleY = yPos.toInt()

                lineTo(xPos, yPos)
            }

            lineTo((waveWidth * 2).toFloat(), 0F)
            close()
        }
    }

    fun setTitle(@NonNull title : String) {
        this.title = title
    }

    @SuppressLint("RestrictedApi")
    fun setMenu(@MenuRes resMenuId : Int) {
        if (popupMenu == null) {
            popupMenu = PopupMenu(context, menuView, Gravity.END)
            menuHelper = MenuPopupHelper(context, popupMenu?.menu as MenuBuilder, menuView)
            popupMenu?.setOnMenuItemClickListener(this)

            menuHelper?.gravity = Gravity.END
            menuView.visibility = View.VISIBLE
            menuHelper?.setForceShowIcon(false)
        }

        popupMenu?.inflate(resMenuId)
    }

    fun setOnBackClickListener(listener : OnBackClickListener) {
        if (!activeBack) {
            activeBack = true
            addView(backView)
        }

        onBackClickListener = listener
        backView.setOnClickListener(this)
        backView.setOnLongClickListener(this)
    }

    fun setOnMenuClickListener(listener : OnMenuClickListener) {
        onMenuClickListener = listener
    }

    fun setOnMenuItemClickListener(listener : OnMenuItemClickListener) {
        onMenuItemClickListener = listener
    }

    fun isActiveBack() : Boolean = activeBack
}