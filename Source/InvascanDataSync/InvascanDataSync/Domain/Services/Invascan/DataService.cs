using InvascanDataSync.Data.Entities;
using InvascanDataSync.Data.Repositories;
using InvascanDataSync.Domain.Services.INaturalist;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace InvascanDataSync.Domain.Services.Invascan;

public class DataService
{
    #region -- protected properties --
    protected readonly ILogger<DataService> logger;
    protected readonly InaturalistService inaturalistService;
    protected readonly InvascanRepository invascanRepository;

    protected static bool serviceRunning = false;
    #endregion


    public DataService(ILogger<DataService> logger, InaturalistService inaturalistService, InvascanRepository invascanRepository)
    {
        this.logger = logger;
        this.inaturalistService = inaturalistService;
        this.invascanRepository = invascanRepository;
    }


    public bool IsServiceRunning() => serviceRunning;

    public async Task InitiateDataSync()
    {
        serviceRunning = true;
        var page = 1;
        var data = await inaturalistService.FetchPyracanthaObservationAsync(page);
        if (data != null)
        {
            while (data.Results.Count() > 0)
            {
                foreach (var result in data.Results)
                {
                    var longlat = result.Location.Split(",");
                    var latitude = double.Parse(longlat[0].ToString(), CultureInfo.InvariantCulture);
                    var longitude = double.Parse(longlat[1].ToString(), CultureInfo.InvariantCulture);
                    var province = await inaturalistService.GetProvinceAsync(latitude, longitude);
                    var detection = new Detections()
                    {
                        Id = Guid.Parse(result.Uuid),
                        SpeciesName = result.Species_guess,
                        CommonName = result.Taxon.Name,
                        ConfidenceScore = 9.0f,
                        UserId = Guid.Parse("E17258B9-4287-45EE-8CC5-68752AC607E3"),
                        StatusId = Guid.Parse("AEFA556C-A285-4838-B54C-0CD8A50A3D37"),
                        NativeRegion = province, //GetProvince(result.Place_guess),
                        DetectedAt = result.Time_observed_at ?? DateTime.Now,
                    };

                    var addResponse = await invascanRepository.AddDetection(detection);
                    if (addResponse.Status)
                    {
                        try
                        {
                            //var longlat = result.Location.Split(",");
                            var location = new GeoData()
                            {
                                DetectionId = detection.Id,
                                Latitude = latitude,//(longlat.Length >= 2) ? double.Parse(longlat[0].ToString(), CultureInfo.InvariantCulture) : 0.0f,
                                Longitude = longitude, //(longlat.Length >= 2) ? double.Parse(longlat[1].ToString(), CultureInfo.InvariantCulture) : 0.0f,
                                Placename = result.Place_guess,
                                Province = province, //GetProvince(result.Place_guess),
                                CreatedAt = result.Time_observed_at ?? DateTime.Now
                            };

                            await invascanRepository.AddGeoCoordinates(location);
                        }
                        catch (Exception ex)
                        {
                            logger.LogError($"AddGeoCoordinates error: {ex.Message}");
                        }



                        foreach (var photo in result.Photos)
                        {
                            try
                            {
                                var image = new DetectionImages()
                                {
                                    DetectionId = detection.Id,
                                    ImageUrl = photo.Url,
                                    ImageData = new byte[0],
                                    UploadedAt = result.Time_observed_at ?? DateTime.Now
                                };
                                await invascanRepository.AddImages(image);
                            }
                            catch (Exception ex)
                            {
                                logger.LogError($"AddImages error: {ex.Message}");
                            }
                        }
                    }
                    else
                    {

                    }
                }

                page++;
                data = await inaturalistService.FetchPyracanthaObservationAsync(page);
            }
        }
        serviceRunning = false;
    }




    private string GetProvince(string place)
    {
        string category = place switch
        {
            var s when s.ToLower().Contains("gauteng") => "Gauteng",
            var s when s.ToLower().Contains("free state") => "Free State",
            var s when s.ToLower().Contains("natal") => "Kwazulu Natal",
            var s when s.ToLower().Contains("kzn") => "Kwazulu Natal",
            var s when s.ToLower().Contains("western cape") => "Western Cape",
            var s when s.ToLower().Contains("eastern cape") => "Eastern Cape",
            var s when s.ToLower().Contains("northern") => "Northern Cape",
            var s when s.ToLower().Contains("north west") => "North West",
            var s when s.ToLower().Contains("north-west") => "North West",
            var s when s.ToLower().Contains("limpopo") => "Limpopo",
            var s when s.ToLower().Contains("mpumalanga") => "Mpumalanga",
            _ => "Unallocated"
        };
        return category;
    }
}
