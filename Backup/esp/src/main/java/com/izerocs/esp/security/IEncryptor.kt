package com.izerocs.esp.security

/**
 * Created by IzeroCs on 2020-05-19
 */
interface IEncryptor {
    fun encrypt(src : ByteArray) : ByteArray
}