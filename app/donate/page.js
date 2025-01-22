"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { COUNTRIES } from "../data/countries";
import {
  getAllSupplyTypes,
  getZonesForRegion,
  createDonation,
} from "../utils/firebase-utils";

export default function DonatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [regions] = useState(COUNTRIES);
  const [zones, setZones] = useState([]);
  const [supplyTypes, setSupplyTypes] = useState([]);
  const [formData, setFormData] = useState({
    regionCode: "PS",
    zoneId: "",
    supplyTypeId: "",
    quantity: 0,
    notes: "",
  });

  // Load zones when region changes
  useEffect(() => {
    const loadZones = async () => {
      const zonesData = await getZonesForRegion(formData.regionCode);
      setZones(zonesData);
    };
    loadZones();
  }, [formData.regionCode]);

  // Load supply types on mount
  useEffect(() => {
    const loadSupplyTypes = async () => {
      const types = await getAllSupplyTypes();
      setSupplyTypes(types);
    };
    loadSupplyTypes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createDonation(formData);
      // Save the region to sessionStorage
      sessionStorage.setItem("lastDonationRegion", formData.regionCode);
      // Redirect to main page
      router.push("/");
    } catch (error) {
      alert("Error submitting donation. Please try again.");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg"
      >
        <h1 className="text-2xl font-bold text-center mb-6">Make a Donation</h1>

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
          <label className="block text-gray-700 mb-2">Select Supply Type</label>
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
          <label className="block text-gray-700 mb-2">Notes (Optional)</label>
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
    </div>
  );
}
