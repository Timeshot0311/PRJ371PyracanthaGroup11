from sqlalchemy import func, select, Date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker

from invascanapi.backend.entities.detections_table import Detections
from invascanapi.backend.entities.geo_data_table import GeoData
from invascanapi.domain.models.location_details import LocationDetails
from invascanapi.domain.models.province_statistics import ProvinceStatistics
from invascanapi.domain.models.responses.generic_backend_response import GenericBackendResponse


class ReportsRepository:
    def __init__(self, session_factory: sessionmaker):
        self._session_factory = session_factory



    async def get_all_province_statistics(self) -> GenericBackendResponse[list[ProvinceStatistics]]:
        try:
            async with self._session_factory() as session:
                query = (
                    select(
                        Detections.NativeRegion,
                        func.count(Detections.NativeRegion).label("RegionTotal")
                    )
                    .group_by(Detections.NativeRegion)
                    .order_by(Detections.NativeRegion)
                )
                result = await session.execute(query)
                rows = result.all()
                # result_set = [{"NativeRegion": r[0], "RegionTotal": r[1]} for r in rows]

                statistics_list = [
                    ProvinceStatistics(province=r[0], totals=r[1])
                    for r in rows
                ]

                return GenericBackendResponse(
                    success=True,
                    code=200,
                    message="success",
                    data=statistics_list
                )
        except Exception as e:
            print(f"\n\n=======================================================================")
            print(f"get_all_province_statistics error :- {e}")
            print(f"=======================================================================\n\n")
            # await self.db.rollback()
            return GenericBackendResponse(
                success=False,
                code=500,
                message=f"failed: {str(e)}",
                data=None
            )



    async def get_province_statistics(self, province_name:str) -> GenericBackendResponse[ProvinceStatistics]:
        try:
            async with self._session_factory() as session:
                query = (
                    select(
                        Detections.NativeRegion,
                        func.count(Detections.NativeRegion).label("RegionTotal")
                    )
                    .where(Detections.NativeRegion == province_name)
                    .group_by(Detections.NativeRegion)
                    .order_by(Detections.NativeRegion)
                )
                result = await session.execute(query)
                row = result.first()

                if not row:
                    return GenericBackendResponse(
                    success=True,
                    code=404,
                    message=f"No results found for province {province_name}",
                    data=None
                )

                province_statistics = ProvinceStatistics(province=row[0], totals=row[1])

                return GenericBackendResponse(
                    success=True,
                    code=200,
                    message="success",
                    data=province_statistics
                )
        except Exception as e:
            print(f"\n\n=======================================================================")
            print(f"get_province_statistics error :- {e}")
            print(f"=======================================================================\n\n")
            # await self.db.rollback()
            return GenericBackendResponse(
                success=False,
                code=500,
                message=f"failed: {str(e)}",
                data=None
            )



    async def get_all_location_positions(self) -> GenericBackendResponse[list[LocationDetails]]:
        try:
            async with self._session_factory() as session:
                query = (
                    select(
                        GeoData.Id,
                        GeoData.Province,
                        GeoData.Placename,
                        GeoData.Latitude,
                        GeoData.Longitude,
                        func.cast(GeoData.CreatedAt, Date).label("CreatedAt")
                    )
                    .order_by(GeoData.Province)
                )
                result = await session.execute(query)
                rows = result.all()

                statistics_list = [
                    LocationDetails(
                        id=str(r.Id),
                        province=r.Province,
                        place=r.Placename,
                        latitude=r.Latitude,
                        longitude=r.Longitude,
                        created_at=r.CreatedAt
                    )
                    for r in rows
                ]

                return GenericBackendResponse(
                    success=True,
                    code=200,
                    message="success",
                    data=statistics_list
                )
        except Exception as e:
            print(f"\n\n=======================================================================")
            print(f"get_all_location_positions error :- {e}")
            print(f"=======================================================================\n\n")
            return GenericBackendResponse(
                success=False,
                code=500,
                message=f"failed: {str(e)}",
                data=None
            )


    async def get_province_location_positions(self, province_name: str) -> GenericBackendResponse[list[LocationDetails]]:
        try:
            async with self._session_factory() as session:
                query = (
                    select(
                        GeoData.Id,
                        GeoData.Province,
                        GeoData.Placename,
                        GeoData.Latitude,
                        GeoData.Longitude,
                        func.cast(GeoData.CreatedAt, Date).label("CreatedAt")
                    )
                    .where(GeoData.Province == province_name)
                    .order_by(GeoData.Province)
                )
                result = await session.execute(query)
                rows = result.all()

                statistics_list = [
                    LocationDetails(
                        id=str(r.Id),
                        province=r.Province,
                        place=r.Placename,
                        latitude=r.Latitude,
                        longitude=r.Longitude,
                        created_at=r.CreatedAt
                    )
                    for r in rows
                ]

                return GenericBackendResponse(
                    success=True,
                    code=200,
                    message="success",
                    data=statistics_list
                )
        except Exception as e:
            print(f"\n\n=======================================================================")
            print(f"get_all_location_positions error :- {e}")
            print(f"=======================================================================\n\n")
            # await self.db.rollback()
            return GenericBackendResponse(
                success=False,
                code=500,
                message=f"failed: {str(e)}",
                data=None
            )



    async def get_province_year_location_positions(self, province_name: str, year_filter: int) -> GenericBackendResponse[list[LocationDetails]]:
        try:
            async with self._session_factory() as session:
                query = (
                    select(
                        GeoData.Id,
                        GeoData.Province,
                        GeoData.Placename,
                        GeoData.Latitude,
                        GeoData.Longitude,
                        func.cast(GeoData.CreatedAt, Date).label("CreatedAt")
                    )
                    .where(GeoData.CreatedAt.isnot(None))
                    .where(GeoData.Province == province_name,
                        func.year(GeoData.CreatedAt) == year_filter)
                    .order_by(GeoData.Province)
                )
                result = await session.execute(query)
                rows = result.all()

                statistics_list = [
                    LocationDetails(
                        id=str(r.Id),
                        province=r.Province,
                        place=r.Placename,
                        latitude=r.Latitude,
                        longitude=r.Longitude,
                        created_at=r.CreatedAt
                    )
                    for r in rows
                ]

                return GenericBackendResponse(
                    success=True,
                    code=200,
                    message="success",
                    data=statistics_list
                )
        except Exception as e:
            print(f"\n\n=======================================================================")
            print(f"get_all_location_positions error :- {e}")
            print(f"=======================================================================\n\n")
            # await self.db.rollback()
            return GenericBackendResponse(
                success=False,
                code=500,
                message=f"failed: {str(e)}",
                data=None
            )


    async def get_location_positions_by_year(self, year_filter: int) -> GenericBackendResponse[list[LocationDetails]]:
        try:
            async with self._session_factory() as session:
                query = (
                    select(
                        GeoData.Id,
                        GeoData.Province,
                        GeoData.Placename,
                        GeoData.Latitude,
                        GeoData.Longitude,
                        func.cast(GeoData.CreatedAt, Date).label("CreatedAt")
                    )
                    .where(GeoData.CreatedAt.isnot(None))
                    # .where(func.extract('year', GeoData.CreatedAt) == year_filter)  # safer cross-dialect
                    .where(func.year(GeoData.CreatedAt) == year_filter)
                    .order_by(GeoData.Province)
                )
                result = await session.execute(query)
                rows = result.all()

                statistics_list = [
                    LocationDetails(
                        id=str(r.Id),
                        province=r.Province,
                        place=r.Placename,
                        latitude=r.Latitude,
                        longitude=r.Longitude,
                        created_at=r.CreatedAt
                    )
                    for r in rows
                ]

                return GenericBackendResponse(
                    success=True,
                    code=200,
                    message="success",
                    data=statistics_list
                )
        except Exception as e:
            print(f"\n\n=======================================================================")
            print(f"get_all_location_positions error :- {e}")
            print(f"=======================================================================\n\n")
            # await self.db.rollback()
            return GenericBackendResponse(
                success=False,
                code=500,
                message=f"failed: {str(e)}",
                data=None
            )



    async def get_location_positions_by_year_and_month(self, year_filter: int, month_filter: int) -> GenericBackendResponse[list[LocationDetails]]:
        try:
            async with self._session_factory() as session:
                query = (
                    select(
                        GeoData.Id,
                        GeoData.Province,
                        GeoData.Placename,
                        GeoData.Latitude,
                        GeoData.Longitude,
                        func.cast(GeoData.CreatedAt, Date).label("CreatedAt")
                    )
                    .where(GeoData.CreatedAt.isnot(None))
                    .where(
                        func.year(GeoData.CreatedAt) == year_filter,
                        func.month(GeoData.CreatedAt) == month_filter
                    )
                    .order_by(GeoData.Province)
                )
                result = await session.execute(query)
                rows = result.all()

                statistics_list = [
                    LocationDetails(
                        id=str(r.Id),
                        province=r.Province,
                        place=r.Placename,
                        latitude=r.Latitude,
                        longitude=r.Longitude,
                        created_at=r.CreatedAt
                    )
                    for r in rows
                ]

                return GenericBackendResponse(
                    success=True,
                    code=200,
                    message="success",
                    data=statistics_list
                )
        except Exception as e:
            print(f"\n\n=======================================================================")
            print(f"get_all_location_positions error :- {e}")
            print(f"=======================================================================\n\n")
            # await self.db.rollback()
            return GenericBackendResponse(
                success=False,
                code=500,
                message=f"failed: {str(e)}",
                data=None
            )



