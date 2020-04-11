package com.izerocs.smarthome.adapter

import android.annotation.SuppressLint
import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.izerocs.smarthome.R
import com.izerocs.smarthome.model.DeviceItem

/**
 * Created by IzeroCs on 2020-03-26
 */
class ListDeviceAdapter(private val context: Context) : RecyclerView.Adapter<ListDeviceAdapter.ViewHolder>() {
    private val devices  : ArrayList<DeviceItem> = ArrayList()
    private val inflater : LayoutInflater = LayoutInflater.from(context)

    class ViewHolder(context : Context, view : View) : RecyclerView.ViewHolder(view) {
        private val mContext = context

        fun setName(name : String) {

        }

        fun setColor(type : String) {
//            itemView.listDeviceBg.background = BackgroundDevice(type)
        }
    }

    @SuppressLint("InflateParams")
    override fun onCreateViewHolder(parent : ViewGroup, viewType : Int) : ViewHolder {
        return ViewHolder(context, inflater.inflate(R.layout.list_device_item, null))
    }

    override fun onBindViewHolder(holder : ViewHolder, position : Int) {
        val device = devices[position]
    }

    override fun getItemCount() : Int {
        return devices.size
    }

    fun add(item : DeviceItem) : Boolean = devices.add(item)
}