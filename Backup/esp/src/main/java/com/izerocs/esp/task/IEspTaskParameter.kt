package com.izerocs.esp.task

/**
 * Created by IzeroCs on 2020-05-19
 */
interface IEspTaskParameter {
    fun getIntervalGuideCodeMillisecond() : Long
    fun getIntervalDataCodeMillisecond() : Long
    fun getTimeoutGuideCodeMillisecond() : Long
    fun getTimeoutDataCodeMillisecond() : Long
    fun getTimeoutTotalCodeMillisecond() : Long
    fun getTotalRepeatTime() : Int
    fun getEspResultOneLen() : Int
    fun getEspResultMacLen() : Int
    fun getEspResultIpLen() : Int
    fun getEspResultTotalLen() : Int
    fun getPortListening() : Int
    fun getTargetHostname() : String
    fun getTargetPort() : Int
    fun getWaitUdpReceivingMillisecond() : Int
    fun getWaitUdpSendingMillisecond() : Int
    fun getWaitUdpTotalMillisecond() : Int
    fun setWaitUdpTotalMillisecond(waitUdpTotalMillisecond : Int)
    fun getThresholdSucBroadcastCount() : Int
    fun getExpectTaskResultCount() : Int
    fun setExpectTaskResultCount(expectTaskResultCount : Int)
    fun setBroadcast(broadcast : Boolean)
}