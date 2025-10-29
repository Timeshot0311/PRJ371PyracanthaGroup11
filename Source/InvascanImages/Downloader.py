import cv2
import numpy as np
import requests
import json
import os
from pathlib import Path
from PIL import Image
from io import BytesIO


save_dir = r"D:\DATA\PRJ371\Images"

def resize_and_pad(image_path, output_path, size=(640, 640), pad_color=(255, 255, 255)):
    # Open the image
    img = Image.open(image_path).convert("RGB")

    # Resize while keeping aspect ratio
    img.thumbnail(size, Image.Resampling.LANCZOS)

    # Create a new white background
    new_img = Image.new("RGB", size, pad_color)

    # Center the image
    paste_x = (size[0] - img.width) // 2
    paste_y = (size[1] - img.height) // 2
    new_img.paste(img, (paste_x, paste_y))

    # Save result
    new_img.save(output_path)


def resize_and_pad_from_bytes(image_bytes, size=(640, 640), pad_color=(255, 255, 255)):
    # Load image from bytearray
    img = Image.open(BytesIO(image_bytes)).convert("RGB")

    # Resize with aspect ratio
    img.thumbnail(size, Image.Resampling.LANCZOS)

    # Create a new white background
    new_img = Image.new("RGB", size, pad_color)

    # Center the resized image
    paste_x = (size[0] - img.width) // 2
    paste_y = (size[1] - img.height) // 2
    new_img.paste(img, (paste_x, paste_y))

    # Return as bytes (JPEG example)
    output_buffer = BytesIO()
    new_img.save(output_buffer, format="JPEG")
    return output_buffer.getvalue()


def resize_with_padding_cv2(image_bytes, target_size=640, color=(255, 255, 255)):
    """
    Resize with padding using OpenCV (YOLO-style)
    """
    try:
        # Download image
        #response = requests.get(image_url)
        #response.raise_for_status()

        # Convert to OpenCV format
        image_array = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

        if image is None:
            raise ValueError("Could not decode image")

        # Get original dimensions
        h, w = image.shape[:2]

        # Calculate scale factor
        scale = target_size / max(h, w)

        # Calculate new dimensions
        new_h, new_w = int(h * scale), int(w * scale)

        # Resize image
        resized_image = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_LINEAR)

        # Create padded image
        padded_image = np.full((target_size, target_size, 3), color, dtype=np.uint8)

        # Calculate padding offsets (center)
        y_offset = (target_size - new_h) // 2
        x_offset = (target_size - new_w) // 2

        # Place resized image in center
        padded_image[y_offset:y_offset + new_h, x_offset:x_offset + new_w] = resized_image

        return padded_image, (scale, (x_offset, y_offset))

    except Exception as e:
        print(f"Error processing image: {e}")
        return None, None


def resize_and_crop(image_bytes, target_size=640):
    """
    Resize image to target_size x target_size by center cropping
    """
    try:
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
        width, height = image.size

        # Calculate scaling factor to cover the target size
        scale = target_size / min(width, height)

        # Calculate new dimensions
        new_width = int(width * scale)
        new_height = int(height * scale)

        # Resize image
        resized_image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)

        # Center crop to target size
        left = (new_width - target_size) // 2
        top = (new_height - target_size) // 2
        right = left + target_size
        bottom = top + target_size

        cropped_image = resized_image.crop((left, top, right, bottom))

        return cropped_image, (scale, (left, top))

    except Exception as e:
        print(f"Error processing image: {e}")
        return None, None


def download_image_from_api_response(api_response_data, prefix, save_directory=None):
    if save_directory is None:
        desktop_path = Path.home() / "Desktop"
        save_directory = desktop_path / "Invasive Plant Observation Photos" #You will find your image out put in the following location C:\Users\YOUR NAME\Desktop


    if not os.path.exists(save_directory):
        os.makedirs(save_directory)

    try:
        results = api_response_data.get('results', [])

        print(f"Total results found: {len(results)}")

        if not results:
            print("No results found in API response")
            return

        downloaded_files = []
        downloaded_urls = set()
        image_counter = 1

        for i, result in enumerate(results):
            print(f"\nProcessing observation {i + 1}/{len(results)}")
            try:
                photos = result.get('photos', [])
                print(f"  Photos found in this observation: {len(photos)}")

                if not photos:
                    print(f"  No photos found for observation {i + 1}")
                    continue

                for j, photo in enumerate(photos):
                    try:
                        photo_url = photo.get('url')
                        if not photo_url:
                            print(f"    No URL found for photo {j + 1}")
                            continue

                        if 'square' in photo_url:
                            medium_url = photo_url.replace('square', 'original')
                        elif 'small' in photo_url:
                            medium_url = photo_url.replace('small', 'original')
                        else:
                            medium_url = photo_url

                        print(f"    Photo {j + 1} URL: {medium_url[:50]}...")

                        if medium_url in downloaded_urls:
                            print(f"    Skipping duplicate URL for photo {j + 1}")
                            continue

                        downloaded_urls.add(medium_url)
                        print(f"    Downloading image...")

                        response = requests.get(medium_url, stream=True)
                        response.raise_for_status()

                        content_type = response.headers.get('content-type', '')
                        if 'jpeg' in content_type or 'jpg' in content_type:
                            extension = '.jpg'
                        elif 'png' in content_type:
                            extension = '.png'
                        else:
                            extension = '.jpg'

                        filename = f"{prefix}_{image_counter:04d}{extension}"
                        file_path = os.path.join(save_directory, filename)

                        image_bytes = response.content
                        # img_byte_array = resize_and_pad_from_bytes(image_bytes)

                        # # Open image from bytes # Resize to 640x640
                        # image = Image.open(BytesIO(image_bytes)).convert("RGB")
                        # target_size = (640, 640)
                        # resized_image = image.resize(target_size, Image.Resampling.LANCZOS)
                        # resized_image.save(file_path)


                        resized_image, metadata = resize_and_crop(image_bytes, 640)
                        if resized_image is not None:
                            resized_image.save(file_path)


                        # with open(file_path, 'wb') as f:
                        #     f.write(resized_image)

                        # with open(file_path, 'wb') as f:
                        #     for chunk in response.iter_content(chunk_size=8192):
                        #         f.write(chunk)

                        downloaded_files.append(file_path)
                        print(f"    Successfully downloaded: {filename}")
                        image_counter += 1

                    except Exception as e:
                        print(f"    Error downloading photo {j + 1}: {str(e)}")
                        continue

            except Exception as e:
                print(f"  Error processing observation {i + 1}: {str(e)}")
                continue

        print(f"\n=== SUMMARY ===")
        print(f"Total observations processed: {len(results)}")
        print(f"Unique images downloaded: {len(downloaded_files)}")
        print(f"Duplicate URLs skipped: {len([r for r in results if r.get('photos')]) - len(downloaded_files)}")

        return downloaded_files

    except Exception as e:
        print(f"Error processing API response: {str(e)}")
        return []



def download_from_json_string(json_string):
    try:
        if not json_string.strip():
            print("JSON string is empty!")
            return []

        api_data = json.loads(json_string)
        print(f"JSON parsed successfully")
        return download_image_from_api_response(api_data)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {str(e)}")
        return []


def download_from_url(url, folder, prefix):
    try:
        print(f"Fetching data from: {url}")
        response = requests.get(url)
        response.raise_for_status()

        api_data = response.json()
        print(f"API data fetched successfully")
        destination_path = os.path.join(save_dir, folder)
        return download_image_from_api_response(api_data, prefix, destination_path)
    except Exception as e:
        print(f"Error fetching from URL: {str(e)}")
        return []


pyracantha_url = "https://api.inaturalist.org/v1/observations?place_id=6986&quality_grade=research&taxon_id=54053&photos=true&per_page=1000"
mango_url = "https://api.inaturalist.org/v1/observations?place_id=6986&quality_grade=research&taxon_id=48875&photos=true&per_page=1000"
thorn_tree_url = "https://api.inaturalist.org/v1/observations?place_id=6986&quality_grade=research&taxon_id=72418&photos=true&per_page=100"
cotoneasters_url = "https://api.inaturalist.org/v1/observations?place_id=6986&quality_grade=research&taxon_id=53376&photos=true&per_page=100"

downloaded_files = download_from_url(cotoneasters_url, "Cotoneasters", "Cotoneasters")

print(f"\nFinal result: Downloaded {len(downloaded_files)} images")