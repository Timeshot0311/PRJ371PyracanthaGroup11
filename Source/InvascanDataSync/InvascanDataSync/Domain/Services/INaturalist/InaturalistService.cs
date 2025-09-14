using InvascanDataSync.Domain.Models;
using InvascanDataSync.Domain.Models.Inaturalist;
using Microsoft.Extensions.Options;
using RestSharp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace InvascanDataSync.Domain.Services.INaturalist;


public class InaturalistService
{
    private readonly RestClient _client;
    private readonly InaturalistConfig config;

    public InaturalistService(IOptions<InaturalistConfig> options)
    {
        config = options.Value;
        _client = new RestClient(config.Endpoint);
    }

    public async Task<ObservationCollectionResponse?> FetchPyracanthaObservationAsync(int? page)
    {
        var request = new RestRequest("observations", Method.Get);
        request.AddParameter("taxon_id", config.TaxonId);
        request.AddParameter("photos", config.Photos);
        request.AddParameter("per_page", config.TotalPerPage);
        request.AddParameter("page", page ?? config.TotalPages);
        request.AddParameter("place_id", config.PlaceId);
        request.AddParameter("quality_grade", config.QualityGrade);

        ObservationCollectionResponse? collectionResponse = null;
        try
        {
            var response = await _client.ExecuteAsync(request);

            if (!response.IsSuccessful)
            {
                Console.WriteLine($"API error: {(int)response.StatusCode} {response.StatusDescription}");
                return collectionResponse;
            }

            if (string.IsNullOrWhiteSpace(response.Content))
            {
                Console.WriteLine("API returned no content.");
                return collectionResponse;
            }

            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            collectionResponse = JsonSerializer.Deserialize<ObservationCollectionResponse>(response.Content, options);
            
            return collectionResponse;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Exception caught: {ex.GetType().Name} – {ex.Message}");
            return null;
        }
    }

    public async Task<string> GetProvinceAsync(double latitude, double longitude)
    {
        try
        {
            var client = new RestClient("https://nominatim.openstreetmap.org");
            var request = new RestRequest("reverse", Method.Get);

            // Query parameters
            request.AddParameter("lat", latitude.ToString(System.Globalization.CultureInfo.InvariantCulture));
            request.AddParameter("lon", longitude.ToString(System.Globalization.CultureInfo.InvariantCulture));
            request.AddParameter("format", "json");
            request.AddParameter("addressdetails", "1");

            // Required by Nominatim
            request.AddHeader("User-Agent", "geoapi-invascan");

            // Send async request
            var response = await client.ExecuteAsync(request);

            if (!response.IsSuccessful)
            {
                Console.WriteLine($"Error: {response.StatusCode} - {response.Content}");
                return "Unallocated";
            }

            // Parse JSON
            using var doc = JsonDocument.Parse(response.Content!);
            var root = doc.RootElement;

            string province = "Unallocated";
            if (root.TryGetProperty("address", out JsonElement address))
            {
                if (address.TryGetProperty("state", out JsonElement state))
                {
                    province = state.GetString() ?? "Unallocated";
                }
            }

            // Debug print
            Console.WriteLine("\n=======================================================================");
            Console.WriteLine("get_province");
            Console.WriteLine($"response \t: {response.Content}");
            Console.WriteLine($"province \t: {province}");
            Console.WriteLine("=======================================================================\n");

            return province;
        }
        catch (Exception ex)
        {
            Console.WriteLine("\n=======================================================================");
            Console.WriteLine($"get_province error :- {ex.Message}");
            Console.WriteLine("=======================================================================\n");
            return "Unallocated";
        }
    }
}
