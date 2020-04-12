package com.izerocs.smarthome.adapter

import android.annotation.SuppressLint
import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.izerocs.smarthome.R
import com.izerocs.smarthome.model.DeviceItem
import com.izerocs.smarthome.widget.RecyclerView
import kotlinx.android.synthetic.main.list_device_item.view.*

/**
 * Created by IzeroCs on 2020-03-26
 */
class ListDeviceAdapter(private val context: Context) : RecyclerView.Adapter<ListDeviceAdapter.ViewHolder>() {
    private val devices  : ArrayList<DeviceItem> = ArrayList()
    private val inflater : LayoutInflater = LayoutInflater.from(context)

    class ViewHolder(private val context : Context, view : View) : RecyclerView.ViewHolder(view) {
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
        }

        fun setStatusVisibility(widgetSize : Int) {
            if (widgetSize == DeviceItem.WIDGET_SIZE_LARGE)
                itemView.listDeviceStatusWrapper.visibility = View.VISIBLE
            else
                itemView.listDeviceStatusWrapper.visibility = View.GONE
        }
    }

    @SuppressLint("InflateParams")
    override fun onCreateViewHolder(parent : ViewGroup, viewType : Int) : ViewHolder {
        return ViewHolder(context, inflater.inflate(R.layout.list_device_item, null))
    }

    override fun onBindViewHolder(holder : ViewHolder, position : Int) {
        val device = devices[position]

        holder.setLabel(device.getName())
        holder.setSubLabel(device.getDescriptor())
        holder.setIcon(device.getResourceIcon())
        holder.setStatusVisibility(device.getWidgetSize())
    }

    override fun getItemCount() : Int {
        return devices.size
    }

    override fun getSpanSize(position : Int) : Int {
        if (devices[position].getWidgetSize() == DeviceItem.WIDGET_SIZE_LARGE)
            return 2

        return 1
    }

    fun add(item : DeviceItem) : Boolean = devices.add(item)
}