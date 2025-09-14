import logging
import uuid

from fastapi import HTTPException, status

from invascanapi.backend.entities.user_feedback_comment_table import UserFeedbackComment
from invascanapi.backend.entities.user_feedback_table import UserFeedback
from invascanapi.backend.repositories.community_repository import CommunityRepository
from invascanapi.domain.models.requests.create_user_feedback import CreateUserFeedback, CreateUserFeedbackComment
from invascanapi.domain.models.responses.generic_api_response import GenericApiResponse


class CommunityService:
    def __init__(self, community_repository:CommunityRepository):
        self.community_repository = community_repository



    # region -- user feedback section --

    async def add_user_feedback(self, user_id:str, user_feedback: CreateUserFeedback) -> GenericApiResponse[CreateUserFeedback]:
        try:
            # logging.info(f"user email: {user_feedback}")
            if not user_feedback.id or user_feedback.id == "": # insert new feedbacks
                new_feedback = UserFeedback(
                    Id=uuid.uuid4(),
                    UserId = uuid.UUID(user_id),
                    Comments = user_feedback.comments,
                    Ratings = user_feedback.ratings
                )

                response = await self.community_repository.add_user_feedback(new_feedback)
                if not response.success:
                    #user details
                    return GenericApiResponse(status=False, statusCode=status.HTTP_400_BAD_REQUEST, statusMessage=response.message)
                return GenericApiResponse(status=True, statusCode=status.HTTP_200_OK, statusMessage=f"{response.message}", dynamicModel=user_feedback)
            else: # update existing feedbacks
                return GenericApiResponse(status=True, statusCode=status.HTTP_200_OK, statusMessage=f"Update still pending")
        except Exception as e:
            logging.error(f"Create failed: {e}")
            return GenericApiResponse(status=False, statusCode=status.HTTP_500_INTERNAL_SERVER_ERROR, statusMessage=f'{e}')

    async def get_all_user_feedbacks(self) -> GenericApiResponse[list[dict]]:
        db_response = await self.community_repository.get_all_user_feedbacks()
        return GenericApiResponse(status=db_response.success, statusCode=db_response.code, statusMessage=db_response.message, dynamicModel=db_response.dynamicModel)


    async def get_user_feedbacks_by_id(self, user_id:str) -> GenericApiResponse[list[dict]]:
        db_response = await self.community_repository.get_user_feedbacks_by_id(user_id)
        return GenericApiResponse(status=db_response.success, statusCode=db_response.code, statusMessage=db_response.message, dynamicModel=db_response.dynamicModel)


    # endregion

    # region -- user feedback comments section --

    async def add_user_feedback_comment(self, user_id: str, user_feedback_comment: CreateUserFeedbackComment) -> GenericApiResponse[CreateUserFeedbackComment]:
        try:
            logging.info(f"user email: {user_feedback_comment}")
            if not user_feedback_comment.id:  # insert new feedbacks
                new_feedback_comment = UserFeedbackComment(
                    Id=uuid.uuid4(),
                    UserId=uuid.UUID(user_id),
                    FeedbackId=uuid.UUID(user_feedback_comment.feedbackId),
                    Comments=user_feedback_comment.comments,
                    Ratings=user_feedback_comment.ratings
                )

                response = await self.community_repository.add_user_feedback_comment(new_feedback_comment)
                if not response.success:
                    # user details
                    return GenericApiResponse(status=False,
                                              statusCode=status.HTTP_400_BAD_REQUEST,
                                              statusMessage=response.message,
                                              dynamicModel=None)
                user_feedback_comment.id = new_feedback_comment.Id
                return GenericApiResponse(status=True,
                                          statusCode=status.HTTP_200_OK,
                                          statusMessage=f"{response.message}",
                                          dynamicModel=user_feedback_comment)

            else:  # update existing feedbacks
                return GenericApiResponse(status=True,
                                          statusCode=status.HTTP_200_OK,
                                          statusMessage=f"Update still pending",
                                          dynamicModel=None)

        except Exception as e:
            logging.error(f"Create failed: {e}")
            return GenericApiResponse(status=False, statusCode=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                      statusMessage=f'{e}')


    async def get_all_user_feedback_comments(self) -> GenericApiResponse[list[dict]]:
        db_response = await self.community_repository.get_all_user_feedback_comments()
        return GenericApiResponse(status=db_response.success, statusCode=db_response.code, statusMessage=db_response.message, dynamicModel=db_response.dynamicModel)


    async def get_user_feedback_comments(self, feedback_id:str) -> GenericApiResponse[list[dict]]:
        db_response = await self.community_repository.get_user_feedback_comments(feedback_id)
        return GenericApiResponse(status=db_response.success, statusCode=db_response.code, statusMessage=db_response.message, dynamicModel=db_response.dynamicModel)

    # endregion