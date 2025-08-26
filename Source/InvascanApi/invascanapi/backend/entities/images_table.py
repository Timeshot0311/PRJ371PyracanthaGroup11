import datetime
import uuid

from sqlalchemy import Column, String, DateTime, Date, Float, ForeignKey, PrimaryKeyConstraint, LargeBinary
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
from sqlalchemy.orm import relationship

from invascanapi.backend.entities.base import Base
from invascanapi.backend.utilz.datetime_extensions import gmt2_now


class Images(Base):
    __tablename__ = "Images"
    Id = Column(UNIQUEIDENTIFIER, primary_key=True, index=True, default=uuid.uuid4, nullable=False)
    DetectionId = Column(
        UNIQUEIDENTIFIER,
        ForeignKey("Detections.Id", name="FK_Images_DetectionId"),
        index=True,
        nullable=False)
    Detection = relationship("Detections", lazy="joined")  # eager load if needed
    ImageUrl = Column(String(1000), unique=False, index=True, nullable=False)
    ImageData = Column(LargeBinary, nullable=True)
    UploadedAt = Column(DateTime, index=True, nullable=False, default=gmt2_now)

    # ✅ Table-level constraints
    __table_args__ = (
        PrimaryKeyConstraint("Id", name="PK_Images_Id"),
        # PrimaryKeyConstraint("UserId", "RoleId", name="PK_UserRole_UserId_RoleId") #composite key
    )
