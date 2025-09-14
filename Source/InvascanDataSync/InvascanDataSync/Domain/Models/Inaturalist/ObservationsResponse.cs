using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace InvascanDataSync.Domain.Models.Inaturalist;

public class ObservationsResponse
{
    public string Quality_grade { get; set; }
    public DateTime? Time_observed_at { get; set; }
    public string Uuid { get; set; }
    public int Id { get; set; }
    public bool Identifications_most_agree { get; set; }
    public string Species_guess { get; set; }
    public Taxon Taxon { get; set; }
    public string Uri { get; set; }
    public string Location { get; set; }
    public InaturalistUser User { get; set; }
    public string Place_guess { get; set; }
    public List<Photo> Photos { get; set; }
}



public class ObservationCollectionResponse
{
    public List<ObservationsResponse> Results { get; set; }
}

