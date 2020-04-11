package com.izerocs.smarthome.activity

import android.app.Application

/**
 * Created by IzeroCs on 2020-04-01
 */
class SmartApplication : Application() {
    private var currentActivity : BaseActivity? = null

    companion object {
        private var self : SmartApplication? = null

        fun getInstance() : SmartApplication? = self
    }

    override fun onCreate() {
        super.onCreate()
        self = this
    }

    fun setCurrentActivity(activity : BaseActivity?) {
        currentActivity = activity
    }

    fun getCurrentActivity() : BaseActivity? {
        return currentActivity
    }
}