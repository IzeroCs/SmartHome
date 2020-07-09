package com.izerocs.smarthome.model

import com.google.gson.annotations.SerializedName

data class ValidateErrorModel(
    @SerializedName("field") val field : String,
    @SerializedName("chains") val chains : MutableList<ValiadteChain>
) {
    enum class ValiadteChain {
        isRequired, isNotEmpty,
        isNumber, isString,
        isEmail, isURL,
        isMin, isMax, isLength,

        hasNotChanged,
        deviceNotExists,
        deviceNotOnline
    }
}