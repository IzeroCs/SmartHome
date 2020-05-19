package com.izerocs.esp.util

import android.content.Context
import android.net.wifi.WifiManager
import java.net.InetAddress
import java.net.UnknownHostException
import kotlin.experimental.and

/**
 * Created by IzeroCs on 2020-05-19
 */
class NetUtil {
    companion object {
        fun getLocalInetAddress(context : Context) : InetAddress? {
            val wm = context.applicationContext.getSystemService(Context.WIFI_SERVICE)
                as WifiManager

            val wifiInfo = wm.connectionInfo
            val localAddrInt = wifiInfo.ipAddress
            val localAddrStr = formatString(localAddrInt)
            var localInetAddr : InetAddress? = null

            try {
                localInetAddr = InetAddress.getByName(localAddrStr);
            } catch (e : UnknownHostException) {
                e.printStackTrace()
            }

            return localInetAddr
        }

        fun parseInetAddr(inetAddrBytes : ByteArray, offset : Int, count : Int) : InetAddress? {
            var inetAddress : InetAddress? = null
            val sb : StringBuilder = StringBuilder()

            for (i in 0 until count) {
                sb.append((inetAddrBytes[offset + i].and(0xff.toByte())))

                if (i != count - 1)
                    sb.append('.')
            }

            try {
                inetAddress = InetAddress.getByName(sb.toString())
            } catch (e : UnknownHostException) {
                e.printStackTrace();
            }

            return inetAddress
        }

        fun parseBssid2bytes(bssid : String) : ByteArray {
            val bssidSplits = bssid.split(":")
            val result = ByteArray(bssidSplits.size)

            for (i in 0 until bssidSplits.size)
                result[i] = bssidSplits[i].toInt(16).toByte()

            return result
        }

        private fun formatString(value : Int) : String {
            val strValue = StringBuilder()
            val ary = intToByteArray(value)

            for (i in ary.size downTo 0) {
                strValue.append(ary[i].and(0xFF.toByte()))

                if (i > 0)
                    strValue.append(".");
            }

            return strValue.toString()
        }

        private fun intToByteArray(value : Int) : ByteArray {
            val b = ByteArray(4)

            for (i in 0 until 4) {
                val offset : Int = (b.size - 1 - i) * 8
                b[i] = value.ushr(offset).and(0xFF).toByte()
            }

            return b
        }
    }
}