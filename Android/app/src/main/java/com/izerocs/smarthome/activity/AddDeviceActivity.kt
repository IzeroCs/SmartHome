package com.izerocs.smarthome.activity

import android.os.Bundle
import android.view.View
import com.izerocs.smarthome.R
import com.izerocs.smarthome.model.DeviceItem
import kotlinx.android.synthetic.main.activity_add_device.*

/**
 * Created by IzeroCs on 2020-04-14
 */
class AddDeviceActivity : BaseActivity() {
    override fun onCreate(savedInstanceState : Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_add_device)
        addDeviceType.setEditTextBinder(addDeviceName)

        DeviceItem.getTypes().forEach {
            addDeviceType.add(DeviceItem.getTypeString(this@AddDeviceActivity, it),
                DeviceItem.getResourceIcon(it), it)
        }
    }

    override fun onBack(backView : View, isLongClick : Boolean) {
        finish()
    }
}