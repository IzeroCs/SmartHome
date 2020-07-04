package com.izerocs.smarthome.network

class Util {
    companion object {
        const val SIGNAL_MIN = 0
        const val SIGNAL_MAX = 5
        const val RSSI_MIN   = -100
        const val RSSI_MAX   = -55

        fun calculateSignalLevel(rssi : Int, numLevels : Int = SIGNAL_MAX) : Int {
            return when {
                rssi <= RSSI_MIN -> SIGNAL_MIN
                rssi >= RSSI_MAX -> numLevels - 1

                else -> {
                    val inputRange : Float = (RSSI_MAX - RSSI_MIN).toFloat()
                    val outputRange : Float = (numLevels - 1).toFloat()

                    ((rssi - RSSI_MIN).toFloat() * outputRange / inputRange).toInt()
                }
            }
        }
    }
}