using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace InvascanDataSync.Data.Entities;

public class DetectionImages
{
    public Guid DetectionId { get; set; }
    public string ImageUrl { get; set; }
    public byte[] ImageData { get; set; }
    public DateTime UploadedAt { get; set; }
}
