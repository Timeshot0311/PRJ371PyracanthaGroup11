package com.vusieam.invascan.domain.injections

import android.app.Application
import android.content.Context
import android.content.pm.PackageManager
import com.vusieam.invascan.domain.Versioning
import com.vusieam.invascan.ui.InvascanApp
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton


@Module
@InstallIn(SingletonComponent::class)
object AppModules {
    @Singleton
    @Provides
    fun provideApplication(@ApplicationContext app: Context): InvascanApp {
        return app as InvascanApp
    }


    @Provides
    fun providesVersioning(app: Application): Versioning {
        val version =  app.packageManager.getPackageInfo(app.packageName, PackageManager.GET_ACTIVITIES).versionName?.split(".")
        var major = "0"
        var minor = "0"
        var build = "0"

        if(version != null) {
            if (version.isNotEmpty() && version.size > 0) {
                major = version[0]
            }
            if (version.isNotEmpty() && version.size >= 1) {
                minor = version[1]
            }
            if (version.isNotEmpty() && version.size >= 2) {
                build = version[2]
            }
        }
        return Versioning(major, minor, build)
    }

}