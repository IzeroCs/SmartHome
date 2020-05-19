package com.izerocs.esp.protocol

import com.izerocs.esp.task.ICodeData
import com.izerocs.esp.util.ByteUtil

/**
 * Created by IzeroCs on 2020-05-19
 */
class GuideCode : ICodeData {
    companion object {
        const val GUIDE_CODE_LEN = 4
    }

    override fun getBytes() : ByteArray {
        throw RuntimeException("DataCode don't support getBytes()")
    }

    override fun getU8s() : CharArray {
        val guidesU8s = CharArray(GUIDE_CODE_LEN)

        guidesU8s[0] = 515.toChar()
        guidesU8s[1] = 514.toChar()
        guidesU8s[2] = 513.toChar()
        guidesU8s[3] = 512.toChar()

        return guidesU8s
    }

    override fun toString() : String {
        val sb : StringBuilder = StringBuilder()
        val dataU8s : CharArray = getU8s()

        for (i in 0 until GUIDE_CODE_LEN) {
            val hexString = ByteUtil.convertU8ToHexString(dataU8s[i])

            sb.append("0x")
            if (hexString.length == 1)
                sb.append("0")

            sb.append(hexString).append(" ")
        }

        return sb.toString()
    }
}