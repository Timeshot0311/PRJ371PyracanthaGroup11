import os
import re
from enum import Enum
from datetime import datetime
from invascanapi.domain.models.base_model import GenericBaseModel

class APIVersion(str, Enum):
    V1 = "v1"


class EngineVersion(str, Enum):
    V1 = "v1"

# Helper to auto-increment version like 1.0.0 -> 1.0.1
VERSION_FILE_PATH = os.path.join(os.path.dirname(__file__), "version.txt")
VERSION_BUMP = os.getenv("VERSION_BUMP", "patch").lower()  # 'patch', 'minor', 'major'

def read_and_increment_version():
    if not os.path.exists(VERSION_FILE_PATH):
        initial_version = "1.0.0"
        with open(VERSION_FILE_PATH, "w") as f:
            f.write(initial_version)
        return initial_version

    with open(VERSION_FILE_PATH, "r") as f:
        version = f.read().strip()

    match = re.match(r"(\d+)\.(\d+)\.(\d+)", version)
    if not match:
        return "1.0.0"

    major, minor, patch = map(int, match.groups())

    if VERSION_BUMP == "major":
        major += 1
        minor = 0
        patch = 0
    elif VERSION_BUMP == "minor":
        minor += 1
        if minor >= 100:
            major += 1
            minor = 1
        patch = 0
    else:
        patch += 1
        if patch >= 200:
            minor += 1
            patch = 1

    new_version = f"{major}.{minor}.{patch}"

    with open(VERSION_FILE_PATH, "w") as f:
        f.write(new_version)

    return new_version


class ProjectVersion(GenericBaseModel):
    api_version: APIVersion = APIVersion.V1
    engine_version: EngineVersion = EngineVersion.V1
    engine_analytics: str = "YOLOv8"
    project_version: str = read_and_increment_version()
    build: str = datetime.now().strftime("%Y%m%d%H%M%S")
    name: str = "Invascan AI Engine API"
    description: str = (
        "API for user registration, Pyracantha species detection, and system interaction."
    )
    contact_name: str = "Invascan Support"
    contact_email: str = "invascan@gmail.com"
    license_name: str = "MIT License"
    license_url: str = "https://opensource.org/licenses/MIT"
    environment: str = os.getenv("ENV", "development")



version_info = ProjectVersion()