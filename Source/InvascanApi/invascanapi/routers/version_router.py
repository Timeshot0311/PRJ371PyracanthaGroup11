from fastapi import APIRouter
from invascanapi.domain.models.version import version_info, ProjectVersion

router = APIRouter(prefix="/api/system", tags=["System"])

@router.get("/version", response_model=ProjectVersion, tags=["System"])
async def get_version():
    return version_info