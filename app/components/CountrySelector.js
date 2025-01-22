export default function CountrySelector({
  countries,
  selectedCountry,
  onCountryChange,
}) {
  return (
    <div className="py-4">
      <select
        value={selectedCountry.code}
        onChange={(e) => {
          const country = countries.find((c) => c.code === e.target.value);
          onCountryChange(country);
        }}
        className="block w-48 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {countries.map((country) => (
          <option key={country.code} value={country.code}>
            {country.name}
          </option>
        ))}
      </select>
    </div>
  );
}
