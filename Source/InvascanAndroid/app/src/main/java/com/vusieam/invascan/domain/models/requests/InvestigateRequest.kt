package com.vusieam.invascan.domain.models.requests

import com.google.gson.annotations.SerializedName
import java.io.Serializable

data class InvestigateRequest (
    @SerializedName("user_id") val userid: String,
    @SerializedName("image_data") val imageData: String,
    @SerializedName("latitude") val latitude: Float,
    @SerializedName("longitude") val longitude: Float,
    @SerializedName("address") val address: String? = null
): Serializable