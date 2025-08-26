-- Wait for the SQL Server to be ready
WAITFOR DELAY '00:00:15';

-- Create database
USE [master]
GO
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'INVASCAN')
BEGIN
    CREATE DATABASE [INVASCAN]
END
GO

-- Switch to INVASCAN database
USE [INVASCAN]
GO

-- Create a sample table for demonstration
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ScanResults]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ScanResults](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [ScanDate] [datetime] NOT NULL,
        [DeviceId] [varchar](50) NOT NULL,
        [Status] [varchar](20) NOT NULL,
        [Results] [nvarchar](max) NULL,
        CONSTRAINT [PK_ScanResults] PRIMARY KEY CLUSTERED 
        (
            [Id] ASC
        )
    )
END
GO

-- Insert sample data
INSERT INTO [dbo].[ScanResults] ([ScanDate], [DeviceId], [Status], [Results])
VALUES 
    (GETDATE(), 'DEVICE001', 'Completed', '{"scan_quality": "high", "findings": ["normal"]}'),
    (GETDATE(), 'DEVICE002', 'Completed', '{"scan_quality": "medium", "findings": ["abnormal"]}'),
    (GETDATE(), 'DEVICE003', 'Failed', NULL)
GO

-- Create a user for the application
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = N'invascan_user')
BEGIN
    CREATE USER [invascan_user] WITH PASSWORD = 'SecurePassword123!'
    
    -- Grant permissions
    EXEC sp_addrolemember 'db_datareader', 'invascan_user'
    EXEC sp_addrolemember 'db_datawriter', 'invascan_user'
END
GO

PRINT 'Database initialization completed successfully.'
GO