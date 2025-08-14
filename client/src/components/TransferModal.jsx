import React, { useState, useEffect } from "react";

export default function TransferModal({
  isOpen,
  selectedCount,
  selectedIds,       // <-- ADD this line
  onClose,
  locationOptions,
  newLocation,
  onLocationChange,
  onTransfer,
}) {
  const [localLocation, setLocalLocation] = useState("");

  // Sync localLocation with parent newLocation
  useEffect(() => {
    setLocalLocation(newLocation || "");
  }, [newLocation, isOpen]);

  if (!isOpen) return null;

  const handleTransfer = () => {
    if (selectedCount > 0 && localLocation) {
      onLocationChange(localLocation); // Ensure state is up to date in parent
      onTransfer();
    }
  };

  const handleSelect = (e) => {
    setLocalLocation(e.target.value);
    onLocationChange(e.target.value);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          minWidth: 360,
          background: "#000000ff",
          border: "2.5px solid #6a7257",
          borderRadius: 16,
          padding: "34px 34px 22px 34px",
          color: "#fff",
          boxShadow: "0 12px 60px #000b",
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 1.2,
            color: "#d6ffb5",
            marginBottom: 22,
            textTransform: "uppercase",
          }}
        >
          Shop to Shop Transfer
        </div>
        <div style={{ fontSize: 16, marginBottom: 8 }}>
          Selected Assets:{" "}
          <span style={{ color: "#6a7257", fontWeight: 700 }}>{selectedCount}</span>
        </div>
        {/* Show full list of asset IDs */}
        {selectedIds && selectedIds.length > 0 && (
          <div style={{
            marginBottom: 10,
            maxHeight: 110,
            overflowY: "auto",
            fontSize: 13,
            background: "#141a15",
            borderRadius: 5,
            padding: "6px 12px",
            border: "1px solid #2c422a"
          }}>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {selectedIds.map((id) => (
                <li key={id} style={{ color: "#daff05ff", fontWeight: 500 }}>
                  {id}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div style={{ marginBottom: 17 }}>
          <label
            htmlFor="location"
            style={{
              fontSize: 15,
              color: "#ffffffff",
              marginBottom: 8,
              display: "block",
            }}
          >
            New Location
          </label>
          <select
            id="location"
            value={localLocation}
            onChange={handleSelect}
            style={{
              fontSize: 16,
              padding: "7px 18px 7px 10px",
              border: "2px solid #6a7257",
              borderRadius: 8,
              outline: "none",
              background: "#222f1d",
              color: "#fff",
              fontWeight: 600,
              minWidth: 180,
            }}
          >
            <option value="">Select Location…</option>
            {locationOptions &&
              locationOptions.map((loc, i) => (
                <option value={loc} key={loc + i}>
                  {loc}
                </option>
              ))}
          </select>
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 18 }}>
          <button
            onClick={handleTransfer}
            disabled={selectedCount === 0 || !localLocation}
            style={{
              background: selectedCount === 0 || !localLocation ? "#444" : "#6a7257",
              color: "#fff",
              fontWeight: 700,
              fontSize: 18,
              border: "none",
              borderRadius: 7,
              padding: "11px 28px",
              cursor:
                selectedCount === 0 || !localLocation ? "not-allowed" : "pointer",
              boxShadow: "0 2px 8px #0007",
              letterSpacing: 0.6,
              opacity: selectedCount === 0 || !localLocation ? 0.7 : 1,
            }}
          >
            Transfer
          </button>
          <button
            onClick={onClose}
            style={{
              background: "#1d1d1d",
              color: "#b6e7ad",
              border: "2px solid #374134",
              fontWeight: 700,
              fontSize: 18,
              borderRadius: 7,
              padding: "11px 28px",
              cursor: "pointer",
              letterSpacing: 0.5,
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
