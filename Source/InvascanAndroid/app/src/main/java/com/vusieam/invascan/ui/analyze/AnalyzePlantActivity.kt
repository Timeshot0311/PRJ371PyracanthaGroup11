package com.vusieam.invascan.ui.analyze

import android.app.Activity
import android.app.ActivityOptions
import android.content.ContentValues
import android.content.Intent
import android.graphics.BitmapFactory
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.util.Log
import android.view.View
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import cn.pedant.SweetAlert.SweetAlertDialog
import com.google.gson.Gson
import com.vusieam.invascan.R
import com.vusieam.invascan.databinding.ActivityAnalyzePlantBinding
import com.vusieam.invascan.domain.InvascanSessionManager
import com.vusieam.invascan.domain.Versioning
import com.vusieam.invascan.domain.models.requests.InvestigateRequest
import com.vusieam.invascan.domain.models.responses.generic.GenericResponse
import com.vusieam.invascan.domain.models.responses.investigate.DetectionModel
import com.vusieam.invascan.domain.services.RetrofitAuthenticatedService
import com.vusieam.invascan.ui.dashboard.DashboardActivity
import com.vusieam.invascan.ui.login.LoginActivity
import com.vusieam.invascan.domain.utils.GenericHelpers
import com.vusieam.invascan.domain.utils.Imagehelper
import com.vusieam.invascan.domain.utils.InternetAccess
import com.yalantis.ucrop.UCrop
import dagger.hilt.android.AndroidEntryPoint
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.io.File
import java.util.UUID
import javax.inject.Inject


@AndroidEntryPoint
class AnalyzePlantActivity : AppCompatActivity(), View.OnClickListener {
    //#region -- protected properties --
    @Inject
    internal lateinit var versioning: Versioning
    private lateinit var binding: ActivityAnalyzePlantBinding
    //#endregion

    private var imageView: ImageView? = null
    private var outputImage: ImageView? = null
    private var detectedName: TextView? = null
    private var detectedScore: TextView? = null
    private var requestImageString:String? = null
    private var currentPhotoUri: Uri? = null

    override fun onCreate(savedInstanceState: Bundle?) {

        super.onCreate(savedInstanceState)

        enableEdgeToEdge()

        binding = ActivityAnalyzePlantBinding.inflate(layoutInflater)
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
            binding.contentMain.btnLoadImageContainer.setOnClickListener(this)
            binding.contentMain.btnCameraImageContainer.setOnClickListener(this)
            binding.contentMain.btnIdentifyContainer.setOnClickListener(this)
            binding.actionBack.setOnClickListener(this)

            binding.contentMain.txtVersion.text = versioning.toString()
            Log.d(GenericHelpers.logID(), "version: ${versioning.toString()}")

            imageView = binding.contentMain.inputImage
            outputImage = binding.contentMain.outputImage
            detectedName = binding.contentMain.txtLabelName
            detectedScore = binding.contentMain.txtLabelScore
        }
    }


    override fun onClick(view: View?) {
        when(view?.id){
            R.id.btnIdentifyContainer ->{
                Log.d(GenericHelpers.logID(), "clicking R.id.btnIdentifyContainer: ${requestImageString}")
                if(!InternetAccess.checkForInternet(this)){
                    val dialog = SweetAlertDialog(this, SweetAlertDialog.WARNING_TYPE)
                    dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
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
                outputImage?.setImageBitmap(null)
                detectedName?.text = ""
                detectedScore?.text = ""
                investigateAsync()
            }
            R.id.btnLoadImageContainer ->{
                Log.d(GenericHelpers.logID(), "clicking R.id.btnLoadImageContainer: ${requestImageString}")
                imageView!!.setImageBitmap(null)
                requestImageString = ""
                pickImage.launch("image/*")
            }
            R.id.btnCameraImageContainer ->{
                Log.d(GenericHelpers.logID(), "clicking R.id.btnCameraImageContainer: ${requestImageString}")
                imageView!!.setImageBitmap(null)
                requestImageString = ""
                captureImage()
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

        }
    }


    private fun investigateAsync() {
        try {
            if (requestImageString.isNullOrEmpty()) {
                runOnUiThread {
                    val dialog = SweetAlertDialog(this, SweetAlertDialog.WARNING_TYPE)
                    dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                    dialog.confirmText = "Ok"
                    dialog.titleText = GenericHelpers.titleID()
                    dialog.contentText = "Image required for investigation."
                    dialog.setConfirmClickListener {
                        dialog.dismissWithAnimation()
                    }
                    dialog.setCancelable(false)
                    dialog.show()
                }

                Log.d(GenericHelpers.logID(), "==================================================================")
                Log.d(GenericHelpers.logID(), "Image required for investigation")
                Log.d(GenericHelpers.logID(), "==================================================================")
                return
            }


            val userId = InvascanSessionManager.getUserIdFromToken(this)
            if (userId.isNullOrEmpty()) {
                val dialog = SweetAlertDialog(this, SweetAlertDialog.WARNING_TYPE)
                dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                dialog.confirmText = "Ok"
                dialog.titleText = GenericHelpers.titleID()
                dialog.contentText = "You are not logged in."
                dialog.setConfirmClickListener {
                    dialog.dismissWithAnimation()
                }
                dialog.setCancelable(false)
                dialog.show()
                return
            }

            val loader = SweetAlertDialog(this, SweetAlertDialog.PROGRESS_TYPE)
            loader.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
            loader.contentText = "Processing request please wait....."
            loader.titleText = GenericHelpers.titleID()
            loader.setCancelable(false)
            loader.show()

            val request = InvestigateRequest(
                userid = userId,
                imageData = requestImageString!!,
                latitude = 0f,
                longitude = 0f,
                address = ""
            )
            val service = RetrofitAuthenticatedService(this)
            val call = service.apiService.identifyAsync(request)
            call.enqueue(object : Callback<GenericResponse<DetectionModel>> {
                override fun onResponse(
                    call: Call<GenericResponse<DetectionModel>>,
                    response: Response<GenericResponse<DetectionModel>>
                ) {
                    runOnUiThread {
                        if (loader.isShowing)
                            loader.dismiss()
                    }

                    if(!response.isSuccessful){
                        runOnUiThread {
                            if (loader.isShowing)
                                loader.dismiss()
                            val dialog = SweetAlertDialog(this@AnalyzePlantActivity, SweetAlertDialog.ERROR_TYPE)
                            dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                            dialog.titleText = GenericHelpers.titleID()
                            dialog.contentText = "Investigation failed: ${response.message()}"
                            dialog.show()
                        }

                        Log.d(GenericHelpers.logID(), "==================================================================")
                        Log.d(GenericHelpers.logID(), "investigateAsync Internal api error: ${response.message()}")
                        Log.d(GenericHelpers.logID(), "investigateAsync Internal api error body: ${response.errorBody()}")
                        Log.d(GenericHelpers.logID(), "==================================================================")
                        return
                    }

                    val responseBody = response.body()
                    Log.d(GenericHelpers.logID(), "==================================================================")
                    Log.d(GenericHelpers.logID(), "investigateAsync Api Response: ${Gson().toJson(responseBody)}")
                    Log.d(GenericHelpers.logID(), "==================================================================")
                    if(!responseBody!!.status){
                        runOnUiThread {
                            if (loader.isShowing)
                                loader.dismiss()
                            val dialog = SweetAlertDialog(this@AnalyzePlantActivity, SweetAlertDialog.ERROR_TYPE)
                            dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                            dialog.titleText = GenericHelpers.titleID()
                            dialog.contentText = responseBody.statusMessage
                            dialog.show()
                        }
                        return
                    }

                    val detectionModel = responseBody.dynamicModel
                    if(detectionModel == null){
                        runOnUiThread {
                            if (loader.isShowing)
                                loader.dismiss()
                            val dialog = SweetAlertDialog(this@AnalyzePlantActivity, SweetAlertDialog.SUCCESS_TYPE)
                            dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                            dialog.titleText = GenericHelpers.titleID()
                            dialog.contentText = responseBody.statusMessage
                            dialog.show()
                        }
                        return
                    }

                    if(detectionModel.imageData?.isEmpty() == false){
                        val img = Imagehelper.base64ToBitmap(detectionModel.imageData)
                        outputImage!!.setImageBitmap(img)
                        detectedName!!.text = if (detectionModel.speciesName!!.isEmpty()) "No Detections" else detectionModel.speciesName
                        detectedScore!!.text = if (detectionModel.confidenceScore == 0f) "0" else "${(detectionModel.confidenceScore!! * 100)}% confidence"
                    }
                }
                override fun onFailure(call: Call<GenericResponse<DetectionModel>>, t: Throwable) {
                    runOnUiThread {
                        if (loader.isShowing)
                            loader.dismiss()
                        val dialog = SweetAlertDialog(this@AnalyzePlantActivity, SweetAlertDialog.ERROR_TYPE)
                        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                        dialog.titleText = GenericHelpers.titleID()
                        dialog.contentText = "onFailure: ${t.message}"
                        dialog.show()
                    }
                    Log.d(GenericHelpers.logID(), "==================================================================")
                    Log.d(GenericHelpers.logID(), "investigateAsync onFailure: ${t.message}")
                    Log.d(GenericHelpers.logID(), "==================================================================")
                }
            })
        }
        catch (ex:Exception){
            runOnUiThread {
                val dialog = SweetAlertDialog(this, SweetAlertDialog.ERROR_TYPE)
                dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                dialog.confirmText = "Ok"
                dialog.titleText = GenericHelpers.titleID()
                dialog.contentText = "main error: ${ex.stackTrace}."
                dialog.setConfirmClickListener {
                    dialog.dismissWithAnimation()
                }
                dialog.setCancelable(false)
                dialog.show()
            }

            Log.d(GenericHelpers.logID(), "==================================================================")
            Log.d(GenericHelpers.logID(), "investigateAsync error: ${ex.stackTrace}")
            Log.d(GenericHelpers.logID(), "==================================================================")
        }
    }


    //#endregion


    //#region --working with images

    /**
     * Configuring image storage for images captured via camera
     */
    private fun createImageUri(): Uri {
        val contentValues = ContentValues().apply {
            val imageUuid: String = UUID.randomUUID().toString().uppercase().replace("-", "")
            put(MediaStore.Images.Media.DISPLAY_NAME, "INV_${imageUuid}.jpg")
            put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg")
        }
        return contentResolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, contentValues)!!
    }


    /**
     * Capturing image from camera
     */
    private val takePhotoLauncher = registerForActivityResult(ActivityResultContracts.TakePicture()) { success ->
        if (success && currentPhotoUri != null) {
            val imageUuid: String = UUID.randomUUID().toString().uppercase().replace("-", "")
            val destinationImageUri = Uri.fromFile(File(filesDir, "INVA_${imageUuid}.jpg"))
            val options = UCrop.Options().apply {
                setFreeStyleCropEnabled(true)
                setToolbarColor(Color.WHITE)
                setStatusBarColor(Color.DKGRAY)
                setActiveControlsWidgetColor(Color.BLUE)
            }
            val intent = UCrop.of(currentPhotoUri!!, destinationImageUri)
                .withMaxResultSize(640, 640)
                .withOptions(options)
                .getIntent(this)
            imageCropLauncher.launch(intent)
        }
    }


    /**
     * Initiating storage setup and invoking image captured from camera
     */
    private fun captureImage() {
        currentPhotoUri = createImageUri()
        takePhotoLauncher.launch(currentPhotoUri!!)
    }


    private val pickImage = registerForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
        uri?.let {
            val imageUuid: String = UUID.randomUUID().toString().uppercase().replace("-", "")
            val destinationImageUri = Uri.fromFile(File(cacheDir, "INVA_${imageUuid}.jpg"))
            val options = UCrop.Options().apply {
                setFreeStyleCropEnabled(true)
                setToolbarColor(Color.WHITE)
                setStatusBarColor(Color.DKGRAY)
                setActiveControlsWidgetColor(Color.BLUE)
            }
            val intent = UCrop.of(it, destinationImageUri)
                .withMaxResultSize(640, 640)
                .withOptions(options)
                .getIntent(this)
            imageCropLauncher.launch(intent)
        }
    }


    private val imageCropLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        Log.d(GenericHelpers.logID(), "===============================================================")
        Log.d(GenericHelpers.logID(), "RESULT_CODE: ${result.resultCode}")
        when (result.resultCode) {
            Activity.RESULT_OK -> {
                Log.d(GenericHelpers.logID(), "RESULT_OK")
                Log.d(GenericHelpers.logID(), "resultData: ${Gson().toJson(result.data)}")
                val data: Intent? = result.data
                val resultUri = UCrop.getOutput(data!!)
                Log.d(GenericHelpers.logID(), "resultUri: ${Gson().toJson(resultUri!!.path)}")

                val bitmap = Imagehelper.bitmapFromPath(resultUri.path!!)
                Log.d(GenericHelpers.logID(), "Image Width: ${bitmap?.width}")
                Log.d(GenericHelpers.logID(), "Image Height: ${bitmap?.height}")

                if (bitmap != null){
                    runOnUiThread {
                        imageView!!.setImageBitmap(bitmap)
                    }
                    requestImageString = Imagehelper.bitmapToBase64(bitmap) //get base64 string of the image
                    Log.d(GenericHelpers.logID(), "Image base64: ${requestImageString}")
                }
                Log.d(GenericHelpers.logID(), "===============================================================")
            }
            UCrop.RESULT_ERROR -> { // 96
                val cropError = result.data?.let { UCrop.getError(it) }
                cropError?.printStackTrace()
                Log.d(GenericHelpers.logID(), "UCrop.RESULT_ERROR: ${cropError?.message}")
                Toast.makeText(this, "CROP ERROR: ${cropError?.message}", Toast.LENGTH_LONG).show()
            }
            Activity.RESULT_CANCELED -> {
                Log.d(GenericHelpers.logID(), "RESULT_CANCELED")
                imageView!!.setImageBitmap(null)
                requestImageString = null //get base64 string of the image
            }
            else -> {
                Log.d(GenericHelpers.logID(), "RESULT_UNKNOWN")
                imageView!!.setImageBitmap(null)
                requestImageString = null //get base64 string of the image
            }
        }
    }


    private val imageCropLauncherV2 = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        Log.d(GenericHelpers.logID(), "imageCropLauncherV2 result")
            if (result.resultCode == Activity.RESULT_OK && result.data != null) {
                Log.d(GenericHelpers.logID(), "RESULT_OK")
                val resultUri = UCrop.getOutput(result.data!!)
                if (resultUri != null) {
                    // Load the cropped image
                    Log.d(GenericHelpers.logID(), "resultUri: ${Gson().toJson(resultUri.path)}")
                    var bitmap = BitmapFactory.decodeStream(
                        contentResolver.openInputStream(resultUri)
                    )
                    imageView!!.setImageBitmap(bitmap)
                    Log.d(GenericHelpers.logID(), "Image 1 Width: ${bitmap?.width}")
                    Log.d(GenericHelpers.logID(), "Image 1 Height: ${bitmap?.height}")

                    val imageUuid: String = UUID.randomUUID().toString().uppercase().replace("-", "")
                    val fileName = "INVA_${imageUuid}.jpg"
                    val newUri = Imagehelper.saveBitmapToGallery(this, bitmap, fileName)

                    bitmap = BitmapFactory.decodeStream(
                        contentResolver.openInputStream(newUri!!)
                    )
                    imageView!!.setImageBitmap(bitmap)

                    Log.d(GenericHelpers.logID(), "Image Width: ${bitmap?.width}")
                    Log.d(GenericHelpers.logID(), "Image Height: ${bitmap?.height}")
                    requestImageString = Imagehelper.bitmapToBase64(bitmap)
                    Log.d(GenericHelpers.logID(), "Image base64: ${requestImageString}")

                }
            }
            else if (result.resultCode == UCrop.RESULT_ERROR) {
                Log.d(GenericHelpers.logID(), "UCrop.RESULT_ERROR")
                val cropError = UCrop.getError(result.data!!)
                Log.d(GenericHelpers.logID(), "UCrop.RESULT_ERROR: ${cropError?.printStackTrace()}")
                cropError?.printStackTrace()
            }
        }

    //#endregion

}