import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Arrow } from "react-konva";

// Modular components
import Grid from '../SiteMeasurementsCanvasComponents/Grid';
import NorthMarker from '../SiteMeasurementsCanvasComponents/NorthMarker';
import WellGroup from '../SiteMeasurementsCanvasComponents/WellGroup';
import SpacingField from '../SiteMeasurementsCanvasComponents/SpacingField';
import CanvasToolbar from '../SiteMeasurementsCanvasComponents/CanvasToolbar';
import CanvasHelpModal from '../SiteMeasurementsCanvasComponents/CanvasHelpModal';
import ResourcesSidebar from '../SiteMeasurementsCanvasComponents/ResourcesSidebar';
import useImage from 'use-image';

const BORDER_GREEN = "#6a7257";
const WELL_RADIUS = 18;
const WELL_SPACING = 300;
const WELL_START_X = 80;

const UNIT_OPTIONS = [
  { value: "ft", label: "ft" },
  { value: "m", label: "m" },
  { value: "in", label: "in" }
];

export default function SiteMeasurementsCanvas({
  wells = 4,
  wellData: initWellData,
  onChange,
  width = 800,
  height = 600,
  symbols = [],
  onUpdateSymbol
}) {
  // Generate and center wells horizontally
  const buildCenteredWells = () => {
    let arr = initWellData;
    if (!arr) {
      arr = Array.from({ length: wells }, (_, i) => ({
        x: WELL_START_X + i * WELL_SPACING,
        y: height / 2,
        name: `Well ${i + 1}`,
        heightValue: 0,
        heightUnit: "in",
        selected: false
      }));
    }
    const minX = Math.min(...arr.map(w => w.x));
    const maxX = Math.max(...arr.map(w => w.x));
    const canvasCenter = width / 2;
    const wellsCenter = (minX + maxX) / 2;
    const offsetX = canvasCenter - wellsCenter;
    return arr.map(w => ({ ...w, x: w.x + offsetX }));
  };

  const [wellData, setWellData] = useState(buildCenteredWells());
  const [spacings, setSpacings] = useState(
    Array.from({ length: Math.max(wellData.length - 1, 0) }, () => ({
      value: 0,
      unit: "ft"
    }))
  );

  // Edit states
  const [editingSpacingIdx, setEditingSpacingIdx] = useState(-1);
  const [editingWellIdx, setEditingWellIdx] = useState(-1);
  const [wellNameInput, setWellNameInput] = useState("");
  const [editingHeightIdx, setEditingHeightIdx] = useState(-1);
  const [wellHeightInput, setWellHeightInput] = useState("");
  const [wellHeightUnitInput, setWellHeightUnitInput] = useState("in");
  const [northAngle, setNorthAngle] = useState(0);
  const [northPos, setNorthPos] = useState({ x: width - 88, y: 70 });
  const [snapGrid, setSnapGrid] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [activeTool, setActiveTool] = useState("select");
  const [prevTool, setPrevTool] = useState("select");
  const [helpOpen, setHelpOpen] = useState(false);
  const [selectedSymbolId, setSelectedSymbolId] = useState(null);

  // Overlay HTML input for spacing/height
  const [inputOverlay, setInputOverlay] = useState(null);

  const stageRef = useRef();
  const lastPan = useRef({ x: 0, y: 0 });

  // --- SPACEBAR HAND TOOL SHORTCUTS ---
  useEffect(() => {
    function handleKeyDown(e) {
      if (
        e.code === "Space" &&
        !e.repeat &&
        (document.activeElement.tagName === "BODY" || document.activeElement === document.body)
      ) {
        setPrevTool(activeTool);
        setActiveTool("pan");
      }
    }
    function handleKeyUp(e) {
      if (e.code === "Space") {
        setActiveTool(prevTool);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
    // eslint-disable-next-line
  }, [activeTool, prevTool]);

  // --- Robust Panning Logic ---
  // Ensure drag to pan only when "pan" tool is active, and follow the mouse
  useEffect(() => {
    function handleMove(e) {
      if (!isPanning) return;
      // For Konva, e.clientX/Y gives window pos
      // Calculate new pan based on mouse movement delta
      setPan(last => ({
        x: e.clientX - lastPan.current.x,
        y: e.clientY - lastPan.current.y
      }));
    }
    function handleUp(e) {
      setIsPanning(false);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    }
    if (isPanning) {
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isPanning]);

  // --- Toolbar handlers ---
  const onAddWell = () => {
    setWellData(wells => {
      const lastWell = wells[wells.length - 1];
      const newWell = {
        x: lastWell.x + WELL_SPACING,
        y: lastWell.y,
        name: `Well ${wells.length + 1}`,
        heightValue: 0,
        heightUnit: "in",
        selected: false
      };
      const updatedWells = [...wells, newWell];
      onChange && onChange(updatedWells);
      return updatedWells;
    });
    setSpacings(spacings => [...spacings, { value: 0, unit: "ft" }]);
  };

  // Remove Well handler (removes selected well or last well)
  const onRemoveWell = () => {
    setWellData(wells => {
      const selectedIndex = wells.findIndex(w => w.selected);
      if (selectedIndex === -1) {
        if (wells.length === 0) return wells;
        const updatedWells = wells.slice(0, -1);
        onChange && onChange(updatedWells);
        return updatedWells;
      } else {
        const updatedWells = wells.filter((_, i) => i !== selectedIndex);
        onChange && onChange(updatedWells);
        return updatedWells;
      }
    });
    setSpacings(spacings => spacings.slice(0, -1));
  };

  // Duplicate Well handler
  const onDuplicate = () => {
    setWellData(wells => {
      if (wells.length === 0) return wells;
      const lastWell = wells[wells.length - 1];
      const newWell = {
        ...lastWell,
        x: lastWell.x + WELL_SPACING,
        name: `Well ${wells.length + 1}`,
        selected: false
      };
      const updatedWells = [...wells, newWell];
      onChange && onChange(updatedWells);
      return updatedWells;
    });
    setSpacings(spacings => [...spacings, { value: 0, unit: "ft" }]);
  };

  // Handle well selection
  const handleSelectWell = (index) => {
    setWellData(wells => wells.map((w, i) => ({ ...w, selected: i === index })));
    setEditingWellIdx(index);
  };

  // --- Editable overlay input ---
  const handleShowInputOverlay = ({ type, index, x, y, value, unit }) => {
    setInputOverlay({ type, index, x, y, value, unit });
  };
  const handleOverlayChange = e => {
    setInputOverlay(o => ({ ...o, value: e.target.value }));
  };
  const handleOverlayUnitChange = e => {
    setInputOverlay(o => ({ ...o, unit: e.target.value }));
  };
  const handleOverlayBlur = () => {
    if (!inputOverlay) return;
    if (inputOverlay.type === "spacing") {
      const updated = [...spacings];
      updated[inputOverlay.index] = {
        ...updated[inputOverlay.index],
        value: inputOverlay.value,
        unit: inputOverlay.unit
      };
      setSpacings(updated);
    } else if (inputOverlay.type === "height") {
      const updated = [...wellData];
      updated[inputOverlay.index] = {
        ...updated[inputOverlay.index],
        heightValue: inputOverlay.value,
        heightUnit: inputOverlay.unit
      };
      setWellData(updated);
    }
    setInputOverlay(null);
  };
  const handleOverlayKeyDown = e => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      handleOverlayBlur();
    }
    if (e.key === "Escape") setInputOverlay(null);
  };

  // --- Render ---
  return (
    <div style={{
      width: "100%",
      height: "100%",
      margin: 0,
      padding: 0,
      background: "#191A16",
      display: "flex",
      flexDirection: "column",
      position: "relative"
    }}>
      {/* Toolbar */}
      <CanvasToolbar
        onAddWell={onAddWell}
        onRemoveWell={onRemoveWell}
        onDuplicate={onDuplicate}
        onUndo={() => {}}
        onRedo={() => {}}
        onZoomIn={() => setZoom(z => Math.min(z * 1.15, 5))}
        onZoomOut={() => setZoom(z => Math.max(z / 1.15, 0.25))}
        onResetView={() => {
          setZoom(1);
          setPan({ x: 0, y: 0 });
        }}
        zoom={zoom}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        snapGrid={snapGrid}
        setSnapGrid={setSnapGrid}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        showLabels={showLabels}
        setShowLabels={setShowLabels}
        onExportJSON={() => {}}
        onImportJSON={() => {}}
        onExportPNG={() => {
          if (stageRef.current) {
            const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
            const a = document.createElement("a");
            a.download = "site-layout.png";
            a.href = uri;
            a.click();
          }
        }}
        onHelp={() => setHelpOpen(true)}
      />

      <CanvasHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />

      {/* Overlay input */}
      {inputOverlay && (
        <div
          style={{
            position: "absolute",
            left: (inputOverlay.x * zoom + pan.x),
            top: (inputOverlay.y * zoom + pan.y),
            zIndex: 20,
            background: "#fff",
            borderRadius: 6,
            padding: "3px 10px",
            boxShadow: "0 0 10px #0003",
            display: "flex",
            alignItems: "center"
          }}
        >
          <input
            type="number"
            value={inputOverlay.value}
            onChange={handleOverlayChange}
            onBlur={handleOverlayBlur}
            onKeyDown={handleOverlayKeyDown}
            style={{
              fontSize: 16,
              width: 52,
              background: "#fff",
              color: "#191A16",
              border: "1px solid #aaa",
              borderRadius: 4,
              marginRight: 5
            }}
            autoFocus
          />
          <select
            value={inputOverlay.unit}
            onChange={handleOverlayUnitChange}
            style={{
              fontSize: 13,
              borderRadius: 4,
              padding: "2px 4px"
            }}
          >
            {UNIT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Canvas container */}
      <div style={{
        background: "#fff",
        borderRadius: 0,
        padding: 0,
        flex: "1 1 auto",
        width: "100%",
        height: "100%",
        overflow: "hidden"
      }}>
        <Stage
          width={width}
          height={height - 48}
          ref={stageRef}
          scaleX={zoom}
          scaleY={zoom}
          x={pan.x}
          y={pan.y}
          onWheel={e => {
            if (e.evt.ctrlKey) {
              e.evt.preventDefault();
              const oldZoom = zoom;
              const scaleBy = e.evt.deltaY > 0 ? 1 / 1.12 : 1.12;
              let newZoom = oldZoom * scaleBy;
              newZoom = Math.max(0.25, Math.min(5, newZoom));
              const mousePointTo = {
                x: (e.evt.x - pan.x) / oldZoom,
                y: (e.evt.y - pan.y) / oldZoom,
              };
              const newPan = {
                x: e.evt.x - mousePointTo.x * newZoom,
                y: e.evt.y - mousePointTo.y * newZoom,
              };
              setZoom(newZoom);
              setPan(newPan);
            }
          }}
          onMouseDown={e => {
            // Only trigger panning in pan tool, with left mouse button
            if (activeTool === "pan" && e.evt.button === 0) {
              setIsPanning(true);
              lastPan.current = {
                x: e.evt.clientX - pan.x,
                y: e.evt.clientY - pan.y
              };
            }
            if (e.target === e.target.getStage()) {
              setSelectedSymbolId(null);
              setWellData(wells => wells.map(w => ({ ...w, selected: false })));
            }
          }}
          style={{ cursor: (isPanning || activeTool === "pan") ? "grab" : "default" }}
        >
          <Layer>
            <Grid width={width} height={height - 48} scale={zoom} offsetX={pan.x} offsetY={pan.y} showGrid={showGrid} />
            {wellData.slice(0, -1).map((a, i) => {
              const b = wellData[i + 1];
              const midX = (a.x + b.x) / 2;
              const midY = (a.y + b.y) / 2 - 50;
              return (
                <React.Fragment key={i}>
                  <Arrow
                    points={[a.x, a.y, b.x, b.y]}
                    pointerLength={12}
                    pointerWidth={12}
                    stroke={BORDER_GREEN}
                    strokeWidth={3.5}
                    opacity={0.9}
                  />
                  <SpacingField
                    x={midX}
                    y={midY}
                    value={spacings[i]?.value || ""}
                    unit={spacings[i]?.unit || "ft"}
                    editing={false}
                    onClick={() => handleShowInputOverlay({
                      type: "spacing",
                      index: i,
                      x: midX,
                      y: midY,
                      value: spacings[i]?.value || "",
                      unit: spacings[i]?.unit || "ft"
                    })}
                    UNIT_OPTIONS={UNIT_OPTIONS}
                  />
                </React.Fragment>
              );
            })}
            {wellData.map((well, idx) => (
              <WellGroup
                key={idx}
                well={well}
                idx={idx}
                activeTool={activeTool}
                onSelect={() => handleSelectWell(idx)}
                onDblClick={() => {
                  setEditingWellIdx(idx);
                  setWellNameInput(well.name);
                }}
                onEditHeight={() => handleShowInputOverlay({
                  type: "height",
                  index: idx,
                  x: well.x,
                  y: well.y + 50,
                  value: well.heightValue || "",
                  unit: well.heightUnit || "in"
                })}
                editingWellIdx={editingWellIdx}
                wellNameInput={wellNameInput}
                setWellNameInput={setWellNameInput}
                handleNameInputBlur={() => {
                  if (editingWellIdx === -1) return;
                  setWellData(wells => {
                    const updated = [...wells];
                    updated[editingWellIdx].name = wellNameInput;
                    return updated;
                  });
                  setEditingWellIdx(-1);
                }}
                handleNameInputKeyDown={e => {
                  if (e.key === "Enter" || e.key === "Escape") {
                    setEditingWellIdx(-1);
                  }
                }}
                editingHeightIdx={editingHeightIdx}
                wellHeightInput={wellHeightInput}
                setWellHeightInput={setWellHeightInput}
                wellHeightUnitInput={wellHeightUnitInput}
                setWellHeightUnitInput={setWellHeightUnitInput}
                handleHeightInputBlur={() => {
                  if (editingHeightIdx === -1) return;
                  setWellData(wells => {
                    const updated = [...wells];
                    updated[editingHeightIdx].heightValue = wellHeightInput;
                    updated[editingHeightIdx].heightUnit = wellHeightUnitInput;
                    return updated;
                  });
                  setEditingHeightIdx(-1);
                }}
                handleHeightInputKeyDown={e => {
                  if (e.key === "Enter" || e.key === "Escape") {
                    setEditingHeightIdx(-1);
                  }
                }}
                UNIT_OPTIONS={UNIT_OPTIONS}
              />
            ))}
            <NorthMarker
              x={northPos.x}
              y={northPos.y}
              angle={northAngle}
              onRotate={setNorthAngle}
              onMove={(x, y) => setNorthPos({ x, y })}
              zoom={zoom}
              pan={pan}
            />

            {/* --- LIBRARY IMAGES --- */}
            {symbols &&
              symbols.map(symbol => (
                <LibrarySymbolImage
                  key={symbol.id}
                  symbol={symbol}
                  isSelected={selectedSymbolId === symbol.id}
                  onSelect={() => setSelectedSymbolId(symbol.id)}
                  onDelete={() => {
                    setSelectedSymbolId(null);
                    onUpdateSymbol(symbol.id, null, null, "delete");
                  }}
                  onTransform={(id, transform) =>
                    onUpdateSymbol(id, undefined, undefined, "transform", transform)
                  }
                  onUpdate={(id, x, y) => onUpdateSymbol(id, x, y)}
                />
              ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

// --- Helper: Render each library image with drag/position/resize/rotate/delete support ---
function LibrarySymbolImage({
  symbol,
  isSelected,
  onSelect,
  onDelete,
  onTransform,
  onUpdate
}) {
  const shapeRef = React.useRef();
  const trRef = React.useRef();
  const [img] = useImage(symbol.src);

  React.useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const w = symbol.width || 96;
  const h = symbol.height || 96;

  return (
    <>
      <KonvaImage
        ref={shapeRef}
        image={img}
        x={symbol.x}
        y={symbol.y}
        width={w}
        height={h}
        rotation={symbol.rotation || 0}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={e => {
          onUpdate(symbol.id, e.target.x(), e.target.y());
        }}
        onTransformEnd={e => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onTransform(
            symbol.id,
            {
              x: node.x(),
              y: node.y(),
              width: Math.max(32, node.width() * scaleX),
              height: Math.max(32, node.height() * scaleY),
              rotation: node.rotation(),
            }
          );
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 32 || newBox.height < 32) {
              return oldBox;
            }
            return newBox;
          }}
          rotateEnabled={true}
          enabledAnchors={[
            "top-left", "top-right", "bottom-left", "bottom-right",
            "top-center", "bottom-center", "middle-left", "middle-right"
          ]}
        />
      )}
      {isSelected && (
        <Text
          text="✕"
          fontSize={26}
          fontStyle="bold"
          fill="red"
          x={symbol.x + w + 8}
          y={symbol.y - 16}
          width={24}
          height={24}
          align="center"
          verticalAlign="middle"
          onClick={onDelete}
          onTap={onDelete}
          style={{ cursor: "pointer" }}
        />
      )}
    </>
  );
}
