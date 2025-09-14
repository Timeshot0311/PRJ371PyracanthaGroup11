package com.vusieam.invascan.domain.services

import com.vusieam.invascan.domain.models.requests.InvestigateRequest
import com.vusieam.invascan.domain.models.requests.account.CreateAccountRequest
import com.vusieam.invascan.domain.models.responses.generic.GenericResponse
import com.vusieam.invascan.domain.models.responses.investigate.DetectionModel
import com.vusieam.invascan.domain.models.responses.login.LoginResponse
import com.vusieam.invascan.domain.models.responses.reports.ProvinceDetections
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.Field
import retrofit2.http.FormUrlEncoded
import retrofit2.http.GET
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


    @GET("reports/all_province")
    fun getAllProvinceAsync(): Call<GenericResponse<List<ProvinceDetections>>>

}