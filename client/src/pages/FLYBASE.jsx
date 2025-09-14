// ==============================
// FILE: src/pages/FLYBASE.jsx
// ==============================

// ============================== Imports ==============================
import { useState } from "react";
import PalomaLogo from "../assets/whitelogo.png";
import BackgroundFX from "../components/BackgroundFX";

// ============================== Section Color Definitions ==============================
const SECTION_COLORS = [
  { title: "Valve Reports", color: "#6a7257" },
  { title: "Shop Resources", color: "#4477b8" },
  { title: "Safety Documentation", color: "#c8b18b" },
  { title: "Section 4", color: "#948bc8" },
  { title: "Section 5", color: "#e28a8a" },
  { title: "Paloma Zone", color: "#6dc2bb" }
];

// ============================== Section Cards ==============================
const SECTION_CARDS = [
  [
    { title: "Build and Tolerance Form", desc: "Submit and review build tolerances" },
    { title: "Valve Testing Form", desc: "Record valve testing results" },
    { title: "Valve Testing Chart Submission", desc: "Upload and track test charts" }
  ],
  [
    { title: "Card 1", desc: "This is Card 1 in Section 2" },
    { title: "Card 2", desc: "This is Card 2 in Section 2" },
    { title: "Card 3", desc: "This is Card 3 in Section 2" }
  ],
  [
    { title: "Card 1", desc: "This is Card 1 in Section 3" },
    { title: "Card 2", desc: "This is Card 2 in Section 3" },
    { title: "Card 3", desc: "This is Card 3 in Section 3" }
  ],
  [
    { title: "Card 1", desc: "This is Card 1 in Section 4" },
    { title: "Card 2", desc: "This is Card 2 in Section 4" },
    { title: "Card 3", desc: "This is Card 3 in Section 4" }
  ],
  [
    { title: "Card 1", desc: "This is Card 1 in Section 5" },
    { title: "Card 2", desc: "This is Card 2 in Section 5" },
    { title: "Card 3", desc: "This is Card 3 in Section 5" }
  ],
  [
    { title: "Card 1", desc: "This is Card 1 in Section 6" },
    { title: "Card 2", desc: "This is Card 2 in Section 6" },
    { title: "Card 3", desc: "This is Card 3 in Section 6" }
  ]
];

// ============================== Glass Section Component ==============================
function GlassSection({ color, sectionTitle, cards }) {
  return (
    <div
      style={{
        width: "100%",
        minHeight: 0,
        borderRadius: 16,
        margin: 0,
        background: "rgba(20,22,18,0.88)",
        boxShadow: `0 2px 24px 0 ${color}55, 0 1.5px 7px 1.5px ${color}55`,
        border: `2.4px solid ${color}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "flex-start",
        padding: 0,
        overflow: "hidden"
      }}
    >
      <div
        style={{
          width: "100%",
          minHeight: 0,
          background: color,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          padding: "7px 0",
          textAlign: "center",
          color: "#fff",
          fontFamily: "Cornero, monospace, sans-serif",
          fontWeight: 900,
          fontSize: 32,
          letterSpacing: 2,
          boxShadow: "0 4px 16px 0 #232b2d44",
          textShadow: `
            -2px -2px 0 #2c3120, 2px -2px 0 #2c3120,
            -2px 2px 0 #2c3120, 2px 2px 0 #2c3120
          `
        }}
      >
        {sectionTitle}
      </div>
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-evenly",
          alignItems: "stretch",
          gap: 18,
          padding: "24px 30px 32px 30px"
        }}
      >
        {cards.map((card, idx) => (
          <div
            key={idx}
            style={{
              flex: 1,
              minWidth: 0,
              minHeight: 0,
              background: "#181b16",
              border: `2.2px solid ${color}`,
              borderRadius: 16,
              boxShadow: `0 2px 12px ${color}22`,
              color: "#e6e8df",
              fontFamily: "Erbaum, sans-serif",
              fontWeight: 800,
              fontSize: 22,
              margin: "0 8px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              transition: "box-shadow .14s, border-color .14s",
              textAlign: "center",
              letterSpacing: ".08em",
              height: 164
            }}
          >
            {card.title}
            <div
              style={{
                fontFamily: "Erbaum, sans-serif",
                fontWeight: 400,
                fontSize: 15,
                color: "#b0b79f",
                marginTop: 6
              }}
            >
              {card.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================== Layout Constants ==============================
const HEADER_HEIGHT = 0;
const FOOTER_HEIGHT = 0;
const DASHBOARD_HEADER_HEIGHT = 56;
const EMPLOYEE_INFO_HEIGHT = 40;
const TOTAL_TOP_HEIGHT = DASHBOARD_HEADER_HEIGHT + EMPLOYEE_INFO_HEIGHT + 22;

const GLASS_CONTAINER_STYLE = {
  background: "transparent",
  borderRadius: 0,
  boxShadow: "none",
  backdropFilter: "none",
  WebkitBackdropFilter: "none",
  border: "none",
  width: "100vw",
  minWidth: 0,
  minHeight: 0,
  height: `calc(100vh - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px)`,
  position: "relative",
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "flex-start",
  margin: 0,
  overflow: "visible",
  zIndex: 1
};

// ============================== Component ==============================
export default function FlyBASE() {
  const [glassGlow, setGlassGlow] = useState(false);
  const [backHover, setBackHover] = useState(false);

  return (
    <div
      className="h-full w-full relative"
      style={{
        width: "100vw",
        height: `100%`,
        minHeight: 0,
        minWidth: 0,
        overflow: "hidden",
        display: "block",
        position: "relative",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        background: "transparent"
      }}
    >
      {/* ============================== Background FX ============================== */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          userSelect: "none"
        }}
      >
        <BackgroundFX />
      </div>

      {/* ============================== Content Container ============================== */}
      <div
        className={`paloma-frosted-glass${glassGlow ? " glow" : ""}`}
        style={{
          ...GLASS_CONTAINER_STYLE,
          position: "absolute",
          top: HEADER_HEIGHT,
          left: 0,
          right: 0,
          bottom: FOOTER_HEIGHT,
          margin: 0,
          padding: 0
        }}
        onMouseEnter={() => setGlassGlow(true)}
        onMouseLeave={() => setGlassGlow(false)}
      >
        <div
          style={{
            width: "100vw",
            height: `calc(100vh - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            background: "transparent",
            borderRadius: 0,
            boxShadow: "none",
            padding: 0,
            overflow: "hidden",
            position: "relative",
            zIndex: 1
          }}
        >
          {/* ============================== Header Bar ============================== */}
          <div
            style={{
              width: "100vw",
              height: DASHBOARD_HEADER_HEIGHT,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              margin: 0,
              padding: 0,
              position: "relative",
              zIndex: 2,
              background: "black",
              borderBottom: "4px solid #6a7257"
            }}
          >
            <button
              onClick={() => (window.location.href = "/")}
              style={{
                background: "#000000ff",
                border: "1px solid #fff",
                color: "#fff",
                borderRadius: "8px",
                padding: "0 28px 0 12px",
                height: 40,
                marginLeft: 18,
                marginRight: 28,
                display: "flex",
                alignItems: "center",
                fontWeight: 600,
                letterSpacing: ".02em",
                fontSize: ".8rem",
                cursor: "pointer",
                outline: "none",
                userSelect: "none",
                gap: 16,
                boxShadow: backHover
                  ? "0 0 14px 3px #fff, 0 3px 14px #232c1d44"
                  : "0 0 6px 2px #fff7, 0 3px 14px #232c1d44",
                transition:
                  "box-shadow .16s, border-color .16s, background .13s"
              }}
              title="Back"
              tabIndex={0}
              onMouseEnter={() => setBackHover(true)}
              onMouseLeave={() => setBackHover(false)}
            >
              <svg width="28" height="28" viewBox="0 0 40 36" fill="none">
                <ellipse
                  cx="18"
                  cy="18"
                  rx="17"
                  ry="17"
                  fill="#191b16"
                  stroke="#fff"
                  strokeWidth="2.7"
                />
                <path
                  d="M23.5 28L13 18L23.5 8"
                  stroke="#fff"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                style={{
                  fontFamily: "Erbaum, sans-serif",
                  fontWeight: 600,
                  color: "#fff",
                  fontSize: "1.3rem",
                  marginLeft: 0
                }}
              >
                BACK
              </span>
            </button>
            <div
              style={{
                flex: 1,
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <div
                className="font-cornero"
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: "3.1rem",
                  color: "#fff",
                  fontWeight: 300,
                  letterSpacing: ".05em",
                  textAlign: "center",
                  lineHeight: "1.00",
                  whiteSpace: "nowrap",
                  zIndex: 10,
                  pointerEvents: "none",
                  width: "auto",
                  minWidth: 380,
                  paddingBottom: "0px",
                  textShadow: `
                    -2px -2px 0 #6a7257, 2px -2px 0 #6a7257, -2px 2px 0 #6a7257, 2px 2px 0 #6a7257,
                    0px 2px 0 #6a7257, 2px 0px 0 #6a7257, 0px -2px 0 #6a7257, -2px 0px 0 #6a7257
                  `
                }}
              >
                SHOP DASHBOARD
              </div>
            </div>
            <div
              style={{
                width: 270,
                minWidth: 170,
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                marginRight: 32
              }}
            >
              <img
                src={PalomaLogo}
                alt="Paloma Logo"
                style={{
                  height: 62,
                  width: "auto",
                  objectFit: "contain",
                  filter: "drop-shadow(0px 3px 14px #232e2365)",
                  userSelect: "none",
                  pointerEvents: "none",
                  alignSelf: "center"
                }}
                draggable={false}
              />
            </div>
          </div>

          {/* ============================== Employee Info ============================== */}
          <div
            style={{
              width: "50%",
              height: EMPLOYEE_INFO_HEIGHT,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 18,
              margin: "8px 0px 8px 0",
              fontSize: ".9rem",
              border: "2px solid #6a7257",
              letterSpacing: ".05em",
              fontFamily: "Cornero, monospace, sans-serif",
              zIndex: 1,
              position: "relative",
              background: "black",
              flexShrink: 0
            }}
          >
            <span style={{ color: "#828c7c", fontWeight: 500, marginRight: 6 }}>
              Employee:
            </span>
            <span
              style={{
                color: "#e6e8df",
                fontWeight: 700,
                marginRight: 24,
                marginLeft: 4
              }}
            >
              Conor Stewart
            </span>
            <span style={{ color: "#828c7c", fontWeight: 500, marginRight: 6 }}>
              Title:
            </span>
            <span
              style={{
                color: "#e6e8df",
                fontWeight: 700,
                marginRight: 24,
                marginLeft: 4
              }}
            >
              Projects Manager
            </span>
            <span style={{ color: "#828c7c", fontWeight: 500, marginRight: 6 }}>
              Points:
            </span>
            <span style={{ color: "#f3bf43", fontWeight: 800, marginLeft: 4 }}>
              120
            </span>
          </div>

          {/* ============================== Main Grid ============================== */}
          <div
            style={{
              width: "98vw",
              maxWidth: "2000px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gridTemplateRows: "1fr 1fr 1fr",
              gap: "14px 20px",
              justifyItems: "center",
              alignItems: "stretch",
              height: `calc(100% - ${TOTAL_TOP_HEIGHT}px)`,
              minHeight: 0,
              marginTop: 0,
              overflow: "visible",
              background: "transparent",
              padding: 0,
              flex: 1
            }}
          >
            {SECTION_COLORS.map((section, idx) => (
              <GlassSection
                key={idx}
                color={section.color}
                sectionTitle={section.title}
                cards={SECTION_CARDS[idx]}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
