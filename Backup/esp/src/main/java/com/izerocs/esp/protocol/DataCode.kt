package com.izerocs.esp.protocol

import com.izerocs.esp.task.ICodeData
import com.izerocs.esp.util.ByteUtil
import com.izerocs.esp.util.CR8

/**
 * Created by IzeroCs on 2020-05-19
 */
class DataCode(u8 : Char, index : Int) : ICodeData {
    companion object {
        const val DATA_CODE_LEN = 6
        const val INDEX_MAX = 127
    }

    private val mSeqHeader : Byte = 0
    private var mDataHigh : Byte = 0
    private var mDataLow : Byte = 0
    // the crc here means the crc of the data and sequence header be transformed
    // it is calculated by index and data to be transformed
    private val mCrcHigh : Byte = 0
    private val mCrcLow : Byte = 0

    init {
        if (index > INDEX_MAX)
            throw RuntimeException("index > INDEX_MAX")

        val dataBytes : ByteArray = ByteUtil.splitUint8To2bytes(u8)
        val cr8 : CR8 = CR8()

        mDataHigh = dataBytes[0]
        mDataLow  = dataBytes[1]
    }

    override fun getBytes() : ByteArray {
        TODO("Not yet implemented")
    }

    override fun getU8s() : CharArray {
        TODO("Not yet implemented")
    }
}