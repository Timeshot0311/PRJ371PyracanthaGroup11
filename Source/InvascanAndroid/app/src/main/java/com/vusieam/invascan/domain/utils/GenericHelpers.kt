package com.vusieam.invascan.domain.utils

import java.text.SimpleDateFormat
import java.util.Locale

object GenericHelpers {

    fun genericDateFormat(): SimpleDateFormat {
        return SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
    }

    fun logID():String{
        return "INVASCAN_V1"
    }

    fun titleID():String{
        return "INVASCAN MOBILE"
    }


    fun getProvinceAbbr(province:String):String{
        return when(province) {
            "Eastern Cape" -> "EC"
            "Free State" -> "FS"
            "Gauteng" -> "GP"
            "KwaZulu-Natal", "KwaZulu Natal" -> "KZN"
            "Limpopo" -> "L"
            "Mpumalanga" -> "MP"
            "Western Cape" -> "WC"
            "North-West", "North West" -> "NW"
            "Northern-Cape", "Northern Cape" -> "NW"
            else -> "UA"
        }
    }
}