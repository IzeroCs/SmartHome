package com.izerocs.smarthome.activity

import android.annotation.SuppressLint
import android.content.pm.ActivityInfo
import android.graphics.Typeface
import android.os.Bundle
import android.util.DisplayMetrics
import android.view.*
import androidx.annotation.MenuRes
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.content.res.ResourcesCompat
import com.github.nkzawa.socketio.client.Socket
import com.izerocs.smarthome.R
import com.izerocs.smarthome.item.RoomListItem
import com.izerocs.smarthome.item.RoomTypeItem
import com.izerocs.smarthome.model.EspModuleModel
import com.izerocs.smarthome.network.SocketClient
import com.izerocs.smarthome.preferences.SharedPreferences
import com.izerocs.smarthome.widget.WavesView
import com.izerocs.smarthome.widget.view.CloudErrorView
import es.dmoral.toasty.Toasty
import kotlinx.android.synthetic.main.activity_room.*

/**
 * Created by IzeroCs on 2020-04-03
 */
abstract class BaseActivity : AppCompatActivity(),
    WavesView.OnBackClickListener, WavesView.OnMenuItemClickListener
{
    private   var rootView    : View? = null
    private   var cloudError  : View? = null
    protected var preferences : SharedPreferences = SharedPreferences()

    companion object {
        const val TAG = "BaseActivity"
        const val FETCH_ROOM_TYPE = 1
    }

    @SuppressLint("SourceLockedOrientationActivity", "CheckResult")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        Toasty.Config.getInstance()
            .allowQueue(false)
            .setTextSize(resources.getDimensionPixelSize(R.dimen.toastyTextSize))
            .setToastTypeface(ResourcesCompat.getFont(this, R.font.ubuntu) as Typeface)
            .apply()

        AppCompatDelegate.setCompatVectorFromResourcesEnabled(true)
        window.setFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
        preferences          = this.onCreatePreferences()

        printResulotion()
    }

    open fun onCreatePreferences() : SharedPreferences = SharedPreferences()
    open fun onSocketConnect(client : SocketClient) {}
    open fun onSocketConnectError(client : SocketClient) {}
    open fun onSocketDisconnect(client : SocketClient) {}
    open fun onEspModules(client : SocketClient, espModules : MutableMap<String, EspModuleModel>?) {}

    open fun onRoomTypes(client : SocketClient, roomTypeItems : MutableList<RoomTypeItem>) {

    }

    open fun onRoomList(client : SocketClient, roomListList : MutableList<RoomListItem>) {}

    @MenuRes
    open fun onCreateMenu() : Int? = null
    open fun onMenuItemClick(itemId : Int, groupId : Int, item : MenuItem?) { }

    override fun onResume() {
        super.onResume()
        getRootApplication().setCurrentActivity(this)
    }

    override fun onDestroy() {
        getRootApplication().setCurrentActivity(null)
        super.onDestroy()
    }

    override fun onBack(backView : View, isLongClick : Boolean) : Unit = finish()

    final override fun onMenuItem(menuView : View, item : MenuItem?) {
        item?.run { onMenuItemClick(itemId, groupId, this) }
    }

    override fun setContentView(view : View?) : Unit = this.setContentView(view, null)
    override fun setContentView(layoutResID : Int) : Unit = this.setContentView(LayoutInflater
        .from(this).inflate(layoutResID, null))


    override fun setContentView(view : View?, params : ViewGroup.LayoutParams?) {

        if (params == null)
            super.setContentView(view)
        else
            super.setContentView(view, params)

        this.rootView = view
        this.addBackListener()
        this.addMenu()

        cloudError = findViewById(R.id.cloudError)
    }

    private fun addBackListener() {
        (rootView as ViewGroup).run {
            findViewById<WavesView>(R.id.wavesView)?.run {
                if (isActiveBack())
                    setOnBackClickListener(this@BaseActivity)
            }
        }
    }

    private fun addMenu() {
        onCreateMenu()?.run {
            wavesView.setMenu(this)
            wavesView.setOnMenuItemClickListener(this@BaseActivity)
        }
    }

    private fun printResulotion() {
        val display = DisplayMetrics()
        windowManager.defaultDisplay.getMetrics(display)

        println("Width: ${display.widthPixels}, Height: ${display.heightPixels}, DensityDpi: ${display.densityDpi}, Density: ${display.density}, ScaledDensity: ${display.scaledDensity}")
    }

    fun cloudError(isShow : Boolean, type : String? = null) {
        if (cloudError is CloudErrorView)
            (cloudError as CloudErrorView).setVisibility(isShow, type)
    }

    fun getRootApplication() : SmartApplication = application as SmartApplication
    fun getSocket() : Socket = getSocketClient().getSocket()
    fun getSocketClient() : SocketClient = getRootApplication().getSocketClient()
    fun getRootView() : View? = rootView

}