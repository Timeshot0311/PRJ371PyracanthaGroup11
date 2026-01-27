package com.vusieam.invascan.domain

import android.content.Context
import com.auth0.android.jwt.JWT

object InvascanSessionManager {
    private const val PREFS_NAME = "my_app_prefs"
    private const val KEY_ACCESS_TOKEN = "auth_token"

    fun saveAuthToken(context: Context, token: String) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putString(KEY_ACCESS_TOKEN, token).apply()
    }

    fun fetchAuthToken(context: Context): String? {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getString(KEY_ACCESS_TOKEN, null)
    }


    fun clearAuthToken(context: Context) {
        val sharedPref = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        sharedPref.edit().remove("user_token").apply()
    }


    fun getUserIdFromToken(context: Context): String? {
        val token = fetchAuthToken(context)
        if(token?.isNullOrEmpty() == true){
            return ""
        }
        val jwt = JWT(token)
        return jwt.getClaim("sub").asString() ?: jwt.getClaim("sub").asString()
    }

    fun getUserIdFromJWTToken(context: Context): String? {
        val token = fetchAuthToken(context)
        if(token?.isNullOrEmpty() == true){
            return ""
        }
        val jwt = JWT(token)
        // Claim used by your backend
        val claimName = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        val userId = jwt.getClaim(claimName).asString()
        return jwt.getClaim("sub").asString() ?: jwt.getClaim("sub").asString()
    }

}