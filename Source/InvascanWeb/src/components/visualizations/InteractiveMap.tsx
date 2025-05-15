"use client";
import { useState, useEffect } from "react";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer } from "@deck.gl/layers";
import { Map } from "react-map-gl/mapbox"
import mapboxgl from "mapbox-gl";  // Import the mapbox-gl library
import "mapbox-gl/dist/mapbox-gl.css";

// Set the Mapbox token globally
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_KEY as string;

type MapPoint = {
  lng: number;
  lat: number;
};

interface Props {
  points: MapPoint[];
  focusPoint: MapPoint | null;
}

export default function InteractiveMap({ points, focusPoint }: Props) {
  const [viewState, setViewState] = useState({
    longitude: 28.2293,
    latitude: -25.7479,
    zoom: 5,
  });

  useEffect(() => {
    if (focusPoint) {
      setViewState({
        longitude: focusPoint.lng,
        latitude: focusPoint.lat,
        zoom: 10,
      });
    }
  }, [focusPoint]);

  const scatterLayer = new ScatterplotLayer({
    id: "scatter-layer",
    data: points,
    getPosition: (d: MapPoint) => [d.lng, d.lat],
    getRadius: 1000,
    getFillColor: [0, 100, 255],
  });

  return (
    
    <DeckGL
      viewState={viewState}
      controller={true}
      layers={[scatterLayer]}
      onViewStateChange={(e) =>
        setViewState(e.viewState as { longitude: number; latitude: number; zoom: number })
      }
      style={{ height: "100%", width: "100%" }}
    >
      <Map
              mapStyle="mapbox://styles/mapbox/streets-v11"
            style={{ width: "100%", height: "100%" }}
        {...viewState}  // Spread the viewState object for map positioning
        onMove={(evt) => setViewState(evt.viewState)}
      />
    </DeckGL>
  );
}
