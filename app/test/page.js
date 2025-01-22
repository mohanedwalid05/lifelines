"use client";

import { useState } from "react";
import { getRegion, getZonesForRegion } from "../utils/firebase-utils.js";

export default function Test() {
  const [testData, setTestData] = useState(null);
  const [error, setError] = useState(null);

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
      const zones = await getZonesForRegion("PS");
      console.log("Zones data:", zones);
      setTestData(zones);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
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
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {testData && (
        <div className="mt-4 p-4 border rounded-lg shadow-lg w-full max-w-4xl">
          <pre className="bg-gray-800 text-white p-4 rounded overflow-auto max-h-[600px]">
            {JSON.stringify(testData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
