from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from invascanapi.backend.database import get_db
from invascanapi.backend.repositories.user_repository import UserRepository
from invascanapi.domain.models.account_details import AccountDetail
from invascanapi.domain.models.requests.create_account import CreateAccount
from invascanapi.domain.models.responses.generic_api_response import GenericApiResponse
from invascanapi.domain.models.token_model import TokenResponseModel
from invascanapi.domain.services.token_service import get_current_user
from invascanapi.domain.services.user_service import UserService

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.post("/", summary="Create User Account", response_model=GenericApiResponse[CreateAccount])
async def create_user(user: CreateAccount, db: AsyncSession = Depends(get_db)):
    service = UserService(UserRepository(db))
    return await service.create_user_account(user)


# @router.post("/login", summary="User Login")
# async def user_login(username: str, password: str, db: AsyncSession = Depends(get_db)):
#     service = UserService(UserRepository(db))
#     return await service.user_authentication(username, password)


@router.get("/{email}", summary="Get Registered User Details By Email Address", response_model=AccountDetail)
async def get_user_by_email(email: str, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    service = UserService(UserRepository(db))
    user = await service.get_user_details(email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="User not found", headers={"WWW-Authenticate": "Bearer"})
    return user


@router.get("/", summary="Get User Logged User Profile", response_model=AccountDetail)
async def get_user_profile(user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    service = UserService(UserRepository(db))
    user = await service.get_user_profile(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="User not found", headers={"WWW-Authenticate": "Bearer"})
    return user