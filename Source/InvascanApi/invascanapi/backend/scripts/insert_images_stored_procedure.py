from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def insert_images_stored_procedure(session: AsyncSession):
    sp_invascan_add_images_sql = text("""
        CREATE OR ALTER PROCEDURE dbo.sp_invascan_add_images
            @detectionId UNIQUEIDENTIFIER,
            @imageUrl NVARCHAR(1000),
            @imageData VARBINARY(MAX) = NULL
        AS
        BEGIN
            SET NOCOUNT ON;
            DECLARE @status BIT = 1, @code INT = 200, @message VARCHAR(MAX) = 'Successful'
            INSERT INTO Images (Id, DetectionId, ImageUrl, ImageData, UploadedAt)
            VALUES (NEWID(), @detectionId, @imageUrl, @imageData, GETDATE());
            SELECT @status AS [Status], @code AS [Code], @message AS [Message]
        END
        """)
    await session.execute(sp_invascan_add_images_sql)