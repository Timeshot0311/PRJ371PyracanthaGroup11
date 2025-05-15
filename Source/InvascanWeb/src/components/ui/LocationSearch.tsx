"use client";
import { useState } from "react";
import { getLocationData } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

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
    <div className='flex gap-2 w-full'>
      <Input type='text' placeholder='Search location' value={query} onChange={(e) => setQuery(e.target.value)} />
      <Button onClick={handleSearch}>
        <Search className='size-4' />
        Search
      </Button>
    </div>
  );
};

export default LocationSearch;
