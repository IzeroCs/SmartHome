package com.izerocs.smarthome.utils

import android.view.View
import android.view.ViewGroup
import android.view.animation.Animation
import android.view.animation.Transformation

/**
 * Created by IzeroCs on 2020-04-14
 */
class AnimationUtil {
    companion object {
        fun expand(view : View?) {
            if (view == null)
                return

            view.measure(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
            val targetHeight = view.measuredHeight

            view.layoutParams.height = 0
            view.visibility = View.VISIBLE

            (object : Animation() {
                override fun applyTransformation(interpolatedTime : Float, t : Transformation?) {
                    if (interpolatedTime == 1F)
                        view.layoutParams.height = ViewGroup.LayoutParams.WRAP_CONTENT
                    else
                        view.layoutParams.height = (targetHeight * interpolatedTime).toInt()

                    view.requestLayout()
                }

                override fun willChangeBounds() : Boolean {
                    return true
                }
            }).run {
                duration = (targetHeight / view.context.resources.displayMetrics.density).toLong()
                view.startAnimation(this)
            }
        }

        fun collapse(view : View?) {
            if (view == null)
                return

            val initalHeight = view.measuredHeight

            (object : Animation() {
                override fun applyTransformation(interpolatedTime : Float, t : Transformation?) {
                    if (interpolatedTime == 1F) {
                        view.visibility = View.GONE
                    } else {
                        view.layoutParams.height = initalHeight - (initalHeight * interpolatedTime).toInt()
                        view.requestLayout()
                    }
                }

                override fun willChangeBounds() : Boolean {
                    return true
                }
            }).run {
                duration = (initalHeight / view.context.resources.displayMetrics.density).toLong()
                view.startAnimation(this)
            }
        }
    }
}