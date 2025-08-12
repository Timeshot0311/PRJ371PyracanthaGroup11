from invascanapi.domain.models.base_model import GenericBaseModel


class InvestigateRequest(GenericBaseModel):
    user_id:str = None
    image_data:str = None
    latitude: float = None
    longitude: float = None
    address: str = None