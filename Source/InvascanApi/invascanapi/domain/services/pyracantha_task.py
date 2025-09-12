import requests

INATURALIST_API = "https://api.inaturalist.org/v1/observations"
PYRACANTHA_TAXON_ID = 54053  # Pyracantha genus

def download_pyracantha_detections(
    per_page: int = 30,
    place_id: int | None = None,
    quality: str = "research"
):
    all_detections = []
    page = 1

    while True:
        params = {
            "taxon_id": PYRACANTHA_TAXON_ID,
            "photos": "true",
            "per_page": per_page,
            "page": page,
            "quality_grade": quality,
        }

        if place_id:
            params["place_id"] = place_id

        headers = {"User-Agent": "invascan-api/1.0"}

        response = requests.get(INATURALIST_API, params=params, headers=headers, timeout=30)
        response.raise_for_status()

        data = response.json()
        results = data.get("results", [])

        if not results:  # no more data
            break

        for obs in results:
            all_detections.append({
                "id": obs["id"],
                "uuid": obs["uuid"],
                "quality": obs["quality_grade"],
                "time_observed": obs["time_observed_at"],
                "species_guess": obs["species_guess"],
                "species": obs.get("taxon", {}).get("name"),
                "uri": obs["uri"],
                "location": obs["location"],
                "place_guess": obs["place_guess"],
                "latitude": obs.get("geojson", {}).get("coordinates", [None, None])[1],
                "longitude": obs.get("geojson", {}).get("coordinates", [None, None])[0],
                "photos": [p.get("url").replace("/square", "/original") for p in obs.get("photos", [])],

                # "common_name": obs.get("taxon", {}).get("preferred_common_name"),
                # "observed_on": obs.get("observed_on"),
            })
        print(f"loading page {page} of {len(results)}")
        page += 1
    return all_detections
