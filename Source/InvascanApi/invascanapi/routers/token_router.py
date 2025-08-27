from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from invascanapi.backend.database import get_db
from invascanapi.backend.repositories.user_repository import UserRepository
from invascanapi.domain.models.token_model import TokenResponseModel
from invascanapi.domain.services.user_service import UserService

router = APIRouter(prefix="/api", tags=["Token"])

@router.post("/token", summary="Generate Token", response_model=TokenResponseModel)
async def user_login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    service = UserService(UserRepository(db))
    return await service.user_authentication(form_data.username, form_data.password)
