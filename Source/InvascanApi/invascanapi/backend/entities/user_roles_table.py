import uuid

from sqlalchemy import Column, String, DateTime, Date
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER

from invascanapi.backend.entities.base import Base

class UserRoles(Base):
    __tablename__ = "UserRoles"
    Id = Column(UNIQUEIDENTIFIER, primary_key=True, index=True, default=uuid.uuid4, nullable=False)
    Description = Column(String(255), unique=True, index=True, nullable=False)