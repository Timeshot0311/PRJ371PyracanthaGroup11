from invascanapi.domain.models.base_model import GenericBaseModel


class TokenResponseModel(GenericBaseModel):
    access_token: str
    token_type: str