import requests
import json
import os
from pathlib import Path


def download_image_from_api_response(api_response_data, save_directory=None):
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
                            medium_url = photo_url.replace('square', 'medium')
                        elif 'small' in photo_url:
                            medium_url = photo_url.replace('small', 'medium')
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

                        filename = f"Pyr_{image_counter:04d}{extension}"
                        file_path = os.path.join(save_directory, filename)

                        with open(file_path, 'wb') as f:
                            for chunk in response.iter_content(chunk_size=8192):
                                f.write(chunk)

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


def download_from_url(url):
    try:
        print(f"Fetching data from: {url}")
        response = requests.get(url)
        response.raise_for_status()

        api_data = response.json()
        print(f"API data fetched successfully")
        return download_image_from_api_response(api_data)
    except Exception as e:
        print(f"Error fetching from URL: {str(e)}")
        return []


url = "https://api.inaturalist.org/v1/observations?place_id=6986&quality_grade=research&taxon_id=54052&verifiable=any&per_page=200"

downloaded_files = download_from_url(url)

print(f"\nFinal result: Downloaded {len(downloaded_files)} images")