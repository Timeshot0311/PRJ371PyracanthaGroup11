package com.vusieam.invascan.ui.analytics

import android.app.ActivityOptions
import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.util.Log
import android.view.View
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import cn.pedant.SweetAlert.SweetAlertDialog
import com.github.mikephil.charting.components.Legend
import com.github.mikephil.charting.components.XAxis
import com.github.mikephil.charting.data.BarData
import com.github.mikephil.charting.data.BarDataSet
import com.github.mikephil.charting.data.BarEntry
import com.github.mikephil.charting.data.PieData
import com.github.mikephil.charting.data.PieDataSet
import com.github.mikephil.charting.data.PieEntry
import com.github.mikephil.charting.formatter.IndexAxisValueFormatter
import com.github.mikephil.charting.utils.ColorTemplate
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.LatLngBounds
import com.google.android.gms.maps.model.TileOverlayOptions
import com.google.gson.Gson
import com.google.maps.android.heatmaps.HeatmapTileProvider
import com.vusieam.invascan.R
import com.vusieam.invascan.databinding.ActivityAnalyticsBinding
import com.vusieam.invascan.domain.Versioning
import com.vusieam.invascan.domain.models.responses.generic.GenericResponse
import com.vusieam.invascan.domain.models.responses.reports.LocationDetails
import com.vusieam.invascan.domain.models.responses.reports.ProvinceDetections
import com.vusieam.invascan.domain.services.RetrofitAuthenticatedService
import com.vusieam.invascan.domain.utils.GenericHelpers
import com.vusieam.invascan.domain.utils.InternetAccess
import com.vusieam.invascan.ui.dashboard.DashboardActivity
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import javax.inject.Inject

@AndroidEntryPoint
class AnalyticsActivity : AppCompatActivity(), View.OnClickListener, OnMapReadyCallback {
    //#region -- protected properties --
    @Inject
    internal lateinit var versioning: Versioning
    private lateinit var binding: ActivityAnalyticsBinding
    private var mGoogleMaps:GoogleMap? = null
    //#endregion

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        binding = ActivityAnalyticsBinding.inflate(layoutInflater)
        setContentView(binding.root)
        initializeUI()
    }

    private fun initializeUI() {
        binding.contentAnalytics.btnBarChart.setOnClickListener(this)
        binding.contentAnalytics.btnPieChart.setOnClickListener(this)
        binding.actionBack.setOnClickListener(this)
        binding.contentAnalytics.txtVersion.text = versioning.toString()
        Log.d(GenericHelpers.logID(), "version: ${versioning.toString()}")

        val mapFragment = supportFragmentManager.findFragmentById(binding.contentAnalytics.detectionsMapsFragment.id) as SupportMapFragment
        mapFragment.getMapAsync(this)
        //// Load data in background
        //lifecycleScope.launch(Dispatchers.IO) {
        //    withContext(Dispatchers.Main) {
        //        mapFragment.getMapAsync(this@AnalyticsActivity)
        //    }
        //}
    }

    //#region override functions

    override fun onClick(view: View?) {
        when(view?.id){
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

            R.id.btn_bar_chart ->{
                getProvinceDetections(false)
            }

            R.id.btn_pie_chart ->{
                getProvinceDetections(true)
            }
        }
    }

    override fun onStart() {
        super.onStart()
    }

    override fun onRestart() {
        super.onRestart()
    }


    override fun onMapReady(googleMap: GoogleMap) {
        mGoogleMaps = googleMap
        lifecycleScope.launch(Dispatchers.IO) {
            withContext(Dispatchers.Main) {
                getLocationDetails()
            }
        }

    }


    //#endregion


    //#region -- api calls --

    private fun getProvinceDetections(pieChartView:Boolean){
        try{
            if (!InternetAccess.checkForInternet(this)) {
                runOnUiThread {
                    val dialog = SweetAlertDialog(this, SweetAlertDialog.WARNING_TYPE)
                    dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                    dialog.confirmText = "Ok"
                    dialog.titleText = GenericHelpers.titleID()
                    dialog.contentText = "Your devices does not have internet connection. Please switch on WIFI or Mobile data"
                    dialog.setConfirmClickListener {
                        dialog.dismissWithAnimation()
                    }
                    dialog.setCancelable(false)
                    dialog.show()
                }

                Log.d(GenericHelpers.logID(), "==================================================================")
                Log.d(GenericHelpers.logID(), "Your devices does not have internet connection. Please switch on WIFI or Mobile data")
                Log.d(GenericHelpers.logID(), "==================================================================")
                return
            }

            val loader = SweetAlertDialog(this, SweetAlertDialog.PROGRESS_TYPE)
            loader.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
            loader.contentText = "Retrieving detections please wait....."
            loader.titleText = GenericHelpers.titleID()
            loader.setCancelable(false)
            loader.show()

            val service = RetrofitAuthenticatedService(this)
            val call = service.apiService.getAllProvinceAsync()
            call.enqueue(object : Callback<GenericResponse<List<ProvinceDetections>>> {
                override fun onResponse(
                    call: Call<GenericResponse<List<ProvinceDetections>>>,
                    response: Response<GenericResponse<List<ProvinceDetections>>>
                ) {
                    runOnUiThread {
                        if (loader.isShowing)
                            loader.dismiss()
                    }

                    if(!response.isSuccessful){
                        runOnUiThread {
                            if (loader.isShowing)
                                loader.dismiss()
                            val dialog = SweetAlertDialog(this@AnalyticsActivity, SweetAlertDialog.ERROR_TYPE)
                            dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                            dialog.titleText = GenericHelpers.titleID()
                            dialog.contentText = "getProvinceDetections failed: ${response.message()}"
                            dialog.show()
                        }

                        Log.d(GenericHelpers.logID(), "==================================================================")
                        Log.d(GenericHelpers.logID(), "getProvinceDetections Internal api error: ${response.message()}")
                        Log.d(GenericHelpers.logID(), "getProvinceDetections Internal api error body: ${response.errorBody()}")
                        Log.d(GenericHelpers.logID(), "==================================================================")
                        return
                    }

                    val responseBody = response.body()
                    Log.d(GenericHelpers.logID(), "==================================================================")
                    Log.d(GenericHelpers.logID(), "getProvinceDetections Api Response: ${Gson().toJson(responseBody)}")
                    Log.d(GenericHelpers.logID(), "==================================================================")
                    if(!responseBody!!.status){
                        runOnUiThread {
                            if (loader.isShowing)
                                loader.dismiss()
                            val dialog = SweetAlertDialog(this@AnalyticsActivity, SweetAlertDialog.ERROR_TYPE)
                            dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                            dialog.titleText = GenericHelpers.titleID()
                            dialog.contentText = responseBody.statusMessage
                            dialog.show()
                        }
                        return
                    }

                    val detections = responseBody.dynamicModel
                    if(detections.isNullOrEmpty()){
                        runOnUiThread {
                            if (loader.isShowing)
                                loader.dismiss()
                            val dialog = SweetAlertDialog(this@AnalyticsActivity, SweetAlertDialog.SUCCESS_TYPE)
                            dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                            dialog.titleText = GenericHelpers.titleID()
                            dialog.contentText = responseBody.statusMessage
                            dialog.show()
                        }
                        return
                    }


                    if(pieChartView) {
                        // Create entries (x = index, y = totals)
                        val pieEntries = detections.map { PieEntry(it.totals.toFloat(), it.province) }

                        //initializing dataset
                        val pieDataSet:PieDataSet = PieDataSet(pieEntries, "")
                        // setting colors
                        pieDataSet.colors = ColorTemplate.MATERIAL_COLORS.toList() + ColorTemplate.COLORFUL_COLORS.toList()
                        pieDataSet.valueTextColor = Color.WHITE
                        pieDataSet.valueTextSize = 12f
                        //#region -- pie chart --
                        //adding data to pieChart
                        binding.contentAnalytics.cardPieChart.visibility = View.VISIBLE
                        binding.contentAnalytics.cardBarChart.visibility = View.GONE
                        binding.contentAnalytics.detectionPieChart.data = PieData(pieDataSet)
                        binding.contentAnalytics.detectionPieChart.setUsePercentValues(true) // show percentages
                        binding.contentAnalytics.detectionPieChart.description.isEnabled = false
                        binding.contentAnalytics.detectionPieChart.centerText = "Province Cases"
                        binding.contentAnalytics.detectionPieChart.setCenterTextSize(16f)
                        binding.contentAnalytics.detectionPieChart.setEntryLabelColor(Color.WHITE)
                        binding.contentAnalytics.detectionPieChart.setEntryLabelTextSize(10f)
                        binding.contentAnalytics.detectionPieChart.animateXY(5000, 5000)

                        // Enable legend
                        val legend = binding.contentAnalytics.detectionPieChart.legend
                        legend.isEnabled = true
                        legend.textSize = 12f
                        //legend.form = Legend.LegendForm.CIRCLE
                        legend.isWordWrapEnabled = true
                        legend.verticalAlignment = Legend.LegendVerticalAlignment.BOTTOM
                        legend.horizontalAlignment = Legend.LegendHorizontalAlignment.CENTER
                        legend.orientation = Legend.LegendOrientation.HORIZONTAL
                        legend.setDrawInside(false)

                        binding.contentAnalytics.detectionPieChart.invalidate() // refresh
                        binding.contentAnalytics.detectionPieChart.notifyDataSetChanged()

                        //#endregion
                    }
                    else {

                        // Create entries (x = index, y = totals)
                        val barEntries = detections.mapIndexed { index, data ->
                            BarEntry(index.toFloat(), data.totals.toFloat())
                        }


                        val barDataSet = BarDataSet(barEntries, "Cases by Province")
                        barDataSet.colors = ColorTemplate.MATERIAL_COLORS.toList() + ColorTemplate.COLORFUL_COLORS.toList()
                        barDataSet.valueTextColor = Color.BLACK
                        barDataSet.valueTextSize = 12f
                        //#region -- bar chart --

                        // Wrap in BarData
                        val barData = BarData(barDataSet)
                        barData.barWidth = 0.9f

                        // Setup chart
                        binding.contentAnalytics.cardPieChart.visibility = View.GONE
                        binding.contentAnalytics.cardBarChart.visibility = View.VISIBLE
                        binding.contentAnalytics.detectionBarChart.data = barData
                        binding.contentAnalytics.detectionBarChart.setFitBars(true)
                        binding.contentAnalytics.detectionBarChart.description.isEnabled = false
                        binding.contentAnalytics.detectionBarChart.animateY(1000)

                        // Configure X-axis with province names
                        //val xAxis = binding.contentAnalytics.detectionsBarChart.xAxis
                        //xAxis.valueFormatter = IndexAxisValueFormatter(detections.map { it.province })
                        //xAxis.position = XAxis.XAxisPosition.BOTTOM
                        //xAxis.granularity = 1f
                        //xAxis.setDrawGridLines(false)
                        //xAxis.labelRotationAngle = -45f // tilt labels so they don’t overlap

                        // X-axis = totals
                        binding.contentAnalytics.detectionBarChart.xAxis.apply {
                            valueFormatter = IndexAxisValueFormatter(detections.map { it.province })
                            position = XAxis.XAxisPosition.BOTTOM
                            granularity = 1f
                            setDrawGridLines(false)
                            axisMinimum = 0f
                            labelRotationAngle = -45f
                        }

                        // Y-axis = province names
                        binding.contentAnalytics.detectionBarChart.axisLeft.apply {
                            //valueFormatter = IndexAxisValueFormatter(detections.map { it.province })
                            axisMinimum = 0f
                            granularity = 1f
                        }
                        binding.contentAnalytics.detectionBarChart.axisRight.isEnabled = false

                        // Y-axis
                        //binding.contentAnalytics.detectionsBarChart.axisLeft.axisMinimum = 0f
                        //binding.contentAnalytics.detectionsBarChart.axisRight.isEnabled = false

                        // Legend
                        val barLegend = binding.contentAnalytics.detectionBarChart.legend
                        barLegend.isEnabled = true

                        binding.contentAnalytics.detectionBarChart.invalidate()
                        binding.contentAnalytics.detectionBarChart.notifyDataSetChanged()

                        //#endregion
                    }
                }
                override fun onFailure(call: Call<GenericResponse<List<ProvinceDetections>>>, t: Throwable) {
                    runOnUiThread {
                        if (loader.isShowing)
                            loader.dismiss()
                        val dialog = SweetAlertDialog(this@AnalyticsActivity, SweetAlertDialog.ERROR_TYPE)
                        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                        dialog.titleText = GenericHelpers.titleID()
                        dialog.contentText = "onFailure: ${t.message}"
                        dialog.show()
                    }
                    Log.d(GenericHelpers.logID(), "==================================================================")
                    Log.d(GenericHelpers.logID(), "getProvinceDetections onFailure: ${t.message}")
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
            Log.d(GenericHelpers.logID(), "getProvinceDetections error: ${ex.stackTrace}")
            Log.d(GenericHelpers.logID(), "==================================================================")
        }
    }




    private fun getLocationDetails(){
        try{
            if (!InternetAccess.checkForInternet(this)) {
                runOnUiThread {
                    val dialog = SweetAlertDialog(this, SweetAlertDialog.WARNING_TYPE)
                    dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                    dialog.confirmText = "Ok"
                    dialog.titleText = GenericHelpers.titleID()
                    dialog.contentText = "Your devices does not have internet connection. Please switch on WIFI or Mobile data"
                    dialog.setConfirmClickListener {
                        dialog.dismissWithAnimation()
                    }
                    dialog.setCancelable(false)
                    dialog.show()
                }

                Log.d(GenericHelpers.logID(), "==================================================================")
                Log.d(GenericHelpers.logID(), "Your devices does not have internet connection. Please switch on WIFI or Mobile data")
                Log.d(GenericHelpers.logID(), "==================================================================")
                return
            }

            val loader = SweetAlertDialog(this, SweetAlertDialog.PROGRESS_TYPE)
            loader.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
            loader.contentText = "Retrieving maps data please wait....."
            loader.titleText = GenericHelpers.titleID()
            loader.setCancelable(false)
            loader.show()

            val service = RetrofitAuthenticatedService(this)
            val call = service.apiService.getLocationDetailsAsync()
            call.enqueue(object : Callback<GenericResponse<List<LocationDetails>>> {
                override fun onResponse(
                    call: Call<GenericResponse<List<LocationDetails>>>,
                    response: Response<GenericResponse<List<LocationDetails>>>
                ) {
                    runOnUiThread {
                        if (loader.isShowing)
                            loader.dismiss()
                    }

                    if(!response.isSuccessful){
                        runOnUiThread {
                            if (loader.isShowing)
                                loader.dismiss()
                            val dialog = SweetAlertDialog(this@AnalyticsActivity, SweetAlertDialog.ERROR_TYPE)
                            dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                            dialog.titleText = GenericHelpers.titleID()
                            dialog.contentText = "getLocationDetails failed: ${response.message()}"
                            dialog.show()
                        }

                        Log.d(GenericHelpers.logID(), "==================================================================")
                        Log.d(GenericHelpers.logID(), "getLocationDetails Internal api error: ${response.message()}")
                        Log.d(GenericHelpers.logID(), "getLocationDetails Internal api error body: ${response.errorBody()}")
                        Log.d(GenericHelpers.logID(), "==================================================================")
                        return
                    }

                    val responseBody = response.body()
                    Log.d(GenericHelpers.logID(), "==================================================================")
                    Log.d(GenericHelpers.logID(), "getLocationDetails Api Response: ${Gson().toJson(responseBody)}")
                    Log.d(GenericHelpers.logID(), "==================================================================")
                    if(!responseBody!!.status){
                        runOnUiThread {
                            if (loader.isShowing)
                                loader.dismiss()
                            val dialog = SweetAlertDialog(this@AnalyticsActivity, SweetAlertDialog.ERROR_TYPE)
                            dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                            dialog.titleText = GenericHelpers.titleID()
                            dialog.contentText = responseBody.statusMessage
                            dialog.show()
                        }
                        return
                    }

                    val locationDetails = responseBody.dynamicModel
                    if(locationDetails.isNullOrEmpty()){
                        runOnUiThread {
                            if (loader.isShowing)
                                loader.dismiss()
                            val dialog = SweetAlertDialog(this@AnalyticsActivity, SweetAlertDialog.SUCCESS_TYPE)
                            dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                            dialog.titleText = GenericHelpers.titleID()
                            dialog.contentText = responseBody.statusMessage
                            dialog.show()
                        }
                        return
                    }

                    val locations:List<LatLng> = locationDetails.map { LatLng(it.latitude, it.longitude) }

                    val heatMapProvider = HeatmapTileProvider.Builder()
                        .data(locations)
                        .radius(30)
                        .build()

                    mGoogleMaps?.addTileOverlay(TileOverlayOptions().tileProvider(heatMapProvider))

                    val boundsBuilder = LatLngBounds.builder()
                    for (point in locations) {
                        boundsBuilder.include(point)
                    }
                    val bounds = boundsBuilder.build()

                    // Animate camera so all heatmap points are visible
                    mGoogleMaps?.animateCamera(CameraUpdateFactory.newLatLngBounds(bounds, 100))
                    //mGoogleMaps?.animateCamera(CameraUpdateFactory.newLatLngZoom(bounds.center, 12f))
                }
                override fun onFailure(call: Call<GenericResponse<List<LocationDetails>>>, t: Throwable) {
                    runOnUiThread {
                        if (loader.isShowing)
                            loader.dismiss()
                        val dialog = SweetAlertDialog(this@AnalyticsActivity, SweetAlertDialog.ERROR_TYPE)
                        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                        dialog.titleText = GenericHelpers.titleID()
                        dialog.contentText = "onFailure: ${t.message}"
                        dialog.show()
                    }
                    Log.d(GenericHelpers.logID(), "==================================================================")
                    Log.d(GenericHelpers.logID(), "getLocationDetails onFailure: ${t.message}")
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
            Log.d(GenericHelpers.logID(), "getLocationDetails error: ${ex.stackTrace}")
            Log.d(GenericHelpers.logID(), "==================================================================")
        }
    }


    //#endregion


}