import React from "react";

export default function CanvasHelpModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        minWidth: 380,
        background: "#23241d",
        border: "3px solid #8CF94A",
        borderRadius: 18,
        padding: 34,
        color: "#fff",
        boxShadow: "0 8px 40px #000a",
        maxWidth: 520,
        maxHeight: "90vh",
        overflowY: "auto"
      }}>
        <h2 style={{ color: "#baf97a", marginTop: 0, marginBottom: 18, fontWeight: 700, letterSpacing: 1 }}>Canvas Shortcuts & Tools</h2>
        <ul style={{ fontSize: 16, lineHeight: "2.0", marginBottom: 26 }}>
          <li><b>Pan Canvas</b>: Hold <b>Spacebar</b> and drag, or click <span style={{ color: "#baf97a" }}>Hand Tool</span></li>
          <li><b>Zoom</b>: Ctrl + Mouse Wheel, or click Zoom In/Out buttons</li>
          <li><b>Reset View</b>: Double-click empty canvas or click Fit button</li>
          <li><b>Select/Move</b>: Click arrow, or hit <b>V</b> for Select tool</li>
          <li><b>Add Well</b>: Click Plus (+) button or press <b>A</b></li>
          <li><b>Delete Well</b>: Select and hit <b>Del</b> or click Trash</li>
          <li><b>Duplicate Well</b>: Select and press <b>D</b></li>
          <li><b>Rename Well</b>: Double-click well name</li>
          <li><b>Edit Well Height</b>: Click height box below a well</li>
          <li><b>Edit Spacing</b>: Click spacing box between wells</li>
          <li><b>Rotate North</b>: <b>Alt+Drag</b> North marker</li>
          <li><b>Undo/Redo</b>: <b>Ctrl+Z</b> / <b>Ctrl+Y</b></li>
          <li><b>Snap to Grid</b>: Toggle with Snap button</li>
          <li><b>Show/Hide Grid</b>: Toggle with Grid Eye button</li>
          <li><b>Show/Hide Well Labels</b>: Toggle with Eye button</li>
          <li><b>Export PNG/JSON</b>: Use Export buttons</li>
          <li><b>Import JSON</b>: Use Import button</li>
        </ul>
        <button onClick={onClose} style={{
          padding: "9px 34px",
          background: "#baf97a",
          color: "#191A16",
          border: "none",
          borderRadius: 8,
          fontWeight: 700,
          fontSize: 18,
          marginTop: 4,
          cursor: "pointer"
        }}>Close</button>
      </div>
    </div>
  );
}
