import axios from "axios";

const INATURALIST_API_URL = "https://api.inaturalist.org/v1/observations";

interface InatObservation {
  id: number;
  geojson: {
    coordinates: [number, number];
  };
  observed_on: string;
}
export interface Observation {
  id: number;
  lat: number;
  lng: number;
  date: string;
  month: string;
  count: number;
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

export async function fetchObservations(taxonId: number, placeId: number): Promise<Observation[]> {
  try {
    const response = await axios.get(INATURALIST_API_URL, {
      params: {
        taxon_id: taxonId,
        place_id: placeId,
        per_page: 50,
      },
    });

    const monthCounts: { [key: string]: number } = {};

    response.data.results
      .filter((item: InatObservation) => item.geojson && item.observed_on)
      .forEach((item: InatObservation) => {
        const month = new Date(item.observed_on).toLocaleString("default", { month: "long" });

        if (!monthCounts[month]) {
          monthCounts[month] = 0;
        }
        monthCounts[month] += 1;  // Increment the count for the month
      });

    return Object.entries(monthCounts).map(([month, count]) => ({
      id: Math.random(),  // Generate a random ID for each aggregated entry
      lat: 0,  // Placeholder as we don't aggregate coordinates
      lng: 0,  // Placeholder as we don't aggregate coordinates
      date: "",  // Placeholder for aggregated data
      month,
      count,
    }));
  } catch (error) {
    console.error("Error fetching observations:", error);
    return [];
  }
}