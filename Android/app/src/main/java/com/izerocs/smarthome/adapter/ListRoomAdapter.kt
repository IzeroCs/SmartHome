package com.izerocs.smarthome.adapter

import android.annotation.SuppressLint
import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.izerocs.smarthome.R
import com.izerocs.smarthome.model.RoomListModel
import com.izerocs.smarthome.model.RoomTypeModel
import com.izerocs.smarthome.widget.list.RecyclerView
import kotlinx.android.synthetic.main.list_room_item.view.*

/**
 * Created by IzeroCs on 2020-04-01
 */
class ListRoomAdapter(private val context: Context) : RecyclerView.Adapter<ListRoomAdapter.ViewHolder>() {
    private val roomLists     : MutableList<RoomListModel> = mutableListOf()
    private val inflate       : LayoutInflater             = LayoutInflater.from(context)
    private var clickListener : OnItemClickListener?       = null

    class ViewHolder(
        private val context: Context,
        private val view : View,
        private val clickListener : OnItemClickListener?
    ) : RecyclerView.ViewHolder(view), View.OnClickListener, View.OnLongClickListener
    {
        init {
            itemView.setOnClickListener(this)
        }

        fun setIcon(type : Int) {
            val resIcon : Int = RoomTypeModel.parseTypeToIcon(type)

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
            clickListener?.onItemClick(v, adapterPosition, false)
        }

        override fun onLongClick(v: View?) : Boolean {
            clickListener?.onItemClick(v, adapterPosition, true)
            return true
        }
    }

    interface OnItemClickListener {
        fun onItemClick(view : View?, position : Int, isLongClick : Boolean)
    }

    @SuppressLint("InflateParams")
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) : ViewHolder = ViewHolder(
        context, inflate.inflate(R.layout.list_room_item, null), clickListener)

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val room = roomLists[position]

        holder.setIcon(room.type.type)
        holder.setName(room.name)
        holder.setCount(room.devices.size)
    }

    override fun getItemCount(): Int = roomLists.size
    fun add(roomList : RoomListModel) : Boolean = roomLists.add(roomList)
    fun addAll(list : MutableList<RoomListModel>) : Boolean = roomLists.addAll(list)

    fun clear() : Unit = roomLists.clear()
    fun get(position: Int) : RoomListModel = roomLists[position]

    fun setOnItemClickListener(listener: OnItemClickListener?) {
        clickListener = listener
    }
}