import requests, os, time

TAXON_NAMES = ["Pyracantha", "Cotoneaster", "Berberis"]  # add your shrubs/berries
TAXON_IDS = [54053, 53376, 58728]  # add your shrubs/berries
PLACE_ID = 6986  # South Africa
PER_PAGE = 100
MAX_PAGES = 1
OUTPUT_DIR = "shrubs_berries"
basePath = f"D:/DATA/PRJ371/training"

def fetch_image_urls(taxon_id):
    all_urls = []
    for page in range(1, MAX_PAGES+1):
        params = {
            "taxon_id": taxon_id,
            "place_id": PLACE_ID,
            "quality_grade": "research",
            #"photo_license": "CC‑BY,CC‑BY‑SA,CC‑0",
            "photos": "true",
            "per_page": PER_PAGE,
            "page": page
        }
        resp = requests.get("https://api.inaturalist.org/v1/observations", params=params)
        resp.raise_for_status()
        results = resp.json().get("results", [])
        if not results:
            break
        for obs in results:
            # photo = results[0].get("taxon").get("default_photo")
            # if photo and "medium_url" in photo:
            #     url = photo["medium_url"]
            #     all_urls.append((taxon_id, obs["id"], url))
            photo = obs.get("photos", [])[0]
            url = photo["url"].replace("square", "original")
            all_urls.append((taxon_id, obs["id"], url))
            # for photo in obs.get("photos", []):
            #     url = photo["url"].replace("square", "original")
            #     all_urls.append((taxon_id, obs["id"], url))
        time.sleep(0.5)
    return all_urls

def download(urls, folder):
    os.makedirs(folder, exist_ok=True)
    for idx, (taxon, obs_id, url) in enumerate(urls):
        ext = url.split('?')[0].split('.')[-1]
        filename = f"{taxon}_{obs_id}_{idx:04d}.{ext}"
        path = os.path.join(folder, filename)
        try:
            r = requests.get(url, timeout=10)
            r.raise_for_status()
            with open(path, 'wb') as f:
                f.write(r.content)
            print("Saved", filename)
        except Exception as e:
            print("Error:", e)
        #time.sleep(0.2)

if __name__ == "__main__":
    all_urls = []
    taxon_name = TAXON_NAMES[0]
    taxon_id = TAXON_IDS[0]
    taxon_folder = os.path.join(basePath, taxon_name)
    os.makedirs(taxon_folder, exist_ok=True)
    print(f"Fetching: {taxon_name} for taxonid {taxon_id}")
    all_urls.extend(fetch_image_urls(taxon_id))
    print("Total to download:", len(all_urls))
    download(all_urls, taxon_folder)

    all_urls = []
    taxon_name = TAXON_NAMES[1]
    taxon_id = TAXON_IDS[1]
    taxon_folder = os.path.join(basePath, taxon_name)
    os.makedirs(taxon_folder, exist_ok=True)
    print(f"Fetching: {taxon_name} for taxonid {taxon_id}")
    all_urls.extend(fetch_image_urls(taxon_id))
    print("Total to download:", len(all_urls))
    download(all_urls, taxon_folder)

    all_urls = []
    taxon_name = TAXON_NAMES[2]
    taxon_id = TAXON_IDS[2]
    taxon_folder = os.path.join(basePath, taxon_name)
    os.makedirs(taxon_folder, exist_ok=True)
    print(f"Fetching: {taxon_name} for taxonid {taxon_id}")
    all_urls.extend(fetch_image_urls(taxon_id))
    print("Total to download:", len(all_urls))
    download(all_urls, taxon_folder)



    # for i, taxon in TAXON_IDS:
    #     taxon_name = TAXON_NAMES[i]
    #     taxon_folder = os.path.join(basePath, taxon_name)
    #     os.makedirs(taxon_folder, exist_ok=True)
    #     print(f"Fetching: {taxon_name} for taxonid {taxon}")
    #     all_urls.extend(fetch_image_urls(taxon))
    # print("Total to download:", len(all_urls))
    # download(all_urls, OUTPUT_DIR)
