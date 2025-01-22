import { useEffect, useState, useRef } from "react";
import { getZone, getAllSupplyTypes } from "../utils/firebase-utils";
import { doc, onSnapshot } from "firebase/firestore";
import db from "../../database/firebase.js";

const formatDate = (timestamp) => {
  if (!timestamp) return "No date available";

  // If timestamp is a Firestore Timestamp, convert to JS Date
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

  // Check if date is valid
  if (isNaN(date.getTime())) return "Invalid date";

  // Format date without seconds
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function InfoPopup({ info, onClose, selectedSupplyType }) {
  const [zoneData, setZoneData] = useState(null);
  const [supplyTypes, setSupplyTypes] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const zoneListener = useRef(null);
  const previousZoneData = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!info) return;

    const unsubscribe = onSnapshot(
      doc(db, "zones", info.id),
      (doc) => {
        if (doc.exists()) {
          setZoneData({ id: doc.id, ...doc.data() });
        }
      },
      (error) => {
        setError("Failed to load zone data");
      }
    );

    return () => unsubscribe();
  }, [info]);

  useEffect(() => {
    const loadData = async () => {
      if (!info?.id) return;

      try {
        // Load supply types if not already loaded
        if (Object.keys(supplyTypes).length === 0) {
          const types = await getAllSupplyTypes();
          const typesMap = {};
          types.forEach((type) => {
            typesMap[type.id] = type.name;
          });
          setSupplyTypes(typesMap);
        }

        // If the zone changed, set up new listener
        if (zoneListener.current) {
          zoneListener.current();
        }

        // Set up real-time listener for the zone
        const zoneRef = doc(db, "zones", info.id);
        zoneListener.current = onSnapshot(
          zoneRef,
          (doc) => {
            if (doc.exists()) {
              previousZoneData.current = zoneData;
              setZoneData({ id: doc.id, ...doc.data() });
            }
          },
          (error) => {
            console.error("Error listening to zone:", error);
          }
        );
      } catch (error) {
        console.error("Error loading zone data:", error);
      }
    };

    loadData();

    // Cleanup listener when component unmounts
    return () => {
      if (zoneListener.current) {
        zoneListener.current();
      }
    };
  }, [info?.id]);

  const getSupplyDetails = () => {
    const currentData = zoneData || previousZoneData.current;
    if (!currentData?.supplies) return null;

    if (!selectedSupplyType) {
      return currentData.supplies.map((supply) => ({
        name: supplyTypes[supply.supplyTypeId] || "Unknown Supply",
        ...supply,
      }));
    }

    const selectedSupply = currentData.supplies.find(
      (s) => s.supplyTypeId === selectedSupplyType
    );
    return selectedSupply
      ? [
          {
            name: supplyTypes[selectedSupply.supplyTypeId] || "Unknown Supply",
            ...selectedSupply,
          },
        ]
      : [];
  };

  if (!info) return null;

  const supplies = getSupplyDetails();
  const displayData = zoneData || previousZoneData.current;

  return (
    <div className="absolute bottom-8 right-8 bg-white p-4 rounded-lg shadow-lg z-20 w-96">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
      >
        ×
      </button>
      <div className="pr-6">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: info.fillColor }}
          />
          <h3 className="font-bold text-lg text-gray-900">
            {info.name || "Unknown Region"}
          </h3>
        </div>
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            <span className="font-semibold">Type:</span> {info.type || "N/A"}
          </p>
          {info.details && (
            <p>
              <span className="font-semibold">Details:</span> {info.details}
            </p>
          )}

          {/* Supply Information */}
          <div className="mt-4">
            <h4 className="font-semibold text-base mb-2">
              {selectedSupplyType
                ? `Supply: ${supplyTypes[selectedSupplyType]}`
                : "All Supplies"}
            </h4>
            {!displayData ? (
              <p className="text-gray-500">Loading supplies...</p>
            ) : supplies && supplies.length > 0 ? (
              <div className="space-y-2">
                {supplies.map((supply) => (
                  <div
                    key={supply.supplyTypeId}
                    className={`bg-gray-50 p-2 rounded border ${
                      selectedSupplyType
                        ? "border-blue-400 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <p className="font-medium text-gray-800">{supply.name}</p>
                    <div className="grid grid-cols-2 gap-2 mt-1 text-sm">
                      <div>
                        <span className="text-gray-500">Available:</span>{" "}
                        <span className="font-medium">{supply.quantity}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Needed:</span>{" "}
                        <span className="font-medium">{supply.need}</span>
                      </div>
                      <div className="col-span-2 text-xs text-gray-400">
                        Last updated: {formatDate(supply.lastUpdated)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">
                {selectedSupplyType
                  ? `No data available for ${supplyTypes[selectedSupplyType]}`
                  : "No supplies information available"}
              </p>
            )}
          </div>

          {/* Donate Button */}
          <div className="mt-6">
            <button
              onClick={() => {
                const params = new URLSearchParams({
                  regionCode: info.id.split("-")[0],
                  zoneId: info.id,
                  zoneName: info.name,
                });
                if (selectedSupplyType) {
                  params.append("supplyTypeId", selectedSupplyType);
                }
                window.location.href = `/donate?${params.toString()}`;
              }}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
            >
              Donate to {info.name}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
