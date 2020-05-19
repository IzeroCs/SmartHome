package com.izerocs.esp.util

import java.io.UnsupportedEncodingException
import java.nio.charset.Charset
import kotlin.experimental.and
import kotlin.random.Random

/**
 * Created by IzeroCs on 2020-05-19
 */
class ByteUtil {
    companion object {
        const val ESP_ENCODING_CHARSET = "UTF-8"

        fun putString2Bytes(destBytes : ByteArray, srcString : String, destOffset : Int,
                            srcOffset : Int, count : Int) {
            for (i in 0 until count)
                destBytes[count.plus(i)] = srcString.toByteArray()[i]
        }

        fun convertUint8toByte(uint8 : Char) : Byte {
            if (uint8 > (Byte.MAX_VALUE - Byte.MIN_VALUE).toChar())
                throw RuntimeException("Out of Boundary")

            return uint8.toByte()
        }

        fun convertByte2Uint8(b : Byte) : Char {
            return (b.and(0xff.toByte())).toChar()
        }

        fun convertBytes2Uint8s(bytes : ByteArray) : CharArray {
            val len = bytes.size
            val uint8s = CharArray(len)

            for (i in 0 until len)
                uint8s[i] = convertByte2Uint8(bytes[i])

            return uint8s
        }

        fun putbytes2Uint8s(desUint8s : CharArray, srcBytes : ByteArray,
                            destOffset : Int, srcOffset : Int, count : Int) {
            for (i in 0 until count)
                desUint8s[destOffset + i] = convertByte2Uint8(srcBytes[srcOffset + i])
        }

        fun convertByte2HexString(b : Byte) : String {
            return convertByte2Uint8(b).toInt().toString(16)
        }

        fun convertU8ToHexString(u8 : Char) : String {
            return u8.toInt().toString(16)
        }

        fun splitUint8To2bytes(uint8 : Char) : ByteArray {
            if (uint8 < 0.toChar() || uint8 > 0xff.toChar())
                throw java.lang.RuntimeException("Out of Boundary")

            val hexString = uint8.toInt().toString(16)
            var lowByte  : Byte = 0
            var highByte : Byte = 0

            if (hexString.length > 1) {
                highByte = hexString.substring(0, 1).toInt(16).toByte()
                lowByte  = hexString.substring(1, 2).toInt(16).toByte()
            } else {
                lowByte = hexString.substring(0, 1).toInt(16).toByte()
            }

            return byteArrayOf(highByte, lowByte)
        }

        fun combine2bytesToOne(high : Byte, low : Byte) : Byte {
            if (high < 0 || high > 0xf || low < 0 || low > 0xf)
                throw RuntimeException("Out of Boundary")

            return high.toInt().shl(4)
                .or(low.toInt())
                .toByte()
        }

        fun combine2bytesToU16(high : Byte, low : Byte) : Char {
            val hightU8 = convertByte2Uint8(high).toInt()
            val lowU8 = convertByte2Uint8(low).toInt()

            return hightU8.shl(8)
                .or(lowU8)
                .toChar()
        }

        fun randomByte() : Byte {
            return (127 - Random.nextInt(256)).toByte()
        }

        fun randomBytes(len : Char) : ByteArray {
            val data = ByteArray(len.toInt())

            for (i in 0 until len.toInt())
                data[i] = randomByte()

            return data
        }

        fun genSpecBytes(len : Char) : ByteArray {
            val data = ByteArray(len.toInt())

            for (i in 0 until len.toInt())
                data[i] = '1'.toByte()

            return data
        }

        fun randomBytes(len : Byte) : ByteArray {
            return randomBytes(convertByte2Uint8(len))
        }

        fun genSpecBytes(len : Byte) : ByteArray {
            return genSpecBytes(convertByte2Uint8(len))
        }

        fun parseBssid(bssidBytes : ByteArray, offset : Int, count : Int) : String {
            val bytes = ByteArray(count)
            System.arraycopy(bssidBytes, offset, bytes, 0, count)

            return parseBssid(bytes)
        }

        fun parseBssid(bssidBytes : ByteArray) : String {
            val sb      = StringBuilder()
            var hexK    = String()
            var str     = String()
            var k : Int = 0

            for (bssidByte : Byte in bssidBytes) {
                k    = 0xff.and(bssidByte.toInt())
                hexK = k.toString(16)
                str  = hexK

                if (k < 16)
                    str = "0" + hexK

                System.out.println(str)
                sb.append(str)
            }

            return sb.toString()
        }

        fun getBytesByString(string : String) : ByteArray {
            try {
                return string.toByteArray(Charset.forName(ESP_ENCODING_CHARSET))
            } catch (e : UnsupportedEncodingException) {
                throw IllegalArgumentException("the charset is invalid")
            }
        }
    }
}