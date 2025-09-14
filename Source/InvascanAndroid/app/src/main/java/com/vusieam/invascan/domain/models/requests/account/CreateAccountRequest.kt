package com.vusieam.invascan.domain.models.requests.account

import com.google.gson.annotations.SerializedName
import java.io.Serializable

data class CreateAccountRequest(
    @SerializedName("Firstname") val name : String,
    @SerializedName("Lastname") val surname : String,
    @SerializedName("Username") val username : String,
    @SerializedName("EmailAddress") val emailAddress : String,
    @SerializedName("PhoneNumber") val phoneNumber : String,
    @SerializedName("Location") val location : String,
    @SerializedName("ExperienceLevel") val experienceLevel : String,
    @SerializedName("PrivacySetting") val privacySetting : String = "public",
    @SerializedName("ImageSharingConsent") val imageSharingConsent : Boolean,
    @SerializedName("RoleId") val roleId : String,
    @SerializedName("password") val password : String,
) : Serializable