package com.izerocs.smarthome.adapter

import android.annotation.SuppressLint
import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.izerocs.smarthome.R
import com.izerocs.smarthome.model.RoomItem
import com.izerocs.smarthome.model.RoomType
import com.izerocs.smarthome.widget.list.RecyclerView
import kotlinx.android.synthetic.main.list_room_item.view.*

/**
 * Created by IzeroCs on 2020-04-01
 */
class ListRoomAdapter(private val context: Context) : RecyclerView.Adapter<ListRoomAdapter.ViewHolder>() {
    private val rooms : MutableList<RoomItem> = mutableListOf()
    private val inflate : LayoutInflater = LayoutInflater.from(context)
    private var onItemClickListener: OnItemClickListener? = null

    class ViewHolder(
        private val context: Context,
        private val view : View,
        private val onItemClickListener : OnItemClickListener?
    ) : RecyclerView.ViewHolder(view), View.OnClickListener, View.OnLongClickListener
    {
        init {
            itemView.setOnClickListener(this)
        }

        fun setIcon(type : Int) {
            val resIcon : Int = RoomType.getIconResource(type)

            if (resIcon != -1)
                itemView.listRoomIcon.setImageResource(resIcon)
        }

        fun setName(name : String) {
            itemView.listRoomName.text = name
        }

        fun setCount(count : Int) {
            itemView.listRoomDeviceCount.text = context.getString(R.string.listRoomItemDeviceCount)
                .replace("\${count}", count.toString())
        }

        override fun onClick(v : View?) {
            onItemClickListener?.onItemClick(v, adapterPosition, false)
        }

        override fun onLongClick(v: View?) : Boolean {
            onItemClickListener?.onItemClick(v, adapterPosition, true)
            return true
        }
    }

    interface OnItemClickListener {
        fun onItemClick(view : View?, position : Int, isLongClick : Boolean)
    }

    @SuppressLint("InflateParams")
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) : ViewHolder = ViewHolder(
        context, inflate.inflate(R.layout.list_room_item, null), onItemClickListener)

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val room = rooms[position]

        holder.setIcon(room.getType())
        holder.setName(room.getName())
        holder.setCount(room.getDeviceCount())
    }

    override fun getItemCount(): Int = rooms.size
    fun add(room : RoomItem) : Boolean = rooms.add(room)
    fun addAll(list : MutableList<RoomItem>) : Boolean = rooms.addAll(list)

    fun clear() : Unit = rooms.clear()
    fun get(position: Int) : RoomItem = rooms[position]

    fun setOnItemClickListener(listener: OnItemClickListener?) {
        onItemClickListener = listener
    }
}