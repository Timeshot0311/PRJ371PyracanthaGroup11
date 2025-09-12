package com.vusieam.invascan.services

import com.vusieam.invascan.models.requests.InvestigateRequest
import com.vusieam.invascan.models.requests.account.CreateAccountRequest
import com.vusieam.invascan.models.responses.generic.GenericResponse
import com.vusieam.invascan.models.responses.investigate.DetectionModel
import com.vusieam.invascan.models.responses.login.LoginResponse
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.Field
import retrofit2.http.FormUrlEncoded
import retrofit2.http.POST

interface ApiService {

    @FormUrlEncoded
    @POST("token")
    fun loginAsync(
        @Field("username") username: String,
        @Field("password") password: String
    ): Call<LoginResponse>


    @POST("users/")
    fun createAccountAsync(@Body request: CreateAccountRequest): Call<GenericResponse<CreateAccountRequest>>



    @POST("engine/investigate")
    fun identifyAsync(@Body request: InvestigateRequest): Call<GenericResponse<DetectionModel>>

}