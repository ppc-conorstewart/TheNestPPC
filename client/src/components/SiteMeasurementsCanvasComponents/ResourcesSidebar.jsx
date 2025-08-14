import React, { useState } from "react";
import FracSpreadImg from "../../assets/Library/FracSpread.png";
import PumpdownImg from "../../assets/Library/Pumpdown.png";

const LIBRARY_ITEMS = [
  { name: "Frac Spread", src: FracSpreadImg, key: "fracspread" },
  { name: "Pumpdown", src: PumpdownImg, key: "pumpdown" }
];

// (Keep your REFERENCE_DOCS and sidebar styling as before)
export default function ResourcesSidebar({
  width = 260
}) {
  const [open, setOpen] = useState(null);

  const handleToggle = key => setOpen(prev => (prev === key ? null : key));

  return (
    <div
      style={{
        height: "100%",
        width,
        background: "#191A16",
        color: "#6a7257",
        borderLeft: "4px solid #6a7257",
        display: "flex",
        flexDirection: "column",
        padding: 0,
        overflowY: "auto",
        boxShadow: "0 0 20px #000a"
      }}
    >
      <div
        style={{
          fontWeight: 900,
          fontSize: 24,
          color: "#6a7257",
          padding: "22px 28px 10px 24px",
          borderBottom: "2px solid #6a7257",
          letterSpacing: "0.6px"
        }}
      >
        Library
      </div>
      {/* --- LIBRARY IMAGES/SYMBOLS --- */}
      <div style={{ padding: "16px 10px 12px 10px" }}>
        <div
          style={{
            fontWeight: 700,
            color: "#8cf94a",
            fontSize: 15,
            marginBottom: 7,
            textTransform: "uppercase"
          }}
        >
          Symbols & Pictures
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
          {LIBRARY_ITEMS.map(item => (
            <div
              key={item.key}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "grab",
                width: 100,
                minHeight: 110,
                marginBottom: 14,
                borderRadius: 10,
                background: "#232716",
                border: "1.5px solid #303a23",
                padding: "14px 8px",
                transition: "background 0.16s, box-shadow 0.16s"
              }}
            >
              <img
                src={item.src}
                alt={item.name}
                style={{
                  width: 80,
                  height: 80,
                  objectFit: "contain",
                  marginBottom: 8,
                  cursor: "grab"
                }}
                draggable={true}
                onDragStart={e => {
                  e.dataTransfer.setData("application/library-item", JSON.stringify(item));
                }}
              />
              <span style={{ color: "#e8eed0", fontSize: 15, fontWeight: 600, textAlign: "center" }}>
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* (Reference Docs section... leave as before) */}
    </div>
  );
}
