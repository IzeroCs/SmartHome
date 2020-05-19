package com.izerocs.esp.task

/**
 * Created by IzeroCs on 2020-05-19
 */
class EspTaskParameter() : IEspTaskParameter {
    private var mIntervalGuideCodeMillisecond : Long = 0
    private var mIntervalDataCodeMillisecond : Long = 0
    private var mTimeoutGuideCodeMillisecond : Long = 0
    private var mTimeoutDataCodeMillisecond : Long = 0
    private var mTotalRepeatTime : Int = 0
    private var mEspResultOneLen : Int = 0
    private var mEspResultMacLen : Int = 0
    private var mEspResultIpLen : Int = 0
    private var mEspResultTotalLen : Int = 0
    private var mPortListening : Int = 0
    private var mTargetPort : Int = 0
    private var mWaitUdpReceivingMilliseond : Int = 0
    private var mWaitUdpSendingMillisecond : Int = 0
    private var mThresholdSucBroadcastCount : Int = 0
    private var mExpectTaskResultCount : Int = 0
    private var mBroadcast : Boolean = true

    companion object {
        private var datagramCount : Int = 0;

        fun getNextDatagramCount() : Int {
            return 1 + (datagramCount++) % 100
        }
    }

    init {
        mIntervalGuideCodeMillisecond = 8
        mIntervalDataCodeMillisecond = 8
        mTimeoutGuideCodeMillisecond = 2000
        mTimeoutDataCodeMillisecond = 4000
        mTotalRepeatTime = 1
        mEspResultOneLen = 1
        mEspResultMacLen = 6
        mEspResultIpLen = 4
        mEspResultTotalLen = 1 + 6 + 4
        mPortListening = 18266
        mTargetPort = 7001
        mWaitUdpReceivingMilliseond = 15000
        mWaitUdpSendingMillisecond = 45000
        mThresholdSucBroadcastCount = 1
        mExpectTaskResultCount = 1
    }

    override fun getIntervalGuideCodeMillisecond() : Long {
        return mIntervalGuideCodeMillisecond
    }

    override fun getIntervalDataCodeMillisecond() : Long {
        return mIntervalDataCodeMillisecond
    }

    override fun getTimeoutGuideCodeMillisecond() : Long {
        return mTimeoutGuideCodeMillisecond
    }

    override fun getTimeoutDataCodeMillisecond() : Long {
        return mTimeoutDataCodeMillisecond
    }

    override fun getTimeoutTotalCodeMillisecond() : Long {
        return mTimeoutGuideCodeMillisecond + mTimeoutDataCodeMillisecond
    }

    override fun getTotalRepeatTime() : Int {
        return mTotalRepeatTime
    }

    override fun getEspResultOneLen() : Int {
        return mEspResultOneLen
    }

    override fun getEspResultMacLen() : Int {
        return mEspResultMacLen
    }

    override fun getEspResultIpLen() : Int {
        return mEspResultIpLen
    }

    override fun getEspResultTotalLen() : Int {
        return mEspResultTotalLen
    }

    override fun getPortListening() : Int {
        return mPortListening
    }

    override fun getTargetHostname() : String {
        return if (mBroadcast) {
            "255.255.255.255"
        } else {
            val count : Int = getNextDatagramCount()
            "234." + count + "." + count + "." + count
        }
    }

    override fun getTargetPort() : Int {
        return mTargetPort
    }

    override fun getWaitUdpReceivingMillisecond() : Int {
        return mWaitUdpReceivingMilliseond
    }

    override fun getWaitUdpSendingMillisecond() : Int {
        return mWaitUdpSendingMillisecond
    }

    override fun getWaitUdpTotalMillisecond() : Int {
        return mWaitUdpReceivingMilliseond + mWaitUdpSendingMillisecond
    }

    override fun setWaitUdpTotalMillisecond(waitUdpTotalMillisecond : Int) {
        if (waitUdpTotalMillisecond < mWaitUdpReceivingMilliseond
                + getTimeoutTotalCodeMillisecond()) {
            // if it happen, even one turn about sending udp broadcast can't be
            // completed
            throw IllegalArgumentException("waitUdpTotalMillisecod is invalid, "
                            + "it is less than mWaitUdpReceivingMilliseond + getTimeoutTotalCodeMillisecond()");
        }

        mWaitUdpSendingMillisecond = waitUdpTotalMillisecond - mWaitUdpReceivingMilliseond
    }

    override fun getThresholdSucBroadcastCount() : Int {
        return mThresholdSucBroadcastCount
    }

    override fun getExpectTaskResultCount() : Int {
        return this.mExpectTaskResultCount
    }

    override fun setExpectTaskResultCount(expectTaskResultCount : Int) {
        this.mExpectTaskResultCount = expectTaskResultCount
    }

    override fun setBroadcast(broadcast : Boolean) {
        mBroadcast = broadcast
    }
}