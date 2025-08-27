from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from typing import Optional


# Configuration
SECRET_KEY = "MWi3tACe0wOdu#On"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60*8  # 1 hour

class JwtTokenUtil:
    def __init__(self):
        pass

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


    def verify_access_token(self, token: str) -> dict:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload  # contains 'sub' or other user data
        except JWTError:
            raise ValueError("Invalid token")