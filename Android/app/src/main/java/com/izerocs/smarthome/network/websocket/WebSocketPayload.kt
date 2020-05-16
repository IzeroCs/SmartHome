package com.izerocs.smarthome.network.websocket

/**
 * Created by IzeroCs on 2020-05-16
 */
class WebSocketPayload(private val opcode : Int, private val data : ByteArray) {
    fun getOpcode() : Int {
        return opcode
    }

    fun getData() : ByteArray {
        return data
    }
}