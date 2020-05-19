package com.izerocs.esp.protocol

import com.izerocs.esp.security.IEncryptor
import com.izerocs.esp.task.IEspGenerator
import com.izerocs.esp.util.ByteUtil
import java.net.InetAddress

/**
 * Created by IzeroCs on 2020-05-19
 */
class EspGenerator(apSsid : ByteArray, apBssid : ByteArray, apPassword : ByteArray,
    inetAddress : InetAddress, encryptor : IEncryptor) : IEspGenerator
{
    private var mGcBytes2 : Array<ByteArray>? = null
    private var mDcBytes2 : Array<ByteArray>? = null

    init {
        val gc = GuideCode()
        val gcU81 = gc.getU8s()

        mGcBytes2 = Array(gcU81.size) { byteArrayOf() }

        mGcBytes2?.let { mGcBytes2 ->
            for (i in 0 until mGcBytes2.size)
                mGcBytes2[i] = ByteUtil.genSpecBytes(gcU81[i]);
        }

        // generate data code
        DatumCode dc = new DatumCode(apSsid, apBssid, apPassword, inetAddress, encryptor);
        char[] dcU81 = dc.getU8s();
        mDcBytes2 = new byte[dcU81.length][];

        for (int i = 0; i < mDcBytes2.length; i++) {
            mDcBytes2[i] = ByteUtil.genSpecBytes(dcU81[i]);
        }
    }

    override fun getGCBytes2() : Array<ByteArray> {
        TODO("Not yet implemented")
    }

    override fun getDCBytes2() : Array<ByteArray> {
        TODO("Not yet implemented")
    }
}