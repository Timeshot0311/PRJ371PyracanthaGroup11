package com.vusieam.invascan.services

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitServiceBase{
    val retrofit = Retrofit.Builder()
        .baseUrl("http://192.168.1.63:8007") // must end with /
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    val apiService = retrofit.create(ApiService::class.java)
}