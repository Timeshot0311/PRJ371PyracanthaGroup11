from sqlalchemy import text
from sqlalchemy.engine import row
from sqlalchemy.ext.asyncio import AsyncSession

from invascanapi.domain.models.responses.generic_backend_response import GenericBackendResponse


class DataSyncRepository:
    def __init__(self, session_factory):
        self.session_factory = session_factory


    async def generic_import_process(self, stored_proc_name: str, parameters: dict) -> GenericBackendResponse[dict]:
        async with self.session_factory() as session:
            try:
                """
                Execute a stored procedure and return the first row as GenericBackendResponse.
                """

                # Build parameter placeholders for SQLAlchemy text query
                param_placeholders = ", ".join([f":{key}" for key in parameters.keys()])
                sql = text(f"EXEC {stored_proc_name} {param_placeholders}")

                # Execute stored procedure
                result = await session.execute(sql, parameters)
                await session.commit()

                first_row = None
                try:
                    first_row = result.first()  # only attempt if SP returns rows
                    print(f"results found: {first_row}")
                except Exception:
                    # SP did not return rows, ignore
                    print(f"results not found: {first_row}")
                    pass


                if first_row:
                    # row is a Row object; convert to dict-like access
                    # row_dict = first_row._mapping
                    row_dict = dict(first_row._mapping)
                    return GenericBackendResponse(
                        success=bool(row_dict.get("Status", row_dict.get("status"))),
                        code=int(row_dict.get("Code", row_dict.get("code"))),
                        message=str(row_dict.get("Message", row_dict.get("message"))),
                        data= None
                    )
                else:
                    return GenericBackendResponse(
                            success=False,
                            code=400,
                            message="Database error",
                            data= None
                        )
            except Exception as e:
                print(f"\n\n=======================================================================")
                print(f"generic_import_process error :- {e}")
                print(f"=======================================================================\n\n")
                await session.rollback()
                return GenericBackendResponse(
                    success=False,
                    code=500,
                    message=f"failed: {str(e)}",
                    data=None
                )
