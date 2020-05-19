package com.izerocs.esp.task

import android.content.Context
import android.os.Looper
import android.util.Log
import com.izerocs.esp.EspResult
import com.izerocs.esp.IEspListener
import com.izerocs.esp.IEspResult
import com.izerocs.esp.security.IEncryptor
import com.izerocs.esp.util.ByteUtil
import com.izerocs.esp.util.Data
import com.izerocs.esp.util.NetUtil
import java.net.InetAddress
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Created by IzeroCs on 2020-05-19
 */
class EspTask(context : Context, apSsid : Data, apBssid : Data, apPassword : Data,
              encryptor : IEncryptor, parameter : IEspTaskParameter) : IEspTask {
    companion object {
        const val ONE_DATA_LEN = 3
        const val TAG = "task.EspTask"
    }

    private val mSocketClient : UDPSocketClient = UDPSocketClient()
    private val mSocketServer : UDPSocketServer = UDPSocketServer()
    private val mApSsid : ByteArray = apSsid.getData()
    private val mApPassword : ByteArray = apPassword.getData()
    private val mApBssid : ByteArray = apBssid.getData()
    private val mEncryptor : IEncryptor = encryptor
    private val mContext : Context = context
    private val mEspResultList : MutableList<IEspResult> = ArrayList()
    private var mIsSuc : Boolean = false
    private var mIsInterrupt : Boolean = false
    private var mIsExecuted : Boolean = false
    private val mIsCancelled : AtomicBoolean = AtomicBoolean(false)
    private val mParameter : IEspTaskParameter = parameter
    private val mBssidTaskSucCountMap : MutableMap<String, Int> = HashMap()
    private var mEspListener : IEspListener? = null
    private var mTask : Thread? = null

    init {
        Log.i(TAG, "Welcome Esptouch " + com.izerocs.esp.IEspTask.ESP_VERSION);
    }

    private fun putEspResult(isSuc : Boolean, bssid : String, inetAddress : InetAddress?) {
        synchronized (mEspResultList) {
            // check whether the result receive enough UDP response
            val isTaskSucCountEnough : Boolean
            var count : Int? = mBssidTaskSucCountMap.get(bssid)

            if (count == null)
                count = 0

            ++count

            if (IEspTask.DEBUG)
                Log.d(TAG, "putEspResult(): count = $count")

            mBssidTaskSucCountMap.put(bssid, count)
            isTaskSucCountEnough = count >= mParameter.getThresholdSucBroadcastCount()

            if (!isTaskSucCountEnough) {
                if (IEspTask.DEBUG)
                    Log.d(TAG, "putEspResult(): count = $count, isn't enough")

                return
            }

            // check whether the result is in the mEspResultList already
            var isExist : Boolean = false

            for (espResultInList : IEspResult in mEspResultList) {
                if (espResultInList.getBssid() == bssid) {
                    isExist = true
                    break
                }
            }

            // only add the result who isn't in the mEspResultList
            if (!isExist) {
                if (IEspTask.DEBUG)
                    Log.d(TAG, "putEsptouchResult(): put one more result " +
                            "bssid = " + bssid + " , address = " + inetAddress)

                val esptouchResult : IEspResult = EspResult(isSuc, bssid, inetAddress)

                mEspResultList.add(esptouchResult)
                mEspListener?.onEspResultAdded(esptouchResult)
            }
        }
    }

    private fun getEspResultList() : MutableList<IEspResult> {
        synchronized (mEspResultList) {
            if (mEspResultList.isEmpty()) {
                val esptouchResultFail = EspResult(false, null, null)

                esptouchResultFail.setIsCancelled(mIsCancelled.get())
                mEspResultList.add(esptouchResultFail)
            }

            return mEspResultList
        }
    }

    @Synchronized
    private fun notifyInterrupt() {
        if (!mIsInterrupt) {
            mIsInterrupt = true
            mSocketClient.interrupt()
            mSocketServer.interrupt()

            // interrupt the current Thread which is used to wait for udp response
            if (mTask != null) {
                mTask?.interrupt()
                mTask = null
            }
        }
    }

    private fun listenAsyn(expectDataLen : Int) {
        mTask = Thread {
            if (IEspTask.DEBUG)
                Log.d(TAG, "__listenAsyn() start")

            val startTimestamp : Long = System.currentTimeMillis();
            val expectOneByte : Byte = (mApSsid.size + mApPassword.size + 9).toByte()

            if (IEspTask.DEBUG)
                Log.i(TAG, "expectOneByte: " + expectOneByte)

            var receiveOneByte : Byte = -1
            var receiveBytes : ByteArray?

            while (mEspResultList.size < mParameter.getExpectTaskResultCount() && !mIsInterrupt) {
                receiveBytes = mSocketServer.receiveSpecLenBytes(expectDataLen)
                receiveOneByte = -1

                if (receiveOneByte == expectOneByte) {
                    if (IEspTask.DEBUG)
                        Log.i(TAG, "receive correct broadcast")

                    // change the socket's timeout
                    val consume : Long = System.currentTimeMillis() - startTimestamp
                    val timeout : Int = (mParameter.getWaitUdpTotalMillisecond() - consume).toInt()

                    if (timeout < 0) {
                        if (IEspTask.DEBUG)
                            Log.i(TAG, "esptouch timeout")

                        break
                    } else {
                        if (IEspTask.DEBUG)
                            Log.i(TAG, "mSocketServer's new timeout is $timeout milliseconds")

                        mSocketServer.setSoTimeout(timeout)

                        if (IEspTask.DEBUG)
                            Log.i(TAG, "receive correct broadcast")

                        val bssid : String = ByteUtil.parseBssid(receiveBytes,
                            mParameter.getEspResultOneLen(),
                            mParameter.getEspResultMacLen())

                        val inetAddress = NetUtil.parseInetAddr(receiveBytes,
                            mParameter.getEspResultOneLen() + mParameter.getEspResultMacLen(),
                            mParameter.getEspResultIpLen())

                            putEspResult(true, bssid, inetAddress)
                        }
                    }
            }

            mIsSuc = mEspResultList.size >= mParameter.getExpectTaskResultCount()
            notifyInterrupt()

            if (IEspTask.DEBUG)
                Log.d(TAG, "listenAsyn() finish")
        }

        mTask?.start()
    }

    private fun execute(generator : IEspGenerator) : Boolean {
        val startTime = System.currentTimeMillis()
        var currentTime = startTime
        var lastTime = currentTime - mParameter.getTimeoutTotalCodeMillisecond()

        val gcBytes2 = generator.getGCBytes2()
        val dcBytes2 = generator.getDCBytes2()

        var index : Int = 0

        while (!mIsInterrupt) {
            if (currentTime - lastTime >= mParameter.getTimeoutTotalCodeMillisecond()) {
                if (IEspTask.DEBUG)
                    Log.d(TAG, "Send gc code ");

                // send guide code
                while (!mIsInterrupt && System.currentTimeMillis() - currentTime < mParameter
                        .getTimeoutGuideCodeMillisecond())
                {
                    mSocketClient.sendData(gcBytes2,
                            mParameter.getTargetHostname(),
                            mParameter.getTargetPort(),
                            mParameter.getIntervalGuideCodeMillisecond())

                    // check whether the udp is send enough time
                    if (System.currentTimeMillis() - startTime > mParameter.getWaitUdpSendingMillisecond())
                        break
                }

                lastTime = currentTime
            } else {
                mSocketClient.sendData(dcBytes2, index, ONE_DATA_LEN,
                        mParameter.getTargetHostname(),
                        mParameter.getTargetPort(),
                        mParameter.getIntervalDataCodeMillisecond())

                index = (index + ONE_DATA_LEN) % dcBytes2.size
            }

            currentTime = System.currentTimeMillis()

            // check whether the udp is send enough time
            if (currentTime - startTime > mParameter.getWaitUdpSendingMillisecond())
                break
        }

        return mIsSuc
    }

    private fun checkTaskValid() {
        if (this.mIsExecuted)
            throw IllegalStateException("the Esptouch task could be executed only once");

        this.mIsExecuted = true
    }

    override fun setEspListener(listener : IEspListener) {
        mEspListener = listener
    }

    override fun interrupt() {
        if (IEspTask.DEBUG)
            Log.d(TAG, "interrupt()")

        mIsCancelled.set(true)
        notifyInterrupt()
    }

    override fun isCancelled() : Boolean {
        return this.mIsCancelled.get()
    }

    override fun executeForResult() : IEspResult {
        return executeForResults(1).get(0)
    }

    override fun executeForResults(expectTaskResultCount : Int) : List<IEspResult> {
    throws RuntimeException {
            checkTaskValid()
            mParameter.setExpectTaskResultCount(expectTaskResultCount);

            if (IEspTask.DEBUG)
            Log.d(TAG, "execute()");

            if (Looper.myLooper() == Looper.getMainLooper())
                throw RuntimeException("Don't call the esp Task at Main(UI) thread directly.")

            val localInetAddress = NetUtil.getLocalInetAddress(mContext)

            if (IEspTask.DEBUG)
                Log.i(TAG, "localInetAddress: $localInetAddress")

        // generator the esptouch byte[][] to be transformed, which will cost
        // some time(maybe a bit much)
            val generator = EspGenerator(mApSsid, mApBssid, mApPassword, localInetAddress, mEncryptor)

        // listen the esptouch result asyn
        __listenAsyn(mParameter.getEsptouchResultTotalLen());
        boolean isSuc = false;
        for (int i = 0; i < mParameter.getTotalRepeatTime(); i++) {
            isSuc = __execute(generator);
            if (isSuc) {
                return __getEsptouchResultList();
            }
        }

        if (!mIsInterrupt) {
            // wait the udp response without sending udp broadcast
            try {
                Thread.sleep(mParameter.getWaitUdpReceivingMillisecond());
            } catch (InterruptedException e) {
                // receive the udp broadcast or the user interrupt the task
                if (this.mIsSuc) {
                    return __getEsptouchResultList();
                } else {
                    this.__interrupt();
                    return __getEsptouchResultList();
                }
            }
            this.__interrupt();
        }

        return __getEsptouchResultList();
    }
}