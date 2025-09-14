package com.vusieam.invascan.domain.models.requests.login

import com.google.gson.annotations.SerializedName
import java.io.Serializable


data class LoginRequest  (
    @SerializedName("username") val username : String,
    @SerializedName("password") val password : String
): Serializable