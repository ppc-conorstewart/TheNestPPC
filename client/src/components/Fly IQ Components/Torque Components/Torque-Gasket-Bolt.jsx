// ==============================
// Torque-Gasket-Bolt.jsx — Torque / Gaskets / Bolt-Up Modal (Reference Message for Bolt-Up and Gasket Tabs)
// ==============================

import { useState } from "react";

const TABS = [
  { key: "hyd", label: "HYD-TORQUE" },
  { key: "pneu", label: "PNEU-TORQUE" },
  { key: "bolt", label: "BOLT-UP" },
  { key: "gasket", label: "GASKETS" }
];

const HYD_IMAGE = "/Torque-Boltup-Hub/hydtorquechart.png";
const PNEU_IMAGE = "/Torque-Boltup-Hub/pneutorquechart.png";

export default function TorqueGasketBolt({ open, onClose }) {
  const [tab, setTab] = useState("hyd");

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(14,18,15, 0.72)",
        backdropFilter: "blur(13px) saturate(160%) brightness(1.08)",
        WebkitBackdropFilter: "blur(13px) saturate(160%) brightness(1.08)",
        boxShadow: "0 0 180px 0 #1b1f1c70 inset",
        transition: "background .16s",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "relative",
          width: "84vw",
          maxWidth: 1200,
          minHeight: 700,
          height: "80vh",
          display: "flex",
          flexDirection: "column",
          background: "#090a08",
          border: "3px solid #6a7257",
          borderRadius: 22,
          boxShadow: "0 6px 44px #000b",
          overflow: "hidden",
          padding: 0,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: "#10110e",
            borderBottom: "2px solid #6a7257",
            padding: "7px 36px 6px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 62,
          }}
        >
          <div style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            justifyContent: "center",
            position: "relative"
          }}>
            <img
              src="/assets/whitelogo.png"
              alt="Paloma"
              style={{
                width: 140,
                height: 54,
                marginRight: 24,
                marginLeft: 6,
                marginTop: 2,
                filter: "drop-shadow(0 2px 10px #363)",
                background: "none"
              }}
              draggable={false}
            />
            <span
              className="font-cornero"
              style={{
                color: "#fff",
                fontSize: "1.7rem",
                fontWeight: 900,
                letterSpacing: ".03em",
                textAlign: "center",
                lineHeight: 1.04,
                fontFamily: "Cornero, Erbaum, sans-serif",
                flex: 1,
                marginLeft: 6,
                marginRight: 8
              }}
            >
              TORQUE / GASKETS / BOLT-UP
            </span>
            <button
              onClick={onClose}
              style={{
                fontSize: 20,
                color: "#ffffffb3",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontWeight: 400,
                lineHeight: 1,
                outline: "none",
                marginLeft: 12,
                transition: "color .14s",
                position: "absolute",
                right: -24,
                top: "30%",
                transform: "translateY(-50%)"
              }}
              title="Close"
            >
              🞫
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
            background: "#090a08",
            borderBottom: "1px solid #6a7257",
            padding: "0 0 0 4px",
            minHeight: 0,
            height: 40,
            position: "relative",
            zIndex: 10
          }}
        >
          {TABS.map((t, idx) => {
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  fontFamily: "Erbaum, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.94rem",
                  color: isActive ? "#ffecc1" : "#babfc2",
                  background: isActive ? "#000" : "#191b17",
                  border: isActive ? "2.5px solid #ffecc1" : "2px solid #6a7257",
                  borderTopLeftRadius: 6,
                  borderTopRightRadius: 36,
                  borderBottom: isActive ? "3px solid #ffecc1" : "0px solid #6a7257",
                  marginRight: 14,
                  marginTop: isActive ? 0 : 0,
                  marginBottom: isActive ? 0 : 0,
                  padding: "4px 38px 2px 38px",
                  letterSpacing: ".01em",
                  cursor: isActive ? "default" : "pointer",
                  opacity: isActive ? 1 : 0.78,
                  boxShadow: isActive
                    ? "0 4px 14px #141a0d10, 0 2px 7px #0007"
                    : "none",
                  position: "relative",
                  zIndex: isActive ? 12 : 11,
                  transition:
                    "background .13s, color .13s, border .13s, box-shadow .13s, margin .13s",
                }}
                tabIndex={isActive ? -1 : 0}
                disabled={isActive}
              >
                {t.label}
              </button>
            );
          })}
          <div style={{ flex: 1 }} />
        </div>
        {/* Content */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            height: "100%",
            padding: 0,
            margin: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#181a13",
            width: "100%",
          }}
        >
          {tab === "hyd" && (
            <img
              src={HYD_IMAGE}
              alt="HYD-TORQUE Chart"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                border: "none",
                margin: 0,
                padding: 0,
                display: "block",
                borderRadius: 0,
                background: "#181a13"
              }}
              draggable={false}
            />
          )}
          {tab === "pneu" && (
            <img
              src={PNEU_IMAGE}
              alt="PNEU-TORQUE Chart"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                border: "none",
                margin: 0,
                padding: 0,
                display: "block",
                borderRadius: 0,
                background: "#181a13"
              }}
              draggable={false}
            />
          )}
          {tab === "bolt" && (
            <div style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "2.1rem", fontWeight: 700, color: "#ffecc1", marginBottom: 18 }}>
                Bolt-Up Reference
              </div>
              <div style={{ fontSize: "1.13rem", opacity: 0.75, color: "#babfc2", marginBottom: 20 }}>
                No bolt-up chart loaded yet. Please consult your field documentation or reach out to Paloma HQ for more information.
              </div>
              <img
                src="/assets/whitelogo.png"
                alt="Paloma Bolt-Up"
                style={{ width: 110, opacity: 0.23, marginTop: 10 }}
                draggable={false}
              />
            </div>
          )}
          {tab === "gasket" && (
            <div style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "2.1rem", fontWeight: 700, color: "#ffecc1", marginBottom: 18 }}>
                Gasket Reference
              </div>
              <div style={{ fontSize: "1.13rem", opacity: 0.75, color: "#babfc2", marginBottom: 20 }}>
                No gasket chart loaded yet. Please consult your field documentation or reach out to Paloma HQ for more information.
              </div>
              <img
                src="/assets/whitelogo.png"
                alt="Paloma Gasket"
                style={{ width: 110, opacity: 0.23, marginTop: 10 }}
                draggable={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
