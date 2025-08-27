
from datetime import date
from uuid import UUID

from invascanapi.domain.models.base_model import GenericBaseModel


class LocationDetails(GenericBaseModel):
    id: str
    province: str
    place: str
    latitude: float
    longitude: float
    created_at: date