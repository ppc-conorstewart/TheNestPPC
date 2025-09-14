// ==============================
// File: SiteMeasurementsCanvas.jsx
// ==============================

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Arrow, Image as KonvaImage, Layer, Stage, Transformer } from 'react-konva';
import CanvasHelpModal from '../SiteMeasurementsCanvasComponents/CanvasHelpModal';
import CanvasToolbar from '../SiteMeasurementsCanvasComponents/CanvasToolbar';
import Grid from '../SiteMeasurementsCanvasComponents/Grid';
import NorthMarker from '../SiteMeasurementsCanvasComponents/NorthMarker';
import SpacingField from '../SiteMeasurementsCanvasComponents/SpacingField';
import WellGroup from '../SiteMeasurementsCanvasComponents/WellGroup';

// ==============================
// ======= CONSTANTS ============
// ==============================
const BORDER_GREEN = '#6a7257';
const WELL_SPACING = 300;
const WELL_START_X = 80;
const HEIGHT_BOX_W = 240;
const HEIGHT_BOX_H = 30;
const SPACING_BOX_W = 240;
const SPACING_BOX_H = 30;
const NAME_W = 120;
const NAME_H = 18;

// ==============================
// ======= SYMBOL SPRITE =========
// ==============================
function SymbolSprite({ sym, selected, onSelect, onMove, onTransform }) {
  const shapeRef = useRef(null);
  const trRef = useRef(null);

  const [img, setImg] = useState(null);
  useEffect(() => {
    const i = new window.Image();
    i.onload = () => setImg(i);
    i.src = sym.src;
  }, [sym.src]);

  useEffect(() => {
    if (selected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [selected]);

  return (
    <>
      <KonvaImage
        ref={shapeRef}
        image={img}
        x={sym.x}
        y={sym.y}
        width={sym.width}
        height={sym.height}
        rotation={sym.rotation || 0}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={e => onMove(sym.id, e.target.x(), e.target.y())}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          const width = Math.max(20, node.width() * scaleX);
          const height = Math.max(20, node.height() * scaleY);
          onTransform(sym.id, {
            x: node.x(),
            y: node.y(),
            width,
            height,
            rotation: node.rotation()
          });
        }}
        listening
      />
      {selected && (
        <Transformer
          ref={trRef}
          rotateEnabled
          keepRatio
          anchorSize={8}
          borderStroke={BORDER_GREEN}
          anchorStroke={BORDER_GREEN}
          anchorFill="#ffffff"
          boundBoxFunc={(oldBox, newBox) => {
            const min = 20;
            const w = Math.max(min, newBox.width);
            const h = Math.max(min, newBox.height);
            return { ...newBox, width: w, height: h };
          }}
        />
      )}
    </>
  );
}

// ==============================
// ======= COMPONENT ============
// ==============================
export default function SiteMeasurementsCanvas({
  wells = 4,
  wellData: initWellData,
  onChange,
  width = 1200,
  height = 650,
  symbols = [],
  onUpdateSymbol
}) {
  // ==============================
  // ======= INITIAL LAYOUT =======
  // ==============================
  const buildCenteredWells = () => {
    let arr = initWellData;
    if (!arr) {
      arr = Array.from({ length: wells }, (_, i) => ({
        x: WELL_START_X + i * WELL_SPACING,
        y: height / 2,
        name: `Well ${i + 1}`,
        heightFeet: 0,
        heightInches: 0,
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

  // ==============================
  // ======= STATE ================
  // ==============================
  const [wellData, setWellData] = useState(buildCenteredWells());
  const [spacings, setSpacings] = useState(
    Array.from(
      { length: Math.max((initWellData ? initWellData.length : wells) - 1, 0) },
      () => ({ feet: 0, inches: 0 })
    )
  );
  const [northAngle, setNorthAngle] = useState(0);
  const [northPos, setNorthPos] = useState({ x: width - 88, y: 70 });
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [activeTool, setActiveTool] = useState('select');
  const [prevTool, setPrevTool] = useState('select');
  const [helpOpen, setHelpOpen] = useState(false);

  const [spacingEdit, setSpacingEdit] = useState(null);
  const [heightEdit, setHeightEdit] = useState(null);
  const [nameEdit, setNameEdit] = useState(null);
  const [selectedSymbolId, setSelectedSymbolId] = useState(null);

  // ==============================
  // ======= REFS / MEMOS =========
  // ==============================
  const stageRef = useRef(null);
  const lastPan = useRef({ x: 0, y: 0 });
  const canvasInnerH = useMemo(() => height - 48, [height]);

  // ==============================
  // ======= EFFECTS ==============
  // ==============================
  useEffect(() => {
    if (onChange) onChange(wellData, northAngle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wellData, northAngle]);

  useEffect(() => {
    const down = e => {
      if (e.code === 'Space' && !e.repeat && document.activeElement === document.body) {
        setPrevTool(activeTool);
        setActiveTool('pan');
      }
    };
    const up = e => {
      if (e.code === 'Space') setActiveTool(prevTool);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [activeTool, prevTool]);

  useEffect(() => {
    const move = e => {
      if (!isPanning) return;
      setPan({ x: e.clientX - lastPan.current.x, y: e.clientY - lastPan.current.y });
    };
    const up = () => {
      setIsPanning(false);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    if (isPanning) {
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
    }
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, [isPanning]);

  // ==============================
  // ======= HELPERS ==============
  // ==============================
  const worldToOverlay = (wx, wy) => {
    return {
      left: wx * zoom + pan.x,
      top: wy * zoom + pan.y
    };
  };

  // ==============================
  // ======= ACTIONS ==============
  // ==============================
  const onAddWell = () => {
    setWellData(wellsArr => {
      const last = wellsArr[wellsArr.length - 1];
      const newWell = {
        x: last.x + WELL_SPACING,
        y: last.y,
        name: `Well ${wellsArr.length + 1}`,
        heightFeet: 0,
        heightInches: 0,
        selected: false
      };
      return [...wellsArr, newWell];
    });
    setSpacings(s => [...s, { feet: 0, inches: 0 }]);
  };

  const onRemoveWell = () => {
    setWellData(wellsArr => {
      const selectedIndex = wellsArr.findIndex(w => w.selected);
      if (selectedIndex === -1) {
        if (wellsArr.length === 0) return wellsArr;
        return wellsArr.slice(0, -1);
      }
      return wellsArr.filter((_, i) => i !== selectedIndex);
    });
    setSpacings(s => s.slice(0, -1));
  };

  const onDuplicate = () => {
    setWellData(wellsArr => {
      if (wellsArr.length === 0) return wellsArr;
      const last = wellsArr[wellsArr.length - 1];
      const newWell = { ...last, x: last.x + WELL_SPACING, name: `Well ${wellsArr.length + 1}`, selected: false };
      return [...wellsArr, newWell];
    });
    setSpacings(s => [...s, { feet: 0, inches: 0 }]);
  };

  const handleSelectWell = index => {
    setWellData(wellsArr => wellsArr.map((w, i) => ({ ...w, selected: i === index })));
  };

  // ==============================
  // ======= RENDER ===============
  // ==============================
  return (
    <div style={{ width: '100%', height: '100%', background: '#191A16', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <CanvasToolbar
        onAddWell={onAddWell}
        onRemoveWell={onRemoveWell}
        onDuplicate={onDuplicate}
        onUndo={() => {}}
        onRedo={() => {}}
        onZoomIn={() => setZoom(z => Math.min(z * 1.12, 5))}
        onZoomOut={() => setZoom(z => Math.max(z / 1.12, 0.25))}
        onResetView={() => {
          setZoom(1);
          setPan({ x: 0, y: 0 });
        }}
        zoom={zoom}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        snapGrid
        setSnapGrid={() => {}}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        showLabels
        setShowLabels={() => {}}
        onExportJSON={() => {}}
        onImportJSON={() => {}}
        onExportPNG={() => {
          if (stageRef.current) {
            const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
            const a = document.createElement('a');
            a.download = 'site-layout.png';
            a.href = uri;
            a.click();
          }
        }}
        onHelp={() => setHelpOpen(true)}
      />

      <CanvasHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />

      <div style={{ background: '#fff', flex: '1 1 auto', width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
        <Stage
          width={width}
          height={canvasInnerH}
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
              const newZoom = Math.max(0.25, Math.min(5, oldZoom * scaleBy));
              const mousePointTo = { x: (e.evt.x - pan.x) / oldZoom, y: (e.evt.y - pan.y) / oldZoom };
              const newPan = { x: e.evt.x - mousePointTo.x * newZoom, y: e.evt.y - mousePointTo.y * newZoom };
              setZoom(newZoom);
              setPan(newPan);
            }
          }}
          onMouseDown={e => {
            if (activeTool === 'pan' && e.evt.button === 0) {
              setIsPanning(true);
              lastPan.current = { x: e.evt.clientX - pan.x, y: e.evt.clientY - pan.y };
            }
            if (e.target === e.target.getStage()) {
              setSelectedSymbolId(null);
              setWellData(wellsArr => wellsArr.map(w => ({ ...w, selected: false })));
            }
          }}
          style={{ cursor: isPanning || activeTool === 'pan' ? 'grab' : 'default' }}
        >
          <Layer>
            <Grid width={width} height={canvasInnerH} scale={zoom} offsetX={pan.x} offsetY={pan.y} showGrid={showGrid} />

            {symbols.map(sym => (
              <SymbolSprite
                key={sym.id}
                sym={sym}
                selected={selectedSymbolId === sym.id}
                onSelect={() => setSelectedSymbolId(sym.id)}
                onMove={(id, x, y) => onUpdateSymbol && onUpdateSymbol(id, x, y, 'move')}
                onTransform={(id, transform) => onUpdateSymbol && onUpdateSymbol(id, null, null, 'transform', transform)}
              />
            ))}

            {wellData.slice(0, -1).map((a, i) => {
              const b = wellData[i + 1];
              const midX = (a.x + b.x) / 2;
              const midY = (a.y + b.y) / 2 - 58;

              return (
                <React.Fragment key={i}>
                  <Arrow
                    points={[a.x, a.y, b.x, b.y]}
                    pointerLength={12}
                    pointerWidth={12}
                    stroke={BORDER_GREEN}
                    strokeWidth={3.2}
                    opacity={0.9}
                  />
                  <SpacingField
                    x={midX}
                    y={midY}
                    feet={spacings[i]?.feet ?? 0}
                    inches={spacings[i]?.inches ?? 0}
                    onRequestEdit={() => {
                      const { left, top } = worldToOverlay(midX - SPACING_BOX_W / 2, midY - SPACING_BOX_H / 2);
                      setSpacingEdit({
                        i,
                        left,
                        top,
                        feet: spacings[i]?.feet ?? 0,
                        inches: spacings[i]?.inches ?? 0
                      });
                    }}
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
                onRequestEditName={() => {
                  const { left, top } = worldToOverlay(well.x - NAME_W / 2, well.y - 62 - 22 - NAME_H / 2);
                  setNameEdit({ i: idx, left, top, name: well.name || `Well ${idx + 1}` });
                }}
                onRequestEditHeight={() => {
                  const { left, top } = worldToOverlay(well.x - HEIGHT_BOX_W / 2, well.y + 62 / 2 + 22 - HEIGHT_BOX_H / 2);
                  setHeightEdit({
                    i: idx,
                    left,
                    top,
                    feet: Number(well.heightFeet ?? 0),
                    inches: Number(well.heightInches ?? 0)
                  });
                }}
              />
            ))}

            <NorthMarker
              x={northPos.x}
              y={northPos.y}
              angle={northAngle}
              onRotate={setNorthAngle}
              onMove={(x, y) => setNorthPos({ x, y })}
            />
          </Layer>
        </Stage>

        {spacingEdit && (
          <div
            style={{
              position: 'absolute',
              left: spacingEdit.left,
              top: spacingEdit.top,
              width: SPACING_BOX_W * zoom,
              height: SPACING_BOX_H * zoom,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6 * zoom,
              pointerEvents: 'auto',
              zIndex: 20
            }}
          >
            <span style={{ fontSize: 11 * zoom, fontWeight: 700, color: '#363b28' }}>Spacing:</span>
            <input
              type='number'
              inputMode='decimal'
              step='0.1'
              defaultValue={Number(spacingEdit.feet).toFixed(1)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === 'Tab') {
                  const feet = parseFloat(e.currentTarget.value) || 0;
                  const inches = parseFloat(
                    e.currentTarget.parentElement.querySelector('[data-inch]').value
                  ) || 0;
                  setSpacings(prev => {
                    const next = [...prev];
                    next[spacingEdit.i] = { feet, inches };
                    return next;
                  });
                  setSpacingEdit(null);
                }
                if (e.key === 'Escape') setSpacingEdit(null);
              }}
              onBlur={() => setSpacingEdit(null)}
              style={{
                width: 56 * zoom,
                fontSize: 12 * zoom,
                padding: `${2 * zoom}px ${6 * zoom}px`,
                border: '1px solid #aaa',
                borderRadius: 6
              }}
              autoFocus
            />
            <span style={{ fontSize: 10 * zoom, color: '#666' }}>[Feet]</span>
            <input
              data-inch
              type='number'
              inputMode='decimal'
              step='0.1'
              defaultValue={Number(spacingEdit.inches).toFixed(1)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === 'Tab') {
                  const inches = parseFloat(e.currentTarget.value) || 0;
                  const feet = parseFloat(
                    e.currentTarget.parentElement.querySelector('input[type="number"]:not([data-inch])').value
                  ) || 0;
                  setSpacings(prev => {
                    const next = [...prev];
                    next[spacingEdit.i] = { feet, inches };
                    return next;
                  });
                  setSpacingEdit(null);
                }
                if (e.key === 'Escape') setSpacingEdit(null);
              }}
              onBlur={() => setSpacingEdit(null)}
              style={{
                width: 56 * zoom,
                fontSize: 12 * zoom,
                padding: `${2 * zoom}px ${6 * zoom}px`,
                border: '1px solid #aaa',
                borderRadius: 6
              }}
            />
            <span style={{ fontSize: 10 * zoom, color: '#666' }}>[Inches]</span>
          </div>
        )}

        {heightEdit && (
          <div
            style={{
              position: 'absolute',
              left: heightEdit.left,
              top: heightEdit.top,
              width: HEIGHT_BOX_W * zoom,
              height: HEIGHT_BOX_H * zoom,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6 * zoom,
              pointerEvents: 'auto',
              zIndex: 20
            }}
          >
            <span style={{ fontSize: 11 * zoom, fontWeight: 700, color: '#363b28' }}>Height:</span>
            <input
              type='number'
              inputMode='decimal'
              step='0.1'
              defaultValue={Number(heightEdit.feet).toFixed(1)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === 'Tab') {
                  const feet = parseFloat(e.currentTarget.value) || 0;
                  const inches = parseFloat(
                    e.currentTarget.parentElement.querySelector('[data-inch]').value
                  ) || 0;
                  setWellData(prev => {
                    const n = [...prev];
                    n[heightEdit.i] = { ...n[heightEdit.i], heightFeet: feet, heightInches: inches };
                    return n;
                  });
                  setHeightEdit(null);
                }
                if (e.key === 'Escape') setHeightEdit(null);
              }}
              onBlur={() => setHeightEdit(null)}
              style={{
                width: 56 * zoom,
                fontSize: 12 * zoom,
                padding: `${2 * zoom}px ${6 * zoom}px`,
                border: '1px solid #aaa',
                borderRadius: 6
              }}
              autoFocus
            />
            <span style={{ fontSize: 10 * zoom, color: '#666' }}>[Feet]</span>
            <input
              data-inch
              type='number'
              inputMode='decimal'
              step='0.1'
              defaultValue={Number(heightEdit.inches).toFixed(1)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === 'Tab') {
                  const inches = parseFloat(e.currentTarget.value) || 0;
                  const feet = parseFloat(
                    e.currentTarget.parentElement.querySelector('input[type="number"]:not([data-inch])').value
                  ) || 0;
                  setWellData(prev => {
                    const n = [...prev];
                    n[heightEdit.i] = { ...n[heightEdit.i], heightFeet: feet, heightInches: inches };
                    return n;
                  });
                  setHeightEdit(null);
                }
                if (e.key === 'Escape') setHeightEdit(null);
              }}
              onBlur={() => setHeightEdit(null)}
              style={{
                width: 56 * zoom,
                fontSize: 12 * zoom,
                padding: `${2 * zoom}px ${6 * zoom}px`,
                border: '1px solid #aaa',
                borderRadius: 6
              }}
            />
            <span style={{ fontSize: 10 * zoom, color: '#666' }}>[Inches]</span>
          </div>
        )}

        {nameEdit && (
          <div
            style={{
              position: 'absolute',
              left: nameEdit.left,
              top: nameEdit.top,
              width: NAME_W * zoom,
              height: NAME_H * zoom,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'auto',
              zIndex: 20
            }}
          >
            <input
              type='text'
              defaultValue={nameEdit.name}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === 'Tab') {
                  const name = e.currentTarget.value.trim() || `Well ${nameEdit.i + 1}`;
                  setWellData(prev => {
                    const n = [...prev];
                    n[nameEdit.i] = { ...n[nameEdit.i], name };
                    return n;
                  });
                  setNameEdit(null);
                }
                if (e.key === 'Escape') setNameEdit(null);
              }}
              onBlur={() => setNameEdit(null)}
              style={{
                width: '100%',
                height: '100%',
                fontSize: 12 * zoom,
                textAlign: 'center',
                border: '1px solid #aaa',
                borderRadius: 6
              }}
              autoFocus
            />
          </div>
        )}
      </div>
    </div>
  );
}
