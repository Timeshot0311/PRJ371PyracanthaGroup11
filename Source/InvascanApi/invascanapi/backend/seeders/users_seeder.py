import uuid
import logging

import bcrypt
from sqlalchemy import select, insert

from invascanapi.backend.entities.user_details_table import UserDetails
from invascanapi.backend.entities.users_table import Users

async def seed_admin_user(db):
    stmt = (select(Users).where(Users.EmailAddress == "invascan@gmail.com"))
    existing = await db.execute(stmt)
    if not existing.scalars().first():
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

    stmt2 = (select(Users).where(Users.EmailAddress == "inaturalist@gmail.com"))
    existing2 = await db.execute(stmt2)
    if not existing2.scalars().first():
        password2 = "1nv9sc9n"
        salt2 = bcrypt.gensalt()
        hashed_password2 = bcrypt.hashpw(password2.encode('utf-8'), salt2)
        user_dict2 = {
            "Id": uuid.UUID("E17258B9-4287-45EE-8CC5-68752AC607E3"),
            "Username": "inaturalist",
            "EmailAddress": "inaturalist@gmail.com",
            "RoleId": uuid.UUID("25232844-4158-4F87-963F-B5F68F98826F"),
            "PasswordHash": hashed_password2.decode("utf-8"),
            "PasswordSalt": salt2.decode("utf-8"),
            "IsActive": True,
        }
        await db.execute(insert(Users).values(**user_dict2))


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