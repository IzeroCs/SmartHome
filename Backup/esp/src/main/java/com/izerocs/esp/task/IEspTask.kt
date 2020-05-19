package com.izerocs.esp.task

import com.izerocs.esp.IEspListener
import com.izerocs.esp.IEspResult

/**
 * Created by IzeroCs on 2020-05-19
 */
interface IEspTask {
    companion object {
        const val DEBUG = true
    }

    fun setEspListener(listener : IEspListener)
    fun interrupt()
    fun isCancelled() : Boolean

    @Throws(RuntimeException::class)
    fun executeForResult() : IEspResult

    @Throws(RuntimeException::class)
    fun executeForResults(expectTaskResultCount : Int) : List<IEspResult>
}