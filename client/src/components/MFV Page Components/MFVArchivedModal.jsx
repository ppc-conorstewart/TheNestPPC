import React from "react";

export default function MFVArchivedModal({
  archived,
  showArchivedModal,
  setShowArchivedModal,
  handleRestore
}) {
  if (!showArchivedModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[#222] rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Archived Pads</h3>
          <button
            onClick={() => setShowArchivedModal(false)}
            className="text-gray-400 hover:text-gray-200"
          >
            ✕
          </button>
        </div>
        {archived.length > 0 ? (
          <ul className="space-y-2">
            {archived.map(p => (
              <li
                key={p.key}
                className="flex justify-between items-center bg-black bg-opacity-20 p-2 rounded"
              >
                <span className="text-white">{p.label}</span>
                <button
                  onClick={() => handleRestore(p.key)}
                  className="text-green-400 hover:text-green-600"
                >
                  Restore
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No archived pads.</p>
        )}
      </div>
    </div>
  );
}
