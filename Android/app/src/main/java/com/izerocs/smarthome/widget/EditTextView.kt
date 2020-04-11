package com.izerocs.smarthome.widget

import android.content.Context
import android.content.res.ColorStateList
import android.graphics.Rect
import android.graphics.drawable.Drawable
import android.graphics.drawable.GradientDrawable
import android.graphics.drawable.VectorDrawable
import android.os.Build
import android.text.InputType
import android.util.AttributeSet
import android.util.TypedValue
import android.view.KeyEvent
import android.view.View
import android.widget.TextView
import androidx.annotation.ColorInt
import androidx.appcompat.widget.AppCompatEditText
import androidx.core.content.ContextCompat
import androidx.core.content.res.ResourcesCompat
import androidx.core.graphics.drawable.DrawableCompat
import androidx.core.view.setPadding
import androidx.vectordrawable.graphics.drawable.VectorDrawableCompat
import com.izerocs.smarthome.R

/**
 * Created by IzeroCs on 2020-04-04
 */
class EditTextView(context: Context, attributeSet: AttributeSet) : AppCompatEditText(context, attributeSet),
    FormLayout.FormElement,
    View.OnKeyListener
{
    private var formLayout : FormLayout? = null

    init {
        typeface = ResourcesCompat.getFont(context, R.font.ubuntu)
        inputType = InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS

        setBackgroundColor(ContextCompat.getColor(context, R.color.formElementBackground))
        setTextSize(TypedValue.COMPLEX_UNIT_PX, resources.getDimension(R.dimen.formEditTextSize))
        setTextColor(ContextCompat.getColor(context, R.color.formEditText))
        setHintTextColor(ContextCompat.getColor(context, R.color.formEditHint))
        setCursorDrawableColor(ContextCompat.getColor(context, R.color.formCursor))
        setPadding(resources.getDimensionPixelSize(R.dimen.formElementPadding))
        setOnKeyListener(this)
    }

    override fun onInitElement(formLayout : FormLayout) {
        this.formLayout = formLayout
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        clipBounds = Rect(0, 0, measuredWidth, measuredHeight)
    }

    override fun onKey(v : View?, keyCode : Int, event : KeyEvent?) : Boolean {
        event?.run {
            if (action == KeyEvent.ACTION_DOWN && keyCode == KeyEvent.KEYCODE_ENTER)
                formLayout?.enterKeypadListener(this@EditTextView)
        }

        return false
    }

    private fun setCursorDrawableColor(@ColorInt color: Int) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val gradientDrawable = GradientDrawable(GradientDrawable.Orientation.BOTTOM_TOP, intArrayOf(color, color))
            gradientDrawable.setSize(1.spToPx(context).toInt(), textSize.toInt())
            textCursorDrawable = gradientDrawable
            return
        }

        try {
            val editorField = try {
                TextView::class.java.getDeclaredField("mEditor").apply { isAccessible = true }
            } catch (t: Throwable) {
                null
            }
            val editor = editorField?.get(this) ?: this
            val editorClass: Class<*> = if (editorField == null) TextView::class.java else editor.javaClass

            val tintedCursorDrawable = TextView::class.java.getDeclaredField("mCursorDrawableRes")
                .apply { isAccessible = true }
                .getInt(this)
                .let { ContextCompat.getDrawable(context, it) ?: return }
                .let { tintDrawable(it, color) }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                editorClass
                    .getDeclaredField("mDrawableForCursor")
                    .apply { isAccessible = true }
                    .run { set(editor, tintedCursorDrawable) }
            } else {
                editorClass
                    .getDeclaredField("mCursorDrawable")
                    .apply { isAccessible = true }
                    .run { set(editor, arrayOf(tintedCursorDrawable, tintedCursorDrawable)) }
            }
        } catch (t: Throwable) {
            t.printStackTrace()
        }
    }

    private fun Number.spToPx(context : Context? = null) : Float {
        val res = context?.resources?: android.content.res.Resources.getSystem()
        return TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_SP, this.toFloat(), res.displayMetrics)
    }

    private fun tintDrawable(drawable : Drawable, @ColorInt color : Int) : Drawable {
        (drawable as? VectorDrawableCompat)
            ?.apply { setTintList(ColorStateList.valueOf(color)) }
            ?.let { return it }

        (drawable as? VectorDrawable)
            ?.apply { setTintList(ColorStateList.valueOf(color)) }
            ?.let { return it }

        val wrappedDrawable = DrawableCompat.wrap(drawable)
        DrawableCompat.setTint(wrappedDrawable, color)
        return DrawableCompat.unwrap(wrappedDrawable)
    }

    fun setStatusError(text : String)   : Unit = (parent as InputLayout).setStatus(text, R.color.formStatusErrorText)
    fun setStatusWarning(text : String) : Unit = (parent as InputLayout).setStatus(text, R.color.formStatusWarningText)
    fun setStatusInfo(text : String)    : Unit = (parent as InputLayout).setStatus(text, R.color.formStatusInfoText)
    fun setStatusSuccess(text : String) : Unit = (parent as InputLayout).setStatus(text, R.color.formStatusSuccessText)

    fun setStatusError(resTextId : Int) : Unit   = setStatusError(context.getString(resTextId))
    fun setStatusWarning(resTextId : Int) : Unit = setStatusWarning(context.getString(resTextId))
    fun setStatusInfo(resTextId : Int) : Unit    = setStatusInfo(context.getString(resTextId))
    fun setStatusSuccess(resTextId : Int) : Unit = setStatusSuccess(context.getString(resTextId))
}