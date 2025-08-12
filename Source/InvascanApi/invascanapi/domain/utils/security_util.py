import bcrypt


class SecurityUtil:
    def __init__(self):
        pass

    async def hash_password(self, plain_password: str) -> dict[str, str]:
        password_salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(plain_password.encode('utf-8'), password_salt)
        # password = hashed_password.decode('utf-8')
        # salt = password_salt.decode('utf-8')
        return {
            "password": hashed_password.decode('utf-8'),
            "salt": password_salt.decode('utf-8'),
        }

    async def verify_password(self, plain_password: str, hashed_password: str, salt: str) -> bool:
        return bcrypt.hashpw(plain_password.encode(), salt.encode()) == hashed_password.encode()

