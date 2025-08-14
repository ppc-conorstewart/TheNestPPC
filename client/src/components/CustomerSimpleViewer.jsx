// src/components/CustomerSimpleViewer.jsx

import React, { useRef, useEffect, useState, useCallback } from 'react';
import '@google/model-viewer';
import { useDropzone } from 'react-dropzone';

export default function CustomerSimpleViewer({
  style,
  initialUrl = null,
  initialLocked = false,
  initialLabels = [],
  onUrlChange = () => {},
  onLockedChange = () => {},
  onLabelsChange = () => {},
}) {
  const viewerRef = useRef();
  const [modelUrl, setModelUrl] = useState(initialUrl);

  // Handle file drop
  const onDrop = useCallback(
    acceptedFiles => {
      const glbFile = acceptedFiles.find(f => f.name.endsWith('.glb'));
      if (!glbFile) return;
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result;
        setModelUrl(url);
        onUrlChange(url);
      };
      reader.readAsDataURL(glbFile);
    },
    [onUrlChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'model/gltf-binary': ['.glb'] },
    multiple: false,
  });

  // Once model loads, set zoom limits and patch WebGL context
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const setZoomLimits = () => {
      viewer.minFieldOfView = '1deg';
      viewer.maxFieldOfView = '80deg';
      viewer.fieldOfView = '45deg';
    };

    const patchGL = () => {
      // Monkey-patch the internal WebGL context creation to preserve the drawing buffer
      const origGet = viewer.renderer?.getContext;
      if (origGet) {
        viewer.renderer.getContext = (...args) => {
          const ctx = origGet(...args);
          // force preserveDrawingBuffer and antialias
          const origAttrs = ctx.getContextAttributes?.() || {};
          ctx.getContextAttributes = () => ({
            ...origAttrs,
            preserveDrawingBuffer: true,
            antialias: true,
          });
          return ctx;
        };
      }
    };

    viewer.addEventListener('load', setZoomLimits);
    viewer.addEventListener('load', patchGL);

    return () => {
      viewer.removeEventListener('load', setZoomLimits);
      viewer.removeEventListener('load', patchGL);
    };
  }, [modelUrl]);

  return (
    <div
      {...getRootProps()}
      style={{
        ...style,
        position: 'relative',
        cursor: isDragActive ? 'copy' : 'grab',
      }}
      className={`flex justify-center items-center ${
        isDragActive ? 'border-2 border-green-400' : ''
      }`}
    >
      <input {...getInputProps()} />

      {modelUrl ? (
        <div
          className="viewer-container w-full h-full"
          onClick={e => e.stopPropagation()}
          style={{ willChange: 'transform' }}
        >
          <model-viewer
            ref={viewerRef}
            src={modelUrl}
            alt="Customer Pad Layout Viewer"
            camera-controls
            touch-action="none"
            interaction-prompt="none"
            antialias
            dpr="5"
            renderer="webgl2"
            exposure="0.8"
            shadow-intensity="1"
            shadow-softness="1"
            environment-image="neutral"
            min-field-of-view="1deg"
            max-field-of-view="80deg"
            style={{
              width: '100%',
              height: '100%',
              imageRendering: 'auto',
            }}
          />
        </div>
      ) : (
        <div className="text-center text-gray-400 uppercase select-none">
          {isDragActive
            ? 'Drop .GLB file here...'
            : 'Drag & Drop or Click to Upload .GLB'}
        </div>
      )}
    </div>
  );
}
