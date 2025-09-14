from invascanapi.domain.models.base_model import GenericBaseModel


class ProvinceStatistics(GenericBaseModel):
    province: str
    totals: int