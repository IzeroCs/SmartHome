package com.izerocs.smarthome.model

import com.google.gson.annotations.SerializedName

data class ErrorModel(
    @SerializedName("error") val error : Type,
    @SerializedName("nsp") val nsp : ValidateErrorModel.ValiadteChain,
    @SerializedName("validates") val validates : MutableList<ValidateErrorModel>
) : BaseErrorModel()