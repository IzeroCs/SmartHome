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
import com.izerocs.smarthome.model.RoomTypeModel
import kotlinx.android.synthetic.main.spinne_single_item.view.*

/**
 * Created by IzeroCs on 2020-04-05
 */
class SpinnerAdapter(context: Context, layoutId : Int) : ArrayAdapter<SpinnerAdapter.SpinnerItem>(context, layoutId) {
    private val inflate = LayoutInflater.from(context)

    class SpinnerItem(context : Context, roomType : RoomTypeModel) {
        private var view     : View?     = null
        private var context  : Context?  = context
        private var image    : Drawable? = null
        private var roomType : RoomTypeModel? = roomType

        init {
            this.setImage(roomType.getIcon())
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
            return this.roomType?.getTitle(context!!)!!
        }

        fun getView() : View? {
            return this.view
        }

        override fun toString() : String {
            return this.roomType?.getTitle(context!!)!!
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

    fun add(roomType : RoomTypeModel) : Unit = add(SpinnerItem(context, roomType))
}