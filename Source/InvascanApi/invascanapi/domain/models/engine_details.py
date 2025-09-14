
from invascanapi.domain.models.base_model import GenericBaseModel

class EngineDetails(GenericBaseModel):
    version: float
    analyticsName: str
