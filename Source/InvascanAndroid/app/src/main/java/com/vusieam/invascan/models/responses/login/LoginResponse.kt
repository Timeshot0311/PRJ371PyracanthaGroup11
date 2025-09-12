package com.vusieam.invascan.models.responses.login

import com.google.gson.annotations.SerializedName
import java.io.Serializable

data class LoginResponse (
    @SerializedName("access_token") val  accessToken : String,
    @SerializedName("token_type") val tokenType : String
): Serializable