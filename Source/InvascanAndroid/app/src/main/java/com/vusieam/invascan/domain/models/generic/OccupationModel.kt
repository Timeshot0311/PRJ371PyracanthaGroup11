package com.vusieam.invascan.domain.models.generic

data class OccupationModel (
    val id:String,
    val description:String,
){
    override fun toString(): String {
        return description
    }
}