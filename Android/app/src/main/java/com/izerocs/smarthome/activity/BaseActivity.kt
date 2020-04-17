package com.izerocs.smarthome.activity

import android.annotation.SuppressLint
import android.content.pm.ActivityInfo
import android.graphics.Typeface
import android.os.Bundle
import android.util.DisplayMetrics
import android.util.Log
import android.view.*
import androidx.annotation.MenuRes
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.content.res.ResourcesCompat
import com.izerocs.smarthome.R
import com.izerocs.smarthome.model.RoomType
import com.izerocs.smarthome.network.NetworkProvider
import com.izerocs.smarthome.preferences.SharedPreferences
import com.izerocs.smarthome.widget.WavesView
import es.dmoral.toasty.Toasty
import kotlinx.android.synthetic.main.activity_room.*

/**
 * Created by IzeroCs on 2020-04-03
 */
abstract class BaseActivity : AppCompatActivity(),
    WavesView.OnBackClickListener, WavesView.OnMenuItemClickListener
{

    private   var rootView    : View? = null
    protected var preferences : SharedPreferences? = null

    companion object {
        const val FETCH_ROOM_TYPE = 1
    }

    @SuppressLint("SourceLockedOrientationActivity", "CheckResult")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        NetworkProvider.self(this)
        RoomType.fetchTypes(this, ::onFetched)
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

    open fun onCreatePreferences() : SharedPreferences? {
        return null
    }

    open fun onFetched(type : Int) {
        Log.d(BaseActivity::class.java.toString(), "onFetch: $type")
    }

    @MenuRes
    open fun onCreateMenu() : Int? {
        return null
    }

    open fun onMenuItemClick(itemId : Int, groupId : Int, item : MenuItem?) { }

    override fun onResume() {
        super.onResume()
        (applicationContext as SmartApplication).setCurrentActivity(this)
    }

    override fun onDestroy() {
        (applicationContext as SmartApplication).setCurrentActivity(null)
        super.onDestroy()
    }

    override fun onBack(backView : View, isLongClick : Boolean) {
        finish()
    }

    final override fun onMenuItem(menuView : View, item : MenuItem?) {
        item?.run {
            onMenuItemClick(itemId, groupId, this)
        }
    }

    override fun setContentView(layoutResID : Int) {
        this.setContentView(LayoutInflater.from(this).inflate(layoutResID, null))
    }

    override fun setContentView(view : View?) {
        this.rootView = view
        super.setContentView(view)
        this.addBackListener()
        this.addMenu()
    }

    override fun setContentView(view : View?, params : ViewGroup.LayoutParams?) {
        this.rootView = view
        super.setContentView(view, params)
        this.addBackListener()
        this.addMenu()
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

    fun getRootView() : View? {
        return rootView
    }

}