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
import com.izerocs.smarthome.model.RoomType
import kotlinx.android.synthetic.main.spinne_single_item.view.*

/**
 * Created by IzeroCs on 2020-04-05
 */
class SpinnerAdapter(context: Context, layoutId : Int) : ArrayAdapter<SpinnerAdapter.SpinnerItem>(context, layoutId) {
    private val inflate = LayoutInflater.from(context)

    class SpinnerItem {
        private var view     : View?     = null
        private var context  : Context?  = null
        private var image    : Drawable? = null
        private var roomType : RoomType? = null

        constructor(context : Context, roomType : RoomType) {
            this.context  = context
            this.roomType = roomType

            this.setImage(roomType.getIconResource())
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

        fun getImage() : Drawable? {
            return this.image
        }

        fun getTitle() : String {
            return this.roomType?.getTitle()!!
        }

        fun getView() : View? {
            return this.view
        }

        override fun toString() : String {
            return this.roomType?.getTitle()!!
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

                spinnerValue.text = getTitle()
            }
        }?.getView() as View
    }

    fun add(roomType : RoomType) : Unit = add(SpinnerItem(context, roomType))
}