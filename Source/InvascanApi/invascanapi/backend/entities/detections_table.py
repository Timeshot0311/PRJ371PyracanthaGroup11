import datetime
import uuid

import pytz
from sqlalchemy import Column, String, DateTime, Date, Float, ForeignKey
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
from sqlalchemy.orm import relationship
from invascanapi.backend.utilz.datetime_extensions import gmt2_now

from invascanapi.backend.entities.base import Base




class Detections(Base):
    __tablename__ = "Detections"
    Id = Column(UNIQUEIDENTIFIER, primary_key=True, index=True, default=uuid.uuid4, nullable=False)
    SpeciesName = Column(String(255), unique=False, index=True, nullable=False)
    CommonName = Column(String(255), unique=False, index=True, nullable=False)
    ConfidenceScore = Column(Float, unique=False, index=True, nullable=True)
    DataSources = Column(String(255), unique=False, index=True, nullable=False, default="invascan")
    UserId = Column(
        UNIQUEIDENTIFIER,
        ForeignKey("Users.Id", name="FK_Detections_UserId"),
        index=True,
        nullable=True,
        default=None)
    User = relationship("Users", lazy="joined")  # eager load if needed
    StatusId = Column(
        UNIQUEIDENTIFIER,
        ForeignKey("DetectionStatus.Id", name="FK_Detections_StatusId"),
        index=True,
        nullable=False,
        default=uuid.UUID("8B721BD2-5A32-4F85-B5E4-D0979A5A82AF"))
    Status = relationship("DetectionStatus", lazy="joined")  # eager load if needed
    NativeRegion = Column(String(255), unique=False, index=True, nullable=True)

    DetectedAt = Column(DateTime, index=True, nullable=False, default=gmt2_now)