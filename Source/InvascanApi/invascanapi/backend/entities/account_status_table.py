import uuid

from sqlalchemy import Column, String, DateTime, Date
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER

from invascanapi.backend.entities.base import Base

class AccountStatus(Base):
    __tablename__ = "AccountStatus"
    Id = Column(UNIQUEIDENTIFIER, primary_key=True, index=True, default=uuid.uuid4, nullable=False)
    Description = Column(String(255), unique=True, index=True, nullable=False)