import datetime
import uuid
from dataclasses import dataclass
from typing import Optional

@dataclass
class UserAccount:
    id: Optional[uuid.UUID] = None  # Optional for new users
    firstname: str = ''
    lastname: str = ''
    gender: str = ''
    dob: Optional[datetime.datetime] = None
    profession: str = ''
    email: str = ''
    password: str = ''
    passwordsalt: str = ''
    status: Optional[uuid.UUID] = None
    createdate: Optional[datetime.datetime] = None
