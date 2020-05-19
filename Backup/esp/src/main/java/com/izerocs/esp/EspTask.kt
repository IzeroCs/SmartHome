package com.izerocs.esp

import android.content.Context
import com.izerocs.esp.security.IEncryptor

/**
 * Created by IzeroCs on 2020-05-19
 */

class EspTask : IEspTask {

    constructor(context : Context, apSsid : String, apBssid : String, apPassword : String) :
            this(context, apSsid, apBssid, apPassword, null)

    constructor(context : Context, apSsid : String, apBssid : String,
                apPassword : String, encryptor : IEncryptor?)

    override fun executeForResult() {

    }

    override fun executeForResult(expectTaskResultCount : Int) : List<IEspResult> {
        TODO("Not yet implemented")
    }

    override fun interrupt() {

    }

    override fun isCancelled() : Boolean {
        return false
    }

    override fun setEspListener(listener : IEspListener) {

    }

    override fun setPackageBroardcast(broardcast : Boolean) {

    }
}