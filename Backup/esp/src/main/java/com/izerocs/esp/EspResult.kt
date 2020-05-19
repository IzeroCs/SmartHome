package com.izerocs.esp

import java.net.InetAddress
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Created by IzeroCs on 2020-05-19
 */
class EspResult(isSuc : Boolean, bssid : String?, inetAddress : InetAddress?) : IEspResult {
    private val mIsSuc : Boolean = isSuc
    private val mBssid : String? = bssid
    private val mInetAddress : InetAddress? = inetAddress
    private val mIsCancelled : AtomicBoolean = AtomicBoolean(false)

    override fun isSuc() : Boolean {
        return this.mIsSuc
    }

    override fun getBssid() : String {
        return this.mBssid as String
    }

    override fun isCancelled() : Boolean {
        return this.mIsCancelled.get()
    }

    override fun getInetAddress() : InetAddress {
        return mInetAddress as InetAddress
    }

    override fun toString() : String {
        return String.format("bssid=%s, address=%s, suc=%b, cancel=%b", mBssid,
                mInetAddress?.getHostAddress(), mIsSuc, mIsCancelled.get());
    }

    fun setIsCancelled(isCancelled : Boolean) {
        this.mIsCancelled.set(isCancelled)
    }
}