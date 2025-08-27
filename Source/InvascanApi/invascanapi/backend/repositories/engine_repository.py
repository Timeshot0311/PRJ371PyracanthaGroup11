from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker

from invascanapi.backend.entities.detections_table import Detections
from invascanapi.backend.entities.geo_data_table import GeoData
from invascanapi.backend.entities.images_table import Images
from invascanapi.backend.entities.validations_table import Validations
from invascanapi.domain.models.responses.generic_backend_response import GenericBackendResponse


class EngineRepository:
    def __init__(self, db: AsyncSession):
        self.db = db


    async def insert_detection(self, detection: Detections) -> GenericBackendResponse[Detections]:
        try:
            self.db.add(detection)
            await self.db.commit()
            await self.db.refresh(detection)
            return GenericBackendResponse(
                success=True,
                code=200,
                message="success",
                data=detection
            )
        except Exception as e:
            print(f"\n\n=======================================================================")
            print(f"insert_detection error :- {e}")
            print(f"=======================================================================\n\n")
            await self.db.rollback()
            return GenericBackendResponse(
                success=False,
                code=500,
                message=f"failed: {str(e)}",
                data=None
            )


    async def insert_images(self, images: Images) -> GenericBackendResponse[Images]:
        try:
            self.db.add(images)
            await self.db.commit()
            await self.db.refresh(images)
            return GenericBackendResponse(
                success=True,
                code=200,
                message="success",
                data=images
            )
        except Exception as e:
            print(f"\n\n=======================================================================")
            print(f"insert_images error :- {e}")
            print(f"=======================================================================\n\n")
            await self.db.rollback()
            return GenericBackendResponse(
                success=False,
                code=500,
                message=f"failed: {str(e)}",
                data=None
            )


    async def insert_geo_data(self, geo_data: GeoData) -> GenericBackendResponse[GeoData]:
        try:
            self.db.add(geo_data)
            await self.db.commit()
            await self.db.refresh(geo_data)
            return GenericBackendResponse(
                success=True,
                code=200,
                message="success",
                data=geo_data
            )
        except Exception as e:
            print(f"\n\n=======================================================================")
            print(f"insert_geo_data error :- {e}")
            print(f"=======================================================================\n\n")
            await self.db.rollback()
            return GenericBackendResponse(
                success=False,
                code=500,
                message=f"failed: {str(e)}",
                data=None
            )


    async def insert_validations(self, validation: Validations) -> GenericBackendResponse[Validations]:
        try:
            self.db.add(validation)
            await self.db.commit()
            await self.db.refresh(validation)
            return GenericBackendResponse(
                success=True,
                code=200,
                message="success",
                data=validation
            )
        except Exception as e:
            print(f"\n\n=======================================================================")
            print(f"insert_validations error :- {e}")
            print(f"=======================================================================\n\n")
            await self.db.rollback()
            return GenericBackendResponse(
                success=False,
                code=500,
                message=f"failed: {str(e)}",
                data=None
            )





class EngineRepositoryV2:
    def __init__(self, session_factory: sessionmaker):
        self._session_factory = session_factory


    async def insert_detection(self, detection: Detections) -> GenericBackendResponse[Detections]:
        try:
            async with self._session_factory() as session:
                async with session.begin():
                    session.add(detection)
                await session.refresh(detection)
                return GenericBackendResponse(
                    success=True,
                    code=200,
                    message="success",
                    data=detection
                )
        except Exception as e:
            print(f"\n\n=======================================================================")
            print(f"insert_detection error :- {e}")
            print(f"=======================================================================\n\n")
            # await self.db.rollback()
            return GenericBackendResponse(
                success=False,
                code=500,
                message=f"failed: {str(e)}",
                data=None
            )


    async def insert_images(self, images: Images) -> GenericBackendResponse[Images]:
        try:
            async with self._session_factory() as session:
                async with session.begin():
                    session.add(images)
                await session.refresh(images)
                return GenericBackendResponse(
                    success=True,
                    code=200,
                    message="success",
                    data=images
                )
        except Exception as e:
            print(f"\n\n=======================================================================")
            print(f"insert_images error :- {e}")
            print(f"=======================================================================\n\n")
            # await self.db.rollback()
            return GenericBackendResponse(
                success=False,
                code=500,
                message=f"failed: {str(e)}",
                data=None
            )


    async def insert_geo_data(self, geo_data: GeoData) -> GenericBackendResponse[GeoData]:
        try:
            async with self._session_factory() as session:
                async with session.begin():
                    session.add(geo_data)
                await session.refresh(geo_data)
                return GenericBackendResponse(
                    success=True,
                    code=200,
                    message="success",
                    data=geo_data
                )
        except Exception as e:
            print(f"\n\n=======================================================================")
            print(f"insert_geo_data error :- {e}")
            print(f"=======================================================================\n\n")
            # await self.db.rollback()
            return GenericBackendResponse(
                success=False,
                code=500,
                message=f"failed: {str(e)}",
                data=None
            )


    async def insert_validations(self, validation: Validations) -> GenericBackendResponse[Validations]:
        try:
            async with self._session_factory() as session:
                async with session.begin():
                    session.add(validation)
                await session.refresh(validation)
                return GenericBackendResponse(
                    success=True,
                    code=200,
                    message="success",
                    data=validation
                )
        except Exception as e:
            print(f"\n\n=======================================================================")
            print(f"insert_validations error :- {e}")
            print(f"=======================================================================\n\n")
            # await self.db.rollback()
            return GenericBackendResponse(
                success=False,
                code=500,
                message=f"failed: {str(e)}",
                data=None
            )


