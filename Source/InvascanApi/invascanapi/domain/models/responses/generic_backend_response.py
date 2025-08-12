from typing import Optional

from typing import Generic, TypeVar, Optional

T = TypeVar("T")

class GenericBackendResponse(Generic[T]):
    def __init__(self, data: Optional[T], success:bool, code:Optional[int], message: str):
        self.success = success
        self.code = code
        self.message = message
        self.dynamicModel = data