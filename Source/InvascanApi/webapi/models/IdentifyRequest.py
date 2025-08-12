from pydantic import BaseModel

class IdentifyRequest(BaseModel):
    userid: str
    imagedata: str
    latitude: float = None
    longitude: float = None
    address: str = None
