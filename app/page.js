"use client";
import { useState } from "react";
import Map from "./components/Map";
import CountrySelector from "./components/CountrySelector";
import RegionsList from "./components/RegionsList";
import { COUNTRIES } from "./data/countries";
import ProfileIndicator from "./components/ProfileIndicator";
import DonateButton from "./components/DonateButton";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [supplyUpdateCounter, setSupplyUpdateCounter] = useState(0);

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    setSelectedRegion(null);
  };

  const triggerMapUpdate = () => {
    setSupplyUpdateCounter((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <CountrySelector
              countries={COUNTRIES}
              selectedCountry={selectedCountry}
              onCountryChange={handleCountryChange}
            />
            <ProfileIndicator />
          </div>
        </div>
        {/* Sidebar */}
        <div className="fixed top-[88px] left-0 w-64 h-[calc(100vh-88px)] overflow-y-auto border-r border-gray-200 bg-white">
          <RegionsList
            regions={regions}
            selectedRegion={selectedRegion}
            onRegionSelect={setSelectedRegion}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64 pt-[88px]">
          <div className="container mx-auto px-4 py-8">
            <Map
              selectedCountry={selectedCountry}
              loading={loading}
              error={error}
              onLoadingChange={setLoading}
              onErrorChange={setError}
              onRegionsLoad={setRegions}
              selectedRegion={selectedRegion}
              onRegionSelect={setSelectedRegion}
              supplyUpdateTrigger={supplyUpdateCounter}
            />
            <DonateButton />
          </div>
        </div>
      </div>
    </div>
  );
}
