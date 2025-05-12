package com.vusieam.invascan.services

import com.vusieam.invascan.models.requests.IdentifyRequest
import com.vusieam.invascan.models.responses.IdentifyResponse
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.POST

interface ApiService {

    @POST("/identifyasync")
    fun identifyAsync(@Body request: IdentifyRequest): Call<IdentifyResponse>

}