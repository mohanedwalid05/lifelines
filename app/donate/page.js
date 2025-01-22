"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { COUNTRIES } from "../data/countries";
import {
  getAllSupplyTypes,
  getZonesForRegion,
  createDonation,
} from "../utils/firebase-utils";

export default function DonatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [regions] = useState(COUNTRIES);
  const [zones, setZones] = useState([]);
  const [supplyTypes, setSupplyTypes] = useState([]);
  const [formData, setFormData] = useState({
    regionCode: searchParams.get("regionCode") || "PS",
    zoneId: searchParams.get("zoneId") || "",
    supplyTypeId: searchParams.get("supplyTypeId") || "",
    quantity: 0,
    notes: "",
  });

  // Load zones when region changes
  useEffect(() => {
    const loadZones = async () => {
      try {
        console.log("Loading zones for region:", formData.regionCode);
        const zonesData = await getZonesForRegion(formData.regionCode);
        console.log("Loaded zones:", zonesData);
        setZones(zonesData);
      } catch (error) {
        console.error("Error loading zones:", error);
      }
    };
    loadZones();
  }, [formData.regionCode]);

  // Load supply types and initialize data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        console.log("Initializing data...");

        // Load supply types
        const types = await getAllSupplyTypes();
        setSupplyTypes(types);

        // Load initial zones
        const zonesData = await getZonesForRegion(formData.regionCode);
        setZones(zonesData);

        // Verify data is valid
        const zoneExists = zonesData.some(
          (zone) => zone.id === formData.zoneId
        );
        const typeExists = types.some(
          (type) => type.id === formData.supplyTypeId
        );

        console.log("Data validation:", { zoneExists, typeExists });

        if (!zoneExists || !typeExists) {
          console.warn("Invalid zone or supply type");
        }

        setDataLoaded(true);
        setLoading(false);
      } catch (error) {
        console.error("Error initializing data:", error);
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!dataLoaded) {
      console.warn("Data not fully loaded yet");
      return;
    }

    setLoading(true);
    console.log("Submitting form data:", formData);

    try {
      // Validate form data
      if (
        !formData.zoneId ||
        !zones.some((zone) => zone.id === formData.zoneId)
      ) {
        throw new Error("Invalid zone selected");
      }
      if (
        !formData.supplyTypeId ||
        !supplyTypes.some((type) => type.id === formData.supplyTypeId)
      ) {
        throw new Error("Invalid supply type selected");
      }
      if (formData.quantity <= 0) {
        throw new Error("Quantity must be greater than 0");
      }

      await createDonation(formData);
      router.push("/");
    } catch (error) {
      console.error("Error submitting donation:", error);
      alert(error.message || "Error submitting donation. Please try again.");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field ${name} changed to:`, value);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto relative">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="absolute left-0 -top-8 text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          Back
        </button>

        {!dataLoaded ? (
          <div className="bg-white p-8 rounded-lg shadow-lg flex items-center justify-center">
            <p className="text-gray-600">Loading form data...</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-lg shadow-lg"
          >
            <h1 className="text-2xl text-black font-bold mb-6">
              Make a Donation
            </h1>

            {/* Region Selection */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Select Region</label>
              <select
                name="regionCode"
                value={formData.regionCode}
                onChange={handleChange}
                className="w-full p-2 border rounded text-black"
                required
              >
                {regions.map((region) => (
                  <option key={region.code} value={region.code}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Zone Selection */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Select Zone</label>
              <select
                name="zoneId"
                value={formData.zoneId}
                onChange={handleChange}
                className="w-full p-2 border rounded text-black"
                required
              >
                <option value="">Select a zone...</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Supply Type Selection */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Select Supply Type
              </label>
              <select
                name="supplyTypeId"
                value={formData.supplyTypeId}
                onChange={handleChange}
                className="w-full p-2 border rounded text-black"
                required
              >
                <option value="">Select a supply type...</option>
                {supplyTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity Input */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                className="w-full p-2 border rounded text-black"
                required
              />
            </div>

            {/* Notes Input */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full p-2 border rounded text-black"
                rows="3"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-500 text-white py-3 rounded-lg font-bold ${
                loading ? "opacity-50" : "hover:bg-blue-600"
              }`}
            >
              {loading ? "Submitting..." : "Submit Donation"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
