package com.izerocs.smarthome.activity

import android.animation.Animator
import android.animation.ObjectAnimator
import android.net.wifi.WifiManager
import android.os.Bundle
import android.view.View
import com.izerocs.smarthome.R
import com.izerocs.smarthome.adapter.ListEspAdapter
import com.izerocs.smarthome.model.EspItem
import com.izerocs.smarthome.network.EspConnectivity
import com.izerocs.smarthome.preferences.EspPreferences
import com.izerocs.smarthome.preferences.SharedPreferences
import es.dmoral.toasty.Toasty
import kotlinx.android.synthetic.main.activity_esp.*

/**
 * Created by IzeroCs on 2020-04-30
 */
class EspActivity : BaseActivity(), View.OnClickListener, ListEspAdapter.OnItemClickListener,
    EspConnectivity.OnScanerListener
{
    private var espConnectivity : EspConnectivity? = null
    private var refreshAnimator : ObjectAnimator?  = null

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

        espConnectivity = EspConnectivity(this)
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

        espConnectivity?.run {
            setOnScannerListener(this@EspActivity)
            startScanModule()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        espConnectivity?.destroy()
    }

    override fun onCreatePreferences() : SharedPreferences? {
        return EspPreferences(this)
    }

    override fun onClick(v : View?) {
        if (v == floatButton) {
            espConnectivity?.toggleScanModule()
        }
    }

    override fun onScanBegin() {
        runOnUiThread {
            if (!refreshAnimator!!.isRunning) refreshAnimator?.run {
                repeatCount = ObjectAnimator.INFINITE
                start()
            }
        }
    }

    override fun onScanEnd() {
        runOnUiThread {
            if (refreshAnimator!!.isRunning)
                refreshAnimator?.repeatCount = 1
        }
    }

    override fun onScanSuccess(wifiManager : WifiManager) {
        wifiManager.scanResults?.run {
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

    override fun onScanFailed(wifiManager : WifiManager) {
        runOnUiThread {
            Toasty.error(this, R.string.listEspScanFailed, Toasty.LENGTH_LONG).show()
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
        espConnectivity?.addWifiToModule(listEspScan.get(position))
    }

    private fun onItemConnectedClick(v : View, position : Int) {

    }
}