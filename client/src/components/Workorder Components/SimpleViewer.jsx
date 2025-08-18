import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  Fragment,
} from 'react';
import { useDropzone } from 'react-dropzone';
import '@google/model-viewer';

const IMAGE_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/svg+xml'
];
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.svg'];

// Helper to convert a relative backend URL to an absolute one for dev
const withServerUrl = url => {
  if (!url) return '';
  // If already absolute, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Assume development: hardcode for localhost:3001
  return `http://localhost:3001${url}`;
};

export default function SimpleViewer({
  style,
  initialUrl = null,
  initialLocked = false,
  initialLabels = [],
  onUrlChange = () => {},
  onLockedChange = () => {},
  onLabelsChange = () => {},
}) {
  const containerRef = useRef();
  const viewerRef = useRef();

  const [url, setUrl] = useState(initialUrl);
  const [isImage, setIsImage] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [locked, setLocked] = useState(initialLocked);
  const [labels, setLabels] = useState(initialLabels);
  const [showModal, setShowModal] = useState(false);
  const [newLabelText, setNewLabelText] = useState('');

  useEffect(() => {
    setUrl(initialUrl);
    if (
      typeof initialUrl === 'string' &&
      /\.(jpg|jpeg|png|webp|gif|bmp|svg)(\?.*)?$/i.test(initialUrl)
    ) {
      setIsImage(true);
    } else {
      setIsImage(false);
    }
  }, [initialUrl]);

  useEffect(() => {
    const mv = viewerRef.current;
    if (!mv || isImage) return;
    mv.disableRotate = locked;
    mv.disableZoom = locked;
    mv.disablePan = locked;
    onLockedChange(locked);
  }, [locked, onLockedChange, isImage]);

  useEffect(() => {
    onLabelsChange(labels);
  }, [labels, onLabelsChange]);

  const onDrop = useCallback(
    async files => {
      const file = files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('model', file);

      try {
        const res = await fetch('http://localhost:3001/api/upload-model', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.url) {
          setUrl(data.url);
          onUrlChange(data.url);
          // Accept both images and .glb
          if (/\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(data.url)) {
            setIsImage(true);
            setLocked(true);
          } else {
            setIsImage(false);
            setLocked(false);
          }
          setRotating(false);
          setLabels([]);
        } else {
          alert('Upload failed.');
        }
      } catch (err) {
        console.error(err);
        alert('Error uploading file.');
      }
    },
    [onUrlChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'model/gltf-binary': ['.glb'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif'],
      'image/bmp': ['.bmp'],
      'image/svg+xml': ['.svg'],
    },
    multiple: false,
    noClick: false,
    noKeyboard: false,
  });

  const handleRemove = () => {
    setUrl(null);
    setIsImage(false);
    onUrlChange(null);
    setRotating(false);
    setLocked(false);
    setLabels([]);
  };

  const handleCreateLabel = () => {
    setNewLabelText('');
    setShowModal(true);
  };

  const handleAddLabel = () => {
    const { width, height } = containerRef.current.getBoundingClientRect();
    setLabels(ls => [
      ...ls,
      {
        id: Date.now(),
        text: newLabelText,
        x: width / 2,
        y: height / 2,
        tx: width / 2 + 60,
        ty: height / 2 - 60,
      },
    ]);
    setShowModal(false);
  };

  const startDrag = (id, fx, fy) => e => {
    e.preventDefault();
    const startX = e.clientX, startY = e.clientY;
    const lab = labels.find(l => l.id === id);
    const origX = lab[fx], origY = lab[fy];
    const onMove = ev => {
      const dx = ev.clientX - startX, dy = ev.clientY - startY;
      setLabels(ls =>
        ls.map(l =>
          l.id === id ? { ...l, [fx]: origX + dx, [fy]: origY + dy } : l
        )
      );
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const autoRotateAttr = rotating ? { 'auto-rotate': '' } : {};

  const labelElements = useMemo(
    () =>
      labels.map(l => (
        <Fragment key={l.id}>
          <svg
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            <defs>
              <marker
                id={`arrow-${l.id}`}
                markerWidth="6"
                markerHeight="6"
                refX="5"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L6,3 L0,6" fill="yellow" />
              </marker>
            </defs>
            <line
              x1={l.x}
              y1={l.y}
              x2={l.tx}
              y2={l.ty}
              stroke="yellow"
              strokeWidth="2"
              markerEnd={`url(#arrow-${l.id})`}
            />
          </svg>
          <div
            onMouseDown={startDrag(l.id, 'x', 'y')}
            style={{
              position: 'absolute',
              left: l.x,
              top: l.y,
              transform: 'translate(-50%, -100%)',
              background: 'yellow',
              color: 'black',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'move',
              userSelect: 'none',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              zIndex: 5,
              pointerEvents: 'all',
            }}
          >
            {l.text}
          </div>
          <div
            onMouseDown={startDrag(l.id, 'tx', 'ty')}
            style={{
              position: 'absolute',
              left: l.tx - 4,
              top: l.ty - 4,
              width: 8,
              height: 8,
              background: 'yellow',
              borderRadius: '50%',
              cursor: 'move',
              userSelect: 'none',
              zIndex: 5,
              pointerEvents: 'all',
            }}
          />
        </Fragment>
      )),
    [labels]
  );

  const defaultHeight = 320;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: defaultHeight,
        height: style?.height || defaultHeight,
        background: '#222',
        ...style,
      }}
      ref={containerRef}
    >
      {(!url || isDragActive) && (
        <div
          {...getRootProps()}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            background: isDragActive
              ? 'rgba(255,255,255,0.1)'
              : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
            pointerEvents: 'all',
          }}
        >
          <input {...getInputProps()} />
          {isDragActive
            ? 'Drop your .glb model or image here…'
            : 'Drag & drop or click to upload a .glb model or image to preview'}
        </div>
      )}

      {url && !isImage && (
        <model-viewer
          ref={viewerRef}
          src={withServerUrl(url)}
          alt="3D model"
          style={{ width: '100%', height: '100%' }}
          interaction-prompt="none"
          min-camera-orbit="auto auto 0.5m"
          max-camera-orbit="auto auto 10m"
          disable-tap
          {...(!locked ? { 'camera-controls': 'orbit' } : {})}
          {...autoRotateAttr}
        />
      )}

      {url && isImage && (
        <img
          src={withServerUrl(url)}
          alt="Preview"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            background: '#222',
            display: 'block',
            borderRadius: 6,
            userSelect: 'none',
            border: '2px solid #6a7257',
          }}
          draggable={false}
        />
      )}

      {labelElements}

      {url && (
        <>
          {!isImage && (
            <>
              <button
                onClick={() => setRotating(r => !r)}
                className="absolute top-2 left-2 px-2 py-1 text-xs bg-black bg-opacity-75 text-white rounded"
                style={{ zIndex: 6, pointerEvents: 'all' }}
              >
                {rotating ? 'Stop Rotate' : 'Rotate'}
              </button>
              <button
                onClick={() => setLocked(l => !l)}
                className="absolute top-2 left-24 px-2 py-1 text-xs bg-black bg-opacity-75 text-white rounded"
                style={{ zIndex: 6, pointerEvents: 'all' }}
              >
                {locked ? 'Unlock Model' : 'Lock Model'}
              </button>
              <button
                onClick={handleCreateLabel}
                className="absolute top-2 left-48 px-2 py-1 text-xs bg-black bg-opacity-75 text-white rounded"
                style={{ zIndex: 6, pointerEvents: 'all' }}
              >
                Create Label
              </button>
            </>
          )}
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 px-2 py-1 text-xs bg-black bg-opacity-75 text-red-500 rounded"
            style={{ zIndex: 6, pointerEvents: 'all' }}
          >
            Remove {isImage ? 'Image' : 'Model'}
          </button>
        </>
      )}

      {showModal && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
          }}
        >
          <div
            style={{
              background: '#222',
              padding: 20,
              borderRadius: 6,
              minWidth: 240,
            }}
          >
            <h3 style={{ color: 'white', marginBottom: 10 }}>
              Enter Label Text
            </h3>
            <input
              value={newLabelText}
              onChange={e => setNewLabelText(e.target.value)}
              style={{
                width: '100%',
                padding: 6,
                marginBottom: 12,
                borderRadius: 4,
                border: '1px solid #555',
                background: '#111',
                color: 'white',
              }}
            />
            <div style={{ textAlign: 'right' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  marginRight: 8,
                  padding: '4px 8px',
                  background: '#555',
                  color: 'white',
                  borderRadius: 4,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddLabel}
                style={{
                  padding: '4px 8px',
                  background: '#6a7257',
                  color: 'white',
                  borderRadius: 4,
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
