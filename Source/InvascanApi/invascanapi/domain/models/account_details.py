import uuid
from typing import Optional

from invascanapi.backend.entities.account_status_table import AccountStatus
from invascanapi.domain.models.base_model import GenericField, GenericBaseModel
from invascanapi.domain.models.requests.create_account import CreateAccount


class AccountDetail(GenericBaseModel):
    userId: uuid.UUID = GenericField(..., alias='UserId')
    firstname: str = GenericField(..., alias='Firstname')
    lastname: str = GenericField(..., alias='Lastname')
    username: str = GenericField(..., alias='Username')
    emailAddress: str = GenericField(..., alias='EmailAddress')
    phoneNumber: str = GenericField(..., alias='PhoneNumber')
    location: str = GenericField(..., alias='Location')
    experienceLevel: str = GenericField(..., alias='ExperienceLevel')
    privacySetting: str = GenericField(..., alias='PrivacySetting')
    imageSharingConsent: bool = GenericField(..., alias='ImageSharingConsent')
    role: str = GenericField(..., alias='Role')