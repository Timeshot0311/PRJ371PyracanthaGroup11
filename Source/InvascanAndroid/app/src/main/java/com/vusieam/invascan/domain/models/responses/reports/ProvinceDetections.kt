package com.vusieam.invascan.domain.models.responses.reports

import com.google.gson.annotations.SerializedName
import java.io.Serializable

class ProvinceDetections (
    @SerializedName("province") val province:String,
    @SerializedName("totals") val totals:Int
): Serializable