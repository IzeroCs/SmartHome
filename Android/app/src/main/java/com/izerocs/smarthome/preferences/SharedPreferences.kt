package com.izerocs.smarthome.preferences

import android.annotation.SuppressLint
import android.content.Context
import com.google.gson.Gson

/**
 * Created by IzeroCs on 2020-04-07
 */
open class SharedPreferences(context : Context, sharedName : String) {
    private val prefix : String = "_preferences"
    private val gson   : Gson   = Gson()

    private val sharedPreferences = context.getSharedPreferences(sharedName + prefix, Context.MODE_PRIVATE)

    fun getString(key : String) : String?  = sharedPreferences.getString(key, "")
    fun getBoolean(key : String) : Boolean = sharedPreferences.getBoolean(key, false)
    fun getFloat(key : String) : Float     = sharedPreferences.getFloat(key, 0F)
    fun getInt(key : String) : Int         = sharedPreferences.getInt(key, 0)
    fun getLong(key : String) : Long       = sharedPreferences.getLong(key, 0L)

    fun <T : Any> getObject(key : String, anonymousClass : Class<T>) : T = gson.fromJson(sharedPreferences.getString(key, ""), anonymousClass)

    fun getString(key : String, defVal : String) : String?   = sharedPreferences.getString(key, defVal)
    fun getBoolean(key : String, defVal : Boolean) : Boolean = sharedPreferences.getBoolean(key, defVal)
    fun getFloat(key : String, defVal : Float) : Float       = sharedPreferences.getFloat(key, defVal)
    fun getInt(key : String, defVal : Int) : Int             = sharedPreferences.getInt(key, defVal)
    fun getLong(key : String, defVal : Long) : Long          = sharedPreferences.getLong(key, defVal)


    @Suppress("UNCHECKED_CAST")
    fun <T : Any> get(key : String, anonymousClass : Class<T> ) : T? {
        when (anonymousClass) {
            String::class.java  -> return sharedPreferences.getString(key, "")     as T
            Boolean::class.java -> return sharedPreferences.getBoolean(key, false) as T
            Float::class.java   -> return sharedPreferences.getFloat(key, 0F)      as T
            Int::class.java     -> return sharedPreferences.getInt(key, 0)         as T
            Long::class.java    -> return sharedPreferences.getLong(key, 0L)       as T
        }

        return gson.fromJson(sharedPreferences.getString(key, ""), anonymousClass)
    }

    @SuppressLint("CommitPrefEdits")
    fun <T : Any> put(key : String, data : T) {
        val editor = sharedPreferences.edit()

        when (data) {
            is String  -> editor.putString(key,  data)
            is Boolean -> editor.putBoolean(key, data)
            is Float   -> editor.putFloat(key,   data)
            is Int     -> editor.putInt(key,     data)
            is Long    -> editor.putLong(key,    data)
            else       -> editor.putString(key, gson.toJson(data))
        }

        editor.apply()
    }

    fun getAll() : MutableMap<String, *>? = sharedPreferences.all
    fun clear()  : Unit = sharedPreferences.edit().clear().apply()
    fun size()   : Int  = sharedPreferences.all.size
    fun empty()  : Boolean = size() <= 0

}