package com.vusieam.invascan

import android.app.Activity
import android.app.AlertDialog
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.vusieam.invascan.models.requests.IdentifyRequest
import com.vusieam.invascan.models.responses.IdentifyResponse
import com.vusieam.invascan.services.RetrofitServiceBase
import com.vusieam.invascan.utils.Imagehelper
import com.yalantis.ucrop.UCrop
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.io.File


class MainActivity : AppCompatActivity() {
    private var imageView: ImageView? = null
    private var outputImage: ImageView? = null
    private var detectedName: TextView? = null
    private var detectedScore: TextView? = null
    private val UCROP_REQUEST_CODE = 101
    private var requestImageString:String? = null
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_main)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        imageView = findViewById(R.id.inputImage)
        outputImage = findViewById(R.id.outputImage)
        detectedName = findViewById(R.id.txtLabelName)
        detectedScore = findViewById(R.id.txtLabelScore)

        findViewById<View>(R.id.btnLoadImageContainer).setOnClickListener {
            //openImagePicker()
            imageView!!.setImageBitmap(null)
            pickImage.launch("image/*")
        }

        findViewById<View>(R.id.btnIdentifyContainer).setOnClickListener {
            //openImagePicker()
            if(!requestImageString.isNullOrEmpty()){
                val loader = showLoadingDialog(this)
                //Toast.makeText(this, "READ TO MAKE API CALL", Toast.LENGTH_LONG).show()
                val request = IdentifyRequest(userid = "123", imagedata = requestImageString!!)
                val call = RetrofitServiceBase.apiService.identifyAsync(request)
                call.enqueue(object : Callback<IdentifyResponse> {
                    override fun onResponse(call: Call<IdentifyResponse>, response: Response<IdentifyResponse>) {
                        if (response.isSuccessful) {
                            Log.d("Upload", "Success")
                            val responseBody = response.body()
                            loader.dismiss()
                            if(responseBody != null){
                                if(!responseBody.status){
                                    Toast.makeText(this@MainActivity, responseBody.message, Toast.LENGTH_LONG).show()
                                    return
                                }

                                if(responseBody.img.isNullOrEmpty()){
                                    Toast.makeText(this@MainActivity, "Response Image is empty: ${responseBody.message}", Toast.LENGTH_LONG).show()
                                    return
                                }

                                val img = Imagehelper.base64ToBitmap(responseBody.img)
                                outputImage!!.setImageBitmap(img)
                                detectedName!!.text = if (responseBody.labelname.isNullOrEmpty()) "No Detections" else responseBody.labelname
                                detectedScore!!.text = if(responseBody.score == 0f) "0" else responseBody.score.toString()
                                Toast.makeText(this@MainActivity, responseBody.message, Toast.LENGTH_LONG).show()
                            }
                            else{
                                Toast.makeText(this@MainActivity, "Internal API error. Response body is empty", Toast.LENGTH_LONG).show()
                            }
                        } else {
                            loader.dismiss()
                            Log.e("Upload", "Server error: ${response.code()}")
                            Toast.makeText(this@MainActivity, "Server error: ${response.code()}", Toast.LENGTH_LONG).show()
                        }
                    }

                    override fun onFailure(call: Call<IdentifyResponse>, t: Throwable) {
                        loader.dismiss()
                        Log.e("Upload", "Failed: ${t.message}")
                        Toast.makeText(this@MainActivity, "Failed: ${t.message}", Toast.LENGTH_LONG).show()
                    }
                })
            }
            else{
                Toast.makeText(this, "IMAGE STRING DOES NOT EXIST", Toast.LENGTH_LONG).show()
            }
        }

    }


    private val imagePickerLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val imageUri: Uri? = result.data?.data
            imageUri?.let {

                //android:background="@drawable/button_dotted_square"
                imageView!!.setImageURI(it)
                outputImage!!.setImageURI(it)
                //Glide.with(this).load(it).into(imageView!!)
            }
        }
    }

    private val pickImage = registerForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
        uri?.let {
            //imageView!!.setImageURI(it)
            //outputImage!!.setImageURI(it)
            val destinationUri = Uri.fromFile(File(cacheDir, "cropped_image.jpg"))
            val intent = UCrop.of(it, destinationUri)
                //.withAspectRatio(1f, 1f) // Square crop
                .withMaxResultSize(640, 640)
                .withOptions(UCrop.Options().apply {
                    setFreeStyleCropEnabled(true)  // 🔑 Enables manual cropping
                    setToolbarColor(Color.WHITE)
                    setStatusBarColor(Color.DKGRAY)
                    setActiveControlsWidgetColor(Color.BLUE)
                })
                .getIntent(this)

            startActivityForResult(intent, UCROP_REQUEST_CODE)

            // Or use Glide: Glide.with(this).load(it).into(imageView)
        }
    }


    private fun openImagePicker() {
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "image/*"
        }
        imagePickerLauncher.launch(intent)
    }



    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == UCROP_REQUEST_CODE && resultCode == RESULT_OK) {
            val resultUri = UCrop.getOutput(data!!)
            resultUri?.let {
                val bitmap = Imagehelper.uriToBitmap(this, it)
                if (bitmap != null){
                    imageView!!.setImageBitmap(bitmap)
                    //get base64 string of the image
                    requestImageString = Imagehelper.bitmapToBase64(bitmap)
                }
                else{
                    Toast.makeText(this, "ERROR LOADING IMAGE", Toast.LENGTH_LONG).show()
                }
            }
        }
        else if(resultCode == RESULT_CANCELED){
            imageView!!.setImageBitmap(null)
            //get base64 string of the image
            requestImageString = null
        }
        else{
            imageView!!.setImageBitmap(null)
            //get base64 string of the image
            requestImageString = null
        }
    }

    fun showLoadingDialog(context: Context): AlertDialog {
        val builder = AlertDialog.Builder(context)
        builder.setView(R.layout.dialog_loader)
        builder.setCancelable(false) // prevent dismissal on back press
        val dialog = builder.create()
        dialog.show()
        return dialog
    }




}