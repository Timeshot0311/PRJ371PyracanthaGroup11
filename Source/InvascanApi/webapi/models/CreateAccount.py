import datetime
import uuid
from typing import Optional

from pydantic import BaseModel

class CreateAccount(BaseModel):
    id: Optional[uuid.UUID] = None  # Optional for new users
    firstname: str = ''
    lastname: str = ''
    gender: str = ''
    dob: Optional[datetime.datetime] = None
    profession: str = ''
    email: str = ''
    password: str = ''
    status: Optional[uuid.UUID] = None
    createdate: Optional[datetime.datetime] = None