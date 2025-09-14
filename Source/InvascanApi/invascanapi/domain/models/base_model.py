from pydantic import BaseModel, Field

# GenericBaseModel = BaseModel
# GenericField = Field


class GenericBaseModel(BaseModel):
    model_config = {
        "from_attributes": True,           # replaces orm_mode
        "validate_by_name": True,          # replaces allow_population_by_field_name
        "str_strip_whitespace": True,      # trims leading/trailing whitespace
        "use_enum_values": True            # enums as strings (optional)
    }

GenericField = Field