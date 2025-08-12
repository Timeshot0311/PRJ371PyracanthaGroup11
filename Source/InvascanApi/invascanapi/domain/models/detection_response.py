
from invascanapi.domain.models.base_model import GenericBaseModel
from invascanapi.domain.models.base_model import GenericField

class DetectionResponse(GenericBaseModel):
    speciesName: str = None
    confidenceScore: float = None
    imageData: str = None
    imageUrl: str = None