// =================== Imports and Dependencies ===================

// =================== Transfers Card Component ===================
export default function TransfersCard({ onAssetTransfer, onPartsTransfer }) {
  // =================== Render Transfers Card ===================
  return (
    <div
      style={{
        border: "3px solid #6a7257",
        borderRadius: 28,
        background: "#161613",
        minHeight: 320,
        minWidth: 440,
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        justifyContent: "space-evenly",
        padding: "20px 12px",
        margin: 0,
        gap: "24px"
      }}
    >
      {/* --------- Asset Transfer Section --------- */}
      <div
        style={{
          flex: 1,
          border: "2px solid #6a7257",
          borderRadius: 24,
          margin: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "12px 8px 24px 8px"
        }}
      >
        <div style={{
          fontFamily: "Erbaum, sans-serif",
          fontWeight: 600,
          fontSize: 20,
          color: "#6a7257",
          textAlign: "center",
          marginBottom: "auto"
        }}>
          ASSET TRANSFER (BOL)
        </div>
        <button
          onClick={onAssetTransfer}
          style={{
            marginTop: 28,
            background: "transparent",
            color: "#6a7257",
            border: "2.5px solid #6a7257",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 20,
            fontFamily: "Erbaum, sans-serif",
            padding: "4px 24px",
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
      {/* --------- Parts Transfer Section --------- */}
      <div
        style={{
          flex: 1,
          border: "2px solid #6a7257",
          borderRadius: 24,
          margin: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "12px 8px 24px 8px"
        }}
      >
        <div style={{
          fontFamily: "Erbaum, sans-serif",
          fontWeight: 600,
          fontSize: 20,
          color: "#6a7257",
          textAlign: "center",
          marginBottom: "auto"
        }}>
          PARTS TRANSFER
        </div>
        <button
          onClick={onPartsTransfer}
          style={{
            marginTop: 28,
            background: "transparent",
            color: "#6a7257",
            border: "2.5px solid #6a7257",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 20,
            fontFamily: "Erbaum, sans-serif",
            padding: "4px 24px",
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
    </div>
  );
}
