from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from urllib.parse import quote_plus

from sqlalchemy import create_engine, text
import urllib
import logging



# server = 'mssql_container' #docker deployment
# port = '1433' #docker deployment
server = 'localhost'
port = '1406'
database = 'InvascanDb'
username = quote_plus("sa")
password = quote_plus("G9e@7I4RiCT#")
driver = '{ODBC Driver 17 for SQL Server}'
DATABASE_URL = f"""mssql+aioodbc://{username}:{password}@{server},{port}/{database}?driver=ODBC+Driver+17+for+SQL+Server&TrustServerCertificate=yes"""

engine = create_async_engine(DATABASE_URL, echo=True, future=True)

AsyncSessionLocal = sessionmaker[AsyncSession](bind = engine, expire_on_commit = False, class_ = AsyncSession)


def create_database_if_not_exists():
    params = urllib.parse.quote_plus(
        f"DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={server},{port};DATABASE=master;UID={username};PWD={password}"
    )
    engine = create_engine(f"mssql+pyodbc:///?odbc_connect={params}")
    with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
        conn.execute(text(f"""
            IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = '{database}')
            BEGIN
                CREATE DATABASE [{database}]
            END
        """))
        logging.info(f"✅ Database '{database}' is ready.")


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session