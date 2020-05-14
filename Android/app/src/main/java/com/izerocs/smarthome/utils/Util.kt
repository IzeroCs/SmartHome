package com.izerocs.smarthome.utils

import android.content.Context
import android.content.res.Resources
import android.view.View
import android.view.inputmethod.InputMethodManager
import java.util.*
import kotlin.math.min

/**
 * Created by IzeroCs on 2020-04-03
 */
class Util {

    companion object {
        fun getStatusBarHeight(resources: Resources): Int {
            val resourceId: Int = resources.getIdentifier("status_bar_height", "dimen", "android")

            if (resourceId > 0)
                return resources.getDimensionPixelSize(resourceId)

            return 0
        }

        fun measureDimension(desiredSize: Int, measureSpec: Int): Int {
            var result   : Int
            val specMode : Int = View.MeasureSpec.getMode(measureSpec)
            val specSize : Int = View.MeasureSpec.getSize(measureSpec)

            if (specMode == View.MeasureSpec.EXACTLY) {
                result = specSize
            } else {
                result = desiredSize

                if (specMode == View.MeasureSpec.AT_MOST)
                    result = min(result, specSize)
            }

            return result
        }

        fun hideSoftInput(view : View?) {
            (view?.context?.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager)
                .hideSoftInputFromWindow(view.windowToken, 0)
        }

        fun formatIPAddress(ip : Int?) : String {
            if (ip == null)
                return "0.0.0.0"

            return String.format(Locale.US, "%d.%d.%d.%d",
                ip.and(0xff),
                ip.shr(8).and(0xff),
                ip.shr(16).and(0xff),
                ip.shr(24).and(0xff))
        }
    }

}