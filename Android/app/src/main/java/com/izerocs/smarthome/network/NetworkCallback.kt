package com.izerocs.smarthome.network

import android.util.Log
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

/**
 * Created by IzeroCs on 2020-04-15
 */
abstract class NetworkCallback<T> : Callback<T> {

    override fun onResponse(call : Call<T>, response : Response<T>) {
        Log.d(NetworkCallback::class.java.toString(), response.toString())
    }

    override fun onFailure(call : Call<T>, t : Throwable) {
        Log.e(NetworkCallback::class.java.toString(), t.message.toString())
    }
}