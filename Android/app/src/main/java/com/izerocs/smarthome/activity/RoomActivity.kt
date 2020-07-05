package com.izerocs.smarthome.activity

import android.content.Intent
import android.os.Bundle
import android.view.View
import com.izerocs.smarthome.R
import com.izerocs.smarthome.adapter.ListDeviceAdapter
import com.izerocs.smarthome.model.RoomDeviceModel
import com.izerocs.smarthome.model.RoomListModel
import com.izerocs.smarthome.network.SocketClient
import com.izerocs.smarthome.widget.WavesView
import kotlinx.android.synthetic.main.activity_room.*

/**
 * Created by IzeroCs on 2020-04-03
 */
class RoomActivity : BaseActivity(),
    View.OnClickListener, WavesView.OnBackClickListener, ListDeviceAdapter.OnItemClickListener
{

    private var roomListItem : RoomListModel? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_room)

        roomListItem = getSocketClient().getRoomLists()
            .first { item -> item.id == intent.getIntExtra(SmartActivity.EXTRA_ROOM_ID, 0) }

        if (roomListItem == null)
            finish()

        wavesView.setTitle(roomListItem?.name!!)
        wavesView.setOnBackClickListener(this@RoomActivity)

        floatButton.setOnClickListener(this)
        listDevice.setOnItemClickListener(this)
    }

    override fun onSocketConnect(client : SocketClient) {
        roomListItem?.let { room ->
            getSocketClient().queryRoomDeviceList(room.id) { list ->
                listDevice.clear()
                listDevice.addAll(list)

                runOnUiThread { listDevice.notifyDataSetChanged() }
            }
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
        val adapter = listDevice.getCastAdapter()
        val device  = adapter.get(position)

        device?.let { device ->
            getSocketClient().commitRoomDevice(device.copy(
                status = RoomDeviceModel.STATUS_ON
            ))
        }

//        (listDevice.adapter as ListDeviceAdapter).run {
//            get(position).run {
//                toggleStatus()
//                runOnUiThread { notifyDataSetChanged() }
//
//                var message = this@RoomActivity.getString(R.string.deviceStatusOffToast)
//
//                if (status == RoomDeviceModel.STATUS_ON)
//                    message = this@RoomActivity.getString(R.string.deviceStatusOnToast)
//
//                if (message.isNotEmpty()) {
//                    message = message.replace("\${name}", name)
//
//                    if (status == RoomDeviceModel.STATUS_ON)
//                        Toasty.success(this@RoomActivity, message, Toasty.LENGTH_SHORT).show()
//                    else
//                        Toasty.info(this@RoomActivity, message, Toasty.LENGTH_SHORT).show()
//                }
//            }
//        }
    }

    override fun onResume() {
        super.onResume()
        floatButton.show()
    }

    override fun onBack(backView: View, isLongClick: Boolean) {
        finish()
    }
}