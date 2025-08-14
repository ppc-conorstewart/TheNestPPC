// ==============================
// FlyIQ.jsx — Integrates JobUpdate modal with JobContext for instant Overwatch refresh
// ==============================

import { useCallback, useState } from "react";
import PalomaLogo from "../assets/whitelogo.png";

// ==============================
// Modular Section Imports
// ==============================
import FleetSection from '../components/Fly IQ Components/Fleet Components/FleetSection';
import JobUpdate from '../components/Fly IQ Components/Operations Components/JobUpdate';
import OperationsSection from '../components/Fly IQ Components/Operations Components/OperationsSection';
import PalomaZoneSection from '../components/Fly IQ Components/Paloma Zone Components/PalomaZoneSection';
import SafetySection from '../components/Fly IQ Components/Safety Components/SafetySection';
import TorqueandServiceSection from '../components/Fly IQ Components/Torque Components/TorqueandServiceSection';
import TrainingSection from '../components/Fly IQ Components/Training Components/TrainingSection';

// ==============================
// Job Context
// ==============================
import { useJobContext } from "../context/JobContext";

// ==============================
// Layout Constants
// ==============================
const HEADER_HEIGHT = 0;
const FOOTER_HEIGHT = 70;
const DASHBOARD_HEADER_HEIGHT = 56;
const EMPLOYEE_INFO_HEIGHT = 40;

const GLASS_CONTAINER_STYLE = {
  background: "rgba(20,24,18,0.13)",
  borderRadius: 0,
  boxShadow: '0 20px 60px 0 #18201711, 0 2.5px 13px #18262222, 0 0px 0px 1px #25292011 inset',
  backdropFilter: 'blur(1.6px) saturate(125%)',
  WebkitBackdropFilter: 'blur(2.2px) saturate(125%)',
  border: '2.5px solid #3a473766',
  width: '100vw',
  minWidth: 0,
  minHeight: 0,
  height: `calc(100vh - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px)`,
  position: "relative",
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  margin: 0,
  overflow: "visible",
  zIndex: 1
};

// ==============================
// Component
// ==============================
export default function FlyIQ() {
  const [glassGlow, setGlassGlow] = useState(false);
  const [backHover, setBackHover] = useState(false);

  // ==============================
  // Job Update Modal Control
  // ==============================
  const [jobUpdateOpen, setJobUpdateOpen] = useState(false);

  // ==============================
  // Context Wiring — instant reflection via optimistic update
  // ==============================
  const { updateJob } = useJobContext?.() || { updateJob: null };

  const handleJobUpdateSubmit = useCallback(async (payload) => {
    const jobId = payload?.selectedJob?.id;
    if (!jobId || !updateJob) return;

    const { selectedJob, ...updateData } = payload;
    await updateJob({
      jobId,
      updateData,
      updatedBy: updateData?.wsm1 || 'FlyIQ'
    });

    setJobUpdateOpen(false);
  }, [updateJob]);

  return (
    <div
      className="h-full w-full relative"
      style={{
        width: '100vw',
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
      {/* ============================== */}
      {/* Background */}
      {/* ============================== */}
      <div
        style={{
          position: "fixed",
          zIndex: 0,
          top: 0,
          left: 0,
          width: "100vw",
          height: "100%",
          background: `
            linear-gradient(rgba(20,24,18,0.40), rgba(21,19,24,0.25)),
            url("/assets/fielddashboard.png") center center / cover no-repeat
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          pointerEvents: "none",
          userSelect: "none"
        }}
      />

      {/* ============================== */}
      {/* Frosted Container */}
      {/* ============================== */}
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
          padding: 0,
        }}
        onMouseEnter={() => setGlassGlow(true)}
        onMouseLeave={() => setGlassGlow(false)}
      >
        <div
          style={{
            width: '100vw',
            height: `100%`,
            display: 'flex',
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            background: "transparent",
            borderRadius: 0,
            boxShadow: "none",
            padding: 0,
            overflow: "hidden",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* ============================== */}
          {/* Header Bar with Job Update trigger */}
          {/* ============================== */}
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
              borderBottom: '4px solid #6a7257'
            }}
          >
            <button
              onClick={() => window.location.href = "/"}
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
                transition: "box-shadow .16s, border-color .16s, background .13s"
              }}
              title="Back"
              tabIndex={0}
              onMouseEnter={() => setBackHover(true)}
              onMouseLeave={() => setBackHover(false)}
            >
              <svg width="28" height="28" viewBox="0 0 40 36" fill="none">
                <ellipse cx="18" cy="18" rx="17" ry="17" fill="#191b16" stroke="#fff" strokeWidth="2.7"/>
                <path d="M23.5 28L13 18L23.5 8" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontFamily: "Erbaum, sans-serif", fontWeight: 600, color: "#fff", fontSize: "1.3rem", marginLeft: 0 }}>BACK</span>
            </button>

            <div style={{ flex: 1, position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
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
                FIELD DASHBOARD
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginRight: 24 }}>
              <button
                onClick={() => setJobUpdateOpen(true)}
                style={{
                  height: 40,
                  padding: "0 14px",
                  borderRadius: 10,
                  border: "1.8px solid #6a7257",
                  background: "#111",
                  color: "#e6e8df",
                  fontWeight: 800,
                  letterSpacing: ".04em",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
                title="Open Job Update"
              >
                JOB UPDATE
              </button>
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

          {/* ============================== */}
          {/* Employee Info Bar */}
          {/* ============================== */}
          <div
            style={{
              width: "50%",
              height: EMPLOYEE_INFO_HEIGHT,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 18,
              margin: "6px 0px 8px 0",
              fontSize: "1.1rem",
              border: '2px solid #6a7257',
              letterSpacing: ".05em",
              fontFamily: "Cornero, monospace, sans-serif",
              zIndex: 1,
              position: "relative",
              background: "black",
              flexShrink: 0,
            }}
          >
            <span style={{ color: "#828c7c", fontWeight: 500, marginRight: 6 }}>Employee:</span>
            <span style={{ color: "#e6e8df", fontWeight: 700, marginRight: 24, marginLeft: 4 }}>Conor Stewart</span>
            <span style={{ color: "#828c7c", fontWeight: 500, marginRight: 6 }}>Title:</span>
            <span style={{ color: "#e6e8df", fontWeight: 700, marginRight: 24, marginLeft: 4 }}>Projects Manager</span>
            <span style={{ color: "#828c7c", fontWeight: 500, marginRight: 6 }}>Points:</span>
            <span style={{ color: "#f3bf43", fontWeight: 800, marginLeft: 4 }}>120</span>
          </div>

          {/* ============================== */}
          {/* Main Dashboard Grid */}
          {/* ============================== */}
          <div
            style={{
              width: "98vw",
              maxWidth: "2000px",
              margin: "0 auto",
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '1fr 1fr 1fr',
              gap: "2px 7px",
              justifyItems: 'center',
              alignItems: 'stretch',
              height: `calc(100vh - ${DASHBOARD_HEADER_HEIGHT + EMPLOYEE_INFO_HEIGHT + 38}px)`,
              minHeight: 0,
              marginTop: 0,
              overflow: "visible",
              background: "transparent",
              padding: 0,
              flex: 1,
            }}
          >
            <div style={{height: "100%", minHeight: 0, width: "100%"}}><OperationsSection /></div>
            <div style={{height: "100%", minHeight: 0, width: "100%"}}><FleetSection /></div>
            <div style={{height: "100%", minHeight: 0, width: "100%"}}><TorqueandServiceSection /></div>
            <div style={{height: "100%", minHeight: 0, width: "100%"}}><TrainingSection /></div>
            <div style={{height: "100%", minHeight: 0, width: "100%"}}><SafetySection /></div>
            <div style={{height: "100%", minHeight: 0, width: "100%"}}><PalomaZoneSection /></div>
          </div>
        </div>
      </div>

      {/* ============================== */}
      {/* Job Update Modal */}
      {/* ============================== */}
      <JobUpdate
        open={jobUpdateOpen}
        onClose={() => setJobUpdateOpen(false)}
        onSubmit={handleJobUpdateSubmit}
      />
    </div>
  );
}
