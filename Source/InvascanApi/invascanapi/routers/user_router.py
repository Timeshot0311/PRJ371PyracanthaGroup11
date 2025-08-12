from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from invascanapi.backend.database import get_db
from invascanapi.backend.repositories.user_repository import UserRepository
from invascanapi.domain.models.requests.create_account import CreateAccount
from invascanapi.domain.models.responses.generic_api_response import GenericApiResponse
from invascanapi.domain.services.user_service import UserService

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.post("/", response_model=GenericApiResponse)
async def create_user(user: CreateAccount, db: AsyncSession = Depends(get_db)):
    service = UserService(UserRepository(db))
    return await service.create_user_account(user)


@router.post("/login", summary="User Login")
async def user_login(username: str, password: str, db: AsyncSession = Depends(get_db)):
    service = UserService(UserRepository(db))
    return await service.user_authentication(username, password)


# @router.get("/emails/{user_email}", response_model=AccountDetail)
# async def get_user(user_email: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
#     print(user_email)
#     service = UserService(UserRepository(db))
#     user = await service.get_user_account(user_email)
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")
#     return user