import datetime
import uuid

from sqlalchemy import Column, String, DateTime, Date, Float, ForeignKey, PrimaryKeyConstraint
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
from sqlalchemy.orm import relationship

from invascanapi.backend.entities.base import Base


class Validations(Base):
    __tablename__ = "Validations"
    Id = Column(UNIQUEIDENTIFIER, primary_key=True, index=True, default=uuid.uuid4, nullable=False)
    DetectionId = Column(
        UNIQUEIDENTIFIER,
        ForeignKey("Detections.Id", name="FK_Validations_DetectionId"),
        index=True,
        nullable=False)
    Detection = relationship("Detections", lazy="joined")  # eager load if needed
    DecisionId = Column(
        UNIQUEIDENTIFIER,
        ForeignKey("DetectionStatus.Id", name="FK_Validations_DecisionId"),
        index=True,
        nullable=False)
    Decision = relationship("DetectionStatus", lazy="joined")  # eager load if needed
    Comments = Column(Float, unique=False, index=True, nullable=False)
    ValidatedAt = Column(DateTime, index=True, nullable=False, default=datetime.datetime.utcnow)

    # ✅ Table-level constraints
    __table_args__ = (
        PrimaryKeyConstraint("Id", name="PK_Validations_Id"),
        # PrimaryKeyConstraint("UserId", "RoleId", name="PK_UserRole_UserId_RoleId") #composite key
    )
