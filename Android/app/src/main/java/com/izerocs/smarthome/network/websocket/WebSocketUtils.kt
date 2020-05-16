package com.izerocs.smarthome.network.websocket

/**
 * Created by IzeroCs on 2020-05-16
 */
class WebSocketUtils {
    companion object {
        fun to2ByteArray(value : Int) : ByteArray {
            return byteArrayOf(value.ushr(8).toByte(), value.toByte())
        }

        fun to8ByteArray(value : Int) : ByteArray {
            return byteArrayOf(0, 0, 0, 0,
                value.ushr(24).toByte(), value.ushr(16).toByte(),
                value.ushr(8).toByte(), value.toByte())
        }

        fun fromByteArray(bytes : ByteArray) : Int {
            return bytes[0].toInt().shl(24)
                .or(bytes[1].toInt().and(0xff).shl(16))
                .or(bytes[2].toInt().and(0xff).shl(8))
                .or(bytes[3].toInt().and(0xff))
        }
    }
}