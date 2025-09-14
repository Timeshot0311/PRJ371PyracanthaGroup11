import java.io.FileInputStream
import java.util.Properties

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.devtools.ksp)
    alias(libs.plugins.hilt)
}




android {
    namespace = "com.vusieam.invascan"
    compileSdk = 35

    var majorVersionCode:Int = 1
    var versionNameCode:String = "1.0.0"
    val versionPropsFile = rootProject.file("version.properties")
    if (versionPropsFile.exists() && versionPropsFile.canRead()) {
        val versionProps = Properties()
        versionProps.load(FileInputStream(versionPropsFile))

        majorVersionCode = versionProps["MAJOR_CODE"].toString().toInt()
        var minorVersionCode = versionProps["MINOR_CODE"].toString().toInt()
        val buildVersionCode = versionProps["BUILD_CODE"].toString().toInt() + 1
        versionNameCode = versionProps["VERSION_NAME"].toString()

        val runTasks = gradle.startParameter.getTaskNames()
        if (runTasks.any { it.contains("assembleRelease") }) {
            minorVersionCode += 1
        }

        val isReleaseBuild = gradle.startParameter.taskNames.any { it.contains("assembleRelease") }
        if (isReleaseBuild) minorVersionCode += 1
        if (minorVersionCode >= 10) {
            minorVersionCode = 0
            majorVersionCode += 1
        }

        versionNameCode = "$majorVersionCode.$minorVersionCode.$buildVersionCode"
        versionProps["MAJOR_CODE"] = majorVersionCode.toString()
        versionProps["MINOR_CODE"] = minorVersionCode.toString()
        versionProps["BUILD_CODE"] = buildVersionCode.toString()
        versionProps["VERSION_NAME"] = versionNameCode.toString()
        versionProps.store(versionPropsFile.writer(), null)
    }


    defaultConfig {
        applicationId = "com.vusieam.invascan"
        minSdk = 24
        //noinspection OldTargetApi
        targetSdk = 34
        versionCode = majorVersionCode
        versionName = versionNameCode

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    lint {
        disable.add("Deprecation")
        // or to ignore multiple:
        // disable.addAll(listOf("Deprecation", "ObsoleteLintCustomCheck"))
    }
    buildFeatures {
        viewBinding = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.material)
    implementation(libs.androidx.activity)
    implementation(libs.androidx.constraintlayout)
    implementation(libs.ucrop)
    implementation(libs.retrofit)
    implementation(libs.gson.converter)
    implementation(libs.glide)
    implementation(libs.androidx.annotation)
    implementation(libs.androidx.lifecycle.livedata.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.ktx)
    implementation(libs.google.services.kts)
    implementation(libs.heat.map.kts)
    implementation(libs.hilt.android)
    implementation(libs.sweet.alerts.dialog)
    implementation(libs.smart.material.spinner)
    implementation(libs.jwt)
    implementation(libs.mp.android.chart)
    ksp(libs.hilt.compiler)
    ksp(libs.glide.compiler)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
}