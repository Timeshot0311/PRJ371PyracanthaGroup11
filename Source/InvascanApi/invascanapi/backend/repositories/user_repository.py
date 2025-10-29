from __future__ import annotations

import uuid

from sqlalchemy import or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload

from invascanapi.backend.entities.user_details_table import UserDetails
from invascanapi.backend.entities.user_feedback_comment_table import UserFeedbackComment
from invascanapi.backend.entities.user_feedback_table import UserFeedback
from invascanapi.backend.entities.user_roles_table import UserRoles
from invascanapi.backend.entities.users_table import Users
from invascanapi.domain.models.responses.generic_backend_response import GenericBackendResponse


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_by_id(self, user_id: uuid.UUID):
        stmt = (select(Users).where(Users.Id == user_id))
        result = await self.db.execute(stmt)
        return result.scalars().first()


    async def get_user_profile(self, user_id: uuid.UUID):
        stmt = (
            select(UserDetails, Users, UserRoles)
            .join(Users, Users.Id == UserDetails.UserId)
            .join(UserRoles, UserRoles.Id == Users.RoleId)
            .where(Users.Id == user_id)
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()


    async def get_user_by_email(self, user_email: str) -> Users | None:
        stmt = (
            select(Users)
            .options(joinedload(Users.Role))  # eager load status
            .where(Users.EmailAddress == user_email)
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()


    async def user_login_async(self, username: str) -> Users | None:
        stmt = (
            select(Users)
            .options(joinedload(Users.Role))  # eager load status
            #.where(Users.EmailAddress == username or Users.Username == username)
            .where(
                or_(
                    Users.EmailAddress == username,
                    Users.Username == username
                )
            )
        )
        result = await self.db.execute(stmt)
        user = result.scalars().first()

        print(f"\n\n=======================================================================")
        print(f"user_login_async username :- {username}")
        print(f"user_login_async stmt :- {stmt}")
        print(f"user_login_async result :- {result}")
        print(f"user_login_async user :- {user}")
        print(f"=======================================================================\n\n")

        return user


    async def get_user_details(self, user_email: str):
        stmt = (
            select(UserDetails, Users, UserRoles)
            .join(Users, Users.Id == UserDetails.UserId)
            .join(UserRoles, UserRoles.Id == Users.RoleId)
            .where(Users.EmailAddress == user_email)
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()


    async def get_user_by_username(self, username: str) -> Users | None:
        stmt = (
            select(Users)
            .options(joinedload(Users.Role))  # eager load status
            .where(Users.Username == username)
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()


    async def create_user(self, user: Users) -> GenericBackendResponse[Users]:
        try:
            self.db.add(user)
            await self.db.commit()
            await self.db.refresh(user)
            return GenericBackendResponse(
                success = True,
                message = "User created",
                data= user,
                code= 200
            )
        except Exception as e:
            print(f"\n\n=======================================================================")
            print(f"create_user error :- {e}")
            print(f"=======================================================================\n\n")
            await self.db.rollback()
            return GenericBackendResponse(
                success=False,
                message= f"User creation failed: {str(e)}",
                data=None,
                code= 500
            )


    async def create_user_details(self, user_details: UserDetails) -> GenericBackendResponse[UserDetails]:
        try:
            self.db.add(user_details)
            await self.db.commit()
            await self.db.refresh(user_details)
            return GenericBackendResponse(
                success=True,
                message="User details created successful",
                data=user_details,
                code= 200
            )
        except Exception as e:
            print(f"\n\n=======================================================================")
            print(f"create_user_details error :- {e}")
            print(f"=======================================================================\n\n")
            await self.db.rollback()
            return GenericBackendResponse(
                success=False,
                message= f"User details creation failed: {str(e)}",
                data=None,
                code= 500
            )


    async  def change_password(self, user_id: uuid.UUID, password_hash: str, password_salt:str) -> GenericBackendResponse[None]:
        try:
            print(f"\n\n=======================================================================")
            print(f"change_password user id :- {user_id}")
            print(f"=======================================================================\n\n")

            user = await self.get_user_by_id(user_id)

            print(f"\n\n=======================================================================")
            print(f"change_password user :- {user}")
            print(f"=======================================================================\n\n")
            if not user:
                return GenericBackendResponse(
                    success=False,
                    message="Changed password failed due to user not found",
                    data=None,
                    code=404
                )
            user.PasswordHash = password_hash
            user.PasswordSalt = password_salt
            await self.db.commit()
            await self.db.refresh(user)
            return GenericBackendResponse(
                success = True,
                message = "Successfully changed password",
                data= None,
                code= 200
            )
        except Exception as e:
            print(f"\n\n=======================================================================")
            print(f"change_password error :- {e}")
            print(f"=======================================================================\n\n")
            await self.db.rollback()
            return GenericBackendResponse(
                success=False,
                message= f"Password change failed: {str(e)}",
                data=None,
                code= 500
            )
