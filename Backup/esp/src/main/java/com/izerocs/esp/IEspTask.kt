package com.izerocs.esp

/**
 * Created by IzeroCs on 2020-05-19
 */
interface IEspTask {
    companion object {
        const val ESP_VERSION = "v1.0"
    }

    fun setEspListener(listener : IEspListener)
    fun interrupt()

    @Throws(RuntimeException::class)
    fun executeForResult()

    @Throws(RuntimeException::class)
    fun executeForResult(expectTaskResultCount : Int) : List<IEspResult>

    fun isCancelled() : Boolean
    fun setPackageBroardcast(broardcast : Boolean)
}