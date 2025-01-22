"use client";
import { useState, useEffect } from "react";
import { COUNTRIES } from "../data/countries";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import db from "../../database/firebase";
import { ORGANIZATIONS_COLLECTION } from "../data/collections";

export default function CountrySelector({ onCountryChange }) {
  const [selectedCountry, setSelectedCountry] = useState(null);

  useEffect(() => {
    const initializeCountry = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      let defaultCountry = COUNTRIES.find((c) => c.code === "QA"); // Default to Qatar

      if (user) {
        const orgRef = doc(db, ORGANIZATIONS_COLLECTION, user.uid);
        const orgDoc = await getDoc(orgRef);

        if (orgDoc.exists()) {
          const orgData = orgDoc.data();
          if (orgData.lastDonationRegion) {
            const lastDonatedCountry = COUNTRIES.find(
              (c) => c.code === orgData.lastDonationRegion
            );
            if (lastDonatedCountry) {
              defaultCountry = lastDonatedCountry;
            }
          }
        }
      }

      setSelectedCountry(defaultCountry);
      onCountryChange(defaultCountry);
    };

    initializeCountry();
  }, []);

  const handleCountryChange = (e) => {
    const country = COUNTRIES.find((c) => c.code === e.target.value);
    setSelectedCountry(country);
    onCountryChange(country);
  };

  return (
    <div className="py-4">
      <select
        value={selectedCountry?.code || ""}
        onChange={handleCountryChange}
        className="block w-48 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
  );
}
