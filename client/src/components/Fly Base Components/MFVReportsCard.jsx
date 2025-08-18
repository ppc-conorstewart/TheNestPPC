// =================== Imports and Dependencies ===================

// =================== Style Constants ===================
const cardStyle = {
  border: "3px solid #6a7257",
  borderRadius: 28,
  background: "#000000ff",
  minHeight: 320,
  minWidth: 440,
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-end",
  justifyContent: "space-evenly",
  padding: "18px 10px 28px 10px",
  margin: 0,
  gap: 16
};

const subCardStyle = {
  flex: 1,
  border: "2.5px solid #6a7257",
  borderRadius: 22,
  margin: "6px 8px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: "14px 6px 18px 6px",
  background: "#161613"
};

const titleStyle = {
  fontFamily: "Erbaum, sans-serif",
  fontWeight: 700,
  fontSize: 23,
  letterSpacing: ".02em",
  color: "#6a7257",
  width: "100%",
  textAlign: "center",
  marginBottom: "auto"
};

const buttonStyle = {
  marginTop: 18,
  background: "transparent",
  color: "#6a7257",
  border: "2.5px solid #6a7257",
  borderRadius: 10,
  fontWeight: 700,
  fontSize: 18,
  fontFamily: "Erbaum, sans-serif",
  padding: "4px 22px",
  letterSpacing: ".01em",
  transition: "all 0.14s cubic-bezier(.4,1.2,.44,.96)",
  outline: "none",
  cursor: "pointer",
};

// =================== MFV Reports Card Component ===================
export default function MFVReportsCard({
  onOpenBuildReport,
  onOpenTestingReport,
  onOpenOemReport
}) {
  // =================== Render MFV Reports Card ===================
  return (
    <div style={cardStyle}>
      <div style={subCardStyle}>
        <div style={titleStyle}>
          Submit MFV<br />Build/Tolerance<br />Report
        </div>
        <button
          style={buttonStyle}
          onClick={onOpenBuildReport}
          onMouseOver={e => (e.currentTarget.style.background = "#232820")}
          onMouseOut={e => (e.currentTarget.style.background = "transparent")}
        >
          OPEN FORM
        </button>
      </div>
      <div style={subCardStyle}>
        <div style={titleStyle}>
          Submit MFV<br />Testing Report
        </div>
        <button
          style={buttonStyle}
          onClick={onOpenTestingReport}
          onMouseOver={e => (e.currentTarget.style.background = "#232820")}
          onMouseOut={e => (e.currentTarget.style.background = "transparent")}
        >
          OPEN FORM
        </button>
      </div>
      <div style={subCardStyle}>
        <div style={titleStyle}>
          Submit OEM<br />Report
        </div>
        <button
          style={buttonStyle}
          onClick={onOpenOemReport}
          onMouseOver={e => (e.currentTarget.style.background = "#232820")}
          onMouseOut={e => (e.currentTarget.style.background = "transparent")}
        >
          OPEN FORM
        </button>
      </div>
    </div>
  );
}
