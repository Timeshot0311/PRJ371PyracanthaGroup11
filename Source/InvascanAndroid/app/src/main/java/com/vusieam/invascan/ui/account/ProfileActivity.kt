package com.vusieam.invascan.ui.account

import android.app.ActivityOptions
import android.app.AlertDialog
import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import cn.pedant.SweetAlert.SweetAlertDialog
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.gson.Gson
import com.vusieam.invascan.R
import com.vusieam.invascan.databinding.ActivityProfileBinding
import com.vusieam.invascan.databinding.DialogChangePasswordBinding
import com.vusieam.invascan.domain.InvascanSessionManager
import com.vusieam.invascan.domain.models.generic.OccupationModel
import com.vusieam.invascan.domain.models.responses.generic.GenericResponse
import com.vusieam.invascan.domain.services.RetrofitAuthenticatedService
import com.vusieam.invascan.domain.services.RetrofitServiceBase
import com.vusieam.invascan.domain.utils.GenericHelpers
import com.vusieam.invascan.domain.utils.InternetAccess
import com.vusieam.invascan.ui.dashboard.DashboardActivity
import com.vusieam.invascan.ui.login.LoginActivity
import kotlinx.coroutines.launch
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ProfileActivity : AppCompatActivity(), View.OnClickListener, AdapterView.OnItemSelectedListener {

    //#region -- protected properties --
    private lateinit var binding: ActivityProfileBinding
    private var occupations =  arrayListOf<OccupationModel>()
    private var experiences:List<String> =  arrayListOf<String>("Beginner", "Intermediate", "Advanced", "Expert")
    private var occupation: OccupationModel? =  null
    private var experience: String = ""
    //#endregion

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        binding = ActivityProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)
        initializeUI()
    }


    //#region -- implemented methods --


    override fun onClick(view: View?) {
        when(view?.id){
            R.id.btn_submit ->{
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
                updateAccountAsync()
            }


            R.id.action_back ->{
                val intent = Intent(this, DashboardActivity::class.java)
                val options = ActivityOptions.makeCustomAnimation(
                    this,
                    R.anim.slide_in_right,
                    R.anim.slide_in_left
                )
                startActivity(intent, options.toBundle())
                finish()
            }

            R.id.change_password_option_holder ,
            R.id.change_password_icon ->{
                showChangePasswordDialog()
            }
        }
    }


    override fun onItemSelected(p0: AdapterView<*>?, p1: View?, p2: Int, p3: Long) {
        TODO("Not yet implemented")
    }

    override fun onNothingSelected(p0: AdapterView<*>?) {
        TODO("Not yet implemented")
    }

    //#endregion



    //#region -- private functions --

    private fun initializeUI(){
        binding.actionBack.setOnClickListener(this)
        binding.contentMain.changePasswordOptionHolder.setOnClickListener(this)
        binding.contentMain.changePasswordIcon.setOnClickListener(this)
        occupations.add(OccupationModel("0183C0ED-AA36-48D8-829B-893B9D2ABE86","FARMER"))
        occupations.add(OccupationModel("6A5FBA39-E25E-47DF-944F-C776F3D9B8A9","SME"))
        experiences.sorted()
        val occupationAdapter = ArrayAdapter(this, R.layout.dropdown_item, occupations)
        val experienceAdapter = ArrayAdapter(this, R.layout.dropdown_item, experiences)


    }


    private fun showChangePasswordDialog(){
        val dialogViewBinding = DialogChangePasswordBinding.inflate(LayoutInflater.from(this))
        val titleView = LayoutInflater.from(this).inflate(R.layout.dialog_title_custom, null)

        val changePasswordDialog = MaterialAlertDialogBuilder(this, R.style.MyDialogTheme)
            .setCustomTitle(titleView)
            .setView(dialogViewBinding.root)
            .setPositiveButton("Submit", null)
            .setNegativeButton("Cancel", null)
            .create()

//        val changePasswordDialog = AlertDialog.Builder(this)
//            .setCustomTitle(titleView)
//            .setView(dialogViewBinding.root)
//            .setPositiveButton("Submit", null)
//            .setNegativeButton("Cancel", null)
//            .create()
        changePasswordDialog.setOnShowListener{
            changePasswordDialog.window?.setBackgroundDrawableResource(R.drawable.bg_dialog_rounded)
            changePasswordDialog.window?.decorView?.setPadding(0, 0, 0, 0) // ✅ removes default dialog padding

            dialogViewBinding.changePasswordNotification.text = ""
            val positiveButton = changePasswordDialog.getButton(AlertDialog.BUTTON_POSITIVE)
            val negativeButton = changePasswordDialog.getButton(AlertDialog.BUTTON_NEGATIVE)

            positiveButton.setOnClickListener {
                val currentPassword = dialogViewBinding.currentPassword.text.toString().trim()
                val newPassword = dialogViewBinding.newPassword.text.toString().trim()
                val confirmPassword = dialogViewBinding.confirmPassword.text.toString().trim()

                when{
                    currentPassword.isEmpty() || newPassword.isEmpty() || confirmPassword.isEmpty() -> {
                        Toast.makeText(this, "All fields are required", Toast.LENGTH_SHORT).show()
                        dialogViewBinding.changePasswordNotification.text = "All fields are required"
                    }
                    newPassword != confirmPassword -> {
                        Toast.makeText(this, "Passwords do not match", Toast.LENGTH_SHORT).show()
                        dialogViewBinding.changePasswordNotification.text = "Passwords do not match"
                    }

                    else ->{
                        dialogViewBinding.currentPassword.setText("")
                        lifecycleScope.launch {
                            val service = RetrofitAuthenticatedService(this@ProfileActivity)
                            val call = service.apiService.changePasswordAsync(newPassword)
                            call.enqueue(object : Callback<GenericResponse<String>> {
                                override fun onResponse(
                                    call: Call<GenericResponse<String>>,
                                    response: Response<GenericResponse<String>>
                                ) {

                                    runOnUiThread {
                                        if (changePasswordDialog.isShowing)
                                            changePasswordDialog.dismiss()
                                    }

                                    if(!response.isSuccessful){
                                        runOnUiThread {
                                            val dialog = SweetAlertDialog(this@ProfileActivity, SweetAlertDialog.ERROR_TYPE)
                                            dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                                            dialog.titleText = GenericHelpers.titleID()
                                            dialog.contentText = "Internal api error: ${response.message()}."
                                            dialog.show()
                                        }
                                        Log.d(GenericHelpers.logID(), "==================================================================")
                                        Log.d(GenericHelpers.logID(), "changePasswordAsync Internal api error: ${response.message()}")
                                        Log.d(GenericHelpers.logID(), "changePasswordAsync Internal api error body: ${response.errorBody()}")
                                        Log.d(GenericHelpers.logID(), "==================================================================")
                                        return
                                    }

                                    val responseBody = response.body()
                                    Log.d(GenericHelpers.logID(), "==================================================================")
                                    Log.d(GenericHelpers.logID(), "changePasswordAsync Api Response: ${Gson().toJson(responseBody)}")
                                    Log.d(GenericHelpers.logID(), "==================================================================")
                                    if(!responseBody!!.status){
                                        runOnUiThread {
                                            val dialog = SweetAlertDialog(this@ProfileActivity, SweetAlertDialog.ERROR_TYPE)
                                            dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                                            dialog.titleText = GenericHelpers.titleID()
                                            dialog.contentText = "${responseBody.statusMessage}."
                                            dialog.show()
                                        }
                                    }
                                    else{
                                        runOnUiThread {
                                            val dialog = SweetAlertDialog(this@ProfileActivity, SweetAlertDialog.SUCCESS_TYPE)
                                            dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                                            dialog.titleText = GenericHelpers.titleID()
                                            dialog.contentText = "${responseBody.statusMessage}."
                                            dialog.setConfirmClickListener {
                                                dialog.dismissWithAnimation()
                                                InvascanSessionManager.clearAuthToken(this@ProfileActivity)
                                                val intent = Intent(this@ProfileActivity, LoginActivity::class.java)
                                                val options = ActivityOptions.makeCustomAnimation(
                                                    this@ProfileActivity,
                                                    R.anim.slide_in_right,
                                                    R.anim.slide_in_left
                                                )
                                                startActivity(intent, options.toBundle())
                                                finish()
                                            }
                                            dialog.setCancelable(false)
                                            dialog.show()
                                        }
                                    }

                                }
                                override fun onFailure(call: Call<GenericResponse<String>>, t: Throwable) {
                                    runOnUiThread {
                                        if (changePasswordDialog.isShowing)
                                            changePasswordDialog.dismiss()

                                        val dialog = SweetAlertDialog(this@ProfileActivity, SweetAlertDialog.ERROR_TYPE)
                                        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                                        dialog.titleText = GenericHelpers.titleID()
                                        dialog.contentText = "onFailure: ${t.message}"
                                        dialog.show()
                                    }
                                    Log.d(GenericHelpers.logID(), "==================================================================")
                                    Log.d(GenericHelpers.logID(), "changePasswordAsync onFailure: ${t.message}")
                                    Log.d(GenericHelpers.logID(), "==================================================================")
                                }
                            })
                        }
                    }
                }
            }
        }
        changePasswordDialog.show()
    }


    private fun updateAccountAsync() {
        TODO("Not yet implemented")
    }


    //#endregion

}