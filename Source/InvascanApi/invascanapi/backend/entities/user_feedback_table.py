import uuid

from sqlalchemy import Column, String, DateTime, Date, ForeignKey, Float
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
from sqlalchemy.orm import relationship

from invascanapi.backend.entities.base import Base
from invascanapi.backend.utilz.datetime_extensions import gmt2_now


class UserFeedback(Base):
    __tablename__ = "UserFeedback"
    Id = Column(UNIQUEIDENTIFIER, primary_key=True, index=True, default=uuid.uuid4, nullable=False)
    UserId = Column(
        UNIQUEIDENTIFIER,
        ForeignKey("Users.Id", name="FK_UserFeedback_UserId"),
        index=True,
        nullable=False)
    User = relationship("Users", lazy="joined", back_populates="Feedbacks")  # eager load if needed
    FeedbackComments = relationship("UserFeedbackComment", back_populates="Feedback", uselist=False)
    Comments = Column(String(255), unique=False, index=True, nullable=False, default="")
    Ratings = Column(Float, unique=False, index=True, nullable=False, default=0)
    CreatedAt = Column(DateTime, index=True, nullable=False, default=gmt2_now)

