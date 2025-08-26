using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace InvascanDataSync.Data.Entities
{
    public class Detections
    {
        public Guid Id { get; set; }
        public string SpeciesName { get; set; }
        public string CommonName { get; set; }
        public float ConfidenceScore { get; set; } = 0.0f;
        public string DataSources { get; set; } = "Inaturalist";
        public Guid UserId { get; set; } = Guid.Parse("E17258B9-4287-45EE-8CC5-68752AC607E3");
        public Guid StatusId { get; set; } = Guid.Parse("AEFA556C-A285-4838-B54C-0CD8A50A3D37");
        public string NativeRegion { get; set; }
        public DateTime DetectedAt { get; set; }
    }
}
