import datetime
import uuid

from sqlalchemy import Column, String, DateTime, Date, ForeignKey, PrimaryKeyConstraint, Boolean
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
from sqlalchemy.orm import relationship

from invascanapi.backend.entities.base import Base


#table for user authentication
class UserDetails(Base):
    __tablename__ = "UserDetails"

    Id = Column(UNIQUEIDENTIFIER, primary_key=True, index=True, default=uuid.uuid4, nullable=False)
    UserId = Column(
        UNIQUEIDENTIFIER,
        ForeignKey("Users.Id", name="FK_UserDetails_UserId"),
        index=True,
        nullable=False)
    User = relationship("Users", lazy="joined")  # eager load if needed
    Firstname = Column(String(255), index=True, nullable=False)
    Lastname = Column(String(255), index=True, nullable=False)
    PhoneNumber = Column(String(255), index=True, nullable=True)
    Location = Column(String(255), index=True, nullable=True)
    ExperienceLevel = Column(String(255), index=True, nullable=False, default="beginner")#‘beginner’, ‘intermediate’, ‘advance’, ‘expert’
    PrivacySetting = Column(String(255), index=True, nullable=False, default="public")#'public', 'friends','private'
    UpdatedAt = Column(DateTime, index=True, nullable=True)
    ImageSharingConsent = Column(Boolean, nullable=True)

    # ✅ Table-level constraints
    __table_args__ = (
        PrimaryKeyConstraint("Id", name="PK_UserDetails_Id"),
        #PrimaryKeyConstraint("UserId", "RoleId", name="PK_UserRole_UserId_RoleId") #composite key
    )