export default function InfoPopup({ info, onClose }) {
  if (!info) return null;

  return (
    <div className="absolute bottom-8 right-8 bg-white p-4 rounded-lg shadow-lg z-20 w-80">
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
        </div>
      </div>
    </div>
  );
}
