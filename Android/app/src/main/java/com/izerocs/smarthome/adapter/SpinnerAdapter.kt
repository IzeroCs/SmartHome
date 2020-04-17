package com.izerocs.smarthome.adapter

import android.annotation.SuppressLint
import android.content.Context
import android.content.res.ColorStateList
import android.graphics.drawable.Drawable
import android.graphics.drawable.VectorDrawable
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import androidx.core.content.ContextCompat
import com.izerocs.smarthome.R
import kotlinx.android.synthetic.main.spinne_single_item.view.*

/**
 * Created by IzeroCs on 2020-04-05
 */
class SpinnerAdapter(context: Context, layoutId : Int) : ArrayAdapter<SpinnerAdapter.SpinnerItem>(context, layoutId) {
    private val inflate = LayoutInflater.from(context)

    class SpinnerItem {
        private var view    : View?     = null
        private var context : Context?  = null
        private var image   : Drawable? = null
        private var value   : String    = ""
        private var obj     : Any?      = null

        constructor(context: Context, value : String, obj : Any?) {
            this.context = context
            this.obj     = obj

            setValue(value)
        }

        constructor(context: Context, value: String, resId: Int, obj : Any?) {
            this.context = context
            this.obj     = obj

            setValue(value)
            setImage(resId)
        }

        constructor(context: Context, value: String, drawable: Drawable, obj : Any?) {
            this.context = context
            this.obj     = obj

            setValue(value)
            setImage(drawable)
        }

        fun cacheView(view : View) {
            this.view = view
        }

        fun isCacheView() : Boolean {
            return this.view != null
        }

        fun setImage(resId : Int) {
            this.setImage(context?.getDrawable(resId))
        }

        fun setImage(drawable: Drawable?) {
            this.image = drawable

            if (this.image is VectorDrawable) {
                this.image = (this.image as VectorDrawable).mutate().apply {
                    setTintList(ColorStateList.valueOf(ContextCompat
                        .getColor(context!!, R.color.primaryDark)))
                }
            }
        }

        fun setValue(value : String) {
            this.value = value
        }

        fun getImage() : Drawable? {
            return this.image
        }

        fun getValue() : String {
            return this.value
        }

        fun getView() : View? {
            return this.view
        }

        fun getObject() : Any? {
            return obj
        }

        override fun toString() : String {
            return this.value
        }
    }

    @SuppressLint("InflateParams")
    override fun getDropDownView(position : Int, convertView : View?, parent : ViewGroup) : View {
        return getItem(position)?.apply {
            if (!isCacheView())
                cacheView(inflate.inflate(R.layout.spinne_single_item, null))

            getView()?.apply {
                spinnerIcon.run {
                    if (getImage() == null) {
                        visibility = View.GONE
                    } else {
                        visibility = View.VISIBLE
                        setImageDrawable(getImage())
                    }
                }

                spinnerValue.text = getValue()
            }
        }?.getView() as View
    }

    fun add(value : String) : Unit                           = add(SpinnerItem(context, value, null))
    fun add(value : String, resId : Int)                     = add(SpinnerItem(context, value, resId, null))
    fun add(value : String, drawable : Drawable)             = add(SpinnerItem(context, value, drawable, null))

    fun add(value : String, obj : Any?) : Unit               = add(SpinnerItem(context, value, obj))
    fun add(value : String, resId : Int, obj : Any?)         = add(SpinnerItem(context, value, resId, obj))
    fun add(value : String, drawable : Drawable, obj : Any?) = add(SpinnerItem(context, value, drawable, obj))

}