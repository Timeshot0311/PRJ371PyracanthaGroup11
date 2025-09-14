using Dapper;
using InvascanDataSync.Data.Entities;
using InvascanDataSync.Domain.Models;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace InvascanDataSync.Data.Repositories;

public class InvascanRepository
{
    #region -- protected properties --
    protected readonly InvascanDbContext database;
    protected readonly ILogger<InvascanRepository> logger;

    #endregion

    public InvascanRepository(InvascanDbContext database, ILogger<InvascanRepository> logger)
    {
        this.database = database;
        this.logger = logger;
    }


    public async Task<GenericResponse> AddDetection(Detections detections)
    {
        GenericResponse response = new GenericResponse();
        try
        {
            using (var db = database.CreateSqlConnection())
            {
                await db.OpenAsync();
                using (var trans = db.BeginTransaction(IsolationLevel.ReadCommitted))
                {
                    try
                    {
                        string query = "dbo.sp_invascan_add_detections";
                        var parameters = new DynamicParameters();
                        parameters.Add("id", detections.Id, DbType.Guid);
                        parameters.Add("speciesName", detections.SpeciesName, DbType.String);
                        parameters.Add("commonName", detections.CommonName, DbType.String);
                        parameters.Add("confidenceScore", detections.ConfidenceScore, DbType.Double);
                        parameters.Add("dataSource", detections.DataSources, DbType.String);
                        parameters.Add("userId", detections.UserId, DbType.Guid);
                        parameters.Add("statusId", detections.StatusId, DbType.Guid);
                        parameters.Add("nativeRegion", detections.NativeRegion, DbType.String);
                        parameters.Add("detectedAt", detections.DetectedAt, DbType.DateTime);

                        response = await db.QueryFirstOrDefaultAsync<GenericResponse>(sql: query, 
                            param: parameters,
                            transaction: trans, 
                            commandType: CommandType.StoredProcedure, 
                            commandTimeout: 0);

                        trans.Commit();
                    }
                    catch (Exception ex)
                    {
                        trans.Rollback();
                        await db.CloseAsync();
                        throw ex;
                    }
                }
                await db.CloseAsync();
            }
        }
        catch (Exception ex)
        {
            response.Status = false;
            response.Code = 500;
            response.Message = ex.Message;
        }
        return response;
    }


    public async Task<GenericResponse> AddGeoCoordinates(GeoData location)
    {
        GenericResponse response = new GenericResponse();
        try
        {
            using (var db = database.CreateSqlConnection())
            {
                await db.OpenAsync();
                using (var trans = db.BeginTransaction(IsolationLevel.ReadCommitted))
                {
                    try
                    {
                        string query = "dbo.sp_invascan_add_geodata";
                        var parameters = new DynamicParameters();
                        parameters.Add("detectionId", location.DetectionId, DbType.Guid);
                        parameters.Add("latitude", location.Latitude, DbType.Double);
                        parameters.Add("longitude", location.Longitude, DbType.Double);
                        parameters.Add("province", location.Province, DbType.String);
                        parameters.Add("placename", location.Placename, DbType.String);
                        parameters.Add("createdAt", location.CreatedAt, DbType.DateTime);

                        await db.QueryAsync(sql: query,
                            param: parameters,
                            transaction: trans,
                            commandType: CommandType.StoredProcedure,
                            commandTimeout: 0);

                        trans.Commit();
                    }
                    catch (Exception ex)
                    {
                        trans.Rollback();
                        await db.CloseAsync();
                        throw ex;
                    }
                }
                await db.CloseAsync();
            }
        }
        catch (Exception ex)
        {
            response.Status = false;
            response.Code = 500;
            response.Message = ex.Message;
        }
        return response;
    }





    public async Task<GenericResponse> AddImages(DetectionImages image)
    {
        GenericResponse response = new GenericResponse();
        try
        {
            using (var db = database.CreateSqlConnection())
            {
                await db.OpenAsync();
                using (var trans = db.BeginTransaction(IsolationLevel.ReadCommitted))
                {
                    try
                    {
                        string query = "dbo.sp_invascan_add_images";
                        var parameters = new DynamicParameters();
                        parameters.Add("detectionId", image.DetectionId, DbType.Guid);
                        parameters.Add("imageUrl", image.ImageUrl, DbType.String);
                        parameters.Add("imageData", image.ImageData, DbType.String);

                        await db.QueryAsync(sql: query,
                            param: parameters,
                            transaction: trans,
                            commandType: CommandType.StoredProcedure,
                            commandTimeout: 0);
                        trans.Commit();
                    }
                    catch (Exception ex)
                    {
                        trans.Rollback();
                        await db.CloseAsync();
                        throw ex;
                    }
                }
                await db.CloseAsync();
            }
        }
        catch (Exception ex)
        {
            response.Status = false;
            response.Code = 500;
            response.Message = ex.Message;
        }
        return response;
    }

}
