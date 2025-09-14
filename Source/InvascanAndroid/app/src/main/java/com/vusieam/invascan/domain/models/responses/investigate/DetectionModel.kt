package com.vusieam.invascan.domain.models.responses.investigate

import com.google.gson.annotations.SerializedName
import java.io.Serializable

data class DetectionModel (
    @SerializedName("speciesName") val  speciesName : String? = null,
    @SerializedName("confidenceScore") val confidenceScore : Float? = null,
    @SerializedName("imageData") val imageData : String? = null,
    @SerializedName("imageUrl") val imageUrl : String? = null,
): Serializable