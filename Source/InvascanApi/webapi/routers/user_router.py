from fastapi import APIRouter
from webapi.services.userservice import UserService
from webapi.data.storagedb import UserRepository


router = APIRouter(prefix="/users", tags=["Users"])