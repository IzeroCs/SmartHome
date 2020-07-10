package com.izerocs.smarthome.adapter

import android.annotation.SuppressLint
import android.content.Context
import android.content.res.ColorStateList
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.core.view.children
import com.izerocs.smarthome.R
import com.izerocs.smarthome.model.RoomDeviceModel
import com.izerocs.smarthome.widget.list.RecyclerView
import kotlinx.android.synthetic.main.list_device_item.view.*

/**
 * Created by IzeroCs on 2020-03-26
 */
class ListDeviceAdapter(private val context: Context) : RecyclerView.Adapter<ListDeviceAdapter.ViewHolder>() {
    private val roomDevices  : ArrayList<RoomDeviceModel> = ArrayList()
    private val inflater : LayoutInflater = LayoutInflater.from(context)
    private var onItemClickListener : OnItemClickListener? = null

    class ViewHolder(
        private val context : Context,
        private val view : View,
        private val onItemClickListener : OnItemClickListener?
    ) : RecyclerView.ViewHolder(view),
            View.OnClickListener, View.OnLongClickListener
    {
        init {
            itemView.listDeviceWrapper.setOnClickListener(this)
            itemView.listDeviceWrapper.setOnLongClickListener(this)

            itemView.listDeviceIconWrapper.setOnClickListener(this)
            itemView.listDeviceIconWrapper.setOnLongClickListener(this)
        }

        fun setLabel(label : String) {
            itemView.listDeviceLabel.text = label
            itemView.listDeviceSubLabel.visibility = View.GONE
        }

        fun setSubLabel(subLabel : String) {
            if (subLabel.isEmpty())
                return

            itemView.listDeviceSubLabel.run {
                visibility = View.VISIBLE
                text       = subLabel
            }
        }

        fun setIcon(resIcon : Int) {
            itemView.listDeviceIcon.setImageResource(resIcon)
            setStatusDevice(false)
        }

        fun setStatusVisibility(widgetSize : Int) {
            if (widgetSize == RoomDeviceModel.WIDGET_SIZE_LARGE)
                itemView.listDeviceStatusWrapper.visibility = View.VISIBLE
            else
                itemView.listDeviceStatusWrapper.visibility = View.GONE
        }

        fun setStatusDevice(status : Boolean) {
            var resColorIcon = R.color.listDeviceIconTintStatusOff
            var resColorStatus = R.color.listDeviceStatusTintStatusOff

            if (status) {
                resColorIcon = R.color.listDeviceIconTintStatusOn
                resColorStatus = R.color.listDeviceStatusTintStatusOn
            }

            itemView.listDeviceIcon.imageTintList = ColorStateList.valueOf(ContextCompat
                .getColor(context, resColorIcon))

            itemView.listDeviceStatus.imageTintList = ColorStateList.valueOf(ContextCompat
                .getColor(context, resColorStatus))
        }

        fun setStatusModule(status : Boolean) {
            if (status)
                itemView.listDeviceQuickInfo.alpha = 1F
            else
                itemView.listDeviceQuickInfo.alpha = 0.2F

            itemView.listDeviceWrapper.let { wrapper ->
                wrapper.isFocusable = status
                wrapper.isClickable = status
                wrapper.setAllEnable(status)
            }
        }

        fun View.setAllEnable(enabled : Boolean) {
            isEnabled = enabled

            if (this is ViewGroup)
                children.forEach { child -> child.setAllEnable(enabled) }
        }

        override fun onClick(v : View?) {
            if (v == itemView.listDeviceWrapper)
                onItemClickListener?.onItemClick(v, adapterPosition, false)
            else if (v == itemView.listDeviceIconWrapper)
                onItemClickListener?.onIconClick(v, adapterPosition, false)
        }

        override fun onLongClick(v : View?) : Boolean {
            if (v == itemView.listDeviceWrapper)
                onItemClickListener?.onItemClick(v, adapterPosition, false)
            else if (v == itemView.listDeviceIconWrapper)
                onItemClickListener?.onIconClick(v, adapterPosition, false)

            return false
        }
    }

    interface OnItemClickListener {
        fun onItemClick(v : View?, position : Int, isLongClick : Boolean)
        fun onIconClick(v : View?, position : Int, isLongClick : Boolean)
    }

    @SuppressLint("InflateParams")
    override fun onCreateViewHolder(parent : ViewGroup, viewType : Int) : ViewHolder {
        return ViewHolder(context, inflater.inflate(R.layout.list_device_item, null),
            onItemClickListener)
    }

    override fun onBindViewHolder(holder : ViewHolder, position : Int) {
        get(position).run {
            holder.setLabel(name)
            holder.setSubLabel(descriptor)
            holder.setIcon(icon)
            holder.setStatusVisibility(widget)
            holder.setStatusDevice(pin.status)
            holder.setStatusModule(esp.online)
        }
    }

    override fun getItemCount() : Int {
        return roomDevices.size
    }

    override fun getSpanSize(position : Int) : Int {
        if (roomDevices[position].widget == RoomDeviceModel.WIDGET_SIZE_LARGE)
            return 2

        return 1
    }

    fun clear() : Unit = roomDevices.clear()
    fun add(itemRoom : RoomDeviceModel) : Boolean = roomDevices.add(itemRoom)
    fun get(position : Int) : RoomDeviceModel = roomDevices[position]

    fun addAll(elements: MutableList<RoomDeviceModel>) : Boolean {
        synchronized(roomDevices) {
            return roomDevices.addAll(elements)
        }
    }


    fun set(position : Int, model : RoomDeviceModel) {
        synchronized(roomDevices) {
            roomDevices.set(position, model)
        }
    }

    fun setOnItemClickListener(listener : OnItemClickListener?) {
        onItemClickListener = listener
    }
}