package com.izerocs.smarthome.preferences

import android.content.Context
import java.util.*

class AppPreferences : SharedPreferences {
    private var appId : String = ""
    private var appToken : String = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9." +
            "eyJuYW1lIjoiSXplcm9DcyIsInN1YiI6IkFQUCIsImlhdCI6NDEwMjQ0NDgwMH0." +
            "W6z51k56Q374LIpEWoaHJkWErMEeMht8J1clLTc9-JewEgsEbNa-rCcoHUr_NKuNzu6H9CQqqAe_" +
            "j5EEAfayl8nECVMuTJxlc4e0vPqehVQGORicfvF9KUyw8xvzKLQlAu-uzynu3AnCYvJhSICT_" +
            "kyIXtEoSZdj70mb5e5AGL9NvO27mfCamItF-q8nlsQEPquBf3jPRxjdVog8_" +
            "t4Sa1hznrhJsgGeJjXAEXK5AqM_7ahCRLbKdG4azENRxrSuN8BBoxO_" +
            "UdBKvlyL931Zq8Zs1pQAFdebdODk2FNnkzVTRowEn1zfOq0K4Tj06hDXawrO7qdaK-fYsCWJCa7hwg"

    companion object {
        const val APP_ID_CHARS  = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        const val APP_ID_PREFIX = "APP"
        const val APP_ID_LENGTH = 20
    }

    constructor(context : Context) : super(context, "app") {
        if (!contains("app_id"))
            this.appId = generatorAppID()
        else
            this.appId = getString("app_id", generatorAppID())

        put("app_id", this.appId)
    }

    fun getAppID() : String = this.appId
    fun getAppToken() : String = this.appToken

    private fun generatorAppID() : String {
        val ran : Random        = Random()
        val buf : StringBuilder = StringBuilder(APP_ID_PREFIX)
        val num : String        = System.currentTimeMillis().shl(1).toString()

        val chrRandSize : Int  = APP_ID_CHARS.length
        var chrDecimal  : Int  = 0

        for (i in 0 until 20) {
            chrDecimal = num[i].toInt()

            if (buf.length >= APP_ID_LENGTH)
                break

            if (chrDecimal < 48 || chrDecimal > 57)
                break

            buf.append(APP_ID_CHARS[(chrDecimal - 48) * ran.nextInt(3) + 1])
            buf.append(APP_ID_CHARS[ran.nextInt(chrRandSize)])
        }

        return buf.toString()
    }

}