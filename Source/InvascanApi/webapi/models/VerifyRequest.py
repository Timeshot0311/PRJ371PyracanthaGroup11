from pydantic import BaseModel

class VerifyRequest(BaseModel):
    image:str