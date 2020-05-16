package com.izerocs.smarthome.network.websocket

/**
 * Created by IzeroCs on 2020-05-16
 */
interface WebSocketEvent {
    fun onOpen(client : WebSocketClient) {}
    fun onTextReceived(client : WebSocketClient, message : String) {}
    fun onBinaryReceived(client : WebSocketClient, byteArray : ByteArray) {}
    fun onPingReceived(client : WebSocketClient, byteArray : ByteArray) {}
    fun onPongReceived(client : WebSocketClient, byteArray : ByteArray) {}
    fun onException(client : WebSocketClient, e : Exception) {}
    fun onCloseReceived(client : WebSocketClient) {}
}