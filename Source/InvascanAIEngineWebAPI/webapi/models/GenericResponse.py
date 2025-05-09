from pydantic import BaseModel

class GenericResponse(BaseModel):
    status: bool
    statuscode:int
    message: str
    img: str