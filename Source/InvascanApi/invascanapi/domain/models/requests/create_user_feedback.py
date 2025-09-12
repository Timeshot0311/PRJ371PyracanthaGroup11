from invascanapi.domain.models.base_model import GenericBaseModel, GenericField


class CreateUserFeedback(GenericBaseModel):
    id:str | None = GenericField(..., alias='Id')
    comments: str = GenericField(..., alias='Comments')
    ratings: float = GenericField(..., alias='Ratings')


class CreateUserFeedbackComment(GenericBaseModel):
    id: str | None = GenericField(..., alias='Id')
    feedbackId: str = GenericField(..., alias='FeedbackId')
    comments: str = GenericField(..., alias='Comments')
    ratings: float = GenericField(..., alias='Ratings')

