import base64
import os
import uuid

from fastapi import APIRouter, Request, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from invascanapi.backend.database import get_db
from invascanapi.backend.repositories.engine_repository import EngineRepository
from invascanapi.domain.models.detection_response import DetectionResponse
from invascanapi.domain.models.responses.generic_api_response import GenericApiResponse
from invascanapi.domain.models.requests.investigate_request import InvestigateRequest
from invascanapi.domain.services.engine_service import EngineService

router = APIRouter(prefix="/api/engine", tags=["Engine"])
app_directory = os.getcwd()
images_directory = f"{app_directory}/invascanapi/domain/images"
images_upload_directory = os.path.join("invascanapi", "domain", "images")


@router.post(
    "/investigate",
    description="Check for pyracantha angustifolia species from image data.",
    summary="Investigate Image",
    response_model=GenericApiResponse[DetectionResponse])
async def investigate(model: InvestigateRequest, request: Request, db: AsyncSession = Depends(get_db)):
    service = EngineService(EngineRepository(db))
    base_url = f"{request.base_url}images"
    identification_response = await service.do_identification_async(model, base_url)
    return identification_response

