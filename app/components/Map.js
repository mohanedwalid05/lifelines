import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import InfoPopup from "./InfoPopup";

const COLORS = [
  "#FF5733",
  "#33FF57",
  "#3357FF",
  "#FFD700",
  "#FF69B4",
  "#4B0082",
  "#00CED1",
  "#FF4500",
  "#32CD32",
  "#BA55D3",
  "#FF8C00",
  "#20B2AA",
  "#FF1493",
  "#00FA9A",
  "#9370DB",
];

export default function Map({
  selectedCountry,
  loading,
  error,
  onLoadingChange,
  onErrorChange,
  onRegionsLoad,
  selectedRegion,
  onRegionSelect,
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  const fetchBoundaries = async (country) => {
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/boundaries/consists-of?id=${country.placeId}&geometry=geometry_1000&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch boundaries");
      }

      const data = await response.json();

      if (!data.features?.length) {
        throw new Error("No boundaries found");
      }

      const features = data.features.map((feature, index) => ({
        type: "Feature",
        properties: {
          ...feature.properties,
          fillColor: COLORS[index % COLORS.length],
          name: feature.properties.name,
          type: feature.properties.type || "Region",
          details: feature.properties.formatted,
        },
        geometry: feature.geometry,
      }));

      // Send regions data to parent
      onRegionsLoad(
        features.map((f) => ({
          ...f.properties,
          fillColor: f.properties.fillColor,
        }))
      );

      return {
        type: "FeatureCollection",
        features,
      };
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const updateMapData = async (country) => {
    try {
      onLoadingChange(true);
      onErrorChange(null);

      const boundariesData = await fetchBoundaries(country);

      if (map.current.getSource("regions")) {
        map.current.getSource("regions").setData(boundariesData);
      } else {
        map.current.addSource("regions", {
          type: "geojson",
          data: boundariesData,
        });

        map.current.addLayer({
          id: "region-fills",
          type: "fill",
          source: "regions",
          paint: {
            "fill-color": ["get", "fillColor"],
            "fill-opacity": [
              "case",
              ["==", ["get", "name"], selectedRegion?.name || ""],
              0.85,
              0.7,
            ],
          },
        });

        map.current.addLayer({
          id: "region-borders",
          type: "line",
          source: "regions",
          paint: {
            "line-color": "#000",
            "line-width": 1,
          },
        });

        // Add click event
        map.current.on("click", "region-fills", (e) => {
          if (e.features.length > 0) {
            const feature = e.features[0];
            onRegionSelect(feature.properties);
          }
        });

        // Change cursor on hover
        map.current.on("mouseenter", "region-fills", () => {
          map.current.getCanvas().style.cursor = "pointer";
        });

        map.current.on("mouseleave", "region-fills", () => {
          map.current.getCanvas().style.cursor = "";
        });
      }

      // Update opacity for selected region
      if (map.current.getLayer("region-fills")) {
        map.current.setPaintProperty("region-fills", "fill-opacity", [
          "case",
          ["==", ["get", "name"], selectedRegion?.name || ""],
          0.85,
          0.7,
        ]);
      }

      map.current.flyTo({
        center: country.center,
        zoom: country.zoom,
        duration: 1000,
      });

      onLoadingChange(false);
    } catch (err) {
      onErrorChange(err.message);
      onLoadingChange(false);
    }
  };

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: selectedCountry.center,
      zoom: selectedCountry.zoom,
      minZoom: 2,
      maxZoom: 18,
    });

    map.current.on("load", () => {
      updateMapData(selectedCountry);
    });

    return () => map.current?.remove();
  }, []);

  useEffect(() => {
    if (map.current && map.current.loaded()) {
      updateMapData(selectedCountry);
    }
  }, [selectedCountry]);

  useEffect(() => {
    // Update opacity when selected region changes
    if (map.current && map.current.getLayer("region-fills")) {
      map.current.setPaintProperty("region-fills", "fill-opacity", [
        "case",
        ["==", ["get", "name"], selectedRegion?.name || ""],
        0.85,
        0.7,
      ]);
    }
  }, [selectedRegion]);

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <div className="text-lg">Loading map data...</div>
        </div>
      )}
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-10">
          Error: {error}
        </div>
      )}
      <div
        ref={mapContainer}
        className="w-full h-[600px] rounded-lg shadow-lg"
      />
      <InfoPopup info={selectedRegion} onClose={() => onRegionSelect(null)} />
    </div>
  );
}
