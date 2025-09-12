package com.vusieam.invascan.ui.dashboard

import android.app.ActivityOptions
import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.util.Log
import android.view.View
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import cn.pedant.SweetAlert.SweetAlertDialog
import com.vusieam.invascan.R
import com.vusieam.invascan.databinding.ActivityDashboardBinding
import com.vusieam.invascan.domain.InvascanSessionManager
import com.vusieam.invascan.ui.login.LoginActivity
import com.vusieam.invascan.utils.GenericHelpers
import com.vusieam.invascan.utils.InternetAccess

class DashboardActivity : AppCompatActivity(), View.OnClickListener  {

    //#region -- protected properties --
    private lateinit var binding: ActivityDashboardBinding
    //#endregion


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        binding = ActivityDashboardBinding.inflate(layoutInflater)
        setContentView(binding.root)
        initializeUI()
        //ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
        //    val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
        //    v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
        //    insets
        //}
    }


    private fun initializeUI(){
        val authenticated = InvascanSessionManager.fetchAuthToken(this)
        if(authenticated.isNullOrEmpty()){
            val intent = Intent(this, LoginActivity::class.java)
            val options = ActivityOptions.makeCustomAnimation(
                this,
                R.anim.slide_in_right,
                R.anim.slide_in_left
            )
            startActivity(intent, options.toBundle())
            finish()
        }
        else{
            //binding.contentMain.btnLoadImageContainer.setOnClickListener(this)
            //binding.contentMain.btnCameraImageContainer.setOnClickListener(this)
            //binding.contentMain.btnIdentifyContainer.setOnClickListener(this)
            //binding.actionBack.setOnClickListener(this)
            //imageView = binding.contentMain.inputImage
            //outputImage = binding.contentMain.outputImage
            //detectedName = binding.contentMain.txtLabelName
            //detectedScore = binding.contentMain.txtLabelScore
        }
    }

    override fun onClick(view: View?) {
        when(view?.id){
            R.id.action_back ->{
                InvascanSessionManager.clearAuthToken(this)
                val intent = Intent(this, LoginActivity::class.java)
                val options = ActivityOptions.makeCustomAnimation(
                    this,
                    R.anim.slide_in_right,
                    R.anim.slide_in_left
                )
                startActivity(intent, options.toBundle())
                finish()
            }

        }
    }

}