export default function RegionsList({
  regions,
  onRegionSelect,
  selectedRegion,
}) {
  if (!regions?.length) return null;

  return (
    <div className="p-4">
      <h2 className="font-bold text-lg mb-4 text-gray-800">Regions</h2>
      <div className="space-y-2">
        {regions.map((region, index) => (
          <button
            key={region.name + index}
            onClick={() => onRegionSelect(region)}
            className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center gap-3 ${
              selectedRegion?.name === region.name
                ? "bg-blue-50 text-blue-700"
                : "hover:bg-gray-50 text-gray-700"
            }`}
          >
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: region.fillColor }}
            />
            <div>
              <div className="font-medium">
                {region.name || "Unknown Region"}
              </div>
              <div className="text-sm text-gray-500">
                {region.type || "Region"}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
