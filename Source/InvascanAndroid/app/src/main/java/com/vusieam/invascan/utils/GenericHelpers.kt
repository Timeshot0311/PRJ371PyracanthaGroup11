package com.vusieam.invascan.utils

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

}