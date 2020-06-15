package com.izerocs.smarthome.activity

import android.content.Intent
import android.os.Bundle
import android.view.View
import com.izerocs.smarthome.R
import com.izerocs.smarthome.adapter.ListDeviceAdapter
import com.izerocs.smarthome.model.DeviceItem
import com.izerocs.smarthome.model.RoomItem
import com.izerocs.smarthome.widget.WavesView
import es.dmoral.toasty.Toasty
import kotlinx.android.synthetic.main.activity_room.*

/**
 * Created by IzeroCs on 2020-04-03
 */
class RoomActivity : BaseActivity(),
    View.OnClickListener, WavesView.OnBackClickListener, ListDeviceAdapter.OnItemClickListener
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

        floatButton.setOnClickListener(this)
        listDevice.setOnItemClickListener(this)

        val arr = arrayListOf<HashMap<String, Any>>(
            hashMapOf("name" to "Đèn tuýp", "type" to 1, "descriptor" to "Trái"),
            hashMapOf("name" to "Đèn tuýp", "type" to 1, "descriptor" to "Phải"),
            hashMapOf("name" to "Đèn ngủ", "type" to 1, "widget" to 1, "status" to 1),
            hashMapOf("name" to "Quạt trần", "type" to 2),
            hashMapOf("name" to "Quạt đứng", "type" to 2, "status" to 1),
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

                if (maps.containsKey("status"))
                    setStatus(maps["status"] as Int)
            }

            listDevice.add(device)
        }
    }

    override fun onCreateMenu() : Int? {
        return R.menu.room_menu
    }

    override fun onClick(v : View?) {
        if (v == floatButton)
            startActivity(Intent(applicationContext, AddDeviceActivity::class.java))
    }

    override fun onItemClick(v : View?, position : Int, isLongClick : Boolean) {

    }

    override fun onIconClick(v : View?, position : Int, isLongClick : Boolean) {
        (listDevice.adapter as ListDeviceAdapter).run {
            get(position).run {
                toggleStatus()
                notifyDataSetChanged()

                var message = this@RoomActivity.getString(R.string.deviceStatusOffToast)

                if (getStatus() == DeviceItem.STATUS_ON)
                    message = this@RoomActivity.getString(R.string.deviceStatusOnToast)

                if (message.isNotEmpty()) {
                    message = message.replace("\${name}", getName())

                    if (getStatus() == DeviceItem.STATUS_ON)
                        Toasty.success(this@RoomActivity, message, Toasty.LENGTH_SHORT).show()
                    else
                        Toasty.info(this@RoomActivity, message, Toasty.LENGTH_SHORT).show()
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        floatButton.show()
    }

    override fun onBack(backView: View, isLongClick: Boolean) {
        finish()
    }
}