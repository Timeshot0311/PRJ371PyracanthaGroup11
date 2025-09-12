package com.vusieam.invascan.ui.splash

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.app.ActivityOptions
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.vusieam.invascan.R
import com.vusieam.invascan.databinding.ActivitySplashBinding
import com.vusieam.invascan.ui.login.LoginActivity
import com.vusieam.invascan.utils.GenericHelpers
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class SplashActivity : AppCompatActivity() {

    //#region -- protected properties --
    private lateinit var binding: ActivitySplashBinding
    private val splashTimeout: Long = 3500
    //#endregion

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        binding = ActivitySplashBinding.inflate(layoutInflater)
        setContentView(binding.root)
        //enableEdgeToEdge()
        //ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
        //    val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
        //    v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
        //    insets
        //}
        initializeUI()
    }


    private fun initializeUI() {
        try {
            Handler(Looper.getMainLooper()).postDelayed({
                val intent = Intent(this, LoginActivity::class.java)
                val options = ActivityOptions.makeCustomAnimation(
                    this,
                    R.anim.slide_in_right,
                    R.anim.slide_in_left
                )
                startActivity(intent, options.toBundle())
                //overridePendingTransition(R.anim.slide_out_right, android.R.anim.slide_in_left)
                finish()
            }, splashTimeout.toLong())

        }
        catch (ex:Exception){
            Log.d(GenericHelpers.logID(), "Splash Screen:- ${if (ex.message.isNullOrEmpty()) "unknown error" else ex.message}")
        }
    }


}