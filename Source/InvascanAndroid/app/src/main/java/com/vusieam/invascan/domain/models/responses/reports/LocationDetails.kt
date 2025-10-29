package com.vusieam.invascan.domain.models.responses.reports

import com.google.gson.annotations.SerializedName
import java.io.Serializable
import java.util.Date

class LocationDetails(
    @SerializedName("id") val id:String,
    @SerializedName("province") val province:String,
    @SerializedName("place") val place:String,
    @SerializedName("latitude") val latitude:Double,
    @SerializedName("longitude") val longitude:Double,
    @SerializedName("created_at") val createdAt:Date,
): Serializable