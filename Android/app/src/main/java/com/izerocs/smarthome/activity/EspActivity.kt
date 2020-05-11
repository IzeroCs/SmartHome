package com.izerocs.smarthome.activity

import android.animation.Animator
import android.animation.ObjectAnimator
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.wifi.WifiInfo
import android.net.wifi.WifiManager
import android.os.Bundle
import android.provider.Settings
import android.view.View
import com.izerocs.smarthome.R
import com.izerocs.smarthome.adapter.ListEspAdapter
import com.izerocs.smarthome.model.EspItem
import com.izerocs.smarthome.preferences.EspPreferences
import com.izerocs.smarthome.preferences.SharedPreferences
import es.dmoral.toasty.Toasty
import kotlinx.android.synthetic.main.activity_esp.*

/**
 * Created by IzeroCs on 2020-04-30
 */
class EspActivity : BaseActivity(), View.OnClickListener, ListEspAdapter.OnItemClickListener {
    private var isScan : Boolean = false

    private var currentWifiInfo : WifiInfo? = null
    private var refreshAnimator : ObjectAnimator? = null
    private var wifiManager : WifiManager? = null

    private val wifiScanReceiver = object : BroadcastReceiver() {
        override fun onReceive(context : Context, intent : Intent) {
            if (intent.getBooleanExtra(WifiManager.EXTRA_RESULTS_UPDATED, false))
                this@EspActivity.scanSuccess()
            else
                this@EspActivity.scanFailed()

            applicationContext.unregisterReceiver(this)
        }
    }

    private val onAnimatorListener = object : Animator.AnimatorListener {
        override fun onAnimationRepeat(animation : Animator?) { }
        override fun onAnimationCancel(animation : Animator?) { }

        override fun onAnimationEnd(animation : Animator?) {
            floatButton.isClickable = true
            floatButton.isFocusable = true
        }

        override fun onAnimationStart(animation : Animator?) {
            floatButton.isClickable = false
            floatButton.isFocusable = false
        }

    }

    override fun onCreate(savedInstanceState : Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_esp)
        wavesView.setTitle(R.string.listEspTitle)
        floatButton.setOnClickListener(this)
        listEspScan.setOnItemClickListener(this)
        listEspConnected.setOnItemClickListener(this)

        wifiManager = applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
        currentWifiInfo = wifiManager?.connectionInfo

        refreshAnimator = ObjectAnimator.ofFloat(floatButton, "rotation", 0F, 360F)
            .apply {
                duration    = 800
                repeatCount = ObjectAnimator.INFINITE

                addListener(onAnimatorListener)
            }

        preferences?.run {
            getAll()?.forEach {
                val data = getObject(it.key, EspItem.EspDataItem::class.java)

                if (EspItem.isMatchEsp(data.ssid))
                    listEspScan.add(EspItem(data.ssid, data.level, data.capabilities))
            }

            runOnUiThread {
                listEspScan.notifyDataSetChanged()
            }
        }

        startScan()
    }

    override fun onCreatePreferences() : SharedPreferences? {
        return EspPreferences(this)
    }

    override fun onClick(v : View?) {
        if (v == floatButton) {
            if (!isScan)
                startScan()
        }
    }

    override fun onItemClick(v : View?, position : Int, isLongClick : Boolean) {
        v?.parent.run {
            if (this == listEspScan)
                onItemScanClick(v as View, position)
            else if (this == listEspConnected)
                onItemConnectedClick(v as View, position)
        }
    }

    private fun onItemScanClick(v : View, position : Int) {
        val item = listEspScan.get(position)

        item.addNetwork(wifiManager)
        println(item)

        println("ConfigList")
        wifiManager?.configuredNetworks?.forEach {
            println("Item")
            println(it)
        }
    }

    private fun onItemConnectedClick(v : View, position : Int) {

    }

    private fun startScan() {
        if (isScan)
            return

        applicationContext.registerReceiver(wifiScanReceiver, IntentFilter().apply {
            addAction(WifiManager.SCAN_RESULTS_AVAILABLE_ACTION)
        })

        if (!wifiManager!!.startScan())
            scanFailed()

        isScan = true

        if (!refreshAnimator!!.isRunning) refreshAnimator?.run {
            repeatCount = ObjectAnimator.INFINITE
            start()
        }
    }

    private fun cancelScan() {
        isScan = false

        if (refreshAnimator!!.isRunning)
            refreshAnimator?.repeatCount = 1
    }

    private fun scanSuccess() {
        cancelScan()

        wifiManager?.scanResults?.run {
            listEspScan.clear()
            preferences?.clear()

            forEach {
                if (EspItem.isMatchEsp(it.SSID)) {
                    val item = EspItem(it)

                    listEspScan.add(item)
                    preferences?.put((preferences?.size()
                        ?.plus(1)).toString(), item.toData())
                }
            }

            runOnUiThread {
                listEspScan.notifyDataSetChanged()
            }
        }

        runOnUiThread {
            Toasty.success(this, R.string.listEspScanSuccess, Toasty.LENGTH_LONG).show()
        }
    }

    private fun scanFailed() {
        runOnUiThread {
            cancelScan()
            Toasty.error(this, R.string.listEspScanFailed, Toasty.LENGTH_LONG).show()
        }
    }

    private fun isScanThrottleEnabled() : Boolean {
        return Settings.Global.getInt(contentResolver, "wifi_scan_throttle_enabled") == 1
    }
}