using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace InvascanDataSync.Domain.Models;

public class GenericResponse
{
    public bool Status { get; set; }
    public int Code { get; set; }
    public string Message { get; set; }
}
