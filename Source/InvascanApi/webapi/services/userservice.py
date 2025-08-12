from webapi.data.storagedb import UserRepository
import asyncio
from concurrent.futures import ThreadPoolExecutor


class UserService:
    def __init__(self):
        self.userRepository = UserRepository()
        self.executor = ThreadPoolExecutor(max_workers=10)

    async def email_exists(self, email: str) -> bool:
        return await self.userRepository.email_exists_async(email)