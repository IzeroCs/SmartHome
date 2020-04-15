package com.izerocs.smarthome.network

import com.google.gson.GsonBuilder
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

/**
 * Created by IzeroCs on 2020-04-15
 */
class NetworkProvider() {
    companion object {
        private var instance : NetworkProvider = NetworkProvider()

        fun self() : NetworkProvider {
            return instance
        }

        fun <T> service(serviceClass : Class<T>) : T {
            return self().retrofit.create(serviceClass)
        }
    }

    private var retrofit : Retrofit = Retrofit.Builder()
            .baseUrl("http://127.0.0.1:80/api/")
            .client(OkHttpClient.Builder().build())
            .addConverterFactory(GsonConverterFactory.create(GsonBuilder().create()))
            .build()

}