package com.izerocs.smarthome.activity

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import com.izerocs.smarthome.R
import com.izerocs.smarthome.adapter.ListRoomAdapter
import com.izerocs.smarthome.model.RoomItem
import com.izerocs.smarthome.model.RoomType
import com.izerocs.smarthome.network.SocketClient
import com.izerocs.smarthome.preferences.RoomPreferences
import com.izerocs.smarthome.preferences.SharedPreferences
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

    override fun onCreatePreferences() : SharedPreferences = RoomPreferences(this)

    override fun onRoomList(client : SocketClient, roomList : MutableMap<String, Int>) {
        if (roomList.isEmpty())
            return

        val rooms = mutableListOf<RoomItem>()

        roomList.forEach { room -> rooms.add(RoomItem(applicationContext, room.key, room.value)) }
        listRoom.clear()
        listRoom.addAll(rooms)

        runOnUiThread { listRoom.notifyDataSetChanged() }
    }

    override fun onFetched(type : Int) {
        super.onFetched(type)

        if (type == FETCH_ROOM_TYPE) {
            if (preferences.empty()) {
                RoomType.getTypes().forEach {
                    preferences.run {
                        put(size().plus(1)
                            .toString(), RoomItem(this@SmartActivity, it).toData())
                    }
                }
            }

            updateListAdapter()
        }
    }

    override fun onResume() {
        super.onResume()
        floatButton.show()
        updateListAdapter()
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
            val roomItem = listRoom.get(position)

            putExtra(EXTRA_ROOM_NAME, roomItem.getName())
            putExtra(EXTRA_ROOM_TYPE, roomItem.getType())
        })
    }

    private fun updateListAdapter() {
//        runOnUiThread {
//            preferences.run {
//                val list = getAll()
//                    ?.toSortedMap(Comparator { o1, o2 -> o1.toInt().compareTo(o2.toInt()) })
//
//                listRoom.clear()
//                list?.forEach {
//                    val item = getObject(it.key, RoomItem.RoomItemData::class.java)
//
//                    if (RoomType.isTypeValid(item.type))
//                        listRoom.add(RoomItem(this@SmartActivity, item.name, item.type))
//                }
//            }
//        }
    }
}
