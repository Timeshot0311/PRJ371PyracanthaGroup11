import datetime
import uuid

from sqlalchemy import Column, String, DateTime, Date, ForeignKey, PrimaryKeyConstraint, Boolean
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
from sqlalchemy.orm import relationship

from invascanapi.backend.entities.base import Base


#table for user authentication
class Users(Base):
    __tablename__ = "Users"

    Id = Column(UNIQUEIDENTIFIER, primary_key=True, index=True, default=uuid.uuid4, nullable=False)
    Username = Column(String(255), unique=True, index=True, nullable=False)
    EmailAddress = Column(String(255), unique=True, index=True, nullable=False)
    RoleId = Column(
        UNIQUEIDENTIFIER,
        ForeignKey("UserRoles.Id", name="FK_Users_RoleId"),
        index=True,
        nullable=False,
        default=uuid.UUID("490FEF64-F752-4A67-A5E6-4CFF0896536A"))
    Role = relationship("UserRoles", lazy="joined")  # eager load if needed
    PasswordHash = Column(String, nullable=False)
    PasswordSalt = Column(String, nullable=False)
    CreatedAt = Column(DateTime, index=True, nullable=False, default=datetime.datetime.utcnow)
    LastLogin = Column(DateTime, index=True, nullable=True)
    IsActive = Column(Boolean, index=True, nullable=False, default=True)

    # ✅ Table-level constraints
    __table_args__ = (
        PrimaryKeyConstraint("Id", name="PK_Users_Id"),
        #PrimaryKeyConstraint("UserId", "RoleId", name="PK_UserRole_UserId_RoleId") #composite key
    )