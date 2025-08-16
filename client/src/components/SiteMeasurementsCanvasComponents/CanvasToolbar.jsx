import React from "react";
import {
  FaPlus, FaTrash, FaCamera, FaBorderAll, FaSearchPlus, FaSearchMinus, FaExpand,
  FaHandPaper, FaMousePointer, FaUndo, FaRedo, FaDownload, FaUpload, FaRegEye, FaRegEyeSlash, FaGripHorizontal, FaRegQuestionCircle
} from "react-icons/fa";

const toolbarBtnStyle = {
  background: "#191A16", // black background for buttons
  color: "#6a7257", // Paloma green text/icons
  border: "none",
  borderRadius: 6,
  padding: "6px 9px",
  margin: "0 2px",
  fontSize: 18,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  transition: "background 0.14s"
};

export default function CanvasToolbar({
  onAddWell,
  onRemoveWell,
  onDuplicate,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onResetView,
  zoom,
  activeTool,
  setActiveTool,
  snapGrid,
  setSnapGrid,
  showGrid,
  setShowGrid,
  showLabels,
  setShowLabels,
  onExportJSON,
  onImportJSON,
  onExportPNG,
  onHelp
}) {
  return (
    <div style={{
      width: "100%",
      background: "#191A16",
      borderBottom: "4px solid #6a7257",
      borderRadius: 0,
      boxShadow: "0 4px 18px #000a",
      padding: "10px 18px",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: 10,
      marginBottom: 0,
      fontWeight: 600,
      fontSize: 15,
      color: "#6a7257",
      zIndex: 10
    }}>
      <button onClick={onAddWell} title="Add Well [A]" style={toolbarBtnStyle}><FaPlus /></button>
      <button onClick={onRemoveWell} title="Delete Well [Del]" style={toolbarBtnStyle}><FaTrash /></button>
      <button onClick={onDuplicate} title="Duplicate [D]" style={toolbarBtnStyle}><FaGripHorizontal /></button>
      <button onClick={onUndo} title="Undo [Ctrl+Z]" style={toolbarBtnStyle}><FaUndo /></button>
      <button onClick={onRedo} title="Redo [Ctrl+Y]" style={toolbarBtnStyle}><FaRedo /></button>
      <span style={{ borderLeft: "1.5px solid #6a7257", margin: "0 10px" }}></span>
      <button onClick={onZoomIn} title="Zoom In [+] or Ctrl+Mousewheel" style={toolbarBtnStyle}><FaSearchPlus /></button>
      <button onClick={onZoomOut} title="Zoom Out [-] or Ctrl+Mousewheel" style={toolbarBtnStyle}><FaSearchMinus /></button>
      <button onClick={onResetView} title="Fit/Reset [Double Click Blank or ⭾]" style={toolbarBtnStyle}><FaExpand /></button>
      <span style={{ marginLeft: 12, marginRight: 8, color: "#6a7257", fontWeight: 400 }}>
        Zoom: {(zoom * 100).toFixed(0)}%
      </span>
      <button onClick={() => setActiveTool("pan")} title="Pan/Hand [Spacebar/H]"
        style={activeTool === "pan" ? { ...toolbarBtnStyle, background: "#6a7257", color: "#191A16" } : toolbarBtnStyle}><FaHandPaper /></button>
      <button onClick={() => setActiveTool("select")} title="Select/Move [V]"
        style={activeTool === "select" ? { ...toolbarBtnStyle, background: "#6a7257", color: "#191A16" } : toolbarBtnStyle}><FaMousePointer /></button>
      <span style={{ borderLeft: "1.5px solid #6a7257", margin: "0 10px" }}></span>
      <button onClick={() => setSnapGrid(s => !s)} title="Snap to Grid [Toggle]" style={toolbarBtnStyle}>
        <FaBorderAll /> {snapGrid ? "Snap" : "No Snap"}
      </button>
      <button onClick={() => setShowGrid(g => !g)} title="Toggle Grid [G]" style={toolbarBtnStyle}>
        {showGrid ? <FaRegEye /> : <FaRegEyeSlash />}
      </button>
      <button onClick={() => setShowLabels(l => !l)} title="Show/Hide Labels [L]" style={toolbarBtnStyle}>
        <FaRegEye />
      </button>
      <span style={{ borderLeft: "1.5px solid #6a7257", margin: "0 10px" }}></span>
      <button onClick={onExportJSON} title="Export JSON" style={toolbarBtnStyle}><FaDownload /></button>
      <label title="Import JSON" style={{ ...toolbarBtnStyle, cursor: "pointer", display: "inline-flex" }}>
        <FaUpload />
        <input type="file" accept=".json" onChange={onImportJSON} style={{ display: "none" }} />
      </label>
      <button onClick={onExportPNG} title="Export PNG [Ctrl+E]" style={toolbarBtnStyle}><FaCamera /></button>
      <span style={{ marginLeft: "auto" }} />
      {/* The working Help button */}
      <button onClick={onHelp} title="Hotkeys / Help" style={toolbarBtnStyle}>
        <FaRegQuestionCircle />
      </button>
    </div>
  );
}
