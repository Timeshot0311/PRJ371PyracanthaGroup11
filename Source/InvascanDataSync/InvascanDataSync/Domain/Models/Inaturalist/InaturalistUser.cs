using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace InvascanDataSync.Domain.Models.Inaturalist;

public class InaturalistUser
{
    public int Id { get; set; }
    public string Login { get; set; }
    public string Name { get; set; }
    public string Icon { get; set; }
    public string Icon_url { get; set; }
}
