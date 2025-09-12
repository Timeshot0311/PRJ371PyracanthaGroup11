from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from invascanapi.backend.database import get_db, AsyncSessionLocal
from invascanapi.backend.repositories.reports_repository import ReportsRepository
from invascanapi.backend.repositories.user_repository import UserRepository
from invascanapi.domain.models.account_details import AccountDetail
from invascanapi.domain.models.location_details import LocationDetails
from invascanapi.domain.models.province_statistics import ProvinceStatistics
from invascanapi.domain.models.requests.create_account import CreateAccount
from invascanapi.domain.models.responses.generic_api_response import GenericApiResponse
from invascanapi.domain.models.responses.generic_backend_response import GenericBackendResponse
from invascanapi.domain.models.token_model import TokenResponseModel
from invascanapi.domain.services.reports_service import ReportsService
from invascanapi.domain.services.token_service import get_current_user
from invascanapi.domain.services.user_service import UserService

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("/all_province", summary="All Province detection statistics", response_model=GenericApiResponse[list[ProvinceStatistics]])
async def get_all_province_statistics(user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    service = ReportsService(ReportsRepository(AsyncSessionLocal))
    return await service.get_all_province_statistics()


@router.get("/province/{province_name}", summary="Province detection statistics", response_model=GenericApiResponse[ProvinceStatistics])
async def get_province_statistics(province_name: str, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    service = ReportsService(ReportsRepository(AsyncSessionLocal))
    return await service.get_province_statistics(province_name)


@router.get("/locationDetails", summary="All province locations", response_model=GenericApiResponse[list[LocationDetails]])
async def get_location_details(user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    service = ReportsService(ReportsRepository(AsyncSessionLocal))
    return await service.get_all_location_positions()


@router.get("/locationDetails/province/{province}", summary="Province locations", response_model=GenericApiResponse[list[LocationDetails]])
async def get_province_location_details(province:str, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    service = ReportsService(ReportsRepository(AsyncSessionLocal))
    return await service.get_province_location_positions(province)


@router.get("/locationDetails/province/year/{province}/{year_filter}", summary="Province and Year locations", response_model=GenericApiResponse[list[LocationDetails]])
async def get_province_year_location_details(province:str, year_filter:int, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    service = ReportsService(ReportsRepository(AsyncSessionLocal))
    return await service.get_province_year_location_positions(province, year_filter)


@router.get("/locationDetails/year/{year_filter}", summary="Year locations", response_model=GenericApiResponse[list[LocationDetails]])
async def get_year_location_details(year_filter:int, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    service = ReportsService(ReportsRepository(AsyncSessionLocal))
    return await service.get_location_positions_by_year(year_filter)


@router.get("/locationDetails/month/{year}/{month}", summary="Year and Month locations", response_model=GenericApiResponse[list[LocationDetails]])
async def get_year_month_location_details(year_filter:int, month:int, user_id: str = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    service = ReportsService(ReportsRepository(AsyncSessionLocal))
    return await service.get_location_positions_by_year_and_month(year_filter, month)