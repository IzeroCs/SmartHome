package com.izerocs.esp

import java.net.InetAddress

/**
 * Created by IzeroCs on 2020-05-19
 */
interface IEspResult {
    fun isSuc() : Boolean
    fun getBssid() : String
    fun isCancelled() : Boolean
    fun getInetAddress() : InetAddress
}