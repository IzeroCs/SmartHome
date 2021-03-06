package com.izerocs.smarthome.activity

import android.animation.Animator
import android.animation.ObjectAnimator
import android.net.wifi.WifiManager
import android.os.Bundle
import android.text.InputType
import android.util.Log
import android.view.View
import com.afollestad.materialdialogs.MaterialDialog
import com.afollestad.materialdialogs.customview.customView
import com.izerocs.smarthome.R
import com.izerocs.smarthome.adapter.ListEspAdapter
import com.izerocs.smarthome.model.EspModuleModel
import com.izerocs.smarthome.network.EspConnectivity
import com.izerocs.smarthome.network.EspConnectivity.Companion.StationStatus
import com.izerocs.smarthome.network.EspConnectivity.OnScanerListener
import com.izerocs.smarthome.network.EspConnectivity.OnStationListener
import com.izerocs.smarthome.network.SocketClient
import com.izerocs.smarthome.preferences.EspPreferences
import com.izerocs.smarthome.preferences.SharedPreferences
import com.izerocs.smarthome.widget.WavesView
import es.dmoral.toasty.Toasty
import kotlinx.android.synthetic.main.activity_esp.*
import kotlinx.android.synthetic.main.dialog_esp_wifi.*

/**
 * Created by IzeroCs on 2020-04-30
 */
class EspActivity : BaseActivity(), View.OnClickListener, WavesView.OnBackClickListener,
    ListEspAdapter.OnItemClickListener, OnScanerListener, OnStationListener
{
    private var currentItemScan : EspModuleModel? = null
    private var currentItemConnected : EspModuleModel? = null
    private var currentItemScanPosition : Int = 0
    private var currentItemConnectedPosition : Int = 0


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

    companion object {
        const val TAG = "EspActivity"
    }

    override fun onCreate(savedInstanceState : Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_esp)
        wavesView.setTitle(R.string.listEspTitle)
        wavesView.setOnBackClickListener(this)
//        floatButton.setOnClickListener(this)
        listEspScan.setOnItemClickListener(this)
        listEspConnected.setOnItemClickListener(this)

//        espConnectivity = EspConnectivity(this)
//        refreshAnimator = ObjectAnimator.ofFloat(floatButton, "rotation", 0F, 360F)
//            .apply {
//                duration    = 800
//                repeatCount = ObjectAnimator.INFINITE
//
//                addListener(onAnimatorListener)
//            }

//        preferences.run {
//            getAll()?.forEach {
//                val data = getObject(it.key, EspItem.EspDataItem::class.java)
//
//                if (EspItem.isMatchEsp(data.ssid))
//                    listEspScan.add(EspItem(data.ssid, data.level, data.capabilities))
//            }
//
//            runOnUiThread {
//                listEspScan.notifyDataSetChanged()
//            }
//        }

//        espConnectivity?.run {
//            setOnScannerListener(this@EspActivity)
//            setOnStationListener(this@EspActivity)
//            startScanModule()
//        }
    }

    override fun onDestroy() {
        super.onDestroy()
//        espConnectivity?.destroy()
    }

    override fun onCreatePreferences() : SharedPreferences {
        return EspPreferences(this)
    }

    override fun onEspModules(client : SocketClient, espModules : MutableMap<String, EspModuleModel>?) {
        espModules?.run {
            listEspConnected.clear()
            listEspConnected.addAll(this.values.toMutableList())

            runOnUiThread {
                listEspConnected.notifyDataSetChanged()
                listEspConnectedTitle.text = getString(R.string.listEspConnectedTitle)
                    .replace("\${count}", listEspConnected.size().toString())
            }
        }
    }

    override fun onClick(v : View?) {
        if (v == floatButton) {
            espConnectivity?.toggleScanModule()
        }
    }

    override fun onBack(backView : View, isLongClick : Boolean) {
        finish()
    }

    override fun onScanBegin() {
        runOnUiThread {
            refreshAnimator?.run {
                if (!isRunning) {
                    repeatCount = ObjectAnimator.INFINITE
                    start()
                }
            }
        }
    }

    override fun onScanEnd() {
        runOnUiThread {
            refreshAnimator?.run {
                if (isRunning)
                    repeatCount = 1
            }
        }
    }

    override fun onScanSuccess(wifiManager : WifiManager) {
        wifiManager.scanResults?.run {
            listEspScan.clear()
            preferences.clear()

//            forEach {
//                if (EspItem.isMatchEsp(it.SSID)) {
//                    val item = EspItem(it)
//
//                    listEspScan.add(item)
//                    preferences.put((preferences.size()
//                        .plus(1)).toString(), item.toData())
//                }
//            }
//
//            runOnUiThread {
//                listEspScan.notifyDataSetChanged()
//            }
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

    override fun onStationStatus(status : StationStatus) {
        Log.d("EspActivity", "Status: $status")
    }

    override fun onStationFailed(message : String) {
        Log.d("EspActivity", "Failed add")

        runOnUiThread {
            Toasty.error(applicationContext, message, Toasty.LENGTH_SHORT).show()
        }
    }

    override fun onStationFailed(e : Exception) {
        e.printStackTrace()
    }

    override fun onItemClick(v : View?, position : Int, isLongClick : Boolean) {
        v?.parent.run {
            if (this == listEspScan)
                onItemScanClick(position)
            else if (this == listEspConnected)
                onItemConnectedClick(position)
        }
    }

    private fun onItemScanClick(position : Int) {
        currentItemScan = listEspScan.get(position)
        currentItemScanPosition = position

        MaterialDialog(this).show {
            title(R.string.dialogEspWiFi)
            customView(R.layout.dialog_esp_wifi)
            negativeButton(R.string.dialogEspWiFiDisagree) { it.dismiss() }
            positiveButton(R.string.dialogEspWiFiAgree) {
                espConnectivity?.run {
                    setCurrentSetupSsid(dialogEspWiFiSsid.text.toString())
                    setCurrentSetupPsk(dialogEspWiFiPassword.text.toString())

                    currentItemScan?.let { stationConnect(it) }
                }
            }

            dialogEspWiFiSsid.setText(espConnectivity?.getCurrentSetupSsid())
            dialogEspWiFiPassword.run {
                inputType = InputType.TYPE_TEXT_VARIATION_PASSWORD.or(InputType.TYPE_CLASS_TEXT)
                setText(espConnectivity?.getCurrentSetupPsk())
            }

            dialogEspWiFiShowPassword.run {
                isChecked = false
                setOnClickListener {
                    dialogEspWiFiPassword.run {
                        val cursor = selectionStart

                        inputType = if (isChecked)
                            InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD
                        else
                            InputType.TYPE_TEXT_VARIATION_PASSWORD.or(InputType.TYPE_CLASS_TEXT)

                        setSelection(cursor)
                    }
                }
            }
        }
    }

    private fun onItemConnectedClick(position : Int) {
        currentItemConnected = listEspConnected.get(position)
        currentItemConnectedPosition = position
    }
}