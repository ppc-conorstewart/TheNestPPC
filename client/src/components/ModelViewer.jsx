// src/components/ModelViewer.jsx

import React, { useRef, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import localforage from 'localforage';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function ModelViewer({ style = {}, pageKey }) {
  const mountRef = useRef();
  const sceneRef = useRef(new THREE.Scene());
  const cameraRef = useRef();
  const rendererRef = useRef();
  const controlsRef = useRef();
  const pivotRef = useRef(new THREE.Group());
  const modelDataRef = useRef(null);      // holds either ArrayBuffer or DataURL
  const imageDataUrlRef = useRef(null);

  const [hasModel, setHasModel] = useState(false);
  const [hasImage, setHasImage] = useState(false);
  const [rotating, setRotating] = useState(false);
  const rotatingRef = useRef(false);
  useEffect(() => { rotatingRef.current = rotating }, [rotating]);

  const storageKey = `savedModelGLB_${pageKey}`;

  function decodeDataUrlToArrayBuffer(dataUrl) {
    // strip header, decode base64
    const base64 = dataUrl.split(',')[1];
    const binary = atob(base64);
    const len = binary.length;
    const buffer = new Uint8Array(len);
    for (let i = 0; i < len; i++) buffer[i] = binary.charCodeAt(i);
    return buffer.buffer;
  }

  function applyModel(mdl) {
    const scene = sceneRef.current;
    const pivot = pivotRef.current;
    pivot.clear();
    if (!scene.children.includes(pivot)) scene.add(pivot);

    mdl.traverse(c => {
      if (c.isMesh && c.material.map) {
        c.material.map.colorSpace = THREE.SRGBColorSpace;
        c.material.map.needsUpdate = true;
      }
    });

    mdl.scale.set(0.5, 0.5, 0.5);
    const box = new THREE.Box3().setFromObject(mdl);
    const center = box.getCenter(new THREE.Vector3());
    mdl.position.sub(center);
    pivot.add(mdl);

    setHasModel(true);
    setHasImage(false);

    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const zoomOut = 2;
    const cam = cameraRef.current;
    cam.position.set(0, maxDim * 0.5 * zoomOut, maxDim * 1.5 * zoomOut);
    cam.lookAt(0, 0, 0);
    cam.updateProjectionMatrix();
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  }

  function loadModel(data) {
    const loader = new GLTFLoader();
    const draco = new DRACOLoader();
    draco.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    loader.setDRACOLoader(draco);

    let bufferPromise;
    if (typeof data === 'string' && data.startsWith('data:application')) {
      // we stored a Data-URL: decode back into ArrayBuffer
      bufferPromise = Promise.resolve(decodeDataUrlToArrayBuffer(data));
    } else if (data instanceof ArrayBuffer) {
      bufferPromise = Promise.resolve(data);
    } else {
      // fallback: loader.load URL
      loader.load(data, ({ scene: mdl }) => applyModel(mdl));
      return;
    }

    bufferPromise.then(buffer => {
      loader.parse(
        buffer,
        '',
        ({ scene: mdl }) => applyModel(mdl),
        err => console.error('GLTF parse error', err)
      );
    });
  }

  // --- Dropzone: read .glb as ArrayBuffer
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: files => {
      if (!files.length) return;
      const file = files[0];
      if (file.name.toLowerCase().endsWith('.glb')) {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result;
          modelDataRef.current = dataUrl;
          // immediately load and persist
          loadModel(dataUrl);
          localforage.setItem(storageKey, dataUrl).catch(console.error);
        };
        reader.readAsDataURL(file);
        return;
      }

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          imageDataUrlRef.current = reader.result;
          setHasImage(true);
          setHasModel(false);
        };
        reader.readAsDataURL(file);
      }
    },
    noClick: true,
    noKeyboard: true,
    multiple: false,
    accept: {
      'model/gltf-binary': ['.glb'],
      'image/*': []
    }
  });

  // --- Three.js init & render loop
  useEffect(() => {
    const mount = mountRef.current;
    const scene = sceneRef.current;
    scene.add(pivotRef.current);

    const cam = new THREE.PerspectiveCamera(
      45, mount.clientWidth / mount.clientHeight, 0.1, 1000
    );
    cam.position.set(0,1,3);
    cameraRef.current = cam;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setClearColor(0x000000, 0.0);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5,10,7.5);
    scene.add(dir);

    const controls = new OrbitControls(cam, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enableZoom = true;
    controls.enablePan = false;
    controlsRef.current = controls;

    // restore on mount
    localforage.getItem(storageKey).then(saved => {
      if (saved) {
        modelDataRef.current = saved;
        loadModel(saved);
      }
    });

    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      cam.aspect = w/h;
      cam.updateProjectionMatrix();
      renderer.setSize(w,h);
    };
    window.addEventListener('resize', onResize);

    const tick = () => {
      requestAnimationFrame(tick);
      controls.update();
      if (rotatingRef.current) pivotRef.current.rotation.y += 0.0006;
      renderer.render(scene, cam);
    };
    tick();

    return () => {
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, [pageKey]);

  // --- Handlers
  const removeRendering = () => {
    pivotRef.current.clear();
    modelDataRef.current = null;
    imageDataUrlRef.current = null;
    setHasModel(false);
    setHasImage(false);
    localforage.removeItem(storageKey).catch(console.error);
  };

  return (
    <div
      {...getRootProps()}
      style={{
        position: 'relative',
        width: '100%', 
        height: '100%',
        border: '1px solid #6a7257',
        borderRadius: '4px',
        backgroundColor: '#222',
        backgroundImage:
          'repeating-linear-gradient(45deg, #444 25%, transparent 25%, transparent 75%, #444 75%, #444),' +
          'repeating-linear-gradient(45deg, #444 25%, transparent 25%, transparent 75%, #444 75%, #444) 10px 10px',
        backgroundSize: '20px 20px',
        ...style
      }}
    >
      <input {...getInputProps()} />

      {/* 3D Canvas */}
      <div
        ref={mountRef}
        style={{
          width: '100%', 
          height: '100%',
          display: hasModel ? 'block' : 'none'
        }}
      />

      {/* Static Image */}
      {hasImage && (
        <img
          src={imageDataUrlRef.current}
          alt="Uploaded"
          style={{
            position: 'absolute', top: 0, left: 0,
            width: '100%', height: '100%',
            objectFit: 'contain'
          }}
        />
      )}

      {/* Placeholder */}
      {!hasModel && !hasImage && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.3)', pointerEvents: 'none'
        }}>
          {isDragActive
            ? 'Release to load .glb or image'
            : 'Drag & drop .glb or image here'}
        </div>
      )}

      {/* Controls */}
      <div style={{
        position: 'absolute', top: 8, left: 8,
        display: 'flex', gap: 4, zIndex: 10
      }}>
        <button
          onClick={() => setRotating(r => !r)}
          className="text-xs px-1 py-0.5 bg-black text-[#6a7257] rounded"
          disabled={!hasModel}
        >
          {rotating ? 'Stop' : 'Rotate'}
        </button>
        <button
          onClick={removeRendering}
          className="text-xs px-1 py-0.5 bg-black text-[#6a7257] rounded"
          disabled={!hasModel && !hasImage}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
