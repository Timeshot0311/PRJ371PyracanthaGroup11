import uuid
import logging

import bcrypt
from sqlalchemy import select, insert

from invascanapi.backend.entities.user_details_table import UserDetails
from invascanapi.backend.entities.users_table import Users

async def seed_admin_user(db):

    # Check if already seeded
    # existing = await db.execute(select(Users))
    # if existing.scalars().first():
    #     return  # already seeded

    stmt = (select(Users).where(Users.EmailAddress == "invascan@gmail.com"))
    existing = await db.execute(stmt)
    # db_user = existing.first()
    if existing.scalars().first():
        return  # already seeded

    password = "1nv9sc9n"
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    user_dict = {
        "Id": uuid.UUID("2b9d35f8-97e6-47f0-a033-d5675d6344b6"),
        "Username": "invascan",
        "EmailAddress": "invascan@gmail.com",
        "RoleId": uuid.UUID("25232844-4158-4F87-963F-B5F68F98826F"),
        "PasswordHash": hashed_password.decode("utf-8"),
        "PasswordSalt": salt.decode("utf-8"),
        "IsActive": True,
    }
    await db.execute(insert(Users).values(**user_dict))
    # await db.commit()


async def seed_admin_user_details(db):
    try:
        stmt = (select(Users).where(Users.EmailAddress == "invascan@gmail.com"))
        existing = await db.execute(stmt)
        db_user = existing.first()

        print(f"\n\n=======================================================================")
        print(f"query :- {stmt}")
        print(f"db_user: {db_user}")
        logging.info(f"db_user: {db_user}")
        print(f"=======================================================================\n\n")

        if db_user:
            user_detail_dict = {
                "Id": uuid.UUID("2b9d35f8-97e6-47f0-a033-d5675d6344b6"),
                "UserId": db_user.Id,
                "Firstname": "Invascan",
                "Lastname": "Administrator",
                "PhoneNumber": "0000000000",
                "Location": "Invascan Offices",
                "ImageSharingConsent": False
            }
            stmt = (select(UserDetails).where(UserDetails.Id == user_detail_dict["Id"]))
            existing = await db.execute(stmt)
            # db_user = existing.first()
            if existing.scalars().first():
                return  # already seeded
            await db.execute(insert(UserDetails).values(**user_detail_dict))
            # await db.commit()
    except Exception as e:
        print(f"seed_admin_user_details error :- {e}")