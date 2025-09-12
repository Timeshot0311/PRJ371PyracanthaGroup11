import asyncio
import base64
import logging
import sys
import os
import uuid

from invascanapi.backend.database import AsyncSessionLocal
from invascanapi.backend.entities.detections_table import Detections
from invascanapi.backend.entities.geo_data_table import GeoData
from invascanapi.backend.entities.images_table import Images
from invascanapi.backend.entities.validations_table import Validations
from invascanapi.backend.repositories.engine_repository import EngineRepository, EngineRepositoryV2
from invascanapi.domain.models.detection_response import DetectionResponse
from invascanapi.domain.models.requests.investigate_request import InvestigateRequest
from invascanapi.domain.services.invascan_engine import InvascanEngine
from invascanapi.domain.utils.maps_utilz import get_province
from invascanapi.domain.utils.storage_util import StorageUtil
from invascanapi.domain.models.responses.generic_api_response import GenericApiResponse

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))


class EngineService:
    def __init__(self, repository: EngineRepository):
        self.engine_repository = repository
        self.engine = InvascanEngine(repository)
        self.util = StorageUtil()
        # self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    async def do_identification_async(self, model: InvestigateRequest, url:str) -> GenericApiResponse[DetectionResponse]:
        # print("Pyracantha version: ", self.base_dir)
        save_image_response = self.util.save_image(model.image_data)
        if not save_image_response or not save_image_response.filepath:
            return GenericApiResponse(status = True, statusCode = 404, statusMessage = "Internal router error saving image", dynamicModel=None)


        identification_response = self.engine.identify_pyracantha(save_image_response.filepath,
                                                                  save_image_response.width, save_image_response.height)
        if identification_response.code == 2005 or identification_response.code == 2004 or identification_response.code == 2003:
            return GenericApiResponse(status=True, statusCode=200, statusMessage=identification_response.message,
                                      dynamicModel=identification_response.dynamicModel)

        # self.util.delete_image(save_image_response.filepath)
        identification_result_image = identification_response.dynamicModel.imageData
        save_identification_image_response = self.util.save_image(identification_result_image)
        print(f"save_response2: {save_identification_image_response}")
        if save_identification_image_response and save_identification_image_response.filename:
            # Build full URL
            filename = save_identification_image_response.filename
            image_url = f"{url}/{filename}"
            identification_response.dynamicModel.imageUrl = image_url

        #region do database actions
        asyncio.create_task(
            self.save_detections_in_background(model, identification_response, identification_result_image)
        )
        #endregion


        return GenericApiResponse(
            status = True,
            statusCode = 200,
            statusMessage = identification_response.message,
            dynamicModel = identification_response.dynamicModel
        )



    async def save_detections_in_background(self, model, identification_response, identification_result_image):
        repo = EngineRepositoryV2(AsyncSessionLocal)
        status_id = uuid.UUID("3041ADFC-400B-4FE0-B209-47FE75DEDB0C")  # REJECTED DETECTION
        common_name = ""
        if identification_response.code == 2002:
            status_id = uuid.UUID("585B6A2E-0A37-45C5-B347-6F2B9860F1CE")  # VALIDATION REQUIRED
        elif identification_response.code == 2000:
            status_id = uuid.UUID("AEFA556C-A285-4838-B54C-0CD8A50A3D37")  # CONFIRMED DETECTION
            common_name = "Pyracantha Angustifolia"

        province = "Unallocated"
        if model.latitude != 0.0 and model.latitude != 0.0:
            province = await get_province(latitude=model.latitude, longitude=model.longitude)

        detection_save = Detections(
            SpeciesName=identification_response.dynamicModel.speciesName,
            CommonName=common_name,
            ConfidenceScore=identification_response.dynamicModel.confidenceScore,
            UserId=uuid.UUID(model.user_id),
            StatusId=status_id,
            NativeRegion=province
        )

        save_detection_response = await repo.insert_detection(detection_save)
        if save_detection_response.success:
            decoded_image_bytes = bytearray(base64.b64decode(identification_result_image))
            images = Images(
                DetectionId=save_detection_response.dynamicModel.Id,
                ImageUrl=identification_response.dynamicModel.imageUrl,
                ImageData=decoded_image_bytes
            )
            await self.engine_repository.insert_images(images)

            geo_data = GeoData(
                DetectionId=save_detection_response.dynamicModel.Id,
                Latitude=model.latitude,
                Longitude=model.longitude,
                Placename=model.address,
                Province=province,
            )
            await repo.insert_geo_data(geo_data)

            if identification_response.code == 2002:
                print(f"we are creating a validation entry")
                # validations = Validations(
                #     DetectionId=save_detection_response.dynamicModel.Id,
                #     DecisionId=uuid.UUID("8B721BD2-5A32-4F85-B5E4-D0979A5A82AF"),
                #     Comments= ""
                # )
                # await repo.insert_validations(validations)


