import datetime
import uuid
from typing import Optional

from invascanapi.domain.models.base_model import GenericBaseModel
from invascanapi.domain.models.base_model import GenericField


class CreateAccount(GenericBaseModel):
    firstname: str = GenericField(..., alias='Firstname')
    lastname: str = GenericField(..., alias='Lastname')
    username: str = GenericField(..., alias='Username')
    email: str = GenericField(..., alias='EmailAddress')
    phoneNumber: str = GenericField(..., alias='PhoneNumber')
    location: str = GenericField(..., alias='Location')
    experienceLevel: str = GenericField(..., alias='ExperienceLevel')
    privacySetting: str = GenericField(..., alias='PrivacySetting')
    imageSharingConsent: bool = GenericField(..., alias='ImageSharingConsent')
    roleId: uuid.UUID = GenericField(..., alias='RoleId')
    password: str = None


class AccountStatus(GenericBaseModel):
    id: uuid.UUID = GenericField(..., alias="Id")
    description: str = GenericField(..., alias="Description")

    class Config:
        from_attributes = True


# class AccountDetail(CreateAccount):
#     id: uuid.UUID = GenericField(..., alias='Id')
#     status_id:uuid.UUID = GenericField(..., alias='StatusId')
#     status: Optional[AccountStatus] = GenericField(None, alias='Status')
#
#     class Config:
#         from_attributes  = True
#         allow_population_by_field_name = True
#         #orm_mode = True