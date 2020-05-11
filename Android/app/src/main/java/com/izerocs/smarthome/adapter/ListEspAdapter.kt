package com.izerocs.smarthome.adapter

import android.annotation.SuppressLint
import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.izerocs.smarthome.R
import com.izerocs.smarthome.model.EspItem
import com.izerocs.smarthome.widget.list.RecyclerView
import kotlinx.android.synthetic.main.list_esp_item.view.*

/**
 * Created by IzeroCs on 2020-05-03
 */
class ListEspAdapter(private val context: Context) : RecyclerView.Adapter<ListEspAdapter.ViewHolder>() {
    private val esps  : ArrayList<EspItem> = ArrayList()
    private val inflater : LayoutInflater = LayoutInflater.from(context)
    private var onItemClickListener : OnItemClickListener? = null

    class ViewHolder(
        private val context : Context,
        private val view : View,
        private val onItemClickListener : OnItemClickListener?
    ) : RecyclerView.ViewHolder(view), View.OnClickListener, View.OnLongClickListener
    {
        init {
            itemView.setOnClickListener(this)
            itemView.setOnLongClickListener(this)
        }

        fun setSsid(ssid : String) {
            itemView.listEspSsid.text = ssid
        }

        fun setSignal(signal : Int) {
            var resIcon = R.drawable.ic_signal_wifi_0

            when (signal) {
                1 -> resIcon = R.drawable.ic_signal_wifi_1
                2 -> resIcon = R.drawable.ic_signal_wifi_2
                3 -> resIcon = R.drawable.ic_signal_wifi_3
                4 -> resIcon = R.drawable.ic_signal_wifi_4
            }

            itemView.listEspSignal.setImageResource(resIcon)
        }

        override fun onClick(v : View?) {
            onItemClickListener?.onItemClick(v, adapterPosition, false)
        }

        override fun onLongClick(v : View?) : Boolean {
            onItemClickListener?.onItemClick(v, adapterPosition, true)
            return false
        }
    }

    interface OnItemClickListener {
        fun onItemClick(v : View?, position: Int, isLongClick : Boolean)
    }

    @SuppressLint("InflateParams")
    override fun onCreateViewHolder(parent : ViewGroup, viewType : Int) : ViewHolder {
        return ViewHolder(context, inflater.inflate(R.layout.list_esp_item, parent, false),
            onItemClickListener)
    }

    override fun onBindViewHolder(holder : ViewHolder, position : Int) {
        val esp = esps[position]

        holder.setSsid(esp.getSn())
        holder.setSignal(esp.getSignal())
    }

    override fun getItemCount() : Int {
        return esps.size
    }

    fun add(item : EspItem) : Boolean = esps.add(item)

    fun clear() : Unit = esps.clear()

    fun get(position : Int) : EspItem {
        return esps[position]
    }

    fun setOnItemClickListener(listener : OnItemClickListener?) {
        onItemClickListener = listener
    }
}