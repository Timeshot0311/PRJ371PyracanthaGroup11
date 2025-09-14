package com.vusieam.invascan.ui.account

import android.app.ActivityOptions
import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.AutoCompleteTextView
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import cn.pedant.SweetAlert.SweetAlertDialog
import com.google.gson.Gson
import com.vusieam.invascan.R
import com.vusieam.invascan.databinding.ActivityCreateAcountBinding
import com.vusieam.invascan.domain.models.generic.OccupationModel
import com.vusieam.invascan.domain.models.requests.account.CreateAccountRequest
import com.vusieam.invascan.domain.models.responses.generic.GenericResponse
import com.vusieam.invascan.domain.services.RetrofitServiceBase
import com.vusieam.invascan.ui.login.LoginActivity
import com.vusieam.invascan.domain.utils.GenericHelpers
import com.vusieam.invascan.domain.utils.InternetAccess
import dagger.hilt.android.AndroidEntryPoint
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response


@AndroidEntryPoint
class CreateAccountActivity : AppCompatActivity(), View.OnClickListener, AdapterView.OnItemSelectedListener {

    //#region -- protected properties --
    private lateinit var binding: ActivityCreateAcountBinding
    private var occupations =  arrayListOf<OccupationModel>()
    private var experiences:List<String> =  arrayListOf<String>("Beginner", "Intermediate", "Advanced", "Expert")
    private var occupation: OccupationModel? =  null
    private var experience: String = ""
    //#endregion


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        binding = ActivityCreateAcountBinding.inflate(layoutInflater)
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

        binding.contentCreateAccount.btnSubmit.setOnClickListener(this)
        binding.actionBack.setOnClickListener(this)
        occupations.add(OccupationModel("0183C0ED-AA36-48D8-829B-893B9D2ABE86","FARMER"))
        occupations.add(OccupationModel("6A5FBA39-E25E-47DF-944F-C776F3D9B8A9","SME"))

        experiences.sorted()

        val occupationAdapter = ArrayAdapter(this, R.layout.dropdown_item, occupations)
        val experienceAdapter = ArrayAdapter(this, R.layout.dropdown_item, experiences)


        (binding.contentCreateAccount.accountOccupation as? AutoCompleteTextView)?.apply {
            setAdapter(occupationAdapter)
            setOnItemClickListener { _, _, position, _ ->
                occupation  = occupationAdapter.getItem(position)
                Log.d(GenericHelpers.logID(), "==================================================================")
                Log.d(GenericHelpers.logID(), "occupationAdapter onItemSelected item: ${Gson().toJson(occupationAdapter.getItem(position))}")
                Log.d(GenericHelpers.logID(), "occupationAdapter onItemSelected occupation: ${Gson().toJson(occupation)}")
                Log.d(GenericHelpers.logID(), "==================================================================")
            }
        }
        (binding.contentCreateAccount.accountExperience as? AutoCompleteTextView)?.apply {
            setAdapter(experienceAdapter)
            setOnItemClickListener { _, _, position, _ ->
                experience = experienceAdapter.getItem(position)!!
                Log.d(GenericHelpers.logID(), "==================================================================")
                Log.d(GenericHelpers.logID(), "experienceAdapter onItemSelected item: ${Gson().toJson(experienceAdapter.getItem(position))}")
                Log.d(GenericHelpers.logID(), "experienceAdapter onItemSelected occupation: ${Gson().toJson(experience)}")
                Log.d(GenericHelpers.logID(), "==================================================================")
            }
        }

        binding.contentCreateAccount.accountName.setText("Carlos")
        binding.contentCreateAccount.accountSurname.setText("Magagula")
        binding.contentCreateAccount.accountUsername.setText("Carlos")
        binding.contentCreateAccount.accountEmail.setText("carlos@gmail.com")
        binding.contentCreateAccount.accountPhone.setText("0000000000")
        binding.contentCreateAccount.accountAddress.setText("142 South Street, Centurion")
        binding.contentCreateAccount.accountImageSharingConsentYes.isChecked = true
        binding.contentCreateAccount.accountNewPassword.setText("123456789")
        binding.contentCreateAccount.accountConfirmPassword.setText("123456789")

    }

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
                createAccountAsync()
            }


            R.id.action_back ->{
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

    override fun onItemSelected(parent: AdapterView<*>?, p1: View?, p2: Int, p3: Long) {
        when(parent?.id){
            R.id.account_occupation ->{
                occupation = parent.selectedItem as OccupationModel

                Log.d(GenericHelpers.logID(), "==================================================================")
                Log.d(GenericHelpers.logID(), "onItemSelected item: ${Gson().toJson(parent.selectedItem)}")
                Log.d(GenericHelpers.logID(), "onItemSelected occupation: ${Gson().toJson(occupation)}")
                Log.d(GenericHelpers.logID(), "==================================================================")
            }

            R.id.account_experience ->{
                experience = parent.selectedItem as String

                Log.d(GenericHelpers.logID(), "==================================================================")
                Log.d(GenericHelpers.logID(), "onItemSelected item: ${Gson().toJson(parent.selectedItem)}")
                Log.d(GenericHelpers.logID(), "onItemSelected experience: ${Gson().toJson(experience)}")
                Log.d(GenericHelpers.logID(), "==================================================================")
            }
        }
    }

    override fun onNothingSelected(p0: AdapterView<*>?) {

    }

    private fun createAccountAsync() {
        try{
            val validationResults = validateInput()
            if(!validationResults)
                return

            val loader = SweetAlertDialog(this, SweetAlertDialog.PROGRESS_TYPE)
            loader.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
            loader.contentText = "Creating account please wait....."
            loader.titleText = GenericHelpers.titleID()
            loader.setCancelable(false)
            loader.show()

            val accountDetails = CreateAccountRequest(
                name = binding.contentCreateAccount.accountName.text?.toString()?.trim()!!,
                surname = binding.contentCreateAccount.accountSurname.text?.toString()?.trim()!!,
                username = binding.contentCreateAccount.accountUsername.text?.toString()?.trim()!!,
                emailAddress = binding.contentCreateAccount.accountEmail.text?.toString()?.trim()!!,
                phoneNumber = binding.contentCreateAccount.accountPhone.text?.toString()?.trim()!!,
                location = binding.contentCreateAccount.accountAddress.text?.toString()?.trim()!!,
                experienceLevel = experience,
                privacySetting = "public",
                imageSharingConsent = binding.contentCreateAccount.accountImageSharingConsentYes.isChecked,
                roleId = occupation?.id!!,
                password = binding.contentCreateAccount.accountNewPassword.text?.toString()?.trim()!!
            )

            Log.d(GenericHelpers.logID(), "==================================================================")
            Log.d(GenericHelpers.logID(), "createAccountAsync Request: ${Gson().toJson(accountDetails)}")
            Log.d(GenericHelpers.logID(), "==================================================================")

            val call = RetrofitServiceBase.apiService.createAccountAsync(accountDetails)
            call.enqueue(object : Callback<GenericResponse<CreateAccountRequest>> {
                override fun onResponse(
                    call: Call<GenericResponse<CreateAccountRequest>>,
                    response: Response<GenericResponse<CreateAccountRequest>>
                ) {
                    runOnUiThread {
                        if (loader.isShowing)
                            loader.dismiss()
                    }
                    if(!response.isSuccessful){
                        runOnUiThread {
                            val dialog = SweetAlertDialog(this@CreateAccountActivity, SweetAlertDialog.ERROR_TYPE)
                            dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                            dialog.titleText = GenericHelpers.titleID()
                            dialog.contentText = "Internal api error: ${response.message()}."
                            dialog.show()
                        }
                        Log.d(GenericHelpers.logID(), "==================================================================")
                        Log.d(GenericHelpers.logID(), "createAccountAsync Internal api error: ${response.message()}")
                        Log.d(GenericHelpers.logID(), "createAccountAsync Internal api error body: ${response.errorBody()}")
                        Log.d(GenericHelpers.logID(), "==================================================================")
                        return
                    }
                    val responseBody = response.body()
                    Log.d(GenericHelpers.logID(), "==================================================================")
                    Log.d(GenericHelpers.logID(), "createAccountAsync Api Response: ${Gson().toJson(responseBody)}")
                    Log.d(GenericHelpers.logID(), "==================================================================")
                    if(!responseBody!!.status){
                        runOnUiThread {
                            val dialog = SweetAlertDialog(this@CreateAccountActivity, SweetAlertDialog.ERROR_TYPE)
                            dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                            dialog.titleText = GenericHelpers.titleID()
                            dialog.contentText = "${responseBody.statusMessage}."
                            dialog.show()
                        }
                    }
                    else{
                        runOnUiThread {
                            val dialog = SweetAlertDialog(this@CreateAccountActivity, SweetAlertDialog.SUCCESS_TYPE)
                            dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                            dialog.titleText = GenericHelpers.titleID()
                            dialog.contentText = "${responseBody.statusMessage}."
                            dialog.show()
                        }
                    }
                }
                override fun onFailure(call: Call<GenericResponse<CreateAccountRequest>>, t: Throwable) {
                    runOnUiThread {
                        if (loader.isShowing)
                            loader.dismiss()

                        val dialog = SweetAlertDialog(this@CreateAccountActivity, SweetAlertDialog.ERROR_TYPE)
                        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                        dialog.titleText = GenericHelpers.titleID()
                        dialog.contentText = "onFailure: ${t.message}"
                        dialog.show()
                    }
                    Log.d(GenericHelpers.logID(), "==================================================================")
                    Log.d(GenericHelpers.logID(), "createAccountAsync onFailure: ${t.message}")
                    Log.d(GenericHelpers.logID(), "==================================================================")
                }
            })
        }
        catch (ex:Exception){
            runOnUiThread {
                val dialog = SweetAlertDialog(this@CreateAccountActivity, SweetAlertDialog.ERROR_TYPE)
                dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                dialog.titleText = GenericHelpers.titleID()
                dialog.contentText = ex.message
                dialog.show()
            }
            Log.d(GenericHelpers.logID(), "==================================================================")
            Log.d(GenericHelpers.logID(), "createAccountAsync Error: ${ex.message}")
            Log.d(GenericHelpers.logID(), "==================================================================")
        }
    }



    private fun validateInput():Boolean{
        if(binding.contentCreateAccount.accountName.text?.toString()?.trim()?.isEmpty()!!){
            val dialog = SweetAlertDialog(this, SweetAlertDialog.ERROR_TYPE)
            dialog.titleText = GenericHelpers.titleID()
            dialog.contentText = "Please enter surname."
            dialog.show()
            return false
        }

        if(binding.contentCreateAccount.accountSurname.text?.toString()?.trim()?.isEmpty()!!){
            val dialog = SweetAlertDialog(this, SweetAlertDialog.ERROR_TYPE)
            dialog.titleText = GenericHelpers.titleID()
            dialog.contentText = "Please enter surname."
            dialog.show()
            return false
        }

        if(binding.contentCreateAccount.accountEmail.text?.toString()?.trim()?.isEmpty()!!){
            val dialog = SweetAlertDialog(this, SweetAlertDialog.ERROR_TYPE)
            dialog.titleText = GenericHelpers.titleID()
            dialog.contentText = "Please enter email address."
            dialog.show()
            return false
        }

        if(binding.contentCreateAccount.accountUsername.text?.toString()?.trim()?.isEmpty()!!){
            val dialog = SweetAlertDialog(this, SweetAlertDialog.ERROR_TYPE)
            dialog.titleText = GenericHelpers.titleID()
            dialog.contentText = "Please enter username."
            dialog.show()
            return false
        }

        if(binding.contentCreateAccount.accountNewPassword.text?.toString()?.trim()?.isEmpty()!!){
            val dialog = SweetAlertDialog(this, SweetAlertDialog.ERROR_TYPE)
            dialog.titleText = GenericHelpers.titleID()
            dialog.contentText = "Please enter new password."
            dialog.show()
            return false
        }

        if(binding.contentCreateAccount.accountConfirmPassword.text?.toString()?.trim()?.isEmpty()!!
        ){
            val dialog = SweetAlertDialog(this, SweetAlertDialog.ERROR_TYPE)
            dialog.titleText = GenericHelpers.titleID()
            dialog.contentText = "Please enter confirm password."
            dialog.show()
            return false
        }



        if(binding.contentCreateAccount.accountConfirmPassword.text?.toString()?.trim()?.isEmpty()!! != binding.contentCreateAccount.accountNewPassword.text?.toString()?.trim()?.isEmpty()!!
        ){
            val dialog = SweetAlertDialog(this, SweetAlertDialog.ERROR_TYPE)
            dialog.titleText = GenericHelpers.titleID()
            dialog.contentText = "The new password does not match confirm password."
            dialog.show()
            return false
        }

        return true
    }


    //#ednregion


}