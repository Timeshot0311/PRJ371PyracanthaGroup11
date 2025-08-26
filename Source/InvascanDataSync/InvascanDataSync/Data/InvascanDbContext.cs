using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace InvascanDataSync.Data;

public class InvascanDbContext
{
    #region -- protected properties --
    protected readonly IConfiguration configuration;
    protected readonly string connectionString;
    #endregion

    public InvascanDbContext(IConfiguration configuration)
    {
        this.configuration = configuration;
        connectionString = configuration.GetConnectionString("InvascanDb");
    }


    public SqlConnection CreateSqlConnection() => new SqlConnection(connectionString);
}
