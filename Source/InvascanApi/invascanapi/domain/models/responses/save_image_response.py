from invascanapi.domain.models.base_model import GenericBaseModel


class SaveImageResponse(GenericBaseModel):
    filename: str
    filepath: str