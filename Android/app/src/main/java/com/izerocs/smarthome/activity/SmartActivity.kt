package com.izerocs.smarthome.activity

import android.content.Intent
import android.os.Bundle
import android.view.View
import com.izerocs.smarthome.R
import com.izerocs.smarthome.adapter.ListRoomAdapter
import com.izerocs.smarthome.model.RoomItem
import com.izerocs.smarthome.preferences.RoomPreferences
import com.izerocs.smarthome.preferences.SharedPreferences
import kotlinx.android.synthetic.main.activity_smart.*

/**
 * Created by IzeroCs on 2020-03-23
 */

class SmartActivity : BaseActivity(),
    View.OnClickListener,
    ListRoomAdapter.OnItemClickListener
{

    companion object {
        const val EXTRA_ROOM_NAME = "com.izerocs.smarthome.ROOM_NAME"
        const val EXTRA_ROOM_TYPE = "com.izerocs.smarthome.ROOM_TYPE"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_smart)
        listRoom.setOnItemClickListener(this)
        floatButton.setOnClickListener(this)

        if (preferences?.empty()!!) {
            RoomItem.getTypes().forEach {
                preferences?.run {
                    put(size().plus(1).toString(), RoomItem(this@SmartActivity, it).toData())
                }
            }
        }

        updateListAdapter()
        onItemClick(null, 0, false)

    }

    override fun onCreatePreferences() : SharedPreferences? {
        return RoomPreferences(this)
    }

    override fun onResume() {
        super.onResume()
        floatButton.show()
        updateListAdapter()
    }

    override fun onClick(v: View?) {
        startActivity(Intent(applicationContext, AddRoomActivity::class.java))
    }

    override fun onItemClick(view: View?, position: Int, isLongClick: Boolean) {
        startActivity(Intent(applicationContext, RoomActivity::class.java).apply {
            val roomItem = listRoom.get(position)

            putExtra(EXTRA_ROOM_NAME, roomItem.getName())
            putExtra(EXTRA_ROOM_TYPE, roomItem.getType())
        })
    }

    private fun updateListAdapter() {
        preferences?.run {
            val list = getAll()
                ?.toSortedMap(Comparator<String> { o1, o2 -> o1.toInt().compareTo(o2.toInt()) })

            listRoom.clear()
            list?.forEach {
                val item = getObject(it.key, RoomItem.RoomItemData::class.java)
                val roomItem = RoomItem(this@SmartActivity, item.name, item.type)

                listRoom.add(roomItem)
            }
        }
    }
}
