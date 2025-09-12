import logging
import uuid

import bcrypt
from fastapi import HTTPException, status

from invascanapi.backend.entities.user_feedback_comment_table import UserFeedbackComment
from invascanapi.backend.entities.user_feedback_table import UserFeedback
from invascanapi.backend.repositories.community_repository import CommunityRepository
from invascanapi.backend.repositories.user_repository import UserRepository
from invascanapi.backend.entities.users_table import Users
from invascanapi.backend.entities.user_details_table import UserDetails
from invascanapi.domain.models.account_details import AccountDetail
from invascanapi.domain.models.requests.create_account import CreateAccount
from invascanapi.domain.models.requests.create_user_feedback import CreateUserFeedback, CreateUserFeedbackComment
from invascanapi.domain.models.responses.generic_api_response import GenericApiResponse
from invascanapi.domain.models.token_model import TokenResponseModel
from invascanapi.domain.utils.security_util import SecurityUtil
from invascanapi.domain.utils.jwt_token_util import JwtTokenUtil


class UserService:
    def __init__(self, repository: UserRepository):
        self.repository = repository

    async def get_user_account(self, user_email: str):
        return await self.repository.get_user_by_email(user_email)


    async def get_user_details(self, user_email: str) -> AccountDetail | None:
        user = await self.repository.get_user_details(user_email)
        if user is None:
            return None

        user_details = AccountDetail(
            userId = user.User.Id,
            firstname = user.Firstname,
            lastname = user.Lastname,
            emailAddress = user.User.EmailAddress,
            username = user.User.Username,
            phoneNumber = user.PhoneNumber,
            location = user.Location,
            experienceLevel = user.ExperienceLevel,
            privacySetting = user.PrivacySetting,
            imageSharingConsent = user.ImageSharingConsent,
            role = user.User.Role.Description
        )
        print(f"========================================")
        print(f"Id \t:\t\t {user.User.Id}")
        print(f"Name \t:\t\t {user.Firstname}")
        print(f"Surname \t:\t\t {user.Lastname}")
        print(f"Email \t:\t\t {user.User.EmailAddress}")
        print(f"Role \t:\t\t {user.User.Role.Description}")
        print(f"========================================")
        return user_details


    async def get_user_profile(self, user_id: str) -> AccountDetail | None:
        user_uid = uuid.UUID(user_id)
        user = await self.repository.get_user_profile(user_uid)
        if user is None:
            return None

        user_details = AccountDetail(
            userId=user.User.Id,
            firstname=user.Firstname,
            lastname=user.Lastname,
            emailAddress=user.User.EmailAddress,
            username=user.User.Username,
            phoneNumber=user.PhoneNumber,
            location=user.Location,
            experienceLevel=user.ExperienceLevel,
            privacySetting=user.PrivacySetting,
            imageSharingConsent=user.ImageSharingConsent,
            role=user.User.Role.Description
        )
        return user_details


    async def user_authentication(self, email: str, password: str) -> TokenResponseModel:
        security = SecurityUtil()
        token = JwtTokenUtil()
        user = await self.repository.user_login_async(email)
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail="Incorrect username or password", headers={"WWW-Authenticate": "Bearer"})

        verified = security.verify_password(password, user.PasswordHash, user.PasswordSalt)
        if not user or not verified:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail="Incorrect username or password", headers={"WWW-Authenticate": "Bearer"})

        access_token = token.create_access_token(data={
            "sub": str(user.Id),
            "email": str(user.EmailAddress),
            "role": user.Role.Description
        })
        return TokenResponseModel(
            access_token=access_token,
            token_type="Bearer",
        )


    async def create_user_account(self, user_data: CreateAccount) -> GenericApiResponse[CreateAccount]:
        try:
            logging.error(f"user email: {user_data.email}")
            existing_user = await self.repository.get_user_by_email(user_data.email)
            if existing_user:
                return GenericApiResponse(status=False, statusCode=status.HTTP_400_BAD_REQUEST, statusMessage='Email already registered')

            existing_user = await self.repository.get_user_by_username(user_data.username)
            if existing_user:
                return GenericApiResponse(status=False, statusCode=status.HTTP_400_BAD_REQUEST, statusMessage='Username already registered')

            user_id = uuid.uuid4()  # Generate a new UUID
            # Hash the password
            salt = bcrypt.gensalt()
            hashed_password = bcrypt.hashpw(user_data.password.encode('utf-8'), salt)
            user = Users(
                Id = user_id,
                Username = user_data.username,
                EmailAddress = user_data.email,
                PasswordHash = hashed_password.decode('utf-8'),
                PasswordSalt = salt.decode('utf-8'),
                RoleId = user_data.roleId,
            )
            response = await self.repository.create_user(user)
            if not response.success:
                #user details
                return GenericApiResponse(status=False, statusCode=status.HTTP_400_BAD_REQUEST, statusMessage=response.message)

            user_detail = UserDetails(
                Id=user_id,
                UserId=response.dynamicModel.Id,
                Firstname=user_data.firstname,
                Lastname=user_data.lastname,
                PhoneNumber=user_data.phoneNumber,
                Location=user_data.location,
                ExperienceLevel=user_data.experienceLevel,
                PrivacySetting=user_data.privacySetting,
                ImageSharingConsent=user_data.imageSharingConsent,
            )
            await self.repository.create_user_details(user_detail)
            return GenericApiResponse(status=True, statusCode=status.HTTP_200_OK, statusMessage='User account created successful')
        except Exception as e:
            logging.error(f"Create failed: {e}")
            return GenericApiResponse(status=False, statusCode=status.HTTP_500_INTERNAL_SERVER_ERROR, statusMessage=f'{e}')

