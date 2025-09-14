from typing import Optional

from typing import Generic, TypeVar, Optional
from invascanapi.domain.models.base_model import GenericBaseModel
from invascanapi.domain.models.base_model import GenericField

T = TypeVar("T")

class GenericApiResponse(GenericBaseModel, Generic[T]):
    status: bool
    statusCode: int
    statusMessage: str
    dynamicModel: Optional[T] = None