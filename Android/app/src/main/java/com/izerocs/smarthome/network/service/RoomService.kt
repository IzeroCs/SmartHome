package com.izerocs.smarthome.network.service

import retrofit2.Call
import retrofit2.http.GET

/**
 * Created by IzeroCs on 2020-04-15
 */
interface RoomService {
    @GET("room/types")
    fun getTypes() : Call<List<String>>
}