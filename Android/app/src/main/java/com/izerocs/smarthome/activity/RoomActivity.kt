package com.izerocs.smarthome.activity

import android.os.Bundle
import android.view.MenuItem
import android.view.View
import com.izerocs.smarthome.R
import com.izerocs.smarthome.model.DeviceItem
import com.izerocs.smarthome.model.RoomItem
import com.izerocs.smarthome.widget.WavesView
import kotlinx.android.synthetic.main.activity_room.*

/**
 * Created by IzeroCs on 2020-04-03
 */
class RoomActivity : BaseActivity(),
    WavesView.OnBackClickListener
{

    private var roomItem : RoomItem? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_room)

        roomItem = RoomItem(this,
            intent.getStringExtra(SmartActivity.EXTRA_ROOM_NAME)!!,
            intent.getIntExtra(SmartActivity.EXTRA_ROOM_TYPE, 0)
        ).apply {
            wavesView.setTitle(getName())
            wavesView.setOnBackClickListener(this@RoomActivity)
        }

        listDevice.add(DeviceItem(this, "Light 1", 1))
        listDevice.add(DeviceItem(this, "Light 2", 1))
        listDevice.add(DeviceItem(this, "Light 3", 1))
        listDevice.add(DeviceItem(this, "Fan 1", 2))
        listDevice.add(DeviceItem(this, "Fan 2", 2))
        listDevice.add(DeviceItem(this, "Heater 1", 3))
    }

    override fun onCreateMenu() : Int? {
        return R.menu.room_menu
    }

    override fun onMenuItemClick(itemId : Int, groupId : Int, item : MenuItem?) {
        super.onMenuItemClick(itemId, groupId, item)
    }

    override fun onBack(backView: View, isLongClick: Boolean) {
        finish()
    }
}