"use client";

import { useState, useEffect } from "react";
import Map from "../components/Map";
import { COUNTRIES } from "../data/countries";
import {
  getRegion,
  getZonesForRegion,
  getAllSupplyTypes,
  updateZoneSupplies,
  getZone,
  initializeZoneSupplies,
} from "../utils/firebase-utils.js";
import RequireAuth from "../components/auth/RequireAuth";
import UserStatus from "../components/auth/UserStatus";

export default function TestPage() {
  const [testData, setTestData] = useState(null);
  const [error, setError] = useState(null);
  const [supplyTypes, setSupplyTypes] = useState([]);
  const [selectedZone, setSelectedZone] = useState("");
  const [zones, setZones] = useState([]);
  const [supplyUpdateCounter, setSupplyUpdateCounter] = useState(0);
  const [supplies, setSupplies] = useState({
    supplyTypeId: "",
    quantity: 0,
    need: 0,
  });
  const [loading, setLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [regions, setRegions] = useState([]);
  const [selectedRegionCode, setSelectedRegionCode] = useState("PS"); // Default to PS (Gaza)

  useEffect(() => {
    // Load supply types and zones when component mounts
    const loadInitialData = async () => {
      try {
        // Load supply types
        const types = await getAllSupplyTypes();
        setSupplyTypes(types);

        // Load zones for the selected region
        await loadZonesForRegion(selectedRegionCode);
      } catch (error) {
        console.error("Error loading initial data:", error);
        setError(error.message);
      }
    };

    loadInitialData();
  }, [selectedRegionCode]); // Reload when region changes

  const loadZonesForRegion = async (regionCode) => {
    try {
      const zonesData = await getZonesForRegion(regionCode);
      setZones(zonesData);
      console.log("Zones loaded for region:", regionCode, zonesData);
      // Clear selected zone when region changes
      setSelectedZone("");
    } catch (error) {
      console.error("Error loading zones:", error);
      setError(error.message);
    }
  };

  const testGetRegion = async () => {
    try {
      const region = await getRegion("PS");
      console.log("Region data:", region);
      setTestData(region);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    }
  };

  const testGetZones = async () => {
    try {
      const zonesData = await getZonesForRegion("PS");
      console.log("Zones data:", zonesData);
      setZones(zonesData);
      setTestData(zonesData);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    }
  };

  const handleUpdateSupplies = async (e) => {
    e.preventDefault();
    if (!selectedZone) {
      setError("Please select a zone");
      return;
    }

    try {
      const zone = await getZone(selectedZone);
      const currentSupplies = zone.supplies || [];

      // Update or add new supply
      const updatedSupplies = currentSupplies.map((supply) =>
        supply.supplyTypeId === supplies.supplyTypeId
          ? { ...supply, ...supplies, lastUpdated: new Date() }
          : supply
      );

      // If supply type doesn't exist, add it
      if (
        !currentSupplies.find((s) => s.supplyTypeId === supplies.supplyTypeId)
      ) {
        updatedSupplies.push({
          ...supplies,
          lastUpdated: new Date(),
        });
      }

      await updateZoneSupplies(selectedZone, updatedSupplies);
      setTestData(updatedSupplies);
      setError(null);
      setSupplyUpdateCounter((prev) => prev + 1);
    } catch (error) {
      console.error("Error updating supplies:", error);
      setError(error.message);
    }
  };

  const initializeAllZonesSupplies = async () => {
    try {
      setError(null);
      const types = await getAllSupplyTypes();

      // Process each region in COUNTRIES
      for (const country of COUNTRIES) {
        const zonesData = await getZonesForRegion(country.code);
        console.log(`Initializing supplies for ${country.name}...`);

        for (const zone of zonesData) {
          // Create random supplies for each type
          const defaultSupplies = types.map((type) => {
            // Generate random values between 50-150 for quantity and 0-200 for need
            const quantity = Math.floor(Math.random() * 101) + 50; // 50-150
            const need = Math.floor(Math.random() * 201); // 0-200

            return {
              supplyTypeId: type.id,
              quantity: quantity,
              need: need,
              lastUpdated: new Date(),
            };
          });

          await updateZoneSupplies(zone.id, defaultSupplies);
          console.log(`Initialized supplies for zone: ${zone.name}`);
        }
      }

      setTestData({
        message:
          "Successfully initialized supplies for all zones in all regions",
      });
      setSupplyUpdateCounter((prev) => prev + 1);
    } catch (error) {
      console.error("Error initializing supplies:", error);
      setError(error.message);
    }
  };

  const deleteAllSupplies = async () => {
    try {
      setError(null);

      // Process each region in COUNTRIES
      for (const country of COUNTRIES) {
        // Get all zones for this region
        const zonesData = await getZonesForRegion(country.code);
        console.log(`Deleting supplies for ${country.name}...`);

        // Update each zone with empty supplies array
        for (const zone of zonesData) {
          await updateZoneSupplies(zone.id, []);
          console.log(`Cleared supplies for zone: ${zone.name}`);
        }
      }

      setTestData({
        message: "Successfully deleted all supplies from all zones",
      });
      setSupplyUpdateCounter((prev) => prev + 1);
    } catch (error) {
      console.error("Error deleting supplies:", error);
      setError(error.message);
    }
  };

  return (
    <RequireAuth>
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="w-full max-w-4xl mb-8">
          <UserStatus />
        </div>
        <div className="space-x-4 mb-8">
          <button
            onClick={testGetRegion}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Get Region
          </button>
          <button
            onClick={testGetZones}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Test Get Zones
          </button>
          <button
            onClick={initializeAllZonesSupplies}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Initialize All Zones Supplies
          </button>
          <button
            onClick={deleteAllSupplies}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete All Supplies
          </button>
        </div>

        {/* Supply Management Form */}
        <div className="w-full max-w-md mb-8">
          <h2 className="text-xl font-bold mb-4">Update Supplies</h2>
          <form onSubmit={handleUpdateSupplies} className="space-y-4">
            {/* Region Selector */}
            <div>
              <label className="block mb-2">Select Region:</label>
              <select
                value={selectedRegionCode}
                onChange={(e) => setSelectedRegionCode(e.target.value)}
                className="w-full text-black p-2 border rounded"
              >
                {COUNTRIES.map((country) => (
                  <option
                    key={country.code}
                    value={country.code}
                    className="text-black"
                  >
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Zone Selector */}
            <div>
              <label className="block mb-2">Select Zone:</label>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full text-black p-2 border rounded"
              >
                <option value="" className="text-black">
                  Select a zone...
                </option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id} className="text-black">
                    {zone.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2">Supply Type:</label>
              <select
                value={supplies.supplyTypeId}
                onChange={(e) =>
                  setSupplies({ ...supplies, supplyTypeId: e.target.value })
                }
                className="w-full text-black p-2 border rounded"
              >
                <option className="text-black" value="">
                  Select a supply type...
                </option>
                {supplyTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2">Quantity Available:</label>
              <input
                type="number"
                value={supplies.quantity}
                onChange={(e) =>
                  setSupplies({
                    ...supplies,
                    quantity: parseInt(e.target.value),
                  })
                }
                className="w-full text-black p-2 border rounded"
                min="0"
              />
            </div>

            <div>
              <label className="block mb-2">Quantity Needed:</label>
              <input
                type="number"
                value={supplies.need}
                onChange={(e) =>
                  setSupplies({ ...supplies, need: parseInt(e.target.value) })
                }
                className="w-full text-black p-2 border rounded"
                min="0"
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Update Supplies
            </button>
          </form>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            Error: {error}
          </div>
        )}

        <div className="w-full max-w-4xl">
          <Map
            selectedCountry={COUNTRIES[0]} // Gaza City
            loading={loading}
            error={error}
            onLoadingChange={setLoading}
            onErrorChange={setError}
            onRegionsLoad={setZones}
            selectedRegion={selectedRegion}
            onRegionSelect={setSelectedRegion}
            supplyUpdateTrigger={supplyUpdateCounter}
          />
        </div>

        {testData && (
          <div className="mt-4 p-4 border rounded-lg shadow-lg w-full max-w-4xl">
            <pre className="bg-gray-800 text-white p-4 rounded overflow-auto max-h-[600px]">
              {JSON.stringify(testData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
