// ==============================
// FleetTruckUpdate.jsx — Wide Modal, Paloma Logo, Working X
// ==============================

import { useState } from "react";

const FLEET_HEADERS = [
  "Truck Unit #",
  "Job",
  "Signed Out To:",
  "Oil Life:",
  "Upcoming planned maintenance"
];

export default function FleetTruckUpdate({ onClose }) {
  const [form, setForm] = useState({
    unit: "",
    kms: "",
    fuel: "",
    oil: "",
    tires: "",
    windshield: "",
    destination: "",
    fuelCard: "",
    radio: "",
    cleaned: "",
    damages: ""
  });
  const [images, setImages] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add submit logic here
  };

  return (
    <div
      style={{
        background: "#000",
        border: "2.5px solid #6a7257",
        borderRadius: 18,
        width: "95vw",
        maxWidth: "1600px",
        minHeight: "540px",
        maxHeight: "90vh",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        margin: "0 auto",
        fontFamily: "Erbaum, sans-serif",
        boxShadow: "0 12px 70px #1d292a90, 0 2px 20px #14171760"
      }}
    >
      {/* Header */}
      <div
        style={{
          width: "100%",
          padding: "0px 0 6px 0",
          margin: 0,
          borderBottom: "2px solid #454837",
          textAlign: "center",
          background: "#000",
          fontFamily: "Erbaum, sans-serif",
          position: "relative",
          minHeight: 68,
          display: "flex",
          alignItems: "center"
        }}
      >
        <img
          src="/assets/Paloma_Logo_White_Rounded.png"
          alt="Paloma"
          style={{
            height: 45,
            marginLeft: 28,
            marginRight: 20,
            marginTop: 6,
            filter: "drop-shadow(0 2px 4px #222)",
            display: "inline-block"
          }}
        />
        <span
          style={{
            color: "#fff",
            fontWeight: 900,
            fontSize: 48,
            letterSpacing: 2,
            textShadow: "0 2px 0 #6a7257",
            fontFamily: "Erbaum, sans-serif",
            textTransform: "uppercase",
            flex: 1,
            textAlign: "center"
          }}
        >
          FLEET TRUCK UPDATE
        </span>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 18,
            right: 36,
            background: "transparent",
            border: "none",
            color: "#b7c495",
            fontSize: 36,
            fontWeight: 700,
            cursor: "pointer",
            zIndex: 25,
            lineHeight: 1,
            padding: 0
          }}
          aria-label="Close"
        >
          &times;
        </button>
      </div>
      {/* Main Content */}
      <div
        style={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          background: "#000"
        }}
      >
        {/* Truck Update Form (Left Panel) */}
        <form
          onSubmit={handleSubmit}
          style={{
            flex: "0 0 385px",
            background: "#000",
            padding: "10px 18px 18px 28px",
            display: "flex",
            flexDirection: "column",
            borderRight: "1.5px solid #6a7257",
            minWidth: 320,
            maxWidth: 420
          }}
        >
          <div
            style={{
              color: "#fff",
              fontWeight: 800,
              fontSize: 30,
              marginBottom: 10,
              textAlign: 'center',
              letterSpacing: 0.5,
              fontFamily: "Erbaum, sans-serif"
            }}
          >
            Truck update
          </div>
          {[
            ["unit", "Unit #:"],
            ["kms", "Km's:"],
            ["fuel", "Fuel:"],
            ["oil", "Oil %:"],
            ["tires", "Tire's:"],
            ["windshield", "Windshield:"],
            ["destination", "Destination:"],
            ["fuelCard", "Fuel Card:"],
            ["radio", "Radio:"],
            ["cleaned", "Cleaned:"],
            ["damages", "Damages:"]
          ].map(([field, label]) => (
            <div
              key={field}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 7,
                fontSize: 18,
                fontFamily: "Erbaum, sans-serif"
              }}
            >
              <label
                htmlFor={field}
                style={{
                  color: "#fff",
                  width: 140,
                  fontWeight: 600,
                  fontSize: 17,
                  fontFamily: "Erbaum, sans-serif"
                }}
              >
                {label}
              </label>
              <input
                type="text"
                id={field}
                name={field}
                value={form[field]}
                onChange={handleChange}
                autoComplete="off"
                style={{
                  background: "transparent",
                  border: "1.5px solid #494f3c",
                  borderRadius: 6,
                  padding: "6px 10px",
                  color: "#e6e8df",
                  fontSize: 17,
                  marginLeft: 18,
                  width: 190,
                  fontFamily: "Erbaum, sans-serif"
                }}
              />
            </div>
          ))}
          <div
            style={{
              marginTop: 16,
              marginBottom: 10,
              fontWeight: 700,
              color: "#fff",
              fontFamily: "Erbaum, sans-serif",
              fontSize: 18,
              letterSpacing: 1.2
            }}
          >
            ATTACH IMAGES
            <label
              htmlFor="fileInput"
              style={{
                color: "#6aef75",
                fontSize: 22,
                marginLeft: 7,
                cursor: "pointer",
                fontWeight: 700
              }}
            >
              +
              <input
                id="fileInput"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </label>
          </div>
          <button
            type="submit"
            style={{
              background: "#6a7257",
              color: "#22251b",
              fontFamily: "Erbaum, sans-serif",
              fontWeight: 900,
              fontSize: 22,
              letterSpacing: 1.1,
              border: "none",
              borderRadius: 10,
              padding: "4px 36px",
              marginTop: 10,
              alignSelf: "flex-start",
              transition: "background 0.18s"
            }}
          >
            SUBMIT
          </button>
        </form>
        {/* Signout Log Table (Right Panel) */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: "#000",
            overflow: "auto"
          }}
        >
          <div
            style={{
              color: "#fff",
              fontWeight: 800,
              fontSize: 29,
              letterSpacing: 1.1,
              padding: "5px 0 2px 0",
              textAlign: "center",
              fontFamily: "Erbaum, sans-serif"
            }}
          >
            Signout Log
          </div>
          <div style={{ flex: 1, overflow: "auto" }}>
            <table
              style={{
                width: "100%",
                marginTop: 9,
                borderCollapse: "collapse",
                background: "transparent",
                color: "#e6e8df",
                fontFamily: "Erbaum, sans-serif",
                fontSize: 16
              }}
            >
              <thead>
                <tr>
                  {FLEET_HEADERS.map((head, i) => (
                    <th
                      key={head}
                      style={{
                        background: "#191f11",
                        color: "#fff",
                        border: "1.5px solid #35392e",
                        padding: "8px 0",
                        fontWeight: 800,
                        fontSize: 16,
                        fontFamily: "Erbaum, sans-serif"
                      }}
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(10)].map((_, idx) => (
                  <tr key={idx}>
                    {FLEET_HEADERS.map((_, c) => (
                      <td
                        key={c}
                        style={{
                          border: "1.1px solid #35392e",
                          height: 27,
                          background: "transparent",
                          fontFamily: "Erbaum, sans-serif"
                        }}
                      >
                        {/* Empty cell (show real data in real app) */}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
