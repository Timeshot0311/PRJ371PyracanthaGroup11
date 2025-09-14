from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from invascanapi.backend.database import get_db, AsyncSessionLocal
from invascanapi.backend.repositories.community_repository import CommunityRepository
from invascanapi.backend.repositories.user_repository import UserRepository
from invascanapi.domain.models.account_details import AccountDetail
from invascanapi.domain.models.requests.create_account import CreateAccount
from invascanapi.domain.models.requests.create_user_feedback import CreateUserFeedback, CreateUserFeedbackComment
from invascanapi.domain.models.responses.generic_api_response import GenericApiResponse
from invascanapi.domain.models.token_model import TokenResponseModel
from invascanapi.domain.services.community_service import CommunityService
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



@router.post("/community/post", summary="Post user feedback", response_model=GenericApiResponse[CreateUserFeedback])
async def user_feedback(feedback:CreateUserFeedback, user_id: str = Depends(get_current_user)):
    service = CommunityService(CommunityRepository(AsyncSessionLocal))
    return await service.add_user_feedback(user_id, feedback)

@router.get("/community/posts", summary="Get posted user feedbacks", response_model=GenericApiResponse[list[dict]])
async def get_user_feedbacks(user_id: str = Depends(get_current_user)):
    service = CommunityService(CommunityRepository(AsyncSessionLocal))
    return await service.get_all_user_feedbacks()


@router.get("/community/user/posts", summary="Get current logged in user posted feedbacks", response_model=GenericApiResponse[list[dict]])
async def get_user_feedbacks_by_id(user_id: str = Depends(get_current_user)):
    service = CommunityService(CommunityRepository(AsyncSessionLocal))
    return await service.get_user_feedbacks_by_id(user_id)


@router.post("/community/post/comment", summary="Post user feedback comment", response_model=GenericApiResponse[CreateUserFeedbackComment])
async def user_feedback_comment(feedback_comment:CreateUserFeedbackComment, user_id: str = Depends(get_current_user)):
    service = CommunityService(CommunityRepository(AsyncSessionLocal))
    return await service.add_user_feedback_comment(user_id, feedback_comment)


@router.get("/community/posts/comments", summary="Get posted feedback comments", response_model=GenericApiResponse[list[dict]])
async def get_user_feedback_comments(feedback_id:str, user_id: str = Depends(get_current_user)):
    service = CommunityService(CommunityRepository(AsyncSessionLocal))
    return await service.get_user_feedback_comments(feedback_id)

