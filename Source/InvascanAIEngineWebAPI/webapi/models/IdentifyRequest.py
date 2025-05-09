from pydantic import BaseModel

class IdentifyRequest(BaseModel):
    userid: str
    imagedata: str