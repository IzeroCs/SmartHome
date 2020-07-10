package com.izerocs.smarthome.activity

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import com.izerocs.smarthome.R
import com.izerocs.smarthome.adapter.ListDeviceAdapter
import com.izerocs.smarthome.model.EspPinModel
import com.izerocs.smarthome.model.RoomDeviceModel
import com.izerocs.smarthome.model.RoomListModel
import com.izerocs.smarthome.network.SocketClient
import com.izerocs.smarthome.widget.WavesView
import es.dmoral.toasty.Toasty
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
        roomListItem?.let {
            room -> getSocketClient().queryRoomDeviceList(room.id) { list ->
                onEspDevices(getSocketClient(), list)
            }
        }
    }

    override fun onEspDevices(client : SocketClient, espDevices : MutableList<RoomDeviceModel>) {
        val list = espDevices.filter { model -> model.room.id == roomListItem?.id }.toMutableList()

        listDevice.clear()
        listDevice.addAll(list)
        runOnUiThread { listDevice.notifyDataSetChanged() }
    }

    override fun onCreateMenu() : Int? {
        return R.menu.room_menu
    }

    override fun onClick(v : View?) {
        if (v == floatButton)
            startActivity(Intent(applicationContext, AddDeviceActivity::class.java))
    }

    override fun onItemClick(v : View?, position : Int, isLongClick : Boolean) {
        val adapter = listDevice.getCastAdapter()

        adapter.get(position).let { device ->
            getSocketClient().queryRoomDevice(device, { model ->
                Log.d(TAG, "Query: $model")
            }) { error -> runOnUiThread {
                Toasty.error(this, error.nsp.toString(), 0).show()
            }}
        }
    }

    override fun onIconClick(v : View?, position : Int, isLongClick : Boolean) {
        val adapter = listDevice.getCastAdapter()

        adapter.get(position).let { device ->
            var status = EspPinModel.StatusCloud.OFF

            if (device.pin.statusCloud != EspPinModel.StatusCloud.ON && !device.pin.status)
                status = EspPinModel.StatusCloud.ON

            vibrator(100)
            getSocketClient().commitStatusRoomDevice(device.copy(pin = device.pin.copy(
                statusCloud = status
            )), { model ->
                Log.d(TAG, "Model: $model")
                adapter.set(position, model)
                runOnUiThread { adapter.notifyDataSetChanged() }
            }) { error -> runOnUiThread {
                Toasty.error(applicationContext, "NSP: ${error.nsp}", 0).show()
            }}
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