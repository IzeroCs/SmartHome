package com.izerocs.smarthome.activity

import android.os.Bundle
import android.view.View
import com.izerocs.smarthome.R

/**
 * Created by IzeroCs on 2020-04-14
 */
class AddDeviceActivity : BaseActivity() {
    override fun onCreate(savedInstanceState : Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_add_device)
    }

    override fun onBack(backView : View, isLongClick : Boolean) {
        finish()
    }
}