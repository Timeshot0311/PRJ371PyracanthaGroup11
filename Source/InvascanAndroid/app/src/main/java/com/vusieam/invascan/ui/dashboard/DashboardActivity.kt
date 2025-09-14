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
import com.vusieam.invascan.domain.Versioning
import com.vusieam.invascan.ui.login.LoginActivity
import com.vusieam.invascan.ui.analyze.AnalyzePlantActivity
import com.vusieam.invascan.domain.utils.GenericHelpers
import com.vusieam.invascan.ui.analytics.AnalyticsActivity
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class DashboardActivity : AppCompatActivity(), View.OnClickListener  {

    //#region -- protected properties --

    @Inject
    internal lateinit var versioning: Versioning
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
            binding.contentDashboard.cardAnalyzePlant.setOnClickListener(this)
            binding.contentDashboard.cardAnalytics.setOnClickListener(this)
            binding.contentDashboard.cardCommunity.setOnClickListener(this)
            binding.contentDashboard.cardAccount.setOnClickListener(this)

            binding.contentDashboard.txtVersion.text = versioning.toString()
            Log.d(GenericHelpers.logID(), "version: ${versioning.toString()}")
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

            R.id.card_analyze_plant ->{
                val intent = Intent(this, AnalyzePlantActivity::class.java)
                val options = ActivityOptions.makeCustomAnimation(
                    this,
                    R.anim.slide_in_right,
                    R.anim.slide_in_left
                )
                startActivity(intent, options.toBundle())
                finish()
            }

            R.id.card_analytics ->{
                //val dialog = SweetAlertDialog(this, SweetAlertDialog.WARNING_TYPE)
                //dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                //dialog.confirmText = "DISMISS"
                //dialog.titleText = GenericHelpers.titleID()
                //dialog.contentText = "Function is not available yet."
                //dialog.setConfirmClickListener {
                //    dialog.dismissWithAnimation()
                //}
                //dialog.setCancelable(false)
                //dialog.show()
                val intent = Intent(this, AnalyticsActivity::class.java)
                val options = ActivityOptions.makeCustomAnimation(
                    this,
                    R.anim.slide_in_right,
                    R.anim.slide_in_left
                )
                startActivity(intent, options.toBundle())
                finish()
            }
            R.id.card_community ->{
                val dialog = SweetAlertDialog(this, SweetAlertDialog.WARNING_TYPE)
                dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                dialog.confirmText = "DISMISS"
                dialog.titleText = GenericHelpers.titleID()
                dialog.contentText = "Function is not available yet."
                dialog.setConfirmClickListener {
                    dialog.dismissWithAnimation()
                }
                dialog.setCancelable(false)
                dialog.show()
                //val intent = Intent(this, AnalyzePlantActivity::class.java)
                //val options = ActivityOptions.makeCustomAnimation(
                //    this,
                //    R.anim.slide_in_right,
                //    R.anim.slide_in_left
                //)
                //startActivity(intent, options.toBundle())
                //finish()
            }
            R.id.card_account ->{
                val dialog = SweetAlertDialog(this, SweetAlertDialog.WARNING_TYPE)
                dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                dialog.confirmText = "DISMISS"
                dialog.titleText = GenericHelpers.titleID()
                dialog.contentText = "Function is not available yet."
                dialog.setConfirmClickListener {
                    dialog.dismissWithAnimation()
                }
                dialog.setCancelable(false)
                dialog.show()
                //val intent = Intent(this, AnalyzePlantActivity::class.java)
                //val options = ActivityOptions.makeCustomAnimation(
                //    this,
                //    R.anim.slide_in_right,
                //    R.anim.slide_in_left
                //)
                //startActivity(intent, options.toBundle())
                //finish()
            }

        }
    }

}