from invascanapi.backend.repositories.reports_repository import ReportsRepository
from invascanapi.domain.models.location_details import LocationDetails
from invascanapi.domain.models.province_statistics import ProvinceStatistics
from invascanapi.domain.models.responses.generic_api_response import GenericApiResponse
from invascanapi.domain.models.responses.generic_backend_response import GenericBackendResponse


class ReportsService:
    def __init__(self, repository: ReportsRepository):
        self.repository = repository


    async def get_all_province_statistics(self) -> GenericApiResponse[list[ProvinceStatistics]]:
        response =  await self.repository.get_all_province_statistics()
        api_response = GenericApiResponse(
            status=response.success,
            statusCode=response.code,
            statusMessage=response.message,
            dynamicModel=response.dynamicModel
        )
        return api_response



    async def get_province_statistics(self, province_name:str) -> GenericApiResponse[ProvinceStatistics]:
        response = await self.repository.get_province_statistics(province_name)
        api_response = GenericApiResponse(
            status=response.success,
            statusCode=response.code,
            statusMessage=response.message,
            dynamicModel=response.dynamicModel
        )
        return api_response



    async def get_all_location_positions(self) -> GenericApiResponse[list[LocationDetails]]:
        response = await self.repository.get_all_location_positions()
        api_response = GenericApiResponse(
            status=response.success,
            statusCode=response.code,
            statusMessage=response.message,
            dynamicModel=response.dynamicModel
        )
        return api_response


    async def get_province_location_positions(self, province_name: str) -> GenericApiResponse[list[LocationDetails]]:
        response = await self.repository.get_province_location_positions(province_name)
        api_response = GenericApiResponse(
            status=response.success,
            statusCode=response.code,
            statusMessage=response.message,
            dynamicModel=response.dynamicModel
        )
        return api_response


    async def get_province_year_location_positions(self, province_name: str, year_filter: int) -> GenericApiResponse[list[LocationDetails]]:
        response = await self.repository.get_province_year_location_positions(province_name, year_filter)
        api_response = GenericApiResponse(
            status=response.success,
            statusCode=response.code,
            statusMessage=response.message,
            dynamicModel=response.dynamicModel
        )
        return api_response


    async def get_location_positions_by_year(self, year_filter: int) -> GenericApiResponse[list[LocationDetails]]:
        response = await self.repository.get_location_positions_by_year(year_filter)
        api_response = GenericApiResponse(
            status=response.success,
            statusCode=response.code,
            statusMessage=response.message,
            dynamicModel=response.dynamicModel
        )
        return api_response
        # return await self.repository.get_location_positions_by_year(year_filter)



    async def get_location_positions_by_year_and_month(self, year_filter: int, month_filter: int) -> GenericApiResponse[list[LocationDetails]]:
        response = await self.repository.get_location_positions_by_year_and_month(year_filter, month_filter)
        api_response = GenericApiResponse(
            status=response.success,
            statusCode=response.code,
            statusMessage=response.message,
            dynamicModel=response.dynamicModel
        )
        return api_response
        # return await self.repository.get_location_positions_by_year_and_month(year_filter, month_filter)


