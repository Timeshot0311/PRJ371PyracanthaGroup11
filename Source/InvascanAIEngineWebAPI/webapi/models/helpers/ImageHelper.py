import base64
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

