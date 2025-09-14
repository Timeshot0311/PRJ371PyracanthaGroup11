from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def insert_geodata_stored_procedure(session: AsyncSession):
    sp_invascan_add_geodata_sql = text("""
        CREATE OR ALTER PROCEDURE dbo.sp_invascan_add_geodata
        (
            @detectionId UNIQUEIDENTIFIER,
            @latitude FLOAT,
            @longitude FLOAT,
            @province NVARCHAR(500),
            @placename NVARCHAR(500) = NULL,
            @createdAt DATETIME = NULL
        )
        AS
        BEGIN
            SET NOCOUNT ON;
            DECLARE @status BIT = 1, @code INT = 200, @message VARCHAR(MAX) = 'Successful'
            INSERT INTO GeoData (Id, DetectionId, Latitude, Longitude, Province, Placename, CreatedAt)
            VALUES (NEWID(), @detectionId, @latitude, @longitude, @province, @placename, ISNULL(@createdAt, GETDATE()));
            SELECT @status AS [Status], @code AS [Code], @message AS [Message]
        END
        """)
    await session.execute(sp_invascan_add_geodata_sql)