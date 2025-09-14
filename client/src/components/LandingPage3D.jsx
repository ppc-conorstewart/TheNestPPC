// ==========================================
// FILE: client/src/components/LandingPage3D.jsx
// ==========================================

// ==============================
// IMPORTS
// ==============================
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import DogboneObj from '../assets/Dogbone.obj';
import ZipperObj from '../assets/Zipper.obj';

// ==============================
// CONFIG
// ==============================
const INSET_X = 180;            // moved slightly inward
const INSET_Y = 120;            // moved slightly downward
const CANVAS_SIZE = 360;        // bigger
const OPACITY = 0.65;           // less faded (no blend mode)
const AUTO_ROTATE = 0.08;       // slower spin
const DAMPING = 0.10;           // cursor follow
const MAX_PIXEL_RATIO = 1.5;    // cap for low-end GPUs
const TARGET_FPS = 30;          // throttle render loop

// ==============================
// COMPONENT
// ==============================
export default function CornerModels() {
  const tlRef = useRef(null);
  const trRef = useRef(null);

  useEffect(() => {
    const makeScene = (container, url, mirrorX = 1) => {
      const scene = new THREE.Scene();

      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
      camera.position.set(0, 0, 5);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas: container });
      const pr = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
      renderer.setPixelRatio(pr);
      renderer.setSize(CANVAS_SIZE, CANVAS_SIZE, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearAlpha(0);

      const hemi = new THREE.HemisphereLight(0xe6eadf, 0x0b0c09, 0.9);
      scene.add(hemi);
      const key = new THREE.DirectionalLight(0xffffff, 0.7);
      key.position.set(1, 1.2, 2);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xbad0a0, 0.5);
      rim.position.set(-1, -0.6, -1.2);
      scene.add(rim);

      const loader = new OBJLoader();
      const group = new THREE.Group();
      scene.add(group);

      let model = null;
      loader.load(url, (obj) => {
        obj.traverse((c) => {
          if (c.isMesh) {
            c.material = new THREE.MeshStandardMaterial({
              color: 0xe6eadf,
              roughness: 0.4,
              metalness: 0.12,
              transparent: false,
            });
          }
        });
        const box = new THREE.Box3().setFromObject(obj);
        const size = new THREE.Vector3();
        box.getSize(size);
        const scale = 2.2 / Math.max(size.x, size.y, size.z || 1); // larger
        obj.scale.setScalar(scale);
        const center = box.getCenter(new THREE.Vector3());
        obj.position.sub(center).multiplyScalar(scale);
        obj.rotation.y = mirrorX < 0 ? Math.PI : 0;
        model = obj;
        group.add(model);
      });

      const target = new THREE.Vector2(0, 0);
      let last = performance.now();
      let accum = 0;
      const frameInterval = 1000 / TARGET_FPS;

      const onMove = (e) => {
        const rect = container.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const nx = (e.clientX - cx) / rect.width;
        const ny = (e.clientY - cy) / rect.height;
        target.x = THREE.MathUtils.clamp(nx * 0.8, -1.0, 1.0);
        target.y = THREE.MathUtils.clamp(ny * 0.8, -1.0, 1.0);
      };
      window.addEventListener('pointermove', onMove);

      let raf = 0;
      const tick = () => {
        raf = requestAnimationFrame(tick);
        const now = performance.now();
        const dt = now - last;
        last = now;
        accum += dt;
        if (accum < frameInterval) return;
        accum = 0;

        if (model) {
          model.rotation.y += AUTO_ROTATE * (dt / 1000) * mirrorX;
          model.rotation.x += (target.y - model.rotation.x) * DAMPING;
          model.rotation.z += (target.x - model.rotation.z) * DAMPING;
        }

        renderer.render(scene, camera);
      };
      tick();

      const onResize = () => {
        const pr2 = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
        renderer.setPixelRatio(pr2);
        renderer.setSize(CANVAS_SIZE, CANVAS_SIZE, false);
      };
      window.addEventListener('resize', onResize);

      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('resize', onResize);
        renderer.dispose();
        scene.traverse((o) => {
          if (o.isMesh) {
            o.geometry?.dispose?.();
            if (o.material?.dispose) o.material.dispose();
          }
        });
      };
    };

    const cleanups = [];
    if (tlRef.current) cleanups.push(makeScene(tlRef.current, ZipperObj, 1));
    if (trRef.current) cleanups.push(makeScene(trRef.current, DogboneObj, -1));
    return () => cleanups.forEach((fn) => fn && fn());
  }, []);

  return (
    <>
      <canvas
        ref={tlRef}
        style={{
          position: 'absolute',
          top: INSET_Y,
          left: INSET_X,
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
          opacity: OPACITY,
          pointerEvents: 'none',
        }}
      />
      <canvas
        ref={trRef}
        style={{
          position: 'absolute',
          top: INSET_Y,
          right: INSET_X,
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
          opacity: OPACITY,
          pointerEvents: 'none',
        }}
      />
    </>
  );
}
