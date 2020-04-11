package com.izerocs.smarthome.utils

import android.content.Context
import android.graphics.Typeface

/**
 * Created by IzeroCs on 2020-03-24
 */
class FontCache {
    companion object {
        private val cacheFonts: HashMap<String, Typeface> = HashMap<String, Typeface>()

        fun getTypeface(context : Context, assetPath : String) : Typeface? {
            if (!cacheFonts.containsKey(assetPath)) {
                val tf : Typeface = Typeface.createFromAsset(context.assets, "font/${assetPath}")
                cacheFonts[assetPath] = tf
            }

            return cacheFonts[assetPath]
        }

        fun getTypeface(context : Context, textStyle : Int) : Typeface? {
            when (textStyle) {
                Typeface.BOLD -> return getTypeface(context, "ubuntu_bold.ttf")
                Typeface.ITALIC -> return getTypeface(context, "ubuntu_italic.ttf")
                Typeface.BOLD_ITALIC -> return getTypeface(context, "ubuntu_bolditalic.ttf")
            }

            return getTypeface(context, "ubuntu_regular.ttf")
        }

        fun getTypeface(context: Context) : Typeface? {
            return getTypeface(context, Typeface.NORMAL)
        }
    }
}