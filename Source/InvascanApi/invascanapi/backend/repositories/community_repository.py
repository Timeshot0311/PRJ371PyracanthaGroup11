import uuid

from sqlalchemy import select
from sqlalchemy.orm import sessionmaker

from invascanapi.backend.entities.user_details_table import UserDetails
from invascanapi.backend.entities.user_feedback_comment_table import UserFeedbackComment
from invascanapi.backend.entities.user_feedback_table import UserFeedback
from invascanapi.domain.models.responses.generic_backend_response import GenericBackendResponse


class CommunityRepository:
    def __init__(self, session_factory: sessionmaker):
        self._session_factory = session_factory

    # region -- user feedback section --

    async def add_user_feedback(self, user_feedback: UserFeedback) -> GenericBackendResponse[UserFeedback]:
        try:
            async with self._session_factory() as session:
                async with session.begin():
                    session.add(user_feedback)
                await session.refresh(user_feedback)
                return GenericBackendResponse(
                    success=True,
                    code=200,
                    message="User feedback created successful",
                    data=user_feedback
                )
        except Exception as e:
            print(f"\n\n=======================================================================")
            print(f"add_user_feedback error :- {e}")
            print(f"=======================================================================\n\n")
            return GenericBackendResponse(
                success=False,
                message=f"User feedback creation failed: {str(e)}",
                data=None,
                code=500
            )


    async def get_all_user_feedbacks(self) -> GenericBackendResponse[list[dict]]:
        try:
            async with self._session_factory() as session:
                stmt = (
                    select(
                        UserFeedback.UserId,
                        UserDetails.Firstname,
                        UserDetails.Lastname,
                        UserFeedback.Id,
                        UserFeedback.Comments,
                        UserFeedback.Ratings,
                        UserFeedback.CreatedAt,
                    )
                    .join(UserDetails, UserDetails.UserId == UserFeedback.UserId)
                    .order_by(UserFeedback.CreatedAt)
                    #.with_hint(UserFeedback, "WITH (NOLOCK)", dialect_name="mssql")
                    #.with_hint(UserDetails, "WITH (NOLOCK)", dialect_name="mssql")
                )

                stmt_results = await session.execute(stmt)
                results = stmt_results.mappings().all()

                if not results:
                    return GenericBackendResponse(
                        success=True,
                        code=404,
                        message=f"There are no user feedbacks",
                        data=None
                    )

                feedback_list = [dict(row) for row in results]
                # feedback_list = [
                #     {k[0].lower() + k[1:]: v for k, v in dict(row).items()}
                #     for row in results
                # ]

                return GenericBackendResponse(
                    success=True,
                    code=200,
                    message="success",
                    data=feedback_list
                )
        except Exception as e:
            print(f"\n\n=======================================================================")
            print(f"get_all_user_feedbacks error :- {e}")
            print(f"=======================================================================\n\n")
            return GenericBackendResponse(
                success=False,
                code=500,
                message=f"failed: {str(e)}",
                data=None
            )


    async def get_user_feedbacks_by_id(self, user_id:str) -> GenericBackendResponse[list[dict]]:
        try:
            async with self._session_factory() as session:
                stmt = (
                    select(
                        UserFeedback.UserId,
                        UserDetails.Firstname,
                        UserDetails.Lastname,
                        UserFeedback.Id,
                        UserFeedback.Comments,
                        UserFeedback.Ratings,
                        UserFeedback.CreatedAt,
                    )
                    .join(UserDetails, UserDetails.UserId == UserFeedback.UserId)
                    .where(UserFeedback.UserId == uuid.UUID(user_id))
                    .order_by(UserFeedback.CreatedAt)
                    .with_hint(UserFeedback, "WITH (NOLOCK)", dialect_name="mssql")
                    .with_hint(UserDetails, "WITH (NOLOCK)", dialect_name="mssql")
                )

                stmt_results = await session.execute(stmt)
                results = stmt_results.mappings().all()

                if not results:
                    return GenericBackendResponse(
                        success=True,
                        code=404,
                        message=f"There are no user feedbacks",
                        data=None
                    )

                feedback_list = [dict(row) for row in results]

                return GenericBackendResponse(
                    success=True,
                    code=200,
                    message="success",
                    data=feedback_list
                )
        except Exception as e:
            print(f"\n\n=======================================================================")
            print(f"get_user_specific_feedbacks error :- {e}")
            print(f"=======================================================================\n\n")
            return GenericBackendResponse(
                success=False,
                code=500,
                message=f"failed: {str(e)}",
                data=None
            )

    # endregion

    # region -- user feedback comments section --

    async def add_user_feedback_comment(self, user_feedback_comment: UserFeedbackComment) -> GenericBackendResponse[UserFeedbackComment]:
        try:
            async with self._session_factory() as session:
                async with session.begin():
                    session.add(user_feedback_comment)
                await session.refresh(user_feedback_comment)
                return GenericBackendResponse(
                    success=True,
                    code=200,
                    message="User feedback comment created successful",
                    data=user_feedback_comment
                )
        except Exception as e:
            print(f"\n\n=======================================================================")
            print(f"add_user_feedback_comment error :- {e}")
            print(f"=======================================================================\n\n")
            return GenericBackendResponse(
                success=False,
                message=f"User feedback comment creation failed: {str(e)}",
                data=None,
                code=500
            )


    async def get_all_user_feedback_comments(self) -> GenericBackendResponse[list[dict]]:
        try:
            async with self._session_factory() as session:
                stmt = (
                    select(
                        UserFeedbackComment.UserId,
                        UserDetails.Firstname,
                        UserDetails.Lastname,
                        UserFeedbackComment.FeedbackId,
                        UserFeedbackComment.Id,
                        UserFeedbackComment.Comments,
                        UserFeedbackComment.Ratings,
                        UserFeedbackComment.CreatedAt,
                    )
                    .join(UserDetails, UserDetails.UserId == UserFeedbackComment.UserId)
                    .order_by(UserFeedbackComment.CreatedAt)
                    .with_hint(UserFeedbackComment, "WITH (NOLOCK)", dialect_name="mssql")
                    .with_hint(UserDetails, "WITH (NOLOCK)", dialect_name="mssql")
                )
                stmt_results = await session.execute(stmt)
                results = stmt_results.mappings().all()

                if not results:
                    return GenericBackendResponse(
                        success=True,
                        code=404,
                        message=f"There are no user feedback comments",
                        data=None
                    )

                feedback_comment_list = [dict(row) for row in results]

                return GenericBackendResponse(
                    success=True,
                    code=200,
                    message="success",
                    data=feedback_comment_list
                )
        except Exception as e:
            print(f"\n\n=======================================================================")
            print(f"get_all_user_feedback_comments error :- {e}")
            print(f"=======================================================================\n\n")
            return GenericBackendResponse(
                success=False,
                code=500,
                message=f"failed: {str(e)}",
                data=None
            )


    async def get_user_feedback_comments(self, feedback_id:str) -> GenericBackendResponse[list[dict]]:
        try:
            async with self._session_factory() as session:
                stmt = (
                    select(
                        UserFeedbackComment.UserId,
                        UserDetails.Firstname,
                        UserDetails.Lastname,
                        UserFeedbackComment.FeedbackId,
                        UserFeedbackComment.Id,
                        UserFeedbackComment.Comments,
                        UserFeedbackComment.Ratings,
                        UserFeedbackComment.CreatedAt,
                    )
                    .join(UserDetails, UserDetails.UserId == UserFeedbackComment.UserId)
                    .where(UserFeedbackComment.FeedbackId == uuid.UUID(feedback_id))
                    .order_by(UserFeedbackComment.CreatedAt)
                    .with_hint(UserFeedbackComment, "WITH (NOLOCK)", dialect_name="mssql")
                    .with_hint(UserDetails, "WITH (NOLOCK)", dialect_name="mssql")
                )
                stmt_results = await session.execute(stmt)
                results = stmt_results.mappings().all()

                if not results:
                    return GenericBackendResponse(
                        success=True,
                        code=404,
                        message=f"There are no user feedback comments",
                        data=None
                    )

                feedback_comment_list = [dict(row) for row in results]

                return GenericBackendResponse(
                    success=True,
                    code=200,
                    message="success",
                    data=feedback_comment_list
                )
        except Exception as e:
            print(f"\n\n=======================================================================")
            print(f"get_all_user_feedback_comments error :- {e}")
            print(f"=======================================================================\n\n")
            return GenericBackendResponse(
                success=False,
                code=500,
                message=f"failed: {str(e)}",
                data=None
            )


    # endregion