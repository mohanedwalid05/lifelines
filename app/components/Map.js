"use client";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import InfoPopup from "./InfoPopup";
import {
  getZonesForRegion,
  getAllSupplyTypes,
} from "../utils/firebase-utils.js";
import { collection, onSnapshot } from "firebase/firestore";
import db from "../../database/firebase.js";
import { COUNTRIES } from "../data/countries";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { ORGANIZATIONS_COLLECTION } from "../data/collections";

// Define color stops for the gradient
const COLOR_STOPS = {
  RED: "#FF0000", // 150% or more shortage (ratio <= 0.4)
  YELLOW: "#FFFF00", // 120% shortage (ratio = 0.45)
  GREEN: "#00FF00", // 120% or more of needs (ratio >= 1.2)
};

// Calculate color based on supply/need ratio
const calculateColor = (supply, need) => {
  if (!need) return COLOR_STOPS.GREEN; // If no need, return green
  if (!supply) return COLOR_STOPS.RED; // If no supply but need exists, return red

  const ratio = supply / need;

  // New thresholds:
  // ratio = 0.4 means supply is 40% of need (shortage of 150%)
  // ratio = 0.45 means supply is 45% of need (shortage of 120%)
  // ratio = 1.2 means supply is 120% of need (surplus of 20%)

  if (ratio >= 1.2) return COLOR_STOPS.GREEN; // 120% or more of needs
  if (ratio <= 0.4) return COLOR_STOPS.RED; // 150% or more shortage

  // Between thresholds - interpolate
  if (ratio < 0.45) {
    // Interpolate between red and yellow (0.4 -> 0.45)
    const t = (ratio - 0.4) / 0.05;
    return interpolateColor(COLOR_STOPS.RED, COLOR_STOPS.YELLOW, t);
  } else {
    // Interpolate between yellow and green (0.45 -> 1.2)
    const t = (ratio - 0.45) / 0.75;
    return interpolateColor(COLOR_STOPS.YELLOW, COLOR_STOPS.GREEN, t);
  }
};

// Helper function to interpolate between two colors
const interpolateColor = (color1, color2, t) => {
  // Convert hex to RGB
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  // Interpolate each component
  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * t);
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * t);
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * t);

  // Convert back to hex
  return rgbToHex(r, g, b);
};

// Helper function to convert hex to RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

// Helper function to convert RGB to hex
const rgbToHex = (r, g, b) => {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

// Modify calculateZoneColor to accept selectedSupplyType
const calculateZoneColor = (supplies, selectedSupplyType) => {
  if (!supplies || supplies.length === 0) return COLOR_STOPS.GREEN;

  if (selectedSupplyType) {
    // Find the specific supply type
    const supply = supplies.find((s) => s.supplyTypeId === selectedSupplyType);
    if (!supply) return COLOR_STOPS.GREEN; // No data for this supply type
    if (!supply.need) return COLOR_STOPS.GREEN; // No need for this supply type

    return calculateColor(supply.quantity, supply.need);
  } else {
    // Original logic for all supplies
    const ratios = supplies.map((supply) => ({
      ratio: supply.quantity / (supply.need || 1),
      need: supply.need,
    }));

    const activeRatios = ratios.filter((r) => r.need > 0);
    if (activeRatios.length === 0) return COLOR_STOPS.GREEN;

    const worstRatio = Math.min(...activeRatios.map((r) => r.ratio));
    return calculateColor(worstRatio * 100, 100);
  }
};

// Initialize Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function Map({
  selectedCountry,
  loading,
  error,
  onLoadingChange,
  onErrorChange,
  onRegionsLoad,
  selectedRegion,
  onRegionSelect,
  supplyUpdateTrigger,
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const zonesListener = useRef(null);
  const [selectedSupplyType, setSelectedSupplyType] = useState("");
  const [supplyTypes, setSupplyTypes] = useState([]);
  const [mapInitialized, setMapInitialized] = useState(false);

  useEffect(() => {
    const loadSupplyTypes = async () => {
      try {
        const types = await getAllSupplyTypes();
        setSupplyTypes(types);
      } catch (error) {
        console.error("Error loading supply types:", error);
      }
    };

    loadSupplyTypes();
  }, []);

  const updateMapData = async (country) => {
    if (!map.current || !mapInitialized) return;

    try {
      onLoadingChange(true);
      onErrorChange(null);

      const boundariesData = await fetchZones(country);

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

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      // Get the user's organization data
      const orgRef = doc(db, ORGANIZATIONS_COLLECTION, user.uid);
      getDoc(orgRef).then((orgDoc) => {
        if (orgDoc.exists()) {
          const orgData = orgDoc.data();
          if (orgData.lastDonationRegion) {
            const donatedCountry = COUNTRIES.find(
              (c) => c.code === orgData.lastDonationRegion
            );
            if (donatedCountry) {
              selectedCountry = donatedCountry;
            }
          }
        }

        // Initialize map with selected country
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/light-v11",
          center: selectedCountry.center,
          zoom: selectedCountry.zoom,
          minZoom: 2,
          maxZoom: 18,
        });

        map.current.on("load", () => {
          setMapInitialized(true);
        });
      });
    } else {
      // No user logged in, initialize with default country
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: selectedCountry.center,
        zoom: selectedCountry.zoom,
        minZoom: 2,
        maxZoom: 18,
      });

      map.current.on("load", () => {
        setMapInitialized(true);
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update map when initialized
  useEffect(() => {
    if (mapInitialized) {
      updateMapData(selectedCountry);
    }
  }, [mapInitialized, selectedCountry]);

  // Update when selected region changes
  useEffect(() => {
    if (mapInitialized && map.current.getLayer("region-fills")) {
      map.current.setPaintProperty("region-fills", "fill-opacity", [
        "case",
        ["==", ["get", "name"], selectedRegion?.name || ""],
        0.85,
        0.7,
      ]);
    }
  }, [selectedRegion]);

  // Update when supply type changes
  useEffect(() => {
    if (mapInitialized && map.current.getSource("regions")) {
      updateMapData(selectedCountry);
    }
  }, [selectedSupplyType]);

  // Listen for supply updates
  useEffect(() => {
    if (mapInitialized && map.current.getSource("regions")) {
      updateMapData(selectedCountry);
    }
  }, [supplyUpdateTrigger]);

  const fetchZones = async (country) => {
    try {
      const zones = await getZonesForRegion(country.code);

      const features = zones.map((zone) => ({
        type: "Feature",
        properties: {
          id: zone.id,
          name: zone.name,
          type: zone.type || "Region",
          fillColor: calculateZoneColor(zone.supplies, selectedSupplyType),
          supplies: zone.supplies,
        },
        geometry: zone.boundaries,
      }));

      onRegionsLoad(
        features.map((f) => ({
          ...f.properties,
        }))
      );

      return {
        type: "FeatureCollection",
        features,
      };
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="relative w-full h-[600px]">
      <div className="absolute top-4 left-4 z-10">
        <select
          value={selectedSupplyType}
          onChange={(e) => setSelectedSupplyType(e.target.value)}
          className="w-48 p-2 border rounded text-sm text-black"
        >
          <option value="" className="text-black">
            All Supplies
          </option>
          {supplyTypes.map((type) => (
            <option key={type.id} value={type.id} className="text-black">
              {type.name}
            </option>
          ))}
        </select>
      </div>

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

      <div ref={mapContainer} className="w-full h-full" />
      <InfoPopup
        info={selectedRegion}
        onClose={() => onRegionSelect(null)}
        selectedSupplyType={selectedSupplyType}
      />
    </div>
  );
}
