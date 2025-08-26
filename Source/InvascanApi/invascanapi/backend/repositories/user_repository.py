from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload

from invascanapi.backend.entities.user_details_table import UserDetails
from invascanapi.backend.entities.users_table import Users
from invascanapi.domain.models.responses.generic_backend_response import GenericBackendResponse


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_by_id(self, user_id: uuid.UUID):
        stmt = (select(Users).where(Users.Id == user_id))
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
            await self.db.rollback()
            return GenericBackendResponse(
                success=False,
                message= f"User details creation failed: {str(e)}",
                data=None,
                code= 500
            )