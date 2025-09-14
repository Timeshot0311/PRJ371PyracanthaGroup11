package com.vusieam.invascan.domain.services

import android.content.Context
import com.vusieam.invascan.domain.InvascanSessionManager
import com.vusieam.invascan.ui.InvascanApp
import com.vusieam.invascan.domain.utils.InternetAccess
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitServiceBase{
    val retrofit = Retrofit.Builder()
        .baseUrl(InternetAccess.prodEndpoint()) // must end with /
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    val apiService = retrofit.create(ApiService::class.java)
}


class AuthInterceptor(private val context: Context) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val token = InvascanSessionManager.fetchAuthToken(context)
        val request = if (token != null) {
            chain.request().newBuilder()
                .addHeader("Authorization", "Bearer $token")
                .build()
        } else {
            chain.request()
        }
        return chain.proceed(request)
    }
}



//object RetrofitAuthenticatedService{
//    private val client: OkHttpClient = OkHttpClient.Builder()
//        .addInterceptor(AuthInterceptor(applicationContext()))
//        .build()
//    private val retrofit = Retrofit.Builder()
//        .baseUrl("http://172.16.0.196:8080/api/")
//        .addConverterFactory(GsonConverterFactory.create())
//        .client(client)
//        .build()
//    val apiService = RetrofitAuthenticatedService.retrofit.create(ApiService::class.java)
//}



class RetrofitAuthenticatedService(context: Context) {
    private val client: OkHttpClient = OkHttpClient.Builder()
        .addInterceptor(AuthInterceptor(context))
        .build()
    private val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl(InternetAccess.prodEndpoint())
        .addConverterFactory(GsonConverterFactory.create())
        .client(client)
        .build()
    val apiService: ApiService = retrofit.create(ApiService::class.java)
}