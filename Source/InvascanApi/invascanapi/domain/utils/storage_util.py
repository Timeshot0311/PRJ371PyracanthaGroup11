import base64
import logging
import os
import uuid
from pathlib import Path
from typing import Optional

from PIL import Image
from io import BytesIO

from invascanapi.domain.models.responses.save_image_response import SaveImageResponse


class StorageUtil:
    def __init__(self):
        #self.base_dir = os.path.dirname(os.path.dirname(__file__))
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.images_upload_directory = os.path.join("invascanapi", "domain", "images")
        self.image_path = os.path.join(self.base_dir, "images")
        os.makedirs(os.path.dirname(self.image_path), exist_ok=True)


    def get_path(self):
        return self.image_path

    def save_image(self, encoded_image:str) -> Optional[SaveImageResponse]:
        try:
            image_id = uuid.uuid4()
            os.makedirs(os.path.dirname(self.image_path), exist_ok=True)
            image_file_name = f"{image_id}.jpg"
            image_location = os.path.join(self.image_path, f"{image_file_name}")

            # Decode base64 and save image
            image_data = base64.b64decode(encoded_image)
            image = Image.open(BytesIO(image_data))
            image.save(image_location)

            print(f"Image file name {image_file_name}")
            print(f"Image saved to {image_location}")

            return SaveImageResponse(filename = image_file_name, filepath=image_location)
            # return {
            #     "image_location": image_location,
            #     "image_name": image_file_name
            # }
        except Exception as ex:
            print(f"Error saving image: {ex}")
            logging.error(f"save_image :- {ex}")
            return None
            # return {
            #     "image_location": None,
            #     "image_name": None
            # }


    def delete_image(self, path:str):
        try:
            os.remove(path)
            print(f"Image deleted from {path}")
            return True
        except Exception as ex:
            print(f"Error deleting image: {ex}")
            return False