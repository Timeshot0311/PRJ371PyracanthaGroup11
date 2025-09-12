package com.vusieam.invascan.models.responses.generic

import android.content.Intent
import com.google.gson.annotations.SerializedName
import java.io.Serializable

class GenericResponse<T>: Serializable {
    @SerializedName("status") var  status : Boolean = false
    @SerializedName("statusCode") var  statusCode : Int = -1
    @SerializedName("statusMessage") lateinit var  statusMessage : String
    @SerializedName("dynamicModel") var  dynamicModel : T? = null
}