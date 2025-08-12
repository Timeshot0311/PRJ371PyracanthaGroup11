import datetime
import uuid

from sqlalchemy import Column, String, DateTime, Date, Float, ForeignKey, PrimaryKeyConstraint
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
from sqlalchemy.orm import relationship

from invascanapi.backend.entities.base import Base


class GeoData(Base):
    __tablename__ = "GeoData"
    Id = Column(UNIQUEIDENTIFIER, primary_key=True, index=True, default=uuid.uuid4, nullable=False)
    DetectionId = Column(
        UNIQUEIDENTIFIER,
        ForeignKey("Detections.Id", name="FK_GeoData_DetectionId"),
        index=True,
        nullable=False)
    Status = relationship("Detections", lazy="joined")  # eager load if needed
    Latitude = Column(Float, unique=False, index=True, nullable=False)
    Longitude = Column(Float, unique=False, index=True, nullable=False)
    Province = Column(String(500), unique=False, index=True, nullable=False)
    Placename = Column(String(500), unique=False, index=True, nullable=True)

    # ✅ Table-level constraints
    __table_args__ = (
        PrimaryKeyConstraint("Id", name="PK_GeoData_Id"),
        # PrimaryKeyConstraint("UserId", "RoleId", name="PK_UserRole_UserId_RoleId") #composite key
    )
