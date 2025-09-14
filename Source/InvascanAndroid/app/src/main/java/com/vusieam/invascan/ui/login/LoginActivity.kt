package com.vusieam.invascan.ui.login

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
import com.vusieam.invascan.databinding.ActivityLoginBinding
import com.vusieam.invascan.domain.InvascanSessionManager
import com.vusieam.invascan.domain.Versioning
import com.vusieam.invascan.domain.models.responses.login.LoginResponse
import com.vusieam.invascan.domain.services.RetrofitServiceBase
import com.vusieam.invascan.ui.account.CreateAccountActivity
import com.vusieam.invascan.ui.dashboard.DashboardActivity
import com.vusieam.invascan.domain.utils.GenericHelpers
import com.vusieam.invascan.domain.utils.InternetAccess
import dagger.hilt.android.AndroidEntryPoint
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import javax.inject.Inject

@AndroidEntryPoint
class LoginActivity : AppCompatActivity(), View.OnClickListener {

    //#region -- protected properties --

    @Inject
    internal lateinit var versioning: Versioning

    private lateinit var binding: ActivityLoginBinding
    //#endregion

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)
        initializeUI()

        //ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
        //    val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
        //    v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
        //    insets
        //}

    }


    //#region -- private functions --

    private fun initializeUI(){

        binding.contentLogin.btnLogin.setOnClickListener(this)
        binding.contentLogin.loginSignup.setOnClickListener(this)
        binding.contentLogin.loginUsername.setText("vusieam")
        binding.contentLogin.loginPassword.setText("vusieam")


        binding.contentLogin.txtVersion.text = versioning.toString()
        Log.d(GenericHelpers.logID(), "version: ${versioning.toString()}")

    }

    override fun onClick(view: View?) {
        when(view?.id){
            R.id.btnLogin ->{

                if(!InternetAccess.checkForInternet(this)){
                    val dialog = SweetAlertDialog(this, SweetAlertDialog.WARNING_TYPE)
                    dialog.confirmText = "Ok"
                    dialog.titleText = "NO INTERNET ACCESS"
                    dialog.contentText = "Please ensure device is connected to WIFI or Mobile Network and has internet access"
                    dialog.setConfirmClickListener {
                        dialog.dismissWithAnimation()
                    }
                    dialog.setCancelable(false)
                    dialog.show()
                    return
                }

                userLoginAsync()

            }

            R.id.login_signup ->{
                val intent = Intent(this, CreateAccountActivity::class.java)
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

    private fun userLoginAsync() {
        try{
            if(binding.contentLogin.loginUsername.text?.toString()?.trim()?.isEmpty()!! || binding.contentLogin.loginPassword.text?.toString()?.trim()?.isEmpty()!!){
                val dialog = SweetAlertDialog(this, SweetAlertDialog.ERROR_TYPE)
                dialog.titleText = GenericHelpers.titleID()
                dialog.contentText = "Username and password is required."
                dialog.show()
                return
            }
            val loader = SweetAlertDialog(this, SweetAlertDialog.PROGRESS_TYPE)
            loader.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
            loader.contentText = "Initiating login please wait....."
            loader.titleText = GenericHelpers.titleID()
            loader.setCancelable(false)
            loader.show()

            val username = binding.contentLogin.loginUsername.text.toString().trim()
            val password = binding.contentLogin.loginPassword.text.toString().trim()

            val call = RetrofitServiceBase.apiService.loginAsync(username, password)
            call.enqueue(object : Callback<LoginResponse>{
                override fun onResponse(
                    call: Call<LoginResponse>,
                    response: Response<LoginResponse>
                ) {
                    if(!response.isSuccessful){
                        runOnUiThread {
                            if (loader.isShowing)
                                loader.dismiss()

                            val dialog = SweetAlertDialog(this@LoginActivity, SweetAlertDialog.ERROR_TYPE)
                            dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                            dialog.titleText = GenericHelpers.titleID()
                            dialog.contentText = "Internal api error: ${response.message()}."
                            dialog.show()
                        }
                        return
                    }
                    val responseBody = response.body()
                    if(responseBody?.accessToken.isNullOrEmpty()){
                        runOnUiThread {
                            if (loader.isShowing)
                                loader.dismiss()

                            val dialog = SweetAlertDialog(this@LoginActivity, SweetAlertDialog.ERROR_TYPE)
                            dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                            dialog.titleText = GenericHelpers.titleID()
                            dialog.contentText = "Login failed, backend could not generate access token."
                            dialog.show()
                        }
                        return
                    }

                    if (loader.isShowing)
                        loader.dismiss()

                    responseBody?.let {body->
                        InvascanSessionManager.saveAuthToken(this@LoginActivity, body.accessToken)
                        Log.d(GenericHelpers.logID(), "===============================================")
                        Log.d(GenericHelpers.logID(), "Login Successful")
                        Log.d(GenericHelpers.logID(), "Token\t\t:\t ${body.accessToken}")
                        Log.d(GenericHelpers.logID(), "Type\t\t:\t ${body.tokenType}")
                        Log.d(GenericHelpers.logID(), "===============================================")
                    }

                    // Go to main activity
                    startActivity(Intent(this@LoginActivity, DashboardActivity::class.java))
                    finish()

                }

                override fun onFailure(call: Call<LoginResponse>, t: Throwable) {
                    runOnUiThread {
                        if (loader.isShowing)
                            loader.dismiss()

                        val dialog = SweetAlertDialog(this@LoginActivity, SweetAlertDialog.ERROR_TYPE)
                        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                        dialog.titleText = GenericHelpers.titleID()
                        dialog.contentText = "onFailure: ${t.message}"
                        dialog.show()
                    }
                    Log.d(GenericHelpers.logID(), "Error: ${t.message}")
                }
            })
        }
        catch (ex:Exception){
            runOnUiThread {
                val dialog = SweetAlertDialog(this@LoginActivity, SweetAlertDialog.ERROR_TYPE)
                dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                dialog.titleText = GenericHelpers.titleID()
                dialog.contentText = ex.message
                dialog.show()
            }
            Log.d(GenericHelpers.logID(), "Error: ${ex.message}")
        }
    }

    //#ednregion

}