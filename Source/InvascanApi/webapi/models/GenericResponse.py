from pydantic import BaseModel

class GenericResponse(BaseModel):
    status: bool
    statuscode:int
    message: str
    img: str
    labelname:str
    score:float

    class Config:
        orm_mode = True
