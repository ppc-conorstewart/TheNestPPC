// ==============================
// FleetSection.jsx — Modal Integration + Overlay Fix
// ==============================

import lottie from "lottie-web";
import { useEffect, useRef, useState } from "react";
import { default as truckUpdateAnim } from "../../../assets/Fly-IQ Icons/FleetUpdateIcon.json";
import receiptAnim from "../../../assets/Fly-IQ Icons/HUB-ReceiptSubmission.json";
import maintenanceIcon from "../../../assets/Fly-IQ Icons/MaintenanceIcon.json";
import FleetTruckUpdate from "./FleetTruckUpdate";

const SECTION_COLOR = "linear-gradient(90deg, #253146 0%, #3a516d 99%)";
const SECTION_TEXT_COLOR = "#ffffffff";
const SECTION_HEADER_BORDER = "2.5px solid #42587a";
const SECTION_LOGO_FILTER = "drop-shadow(0 1px 2px #122233) brightness(1.08)";
const SECTION_ICON_FILTER = "brightness(1.19)";
const SECTION_HOVER_BORDER = "2.8px solid #3a516d";
const SECTION_CARD_BORDER = "2.5px solid #42587a";
const ICON_SIZE = 70;

const CARD_WIDTH = 273;
const CARD_HEIGHT = 224;

function LottieHoverIcon({ animationData, hovered, iconFilter }) {
  const lottieRef = useRef();
  const instanceRef = useRef();
  useEffect(() => {
    if (!animationData) return;
    if (instanceRef.current) {
      instanceRef.current.destroy();
    }
    instanceRef.current = lottie.loadAnimation({
      container: lottieRef.current,
      renderer: "svg",
      loop: true,
      autoplay: false,
      animationData,
      rendererSettings: { preserveAspectRatio: "xMidYMid meet" }
    });
    return () => {
      if (instanceRef.current) instanceRef.current.destroy();
    };
  }, [animationData]);
  useEffect(() => {
    if (!instanceRef.current) return;
    if (hovered) {
      instanceRef.current.goToAndPlay(0, true);
    } else {
      instanceRef.current.goToAndStop(0, true);
    }
  }, [hovered]);
  useEffect(() => {
    if (!lottieRef.current) return;
    if (iconFilter) {
      lottieRef.current.style.filter = iconFilter;
    }
  }, [iconFilter, hovered]);
  return (
    <div
      ref={lottieRef}
      style={{ width: ICON_SIZE, height: ICON_SIZE, margin: "0 auto" }}
      tabIndex={-1}
    />
  );
}

function DashboardCard({ title, icon, description, onCardClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        background: "#000",
        borderRadius: 16,
        border: hovered
          ? SECTION_HOVER_BORDER
          : SECTION_CARD_BORDER,
        minHeight: CARD_HEIGHT,
        maxHeight: CARD_HEIGHT,
        height: CARD_HEIGHT,
        minWidth: CARD_WIDTH,
        maxWidth: CARD_WIDTH,
        width: CARD_WIDTH,
        flex: "0 0 auto",
        boxShadow: hovered
          ? "0 0 32px 10px #253146cc, 0 9px 26px #00000044"
          : "0 2.5px 18px #232c186b, 0 1px 6px #28281b61",
        margin: 0,
        marginTop: 0,
        padding: 0,
        position: "relative",
        overflow: "visible",
        alignItems: "center",
        cursor: "pointer",
        transform: hovered ? "scale(1.048)" : "scale(1)",
        transition: "box-shadow .22s, transform .14s cubic-bezier(.43,1.44,.6,1), border-color .14s"
      }}
      tabIndex={0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onCardClick}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 32,
          bottom: 14,
          width: 3.8,
          borderRadius: 8,
          background: SECTION_COLOR,
          filter: "blur(0.4px) saturate(120%)",
          zIndex: 5,
          opacity: 0.92,
        }}
      />
      <div
        style={{
          fontSize: "1rem",
          color: SECTION_TEXT_COLOR,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          background: `linear-gradient(90deg,${SECTION_TEXT_COLOR}22 0%,${SECTION_TEXT_COLOR}00 98%)`,
          letterSpacing: ".018em",
          textAlign: "center",
          marginTop: 0,
          gap: 2,
          marginBottom: 24,
          width: "100%",
          minHeight: 24,
          pointerEvents: "none",
          fontWeight: 900,
          textShadow: "0 2.5px 8px #000, 0 1.5px 5px #0004"
        }}
      >
        {title}
      </div>
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <LottieHoverIcon animationData={icon} hovered={hovered} iconFilter={SECTION_ICON_FILTER} />
        <div
          style={{
            fontSize: ".51rem",
            color: '#f4f4f2',
            letterSpacing: ".01em",
            textAlign: "center",
            justifyContent: "center",
            fontWeight: 600,
            opacity: .93,
            marginTop: 18,
            marginBottom: 20,
            minHeight: 20,
            width: "94%",
            pointerEvents: "none",
            textShadow: "0 1.5px 6px #000d"
          }}
        >
          {description}
        </div>
      </div>
    </div>
  );
}

export default function FleetSection() {
  const [showTruckUpdate, setShowTruckUpdate] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "stretch",
        background: "linear-gradient(117deg, #000000ff 50%, #000000ff 100%)",
        border: SECTION_HEADER_BORDER,
        borderRadius: 16,
        padding: "0 0px 0px 0px",
        minHeight: 0,
        height: "100%",
        boxShadow: "0 2.5px 22px #13141599, 0 0px 2px #252e28a6",
        width: "98%",
        margin: "0 auto",
        overflow: "visible"
      }}
    >
      {/* Section Header */}
      <div style={{
        position: "relative",
        width: "100%",
        minHeight: "39px",
        zIndex: 10,
        marginBottom: "2px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 11px #1b1d1790"
      }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 36,
            background: SECTION_COLOR,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            opacity: 0.97,
            zIndex: 1,
            boxShadow: "0 2px 12px #23272380"
          }}
        />
        <div
          className="font-cornero"
          style={{
            position: "relative",
            zIndex: 2,
            fontSize: "1.88rem",
            fontWeight: 400,
            textAlign: "center",
            letterSpacing: ".04em",
            marginBottom: 4,
            padding: 0,
            width: "100%",
            color: SECTION_TEXT_COLOR,
            textShadow: "0 3px 13px #0b0c09, 0 1.5px 7px #000f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "32px",
            lineHeight: "1.3",
            fontFamily: "Font-cornero, Erbaum, sans-serif"
          }}
        >
          <span style={{ width: "100%", textAlign: "center", display: "inline-block" }}>FLEET</span>
        </div>
      </div>
      {/* Cards Row */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          gap: 4,
          flex: 1,
          marginTop: 8,
          marginBottom: 8,
          overflow: "visible",
          justifyContent: "space-evenly",
          alignItems: "flex-start"
        }}
      >
        <DashboardCard
          title="Fleet Truck Update"
          icon={truckUpdateAnim}
          description="Post a Fleet Truck Update"
          onCardClick={() => setShowTruckUpdate(true)}
        />
        <DashboardCard
          title="Receipt Submission"
          icon={receiptAnim}
          description="Post your Fleet Truck fuel receipts and expenses"
        />
        <DashboardCard
          title="Maintenance Tracker"
          icon={maintenanceIcon}
          description="Hub to layout upcoming truck maintenance and planning"
        />
      </div>
      {/* Fleet Truck Update Modal */}
      {showTruckUpdate && (
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 9999,
            background: "rgba(0,0,0,0.84)", // true blackout, no glow/rectangle
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <FleetTruckUpdate
            onClose={() => setShowTruckUpdate(false)}
          />
        </div>
      )}
    </div>
  );
}
