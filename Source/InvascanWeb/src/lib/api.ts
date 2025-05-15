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
        per_page: 100,
      },
    });

    const monthCounts: {
      [key: string]: { count: number; timestamp: number };
    } = {};

    //sort by date
    response.data.results
      .filter((item: InatObservation) => item.geojson && item.observed_on)
      .forEach((item: InatObservation) => {
        const dateObj = new Date(item.observed_on);
        // Get first day of month for consistent timestamp
        const firstOfMonth = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
        const monthYear = firstOfMonth.toLocaleString("default", { month: "short", year: "numeric" });
        const timestamp = firstOfMonth.getTime();

        if (!monthCounts[monthYear]) {
          monthCounts[monthYear] = { count: 0, timestamp };
        }
        monthCounts[monthYear].count += 1;
      });

    const results = Object.entries(monthCounts)
      .map(([monthYear, { count, timestamp }]) => ({
        id: Math.random(),
        lat: 0,
        lng: 0,
        date: "",
        month: monthYear,
        count,
        timestamp, // add timestamp for sorting
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    return results;
  } catch (error) {
    console.error("Error fetching observations:", error);
    return [];
  }
}
