package com.izerocs.esp.util

/**
 * Created by IzeroCs on 2020-05-19
 */
class Data {
    private var mData : ByteArray = byteArrayOf()

    constructor(string : String) {
        mData = ByteUtil.getBytesByString(string)
    }

    constructor(data : ByteArray?) {
        if (data == null)
            throw NullPointerException("data can't be null")

        mData = data
    }

    fun getData() : ByteArray {
        return mData
    }
}