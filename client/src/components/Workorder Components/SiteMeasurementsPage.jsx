import React, { useRef, useEffect, useState } from 'react';
import SiteMeasurementsCanvas from './SiteMeasurementsCanvas';
import ResourcesSidebar from '../SiteMeasurementsCanvasComponents/ResourcesSidebar';

function useContainerSize(ref) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    function update() {
      if (ref.current) {
        setSize({
          width: ref.current.offsetWidth,
          height: ref.current.offsetHeight,
        });
      }
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [ref]);
  return size;
}

export default function SiteMeasurementsPage({ measurements = {}, onChange }) {
  const canvasData = measurements.canvas || {};
  const wells = canvasData.wells || 4;
  const wellData = canvasData.wellsArr || undefined;
  const northAngle = canvasData.northAngle || 0;

  const containerRef = useRef();
  const canvasDivRef = useRef();
  const { width, height } = useContainerSize(containerRef);

  // Library Symbol Items state
  const [canvasSymbols, setCanvasSymbols] = useState([]);

  // Handler for sidebar image drop (DRAG & DROP, with aspect ratio!)
  const handleDropLibrarySymbol = e => {
    e.preventDefault();
    const data = e.dataTransfer.getData("application/library-item");
    if (data && canvasDivRef.current) {
      const item = JSON.parse(data);
      const boundingRect = canvasDivRef.current.getBoundingClientRect();
      const x = e.clientX - boundingRect.left;
      const y = e.clientY - boundingRect.top;

      // Dynamically get aspect ratio at drop time:
      const img = new window.Image();
      img.onload = function() {
        const desiredWidth = 160; // or whatever size you want
        const scale = desiredWidth / img.naturalWidth;
        const desiredHeight = img.naturalHeight * scale;
        setCanvasSymbols(prev => [
          ...prev,
          {
            ...item,
            x,
            y,
            id: `${item.key}-${Date.now()}-${Math.random()}`,
            width: desiredWidth,
            height: desiredHeight,
            rotation: 0,
          }
        ]);
      };
      img.src = item.src;
    }
  };

  // KEY: Robust handler for move, resize, rotate, delete, always preserve/copy all properties
  const handleUpdateSymbol = (id, x, y, action = "move", transform = {}) => {
    setCanvasSymbols(symbols =>
      symbols
        .map(sym => {
          if (sym.id !== id) return sym;
          if (action === "delete") return null;
          let updated = { ...sym };
          if (action === "move" && x != null && y != null) {
            updated.x = x;
            updated.y = y;
          }
          if (action === "transform") {
            updated = {
              ...updated,
              ...(transform.x !== undefined ? { x: transform.x } : {}),
              ...(transform.y !== undefined ? { y: transform.y } : {}),
              ...(transform.width !== undefined ? { width: transform.width } : {}),
              ...(transform.height !== undefined ? { height: transform.height } : {}),
              ...(transform.rotation !== undefined ? { rotation: transform.rotation } : {}),
            };
          }
          return updated;
        })
        .filter(Boolean)
    );
  };

  const handleCanvasChange = (wellsArr, angle) => {
    onChange('canvas', {
      wellsArr,
      northAngle: angle,
    });
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        background: "#191A16",
        borderRadius: 0,
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      {/* Left: Canvas (80%) */}
      <div
        ref={canvasDivRef}
        style={{
          flex: "4 1 0",
          height: "100%",
          background: "#191A16",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          borderRadius: 0,
          minWidth: 0,
          position: "relative"
        }}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDropLibrarySymbol}
      >
        {(width > 0 && height > 0) && (
          <SiteMeasurementsCanvas
            wells={Array.isArray(wellData) ? wellData.length : wells}
            wellData={wellData}
            onChange={handleCanvasChange}
            width={width * 0.8}
            height={height}
            symbols={canvasSymbols}
            onUpdateSymbol={handleUpdateSymbol}
          />
        )}
      </div>
      {/* Right: Sidebar (20%) */}
      <div
        style={{
          flex: "1 1 0",
          height: "100%",
          background: "#191A16",
          borderLeft: "4px solid #8CF94A",
          minWidth: 0,
          maxWidth: 360,
          boxShadow: "0 0 20px #0006"
        }}
      >
        <ResourcesSidebar width="100%" />
      </div>
    </div>
  );
}
