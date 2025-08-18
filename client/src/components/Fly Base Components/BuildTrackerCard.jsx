// =================== Imports and Dependencies ===================

// =================== Build Tracker Card Component ===================
export default function BuildTrackerCard({ onOpenBuildTracker }) {
  // =================== Render Build Tracker Card ===================
  return (
    <div
      style={{
        border: "3px solid #6a7257",
        borderRadius: 28,
        background: "#161613",
        minHeight: 320,
        minWidth: 440,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 12px",
        margin: 0,
      }}
    >
      {/* --------- Title Section --------- */}
      <div style={{
        fontFamily: "Erbaum, sans-serif",
        fontWeight: 700,
        fontSize: 30,
        letterSpacing: "0.02em",
        color: "#6a7257",
        width: "100%",
        textAlign: "center",
        marginBottom: 12,
      }}>
        Build Tracker
      </div>
      {/* --------- Open Form Button --------- */}
      <button
        onClick={onOpenBuildTracker}
        style={{
          background: "transparent",
          color: "#6a7257",
          border: "2.5px solid #6a7257",
          borderRadius: 10,
          fontWeight: 700,
          fontSize: 22,
          fontFamily: "Erbaum, sans-serif",
          padding: "6px 32px",
          marginTop: 24,
          letterSpacing: ".02em",
          transition: "all 0.14s cubic-bezier(.4,1.2,.44,.96)",
          outline: "none",
          cursor: "pointer",
        }}
        onMouseOver={e => (e.currentTarget.style.background = "#232820")}
        onMouseOut={e => (e.currentTarget.style.background = "transparent")}
      >
        OPEN FORM
      </button>
    </div>
  );
}
