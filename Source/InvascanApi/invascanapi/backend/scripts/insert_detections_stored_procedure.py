from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def create_stored_procedure(session: AsyncSession):
    sp_invascan_add_detections_sql = text("""
    CREATE OR ALTER PROCEDURE  dbo.sp_invascan_add_detections
    (
        @id UNIQUEIDENTIFIER,
        @speciesName VARCHAR(255),
        @commonName VARCHAR(255),
        @confidenceScore FLOAT = NULL,
        @dataSource VARCHAR(255) = 'Inaturalist',
        @userId UNIQUEIDENTIFIER = 'E17258B9-4287-45EE-8CC5-68752AC607E3',
        @statusId UNIQUEIDENTIFIER = 'AEFA556C-A285-4838-B54C-0CD8A50A3D37',
        @nativeRegion VARCHAR(255) = NULL,
        @detectedAt DATETIME = NULL
    )
    AS 
    BEGIN
        SET NOCOUNT ON;
        DECLARE @status BIT, @code INT, @message VARCHAR(MAX)
        IF(EXISTS(SELECT * FROM dbo.Detections d WITH(NOLOCK) WHERE d.Id = @id))
        BEGIN
            SET @status = 0
            SET @code = 409
            SET @message = 'Detection with provided id already exists'
        END
        ELSE
        BEGIN
            INSERT INTO dbo.Detections(Id, SpeciesName, CommonName, ConfidenceScore, DataSources, UserId, StatusId, NativeRegion, DetectedAt)
            VALUES(@id, @speciesName, @commonName, @confidenceScore, @dataSource, @userId, @statusId, @nativeRegion, ISNULL(@detectedAt, GETDATE()))
            SET @status = 1
            SET @code = 200
            SET @message = 'Detection successfully created'
        END
        SELECT @status AS [Status], @code AS [Code], @message AS [Message]
    END    
    """)
    await session.execute(sp_invascan_add_detections_sql)



