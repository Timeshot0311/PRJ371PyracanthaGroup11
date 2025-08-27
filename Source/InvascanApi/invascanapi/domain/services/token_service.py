from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from invascanapi.domain.utils.jwt_token_util import JwtTokenUtil

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        jwt = JwtTokenUtil()
        payload = jwt.verify_access_token(token)
        user_id = payload.get("sub")
        user_email = payload.get("email")
        user_role = payload.get("role")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
