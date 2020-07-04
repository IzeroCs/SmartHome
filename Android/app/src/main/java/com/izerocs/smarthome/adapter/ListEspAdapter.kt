package com.izerocs.smarthome.adapter

import android.annotation.SuppressLint
import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import com.izerocs.smarthome.R
import com.izerocs.smarthome.model.EspModuleModel
import com.izerocs.smarthome.widget.list.RecyclerView
import kotlinx.android.synthetic.main.list_esp_item.view.*

/**
 * Created by IzeroCs on 2020-05-03
 */
class ListEspAdapter(private val context: Context) : RecyclerView.Adapter<ListEspAdapter.ViewHolder>() {
    private val esps  : MutableList<EspModuleModel> = mutableListOf()
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

        fun setSignal(signal : Int, online : Boolean) {
            if (!online) {
                itemView.listEspSignal.visibility = View.GONE
            } else {
                var resIcon = R.drawable.ic_signal_wifi_0

                when (signal) {
                    1 -> resIcon = R.drawable.ic_signal_wifi_1
                    2 -> resIcon = R.drawable.ic_signal_wifi_2
                    3 -> resIcon = R.drawable.ic_signal_wifi_3
                    4 -> resIcon = R.drawable.ic_signal_wifi_4
                }

                itemView.listEspSignal.setImageResource(resIcon)
                itemView.listEspSignal.visibility = View.VISIBLE
            }
        }

        fun setOnline(online : Boolean) {
            var colorRes = R.color.listEspIconTintOffline

            if (online)
                colorRes = R.color.listEspIconTint

            itemView.listEspIcon.imageTintList = ContextCompat
                .getColorStateList(context, colorRes)
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
        if (position > esps.size - 1)
            return

        val esp = esps[position]

        holder.setSsid(esp.getSn())
        holder.setSignal(esp.getSignal(), esp.online)
        holder.setOnline(esp.online)
    }

    override fun getItemCount() : Int {
        return esps.size
    }

    fun add(item : EspModuleModel) : Boolean {
        esps.forEachIndexed { index, esp ->
            if (esp.name == item.name) {
                esps[index] = item
                return@add false
            }
        }

        return esps.add(item)
    }

    fun clear() : Unit = esps.clear()
    fun addAll(lists : MutableList<EspModuleModel>) : Boolean = esps.addAll(lists)
    fun get(position : Int) : EspModuleModel = esps[position]

    fun setOnItemClickListener(listener : OnItemClickListener?) {
        onItemClickListener = listener
    }
}