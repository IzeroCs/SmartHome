package com.izerocs.smarthome.activity

import android.content.Intent
import android.os.Bundle
import android.view.View
import com.izerocs.smarthome.R
import com.izerocs.smarthome.adapter.ListRoomAdapter
import com.izerocs.smarthome.model.RoomItem
import com.izerocs.smarthome.network.SocketClient
import com.izerocs.smarthome.widget.WavesView
import kotlinx.android.synthetic.main.activity_smart.*

/**
 * Created by IzeroCs on 2020-03-23
 */

class SmartActivity : BaseActivity(),
    View.OnClickListener, WavesView.OnMenuClickListener, ListRoomAdapter.OnItemClickListener
{

    companion object {
        const val TAG = "SmartActivity"
        const val EXTRA_ROOM_ID   = "com.izerocs.smarthome.ROOM_ID"
        const val EXTRA_ROOM_NAME = "com.izerocs.smarthome.ROOM_NAME"
        const val EXTRA_ROOM_TYPE = "com.izerocs.smarthome.ROOM_TYPE"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_smart)
        listRoom.setOnItemClickListener(this)
        wavesView.setMenuIcon(R.drawable.ic_chipset, true)
        wavesView.setOnMenuClickListener(this)
        floatButton.setOnClickListener(this)
    }

    override fun onRoomList(client : SocketClient, roomList : MutableList<RoomItem>) {
        if (roomList.isEmpty())
            return

        val rooms = mutableListOf<RoomItem>()

        roomList.forEach { item -> rooms.add(item) }
        listRoom.clear()
        listRoom.addAll(rooms)

        runOnUiThread { listRoom.notifyDataSetChanged() }
    }

    override fun onResume() {
        super.onResume()
        floatButton.show()
    }

    override fun onClick(v: View?) {
        if (v == floatButton)
            startActivity(Intent(applicationContext, AddRoomActivity::class.java))
    }

    override fun onMenu(menuView : View, isLongClick : Boolean) {
        startActivity(Intent(applicationContext, EspActivity::class.java))
    }

    override fun onItemClick(view: View?, position: Int, isLongClick: Boolean) {
        startActivity(Intent(applicationContext, RoomActivity::class.java).apply {
            putExtra(EXTRA_ROOM_ID, listRoom.get(position).getId())
        })
    }
}
