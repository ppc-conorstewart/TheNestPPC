// ==============================
// File: SiteMeasurementsPage.jsx
// ==============================

import { useCallback, useEffect, useRef, useState } from 'react';
import ResourcesSidebar from './ResourcesSidebar';
import SiteMeasurementsCanvas from './SiteMeasurementsCanvas';

// ==============================
// ======= HOOKS ================
// ==============================
function useContainerSize(ref) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    function update() {
      if (ref.current) {
        setSize({
          width: ref.current.offsetWidth,
          height: ref.current.offsetHeight
        });
      }
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [ref]);
  return size;
}

// ==============================
// ======= COMPONENT ============
// ==============================
export default function SiteMeasurementsPage({ measurements = {}, onChange }) {
  const canvasData = measurements.canvas || {};
  const wells = canvasData.wells || 4;
  const wellData = canvasData.wellsArr || undefined;

  const containerRef = useRef();
  const canvasDivRef = useRef();
  const { width, height } = useContainerSize(containerRef);

  const [canvasSymbols, setCanvasSymbols] = useState([]);

  const handleDropLibrarySymbol = e => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/library-item');
    if (data && canvasDivRef.current) {
      const item = JSON.parse(data);
      const boundingRect = canvasDivRef.current.getBoundingClientRect();
      const x = e.clientX - boundingRect.left;
      const y = e.clientY - boundingRect.top;

      const img = new window.Image();
      img.onload = function() {
        const desiredWidth = 160;
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
            rotation: 0
          }
        ]);
      };
      img.src = item.src;
    }
  };

  const handleUpdateSymbol = (id, x, y, action = 'move', transform = {}) => {
    setCanvasSymbols(symbols =>
      symbols
        .map(sym => {
          if (sym.id !== id) return sym;
          if (action === 'delete') return null;
          let updated = { ...sym };
          if (action === 'move' && x != null && y != null) {
            updated.x = x;
            updated.y = y;
          }
          if (action === 'transform') {
            updated = {
              ...updated,
              ...(transform.x !== undefined ? { x: transform.x } : {}),
              ...(transform.y !== undefined ? { y: transform.y } : {}),
              ...(transform.width !== undefined ? { width: transform.width } : {}),
              ...(transform.height !== undefined ? { height: transform.height } : {}),
              ...(transform.rotation !== undefined ? { rotation: transform.rotation } : {})
            };
          }
          return updated;
        })
        .filter(Boolean)
    );
  };

  // Stable identity prevents downstream effect loops
  const handleCanvasChange = useCallback(
    (wellsArr, angle) => {
      onChange('canvas', {
        wellsArr,
        northAngle: angle
      });
    },
    [onChange]
  );

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        background: '#191A16',
        borderRadius: 0,
        margin: 0,
        padding: 0,
        overflow: 'hidden'
      }}
    >
      <div
        ref={canvasDivRef}
        style={{
          flex: '4 1 0',
          height: '100%',
          background: '#191A16',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          borderRadius: 0,
          minWidth: 0,
          position: 'relative'
        }}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDropLibrarySymbol}
      >
        {width > 0 && height > 0 && (
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
      <div
        style={{
          flex: '1 1 0',
          height: '100%',
          background: '#191A16',
          borderLeft: '4px solid #8CF94A',
          minWidth: 0,
          maxWidth: 360,
          boxShadow: '0 0 20px #0006'
        }}
      >
        <ResourcesSidebar width='100%' />
      </div>
    </div>
  );
}
