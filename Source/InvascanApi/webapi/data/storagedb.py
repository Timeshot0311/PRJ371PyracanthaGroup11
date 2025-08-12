import uuid

import bcrypt
import pyodbc
import logging

from webapi.entities.UserAccount import UserAccount
from typing import Optional
import asyncio
from concurrent.futures import ThreadPoolExecutor

class UserRepository:
    def __init__(self):
        # === 🔐 Configuration variables (set them here) ===
        self.server = 'localhost,1406'
        self.database = 'InvascanDb'
        self.username = 'sa'
        self.password = 'G9e@7I4RiCT#'
        self.executor = ThreadPoolExecutor(max_workers=10)

        self.connection_string = (
            'DRIVER={ODBC Driver 17 for SQL Server};'
            f'SERVER={self.server};'
            f'DATABASE={self.database};'
            f'UID={self.username};'
            f'PWD={self.password};'
        )

    #region === STANDARD/SYNCHRONOUS DATABASE CALLS ===

    def _connect(self):
        try:
            return pyodbc.connect(self.connection_string)
        except pyodbc.Error as e:
            logging.error(f"Connection failed: {e}")
            raise



    def email_exists(self, email: str) -> bool:
        try:
            with self._connect() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT 1 FROM [dbo].[UserAccount] WHERE EmailAddress = ?", (email,))
                return cursor.fetchone() is not None
        except Exception as e:
            logging.error(f"Email check failed: {e}")
            return False  # fallback to safe side (treat as not existing)


    # === CREATE ===
    def create_user_account(self, user: UserAccount) -> str:

        if self.email_exists(user.email):
            logging.warning(f"User with email {user.email} already exists.")
            return f"User with email {user.email} already exists."

        try:
            user.id = uuid.uuid4()  # Generate a new UUID
            # Hash the password
            salt = bcrypt.gensalt()
            hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), salt)

            with self._connect() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    """INSERT INTO [dbo].[UserAccount] (
                        Id, Name, Surname, Gender, DateOfBirth, EmailAddress, Profession, Password, PasswordSalt, Status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (
                        str(user.id),
                        user.firstname,
                        user.lastname,
                        user.gender,
                        user.dob,
                        user.email,
                        user.profession,
                        # user.password,
                        # user.passwordsalt,
                        salt.decode('utf-8'),
                        hashed_password.decode('utf-8'),
                        str(user.status) if user.status else None,
                    )
                )
                conn.commit()
                logging.info(f"User created with Id {user.id}.")
                return f"User created with Id {user.id}."
        except Exception as e:
            logging.error(f"Create failed: {e}")
            return f"Create failed: {e}"


    # === GET ALL USERS ===
    def get_all_users(self):
        try:
            with self._connect() as conn:
                cursor = conn.cursor()
                cursor.execute("""SELECT * FROM [dbo].[UserAccount]""")
                rows = cursor.fetchall()
                users = [UserAccount(
                    id=uuid.UUID(row.Id),
                    firstname=row.Name,
                    lastname=row.Surname,
                    gender=row.Gender,
                    dob=row.DateOfBirth,
                    email=row.EmailAddress,
                    profession=row.Profession,
                    status=uuid.UUID(row.Status),
                    createdate=row.CreatedAt
                ) for row in rows]
                logging.info("Users retrieved.")
                return users
        except Exception as e:
            logging.error(f"Read failed: {e}")
            return []



    # === GET ALL USERS ===
    def authenticate_user(self, email, password) -> Optional[UserAccount]:
        try:
            with self._connect() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM [dbo].[UserAccount] WHERE EmailAddress = ?", (email,))
                row = cursor.fetchone()

                if not row:
                    logging.warning("Login failed: user not found.")
                    return None

                # Fetch stored hashed password and salt
                stored_hash = row.Password.encode('utf-8')
                input_password = password.encode('utf-8')

                # Check the password
                if bcrypt.checkpw(input_password, stored_hash):
                    logging.info(f"User {email} logged in successfully.")
                    return UserAccount(
                        id=uuid.UUID(row.Id),
                        firstname=row.Name,
                        lastname=row.Surname,
                        gender=row.Gender,
                        dob=row.DateOfBirth,
                        profession=row.Profession,
                        email=row.EmailAddress,
                        status=uuid.UUID(row.Status) if row.Status else None,
                        createdate=row.CreateDate
                    )
                else:
                    logging.warning("Login failed: incorrect password.")
                    return None
        except Exception as e:
            logging.error(f"Read failed: {e}")
            return None



    def update_user_account(self, user: UserAccount):
        try:
            with self._connect() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                               UPDATE [dbo].[UserAccount]
                               SET Name         = ?,
                                   Surname      = ?,
                                   Gender       = ?,
                                   DateOfBirth  = ?,
                                   Profession   = ?,
                                   EmailAddress = ?
                               WHERE Id = ?
                               """, (
                                   user.firstname,
                                   user.lastname,
                                   user.gender,
                                   user.dob,
                                   user.profession,
                                   user.email,
                                   str(user.id)
                               ))
                conn.commit()
                logging.info(f"User {user.email} updated.")
        except Exception as e:
            logging.error(f"Update failed: {e}")



    def change_user_account_status(self, user: UserAccount):
        try:
            with self._connect() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                               UPDATE [dbo].[UserAccount]
                               SET Status = ?
                               WHERE Id = ?
                               """, (
                                   str(user.status) if user.status else None,
                                   str(user.id)
                               ))
                conn.commit()
                logging.info(f"User {user.email} account status changed.")
        except Exception as e:
            logging.error(f"Update failed: {e}")

    #endregion


    #region === Async wrappers using run_in_executor ====

    async def email_exists_async(self, email: str) -> bool:
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(self.executor, self.email_exists, email)


    async def create_user_account_async(self, user: UserAccount) -> str:
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(self.executor, self.create_user_account, user)


    async def login_user_async(self, email: str, password: str) -> Optional[UserAccount]:
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(self.executor, self.authenticate_user, email, password)


    async def update_user_account_async(self, user: UserAccount):
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(self.executor, self.update_user_account, user)

    #endregion