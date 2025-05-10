import base64
import os
from pathlib import Path

from PIL import Image
from io import BytesIO


class ImageHelper:
    def __init__(self):
        pass

    def get_image_size(self, image):
        return image.size

    def get_image_format(self, image):
        return image.format

    def get_image_mode(self, image):
        return image.mode

    def base64_to_image(base64_string:str, output_path:str):
        try:
            image_data = base64.b64decode(base64_string)
            image = Image.open(BytesIO(image_data))
            image.save(output_path)
            print(f"Image saved to {output_path}")
            return True
        except Exception as ex:
            print(f"Error saving image: {ex}")
            return False


    def delete_image(image_path:str):
        try:
            os.remove(image_path)
            print(f"Image deleted from {image_path}")
            return True
        except Exception as ex:
            print(f"Error deleting image: {ex}")
            return False


    def delink_image(image_path:str):
        try:
            file_path = Path(image_path)
            if file_path.exists():
                file_path.unlink()
                print("File deleted.")
                return True
            else:
                print("File not found.")
                return False
        except Exception as ex:
            print(f"Error deleting file: {ex}")
            return False