using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace InvascanDataSync.Domain.Models
{
    public class InaturalistConfig
    {
        public string Endpoint { get; set; }
        public int TaxonId { get; set; }
        public bool Photos { get; set; }
        public int TotalPerPage { get; set; }
        public int TotalPages { get; set; }
        public int PlaceId { get; set; }
        public string QualityGrade { get; set; }
    }
}
