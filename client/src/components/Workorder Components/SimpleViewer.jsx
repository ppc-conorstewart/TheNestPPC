// ==============================
// FILE: src/components/Workorder Components/SimpleViewer.jsx
// ==============================

import '@google/model-viewer';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import GlbLibraryModal from './GlbLibraryModal';

// ==============================
// ======= DEV URL HELPER =======
// ==============================
const withServerUrl = url => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return 'http://localhost:3001' + url;
};

export default function SimpleViewer({
  style,
  initialUrl = null,
  initialLocked = false,
  initialLabels = [],
  onUrlChange = () => {},
  onLockedChange = () => {},
  onLabelsChange = () => {},
  storageKey = 'default'
}) {
  // ==============================
  // ======= REFS + STATE =========
  // ==============================
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const didMountRef = useRef(false);

  const [url, setUrl] = useState(initialUrl);
  const [isImage, setIsImage] = useState(
    typeof initialUrl === 'string' && /\.(jpg|jpeg|png|webp|gif|bmp|svg)(\?.*)?$/i.test(initialUrl)
  );
  const [locked, setLocked] = useState(!!initialLocked);
  const [labels, setLabels] = useState(Array.isArray(initialLabels) ? initialLabels : []);
  const [selectedId, setSelectedId] = useState(null);
  const [showLibrary, setShowLibrary] = useState(false);

  // ==============================
  // ======== STORAGE KEYS ========
  // ==============================
  const savedStateKey = `mv_state_${storageKey}`;
  const savedLabelsKey = `mv_labels_${storageKey}`;

  // ==============================
  // ===== SYNC PROPS ONCE ========
  // ==============================
  useEffect(() => {
    if (didMountRef.current) return;
    didMountRef.current = true;

    try {
      const raw = localStorage.getItem(savedLabelsKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setLabels(parsed);
        } else if (Array.isArray(initialLabels)) {
          setLabels(initialLabels);
        }
      } else if (Array.isArray(initialLabels)) {
        setLabels(initialLabels);
      }
    } catch {
      setLabels(Array.isArray(initialLabels) ? initialLabels : []);
    }

    setLocked(!!initialLocked);
    setUrl(initialUrl || null);
    setIsImage(typeof initialUrl === 'string' && /\.(jpg|jpeg|png|webp|gif|bmp|svg)(\?.*)?$/i.test(initialUrl));
  }, []);

  // ==============================
  // ===== SYNC URL ON CHANGE =====
  // ==============================
  useEffect(() => {
    if (!didMountRef.current) return;
    setUrl(initialUrl || null);
    const img = typeof initialUrl === 'string' && /\.(jpg|jpeg|png|webp|gif|bmp|svg)(\?.*)?$/i.test(initialUrl);
    setIsImage(img);
  }, [initialUrl]);

  // ==============================
  // ======= PERSIST LABELS =======
  // ==============================
  useEffect(() => {
    onLabelsChange(labels);
    try {
      localStorage.setItem(savedLabelsKey, JSON.stringify(labels));
    } catch {}
  }, [labels, onLabelsChange, savedLabelsKey]);

  // ==============================
  // ====== CAMERA PERSISTENCE ====
  // ==============================
  const saveCameraToStorage = useCallback(() => {
    const mv = viewerRef.current;
    if (!mv || isImage) return;
    try {
      const { theta, phi, radius } = mv.getCameraOrbit();
      const fov = mv.getFieldOfView ? mv.getFieldOfView() : null;
      const payload = { theta, phi, radius, fov };
      localStorage.setItem(savedStateKey, JSON.stringify(payload));
    } catch {}
  }, [isImage, savedStateKey]);

  const applySavedOrbit = useCallback(async () => {
    const mv = viewerRef.current;
    if (!mv || isImage) return false;
    try {
      const raw = localStorage.getItem(savedStateKey);
      if (!raw) return false;
      const { theta, phi, radius, fov } = JSON.parse(raw);
      await mv.updateComplete;
      if (typeof fov === 'number') mv.setAttribute('field-of-view', `${fov}deg`);
      mv.setAttribute('camera-orbit', `${theta}rad ${phi}rad ${radius}m`);
      await mv.updateComplete;
      return true;
    } catch {
      return false;
    }
  }, [isImage, savedStateKey]);

  // ==============================
  // ===== LOCK / UNLOCK VIEW =====
  // ==============================
  useEffect(() => {
    const mv = viewerRef.current;
    if (!mv || isImage) return;
    mv.disableRotate = locked;
    mv.disableZoom = locked;
    mv.disablePan = locked;
    if (locked) {
      mv.removeAttribute('camera-controls');
    } else {
      mv.setAttribute('camera-controls', 'orbit');
    }
  }, [locked, isImage]);

  const toggleLocked = () => {
    setLocked(prev => {
      const next = !prev;
      try { onLockedChange(next); } catch {}
      if (next) saveCameraToStorage();
      return next;
    });
  };

  // ==============================
  // ===== MODEL LOAD HANDLER =====
  // ==============================
  useEffect(() => {
    const mv = viewerRef.current;
    if (!mv || !url || isImage) return;

    const onLoad = async () => {
      mv.setAttribute('min-camera-orbit', 'auto auto 0.25m');
      mv.setAttribute('max-camera-orbit', 'auto auto 20m');
      await mv.updateComplete;

      const applied = await applySavedOrbit();
      if (!applied) {
        mv.setAttribute('camera-orbit', 'auto auto auto');
        await mv.updateComplete;
        const { theta, phi, radius } = mv.getCameraOrbit();
        const newRadius = Math.min(20, radius * 1.05);
        mv.setAttribute('camera-orbit', `${theta}rad ${phi}rad ${newRadius}m`);
        await mv.updateComplete;
      }
    };

    mv.addEventListener('load', onLoad, { once: true });
    return () => mv && mv.removeEventListener('load', onLoad);
  }, [url, isImage, applySavedOrbit]);

  // ==============================
  // ======== UPLOAD / DROP =======
  // ==============================
  const onDrop = useCallback(async files => {
    const file = files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('model', file);

    try {
      const res = await fetch('http://localhost:3001/api/upload-model', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        setUrl(data.url);
        onUrlChange(data.url);
        const img = /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(data.url);
        setIsImage(img);
        setLocked(img ? true : false);
        setLabels([]);
        setSelectedId(null);
      } else {
        alert('Upload failed.');
      }
    } catch {
      alert('Error uploading file.');
    }
  }, [onUrlChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'model/gltf-binary': ['.glb'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif'],
      'image/bmp': ['.bmp'],
      'image/svg+xml': ['.svg']
    },
    multiple: false,
    noClick: false,
    noKeyboard: false
  });

  // ==============================
  // ====== BACKGROUND CLICKS =====
  // ==============================
  const onBackgroundMouseDown = e => {
    if (e.target === containerRef.current) setSelectedId(null);
  };

  // ==============================
  // ======= LABEL CREATION =======
  // ==============================
  const createLabelAt = (text, x, y) => {
    const rect = containerRef.current?.getBoundingClientRect();
    const width = rect?.width || 0;
    const height = rect?.height || 0;
    const id = Date.now() + Math.random();
    const cx = Math.max(24, Math.min(width - 24, x ?? width / 2));
    const cy = Math.max(24, Math.min(height - 24, y ?? height / 2));
    const tx = Math.max(8, Math.min(width - 8, cx + 60));
    const ty = Math.max(8, Math.min(height - 8, cy - 60));
    setLabels(ls => [...ls, { id, text: String(text), x: cx, y: cy, tx, ty }]);
    setSelectedId(id);
  };

  // ==============================
  // ======= SELECT & DELETE ======
  // ==============================
  useEffect(() => {
    const onKey = e => {
      if (selectedId == null) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        setLabels(ls => ls.filter(l => l.id !== selectedId));
        setSelectedId(null);
      } else if (e.key === 'Escape') {
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId]);

  const startDrag = (id, fx, fy) => e => {
    e.preventDefault();
    setSelectedId(id);
    const startX = e.clientX;
    const startY = e.clientY;
    const lab = labels.find(l => l.id === id);
    const origX = lab[fx];
    const origY = lab[fy];
    const onMove = ev => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      setLabels(ls => ls.map(l => (l.id === id ? { ...l, [fx]: origX + dx, [fy]: origY + dy } : l)));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      try { localStorage.setItem(savedLabelsKey, JSON.stringify(labels)); } catch {}
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // ==============================
  // ======== LABEL LAYERS ========
  // ==============================
  const labelElements = useMemo(
    () =>
      labels.map(l => {
        const selected = l.id === selectedId;
        return (
          <Fragment key={l.id}>
            <svg style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              <defs>
                <marker id={'arrow-' + l.id} markerWidth='6' markerHeight='6' refX='5' refY='3' orient='auto'>
                  <path d='M0,0 L6,3 L0,6' fill='yellow' />
                </marker>
              </defs>
              <line
                x1={l.x}
                y1={l.y}
                x2={l.tx}
                y2={l.ty}
                stroke={selected ? '#ffea00' : 'yellow'}
                strokeWidth={selected ? 3 : 2}
                markerEnd={'url(#arrow-' + l.id + ')'}
              />
            </svg>
            <div
              onMouseDown={startDrag(l.id, 'x', 'y')}
              style={{
                position: 'absolute',
                left: l.x,
                top: l.y,
                transform: 'translate(-50%, -100%)',
                background: selected ? '#ffea00' : 'yellow',
                color: 'black',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'move',
                userSelect: 'none',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                zIndex: 5,
                pointerEvents: 'all',
                boxShadow: selected ? '0 0 0 2px white' : 'none'
              }}
            >
              {l.text}
            </div>
            <div
              onMouseDown={startDrag(l.id, 'tx', 'ty')}
              style={{
                position: 'absolute',
                left: l.tx - 5,
                top: l.ty - 5,
                width: selected ? 12 : 10,
                height: selected ? 12 : 10,
                background: selected ? '#ffea00' : 'yellow',
                borderRadius: '50%',
                cursor: 'move',
                userSelect: 'none',
                zIndex: 5,
                pointerEvents: 'all',
                boxShadow: selected ? '0 0 0 2px white' : 'none'
              }}
            />
          </Fragment>
        );
      }),
    [labels, selectedId]
  );

  // ==============================
  // ========= RENDER =============
  // ==============================
  const defaultHeight = 320;

  return (
    <div
      ref={containerRef}
      onMouseDown={onBackgroundMouseDown}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: defaultHeight,
        height: style?.height || defaultHeight,
        backgroundColor: '#000',
        backgroundImage:
          'linear-gradient(rgba(106,114,87,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(106,114,87,0.35) 1px, transparent 1px)',
        backgroundSize: '20px 20px, 20px 20px',
        ...style
      }}
    >
      {(!url || isDragActive) && (
        <div
          {...getRootProps()}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            background: isDragActive ? 'rgba(255,255,255,0.1)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
            pointerEvents: 'all'
          }}
        >
          <input {...getInputProps()} />
          {isDragActive ? 'Drop your .glb model or image here…' : 'Drag & drop or click to upload a .glb model or image to preview'}
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          top: 8,
          left: 8,
          right: 8,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 50,            // <-- Lift the toolbar above the drop overlay so buttons remain clickable
          pointerEvents: 'none'
        }}
      >
        <div style={{ display: 'flex', gap: 8, pointerEvents: 'all' }}>
          <button
            onClick={toggleLocked}
            style={{ padding: '6px 10px', background: 'black', color: 'white', borderRadius: 4, border: '1px solid #555' }}
            title='Lock/Unlock View'
          >
            {locked ? 'Unlock View' : 'Lock View'}
          </button>
          <button
            onClick={saveCameraToStorage}
            style={{ padding: '6px 10px', background: 'black', color: 'white', borderRadius: 4, border: '1px solid #555' }}
            title='Save Current View'
          >
            Save View
          </button>
          <button
            onClick={() => setShowLibrary(true)}
            style={{ padding: '6px 10px', background: '#6a7257', color: 'black', borderRadius: 4, border: '1px solid #6a7257', fontWeight: 800 }}
            title='Add From GLB Library'
          >
            Add From Library
          </button>
        </div>
        <div style={{ display: 'flex', gap: 6, pointerEvents: 'all' }}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
            <div
              key={n}
              onClick={() => {
                const rect = containerRef.current?.getBoundingClientRect();
                const x = rect ? rect.width / 2 : 120;
                const y = rect ? rect.height / 2 : 120;
                createLabelAt(n, x, y);
              }}
              style={{
                width: 28,
                height: 28,
                background: '#111',
                color: '#ffea00',
                border: '1px solid #444',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                cursor: 'pointer',
                userSelect: 'none'
              }}
              title={`Add label ${n}`}
            >
              {n}
            </div>
          ))}
        </div>
      </div>

      {url && !isImage && (
        <model-viewer
          ref={viewerRef}
          src={withServerUrl(url)}
          alt='3D model'
          style={{ width: '100%', height: '100%' }}
          interaction-prompt='none'
          min-camera-orbit='auto auto 0.25m'
          max-camera-orbit='auto auto 20m'
          disable-tap
          {...(!locked ? { 'camera-controls': 'orbit' } : {})}
        />
      )}

      {url && isImage && (
        <img
          src={withServerUrl(url)}
          alt='Preview'
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            background: 'transparent',
            display: 'block',
            borderRadius: 6,
            userSelect: 'none',
            border: '2px solid #6a7257'
          }}
          draggable={false}
        />
      )}

      {labelElements}

      <GlbLibraryModal
        open={showLibrary}
        onClose={() => setShowLibrary(false)}
        onSelect={item => {
          const newUrl = item?.storage_url || '';
          if (!newUrl) return;
          setShowLibrary(false);
          setUrl(newUrl);
          onUrlChange(newUrl);
          const img = /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(newUrl);
          setIsImage(img);
          setLocked(img ? true : false);
          setLabels([]);
          setSelectedId(null);
        }}
      />
    </div>
  );
}
