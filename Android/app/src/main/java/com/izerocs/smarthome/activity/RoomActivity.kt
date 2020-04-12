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

        val arr = arrayListOf<HashMap<String, Any>>(
            hashMapOf("name" to "Đèn tuýp", "type" to 1, "descriptor" to "Trái"),
            hashMapOf("name" to "Đèn tuýp", "type" to 1, "descriptor" to "Phải"),
            hashMapOf("name" to "Đèn ngủ", "type" to 1, "widget" to 1),
            hashMapOf("name" to "Quạt trần", "type" to 2),
            hashMapOf("name" to "Quạt đứng", "type" to 2),
            hashMapOf("name" to "Bình nóng lạnh", "type" to 3, "widget" to 1)
        )

        for (i in 0 until arr.size) {
            val maps = arr[i]
            val device = DeviceItem(this).apply {
                setName(maps["name"] as String)
                setType(maps["type"] as Int)

                if (maps.containsKey("descriptor"))
                    setDescriptor(maps["descriptor"] as String)

                if (maps.containsKey("widget"))
                    setWidgetSize(maps["widget"] as Int)
            }

            listDevice.add(device)
        }
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