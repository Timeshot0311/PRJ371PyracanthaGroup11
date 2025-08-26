using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace InvascanDataSync.Data.Entities;

public class GeoData
{
    public Guid DetectionId { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string Province { get; set; }
    public string Placename { get; set; }
    public DateTime CreatedAt { get; set; }
}
