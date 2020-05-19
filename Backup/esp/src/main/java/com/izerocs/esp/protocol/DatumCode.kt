package com.izerocs.esp.protocol

import com.izerocs.esp.task.ICodeData
import java.util.*

/**
 * Created by IzeroCs on 2020-05-19
 */
class DatumCode : ICodeData {
    companion object {
        const val EXTRA_LEN = 40
        const val EXTRA_HEAD_LEN = 5
    }

    private val mDataCodes : LinkedList<DataCode>
    override fun getBytes() : ByteArray {
        TODO("Not yet implemented")
    }

    override fun getU8s() : CharArray {
        TODO("Not yet implemented")
    }
}