package com.izerocs.smarthome.network

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Build
import com.google.gson.GsonBuilder
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

/**
 * Created by IzeroCs on 2020-04-15
 */
class NetworkProvider(private val context : Context?) {
    companion object {
        private var instance : NetworkProvider? = null

        const val CONNECT_TYPE_NONE   = 0
        const val CONNECT_TYPE_WIFI   = 1
        const val CONNECT_TYPE_MOBILE = 2

        fun self() : NetworkProvider {
            return self(null)
        }

        fun self(context : Context?) : NetworkProvider {
            if (instance == null)
                instance = NetworkProvider(context)

            return instance as NetworkProvider
        }

        fun <T> service(serviceClass : Class<T>) : T {
            return self().retrofit.create(serviceClass)
        }

        fun getConnectType(context : Context?) : Int {
            if (context == null)
                return CONNECT_TYPE_NONE

            (context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager).run {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    getNetworkCapabilities(activeNetwork)?.run {
                        if (hasTransport(NetworkCapabilities.TRANSPORT_WIFI))
                            return@getConnectType CONNECT_TYPE_WIFI
                        else if (hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR))
                            return@getConnectType CONNECT_TYPE_MOBILE
                    }

                    return@getConnectType CONNECT_TYPE_NONE
                } else {
                    @Suppress("DEPRECATION")
                    activeNetworkInfo?.run {
                        if (type == ConnectivityManager.TYPE_WIFI)
                            return@getConnectType CONNECT_TYPE_WIFI
                        else if (type == ConnectivityManager.TYPE_MOBILE)
                            return@getConnectType CONNECT_TYPE_MOBILE
                    }

                    return@getConnectType CONNECT_TYPE_NONE
                }
            }
        }
    }

    private var retrofit : Retrofit = Retrofit.Builder().apply {
        val connectType = getConnectType(context!!)
        var baseUrl = "127.0.0.1"

        if (connectType == CONNECT_TYPE_WIFI)
            baseUrl = "192.168.31.106"
        else if (connectType == CONNECT_TYPE_MOBILE)
            baseUrl = "192.168.42.244"

        baseUrl("http://$baseUrl:80/api/")
            .client(OkHttpClient.Builder().build())
            .addConverterFactory(GsonConverterFactory.create(GsonBuilder().create()))
    }.build()

}