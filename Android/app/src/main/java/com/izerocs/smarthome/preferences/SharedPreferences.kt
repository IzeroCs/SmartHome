package com.izerocs.smarthome.preferences

import android.annotation.SuppressLint
import android.content.Context
import android.content.SharedPreferences
import com.google.gson.Gson

/**
 * Created by IzeroCs on 2020-04-07
 */
open class SharedPreferences {
    private var context : Context? = null
    private var sharedName : String = ""
    private val prefix : String = "_preferences"
    private val gson   : Gson   = Gson()

    private var preferences : SharedPreferences? = null

    constructor() {}

    constructor(context : Context, sharedName : String) {
        this.context = context
        this.sharedName = sharedName
        this.preferences = context.getSharedPreferences(sharedName + prefix,
            Context.MODE_PRIVATE)
    }

    fun getString(key : String) : String?  = preferences?.getString(key, "")
    fun getBoolean(key : String) : Boolean = preferences?.getBoolean(key, false)!!
    fun getFloat(key : String) : Float     = preferences?.getFloat(key, 0F)!!
    fun getInt(key : String) : Int         = preferences?.getInt(key, 0)!!
    fun getLong(key : String) : Long       = preferences?.getLong(key, 0L)!!

    fun <T : Any> getObject(key : String, anonymousClass : Class<T>) : T = gson
        .fromJson(preferences?.getString(key, ""), anonymousClass)

    fun getString(key : String, defVal : String) : String?   = preferences?.getString(key, defVal)
    fun getBoolean(key : String, defVal : Boolean) : Boolean = preferences?.getBoolean(key, defVal)!!
    fun getFloat(key : String, defVal : Float) : Float       = preferences?.getFloat(key, defVal)!!
    fun getInt(key : String, defVal : Int) : Int             = preferences?.getInt(key, defVal)!!
    fun getLong(key : String, defVal : Long) : Long          = preferences?.getLong(key, defVal)!!


    @Suppress("UNCHECKED_CAST")
    fun <T : Any> get(key : String, anonymousClass : Class<T> ) : T? {
        when (anonymousClass) {
            String::class.java  -> return preferences?.getString(key, "")     as T
            Boolean::class.java -> return preferences?.getBoolean(key, false) as T
            Float::class.java   -> return preferences?.getFloat(key, 0F)      as T
            Int::class.java     -> return preferences?.getInt(key, 0)         as T
            Long::class.java    -> return preferences?.getLong(key, 0L)       as T
        }

        return gson.fromJson(preferences?.getString(key, ""), anonymousClass)
    }

    @SuppressLint("CommitPrefEdits")
    fun <T : Any> put(key : String, data : T) {
        val editor = preferences?.edit()

        when (data) {
            is String  -> editor?.putString(key,  data)
            is Boolean -> editor?.putBoolean(key, data)
            is Float   -> editor?.putFloat(key,   data)
            is Int     -> editor?.putInt(key,     data)
            is Long    -> editor?.putLong(key,    data)
            else       -> editor?.putString(key, gson.toJson(data))
        }

        editor?.apply()
    }

    fun getAll() : MutableMap<String, *>? = preferences?.all
    fun clear()  : Unit = preferences?.edit()?.clear()?.apply()!!
    fun size()   : Int  = preferences?.all?.size!!
    fun empty()  : Boolean = size() <= 0

}