import axios from "axios";

interface Observation {
  id: number;
  lat: number;
  lng: number;
  date: string;
}

// Fetch location data from Mapbox API
export const getLocationData = async (query: string): Promise<{ lng: number; lat: number } | null> => {
  try {
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`, 
      {
        params: {
          access_token: process.env.NEXT_PUBLIC_MAPBOX_KEY,
          limit: 1,
        },
      }
    );

    if (response.data.features.length > 0) {
      const { center } = response.data.features[0];
      return { lng: center[0], lat: center[1] };
    }
    console.warn("No location found for:", query);
    return null;
  } catch (error) {
    console.error("Mapbox API error:", error);
    return null;
  }
};

// Fetch observation data from Inaturalist API
export const getObservations = async (taxonName: string, placeId: number): Promise<Observation[]> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_INATURALIST_API}/observations`, 
      {
        params: {
          taxon_name: taxonName,
          place_id: placeId,
          per_page: 50,
        },
      }
    );
    return response.data.results.map((item: { id: number; geojson: { coordinates: [number, number] }; observed_on: string; }) => ({
      id: item.id,
      lat: item.geojson.coordinates[1],
      lng: item.geojson.coordinates[0],
      date: item.observed_on,
    }));
  } catch (error) {
    console.error("Error fetching observations:", error);
    return [];
  }
};
