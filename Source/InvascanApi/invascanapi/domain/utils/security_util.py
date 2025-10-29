import bcrypt


class SecurityUtil:
    def __init__(self):
        pass

    async def hash_password(self, plain_password: str) -> dict[str, str]:
        password_salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(plain_password.encode('utf-8'), password_salt)
        return {
            "password": hashed_password.decode('utf-8'),
            "salt": password_salt.decode('utf-8'),
        }

    async def verify_password(self, plain_password: str, hashed_password: str, salt: str) -> bool:
        # encoded_password = plain_password.encode()
        # encoded_salt = salt.encode()
        # encoded_hash = hashed_password.encode()
        # hashed_input = bcrypt.hashpw(plain_password.encode('utf-8'), salt.encode('utf-8'))
        # verified = hashed_input.decode('utf-8') == hashed_password
        # verified_reco = bcrypt.checkpw(plain_password.encode(), hashed_password.encode())

        # ✅ Verify (no need to pass custom salt again)
        # is_valid = bcrypt.checkpw(plain_password.encode(), hashed_password.encode())
        is_valid = bcrypt.hashpw(plain_password.encode(), salt.encode()) == hashed_password.encode()

        # verify_result = bcrypt.checkpw(encoded_password, encoded_salt)
        # return bcrypt.hashpw(plain_password.encode(), salt.encode()) == hashed_password.encode()
        return is_valid

