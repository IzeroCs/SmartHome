package com.izerocs.esp.util

import java.util.zip.Checksum

/**
 * Created by IzeroCs on 2020-05-19
 */
class CR8 : Checksum {
    companion object {
        const val CRC_POLYNOM = 0x8c
        const val CRC_INITIAL = 0x00

        private val crcTable : ShortArray = ShortArray(256)

        init {

        }
    }

    init {

    }

    override fun update(b : Int) {
        TODO("Not yet implemented")
    }

    override fun update(b : ByteArray?, off : Int, len : Int) {
        TODO("Not yet implemented")
    }

    override fun getValue() : Long {
        TODO("Not yet implemented")
    }

    override fun reset() {
        TODO("Not yet implemented")
    }
}