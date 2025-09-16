// ==============================
// FILE: client/src/components/Interactive Trainer Components/TrainingViewer.jsx
// ==============================

import '@google/model-viewer';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { API_BASE_URL } from '../../api';


const API_BASE = API_BASE_URL || '';

// ==============================
// ======== UTILS ===============
// ==============================
const withServerUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE}` + url;
};
const norm = (s) => (s || '').toLowerCase().trim();

// ==============================
// ======== VIEWER ==============
// ==============================
export default function TrainingViewer({
  style,
  modelUrl,
  onReady = () => {},
  onProgress = () => {},
  stepActive = true,
  forceLock = false,
  rotAxis = 'z',
  liftAxis = 'y',
  liftAmount = 0.05,
  turnSeconds = 0.7,
  allowedNames = [
    'Heavy Hex Nuts 2H-33',
    'Heavy Hex Nuts 2H-34',
    'Heavy Hex Nuts 2H-35',
    'Heavy Hex Nuts 2H-36',
    'Heavy Hex Nuts 2H-37',
    'Heavy Hex Nuts 2H-38',
    'Heavy Hex Nuts 2H-39',
    'Heavy Hex Nuts 2H-40'
  ]
}) {
  const mvRef = useRef(null);

  // ---------- External lock toggle ----------
  useEffect(() => {
    const mv = mvRef.current;
    if (!mv) return;
    const lockCamera = () => {
      try {
        mv.disableRotate = true;
        mv.disableZoom = true;
        mv.disablePan = true;
        mv.removeAttribute('camera-controls');
      } catch {}
    };
    const unlockCamera = () => {
      try {
        mv.disableRotate = false;
        mv.disableZoom = false;
        mv.disablePan = false;
        mv.setAttribute('camera-controls', 'orbit');
      } catch {}
    };
    if (forceLock) lockCamera(); else unlockCamera();
  }, [forceLock]);

  // ---------- Loader + interactions ----------
  useEffect(() => {
    const mv = mvRef.current;
    if (!mv || !modelUrl) return;

    let cleanupFns = [];
    let threeScene = null;
    let camera = null;

    const lockCamera = () => {
      try {
        mv.disableRotate = true;
        mv.disableZoom = true;
        mv.disablePan = true;
        mv.removeAttribute('camera-controls');
      } catch {}
    };
    const unlockCamera = () => {
      try {
        if (forceLock) return;
        mv.disableRotate = false;
        mv.disableZoom = false;
        mv.disablePan = false;
        mv.setAttribute('camera-controls', 'orbit');
      } catch {}
    };

    const onLoad = async () => {
      await mv.updateComplete;
      mv.setAttribute('min-camera-orbit', 'auto auto 0.25m');
      mv.setAttribute('max-camera-orbit', 'auto auto 20m');
      if (!forceLock) mv.setAttribute('camera-controls', 'orbit');

      threeScene =
        (mv && mv.model && mv.model.scene) ||
        (mv && mv.scene && mv.scene.model && mv.scene.model.scene) ||
        null;

      camera =
        (mv && mv.camera) ||
        (mv && mv.scene && mv.scene.camera) ||
        null;

      const nodes = {};
      try {
        threeScene?.traverse?.((obj) => {
          if (!obj?.name) return;
          nodes[obj.name] = obj;
        });
      } catch {}

      const allowSet = new Set(allowedNames.map(norm));
      const targetNodes = Object.values(nodes).filter(o => allowSet.has(norm(o.name)));

      onReady({ mv, scene: threeScene, camera, THREE, nodes, targetNodes });
      if (!camera || !threeScene) return;

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();

      let isMouseDown = false;
      let current = null;
      let raf = 0;
      const prog = new Map();

      const setCursor = (c) => { try { mv.style.cursor = c; } catch {} };
      const axisKey = (axis) => (axis === 'x' ? 'x' : axis === 'z' ? 'z' : 'y');

      const softenMaterial = (obj) => {
        try {
          obj.traverse(child => {
            if (child.material) {
              child.material.transparent = true;
              child.material.opacity = 0.25;
              child.material.needsUpdate = true;
            }
          });
        } catch {}
      };

      const animateUnscrew = (obj) => {
        if (!obj) return;
        if (!prog.has(obj.uuid)) prog.set(obj.uuid, 0);
        const start = performance.now();
        const baseLift = obj.userData.__baseLift ?? obj.position[axisKey(liftAxis)];
        const baseRot  = obj.userData.__baseRot  ?? obj.rotation[axisKey(rotAxis)];
        obj.userData.__baseLift = baseLift;
        obj.userData.__baseRot  = baseRot;

        const step = (t) => {
          if (!isMouseDown || !current || !stepActive) {
            cancelAnimationFrame(raf);
            return;
          }
          const elapsed = (t - start) / (turnSeconds * 1000);
          const p = Math.min(1, (prog.get(obj.uuid) || 0) + elapsed);
          prog.set(obj.uuid, p);

          obj.rotation[axisKey(rotAxis)] = baseRot + p * Math.PI * 2;
          obj.position[axisKey(liftAxis)] = baseLift + p * liftAmount;

          mv.requestRender?.();

          if (p >= 1) {
            softenMaterial(obj);
            cancelAnimationFrame(raf);
            prog.delete(obj.uuid);
            const finishedName = current.name;
            current = null;
            unlockCamera();
            onProgress({ removedName: finishedName });
            setCursor('grab');
            return;
          }
          raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      };

      const pick = (clientX, clientY) => {
        const rect = mv.getBoundingClientRect();
        pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(targetNodes, true);
        if (!hits.length) return null;
        let obj = hits[0].object;
        while (obj && !allowSet.has(norm(obj.name))) obj = obj.parent;
        return obj || null;
      };

      const onMove = (e) => {
        if (!stepActive) { setCursor('default'); return; }
        const hit = pick(e.clientX, e.clientY);
        setCursor(hit ? (isMouseDown ? 'grabbing' : 'grab') : 'default');
      };

      const onDown = (e) => {
        if (!stepActive) return;
        const hit = pick(e.clientX, e.clientY);
        if (!hit) return;
        if (hit.userData.__baseLift == null) hit.userData.__baseLift = hit.position[axisKey(liftAxis)];
        if (hit.userData.__baseRot  == null) hit.userData.__baseRot  = hit.rotation[axisKey(rotAxis)];
        isMouseDown = true;
        current = hit;
        lockCamera();
        setCursor('grabbing');
        animateUnscrew(hit);
      };

      const onUp = () => {
        isMouseDown = false;
        current = null;
        cancelAnimationFrame(raf);
        unlockCamera();
        setCursor('grab');
      };

      mv.addEventListener('pointermove', onMove);
      mv.addEventListener('pointerdown', onDown);
      window.addEventListener('pointerup', onUp);
      mv.addEventListener('contextmenu', (e) => e.preventDefault());

      cleanupFns.push(() => mv.removeEventListener('pointermove', onMove));
      cleanupFns.push(() => mv.removeEventListener('pointerdown', onDown));
      cleanupFns.push(() => window.removeEventListener('pointerup', onUp));
      cleanupFns.push(() => cancelAnimationFrame(raf));
      cleanupFns.push(() => setCursor('default'));
      cleanupFns.push(() => unlockCamera());
    };

    mv.addEventListener('load', onLoad, { once: true });
    return () => {
      cleanupFns.forEach(fn => { try { fn(); } catch {} });
    };
  }, [modelUrl, onReady, onProgress, stepActive, forceLock, rotAxis, liftAxis, liftAmount, turnSeconds, allowedNames]);

  return (
    <model-viewer
      ref={mvRef}
      src={withServerUrl(modelUrl || '')}
      alt='Trainer Model'
      style={{ width: '100%', height: '100%', ...(style || {}) }}
      interaction-prompt='none'
      min-camera-orbit='auto auto 0.25m'
      max-camera-orbit='auto auto 20m'
      disable-tap
      camera-controls
      crossorigin="anonymous"
      exposure='1.0'
      shadow-intensity='0.0'
    />
  );
}

