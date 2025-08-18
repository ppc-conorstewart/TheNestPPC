
export default function PalomaToast({ type = "success", message, detail }) {
  const borderColor = "#6A7257"; // Paloma green
  const bg = "#111111";
  const icon = "/assets/paloma-favicon.png"; // Path relative to public

  return (
    <div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: 'center',
    padding: "12px 12px 12px 12px",    // increase vertical padding
    background: bg,
    borderLeft: `7px solid ${borderColor}`,
    borderTop: `1px solid ${borderColor}`,
    borderBottom: `1px solid ${borderColor}`,
    borderRadius: 10,
    textTransform: 'uppercase',
    minWidth: 240,
    maxWidth: 800,
    minHeight: 40,                     // <--- Add this line (increase value as desired)
    // height: 80,                     // <--- Or set a fixed height
    boxSizing: "border-box",
    boxShadow: `0 8px 32px ${borderColor}`,
    fontFamily: "inherit",
    overflow: "hidden"
  }}
>

      <img
        src={icon}
        alt="Paloma"
        style={{
          width: 48,
          height: 48,
          marginRight: 16,
          borderRadius: 12,
          background: "#242d20",
          border: `2px solid ${borderColor}`,  // added border color
          flexShrink: 0,
        }}
      />
      <div style={{display: "flex", flexDirection: "column", justifyContent: "center"}}>
        <div style={{
          fontWeight: 700,
          letterSpacing: 0.7,
          color: "#51ff00ff",
          marginBottom: 0,
          fontSize: ".8em",
          lineHeight: "1.1",
        }}>
          {message}
        </div>
        {detail && (
          <div style={{
            color: "#c5c7b7",
            fontSize: "0.6em",
            marginTop: 2,
            fontWeight: 800,
            wordBreak: "break-word",
            lineHeight: "1.1"
          }}>{detail}</div>
        )}
      </div>
    </div>
  );
}
