package com.izerocs.esp.task

/**
 * Created by IzeroCs on 2020-05-19
 */
interface IEspGenerator {
    fun getGCBytes2() : Array<ByteArray>
    fun getDCBytes2() : Array<ByteArray>
}