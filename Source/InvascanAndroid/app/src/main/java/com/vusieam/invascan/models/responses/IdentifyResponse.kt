package com.vusieam.invascan.models.responses

data class IdentifyResponse (
    val status: Boolean,
    val statusCode: Int,
    val message: String,
    val img: String?,
    val labelname: String,
    val score: Float
)