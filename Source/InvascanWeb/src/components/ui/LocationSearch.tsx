"use client";
import { useState } from "react";
import { getLocationData } from "@/lib/api";

interface Props {
  onSearch: (lng: number, lat: number) => void;
}

const LocationSearch: React.FC<Props> = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleSearch = async () => {
    const location = await getLocationData(query);
    if (location) {
      onSearch(location.lng, location.lat);
    } else {
      console.warn("No location data found.");
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Search location"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border p-2 w-full"
      />
      <button onClick={handleSearch} className="p-2 bg-blue-600 text-white">
        Search
      </button>
    </div>
  );
};

export default LocationSearch;
