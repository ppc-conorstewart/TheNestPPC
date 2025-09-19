// ==============================
// FILE: src/LandingPage.jsx
// Sections: Imports • Brand Assets • Sales Crest 3D Group • Component • Styles
// ==============================

import { useEffect, useRef, useState } from 'react';
import { resolveApiUrl } from './api';
import BackgroundFX from './components/BackgroundFX';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// ==============================
// ======= BRAND ASSETS =========
// ==============================
const flyIqLogo = '/assets/logo.png';
const flySalesLogo = '/assets/SALES.png'; // PNG not rendered for Sales crest (3D used instead)
const flyHqLogo = '/assets/flyhq-logo.png';
const flyBaseLogo = '/assets/FLY-BASE.png';

// ==============================
// ===== SALES CREST 3D GROUP ===
// ==============================
function SalesCrest3D({ hovered }) {
  const mountRef = useRef(null);
  const groupRef = useRef(null);
  const frameRef = useRef(0);
  const pmremRef = useRef(null);
  const hoverRef = useRef(false);
  const lightRef = useRef(null);

  useEffect(() => { hoverRef.current = hovered; }, [hovered]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ---------- Renderer ----------
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    mount.appendChild(renderer.domElement);

    // ---------- Scene / Camera / Env ----------
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0.15, 5);

    pmremRef.current = new THREE.PMREMGenerator(renderer);
    const envTex = pmremRef.current.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;

    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(5, 6, 7);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.35);
    fill.position.set(-6, 3, -5);
    scene.add(fill);
    scene.add(new THREE.AmbientLight(0xffffff, 0.65));

    // Accent light that intensifies on hover
    const rim = new THREE.PointLight(0x99ffcc, 0.0, 8, 2.2);
    rim.position.set(0, 0.6, 1.6);
    scene.add(rim);
    lightRef.current = rim;

    // ---------- Group: Load Bird + Crest ----------
    const loader = new GLTFLoader();
    const group = new THREE.Group();
    groupRef.current = group;
    scene.add(group);

    function centerAndScale(target, desired = 2.6) {
      const box = new THREE.Box3().setFromObject(target);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);
      target.position.sub(center);
      const largest = Math.max(size.x, size.y, size.z || 1);
      const scale = desired / (largest || 1);
      target.scale.setScalar(scale);
    }
    function applyMatAll(obj, { color, metalness = 0.35, roughness = 0.4 }) {
      obj.traverse((ch) => {
        if (ch.isMesh) {
          const mat = ch.material && !Array.isArray(ch.material) ? ch.material : new THREE.MeshStandardMaterial();
          if (!mat.map) {
            mat.color = new THREE.Color(color);
            mat.metalness = metalness;
            mat.roughness = roughness;
            mat.side = THREE.DoubleSide;
          } else {
            mat.map.colorSpace = THREE.SRGBColorSpace;
          }
          ch.material = mat;
          ch.castShadow = true;
          ch.receiveShadow = true;
        }
      });
    }

    const birdURL = '/assets/sales1.gltf';
    const crestURL = '/assets/Sales.gltf';

    Promise.all([
      new Promise((res, rej) => loader.load(birdURL, (g) => res(g), undefined, rej)),
      new Promise((res, rej) => loader.load(crestURL, (g) => res(g), undefined, rej))
    ])
      .then(([birdGLTF, crestGLTF]) => {
        const bird = (birdGLTF.scene || birdGLTF.scenes?.[0])?.clone(true);
        const crest = (crestGLTF.scene || crestGLTF.scenes?.[0])?.clone(true);

        if (bird) {
          applyMatAll(bird, { color: '#d0d0d0', metalness: 0.55, roughness: 0.28 });
          centerAndScale(bird, 2.2);
          bird.position.set(0, 0.32, 0);
          group.add(bird);
        }
        if (crest) {
          applyMatAll(crest, { color: '#b80d0d', metalness: 0.3, roughness: 0.35 });
          centerAndScale(crest, 2.2);
          crest.position.set(0, -0.35, 0);
          group.add(crest);
        }

        // Normalize, then reduce by 30% (bird + crest only)
        centerAndScale(group, 2.8);
        group.scale.setScalar(0.7);
      })
      .catch(() => { /* silent */ });

    // ---------- Resize ----------
    function resize() {
      const rect = mount.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    // ---------- Animate (spin ONLY on hover; extra hover effects) ----------
    const tick = () => {
      const g = groupRef.current;
      const rimLight = lightRef.current;
      if (g) {
        const hovering = hoverRef.current;

        // Spin eases in/out based on hover
        const targetSpin = hovering ? 0.38 : 0;
        const currentSpin = g.userData.spin ?? 0;
        const easedSpin = currentSpin + (targetSpin - currentSpin) * 0.12;
        g.userData.spin = easedSpin;
        g.rotation.y += easedSpin * (1 / 60);

        // Scale up slightly on hover from base 0.7 -> 0.82
        const baseScale = 0.7;
        const targetScale = hovering ? 0.82 : 0.7;
        const curScale = g.scale.x;
        const newScale = curScale + (targetScale - curScale) * 0.12;
        g.scale.setScalar(newScale);

        // Subtle tilt when hovered
        const targetTilt = hovering ? 0.08 : 0.0;
        g.rotation.x += (targetTilt - g.rotation.x) * 0.08;

        // Rim light intensity boost on hover
        if (rimLight) {
          const targetI = hovering ? 1.1 : 0.0;
          rimLight.intensity += (targetI - rimLight.intensity) * 0.15;
        }
      }
      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      ro.disconnect();
      renderer.dispose();
      if (pmremRef.current) pmremRef.current.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className={`sales-3d-wrap${hovered ? ' hovered' : ''}`}>
      <img
        src='/assets/Sales-Text-3d.png'
        alt='Sales'
        className='sales-title'
        draggable='false'
      />
      <div ref={mountRef} className='sales-3d-canvas' />
    </div>
  );
}

// ==============================
// ========== APP ===============
// ==============================
export default function LandingPage() {
  const [user, setUser] = useState(null);
  const [salesHovered, setSalesHovered] = useState(false);

  // ==============================
  // ======== AUTH BOOT ==========
  // ==============================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userData = params.get('user');
    if (userData) {
      try {
        const parsed = JSON.parse(decodeURIComponent(userData));
        setUser(parsed);
        localStorage.setItem('flyiq_user', JSON.stringify(parsed));
        window.history.replaceState({}, document.title, '/');
      } catch {}
    } else {
      const stored = localStorage.getItem('flyiq_user');
      if (stored) {
        try { setUser(JSON.parse(stored)); }
        catch { localStorage.removeItem('flyiq_user'); }
      }
    }
  }, []);

  // ==============================
  // ======== CONFIG =============
  // ==============================
  const handleDiscordLogin = () => {
    window.location.href = resolveApiUrl('/auth/discord');
  };

  const CRESTS = [
    { logo: flyIqLogo,    href: '/fly-iq' },
    { logo: flySalesLogo, href: '/sales' },
    { logo: flyHqLogo,    href: '/fly-hq-tools' },
    { logo: flyBaseLogo,  href: '/fly-mfv' }
  ];

  // ==============================
  // ======== UNAUTH =============
  // ==============================
  if (!user) {
    return (
      <div className='relative w-full h-full overflow-hidden'>
        <div className='absolute inset-0 z-0'>
          <BackgroundFX />
        </div>
        <div className='relative z-10 flex flex-col items-center justify-center min-h-screen p-6'>
          <h1 className='text-xl sm:text-2xl font-bold text-white mt-8 text-center'>To Gain Access to The Nest</h1>
          <button
            onClick={handleDiscordLogin}
            className='mt-8 bg-indigo-600 hover:bg-indigo-700 px-8 py-3 rounded-lg text-lg font-semibold transition shadow-md'
          >
            Log in with Discord
          </button>
        </div>
      </div>
    );
  }

  // ==============================
  // ========= AUTHED ============
  // ==============================
  return (
    <div className='relative w-full h-full overflow-hidden'>
      <div className='absolute inset-0 z-0'>
        <BackgroundFX />
      </div>

      <div className='relative z-10 h-full w-full flex flex-col items-center p-4'>
        <h1 className='uppercase font-erbaum font-extrabold text-4xl text-white mt-4 mb-2 text-center drop-shadow-[0_4px_16px_rgba(0,0,0,0.4)]'>
          Welcome to The Nest, {user.username || user.id}!
        </h1>

        {/* ============================== CRESTS ARCH ============================== */}
        <div className='crest-arch'>
          {CRESTS.map(({ logo, href }, i) => (
            <button
              key={href}
              className={`crest-btn crest-${i + 1}`}
              onClick={() => (window.location.href = href)}
              aria-label='module'
              onMouseEnter={() => i === 1 && setSalesHovered(true)}
              onMouseLeave={() => i === 1 && setSalesHovered(false)}
            >
              <div className={`logo-wrap ${i === 1 && salesHovered ? 'logo-hovered' : ''}`}>
                {i === 1 ? (
                  <SalesCrest3D hovered={salesHovered} />
                ) : (
                  <img src={logo} alt='logo' className='crest-img' draggable='false' />
                )}
                <div className='crest-shadow' />
              </div>
            </button>
          ))}
        </div>

        {/* ============================== STYLE ============================== */}
        <style>{`
          .crest-arch{
            --gap: clamp(1.5rem, 5vw, 4.5rem);
            --lowerY: clamp(10vh, 18vh, 22vh);
            --upperY: 0vh;
            --wrapW: min(92vw, 1500px);
            width: var(--wrapW);
            margin-top: clamp(6px, 1vh, 18px);
            padding: 0 0 clamp(24px, 4vh, 48px) 0;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            gap: var(--gap);
          }

          .crest-1{ transform: translateY(var(--lowerY)); }
          .crest-2{ transform: translateY(var(--upperY)); }
          .crest-3{ transform: translateY(var(--upperY)); }
          .crest-4{ transform: translateY(var(--lowerY)); }

          .crest-btn{
            background: transparent;
            border: 0;
            cursor: pointer;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform .25s cubic-bezier(.22,.75,.25,1.05);
          }
          .logo-wrap{
            position: relative;
            width: clamp(220px, 26vw, 440px);
            height: clamp(220px, 26vw, 440px);
            display: flex;
            align-items: center;
            justify-content: center;
            transform: scale(1);
            transition: transform .25s cubic-bezier(.22,.75,.25,1.05), filter .25s ease;
          }
          .crest-btn:hover .logo-wrap{ transform: scale(1.06); }

          .crest-img{
            width: clamp(160px, 18vw, 300px);
            height: clamp(160px, 18vw, 300px);
            object-fit: contain;
            filter: drop-shadow(0 10px 28px rgba(0,0,0,.55));
            position: relative;
            z-index: 2;
            user-select: none;
          }

          /* ---------- Sales 3D + Title ---------- */
          .sales-3d-wrap{
            position: relative;
            width: 100%;
            height: 100%;
            z-index: 2;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .sales-title{
            position: absolute;
            top: clamp(10px, 1.8vh, 22px);
            width: clamp(80px, 9vw, 160px);
            height: auto;
            object-fit: contain;
            filter: drop-shadow(0 8px 18px rgba(0,0,0,.5));
            pointer-events: none;
            z-index: 3;
            user-select: none;
          }
          .sales-3d-canvas{
            position: absolute;
            inset: 0;
            z-index: 2;
          }
          .sales-3d-canvas > canvas{
            width: 100% !important;
            height: 100% !important;
          }

          .crest-shadow{
            position: absolute;
            bottom: clamp(16px, 2.2vw, 34px);
            width: 54%;
            height: clamp(10px, 1.1vw, 16px);
            border-radius: 999px;
            background: radial-gradient(ellipse at center, rgba(0,0,0,.52), rgba(0,0,0,0));
            filter: blur(6px);
            z-index: 0;
            transform: scale(1);
            transition: transform .28s ease;
          }
          .crest-btn:hover .crest-shadow{ transform: scale(1.1); }

          @media (min-width: 1920px){
            .crest-arch{ --gap: clamp(2rem, 3.8vw, 4rem); --lowerY: 18vh; }
          }
          @media (max-width: 1280px){
            .crest-arch{ --gap: clamp(1.2rem, 3.6vw, 3.2rem); --lowerY: 14vh; }
          }
          @media (max-width: 860px){
            .crest-arch{
              width: min(96vw, 680px);
              flex-direction: column;
              align-items: center;
              gap: clamp(10px, 3vh, 18px);
              --lowerY: 0vh;
              --upperY: 0vh;
            }
            .logo-wrap{
              width: clamp(180px, 58vw, 300px);
              height: clamp(180px, 58vw, 300px);
            }
            .crest-img{
              width: clamp(130px, 46vw, 170px);
              height: clamp(130px, 46vw, 170px);
            }
            .sales-title{
              top: clamp(6px, 1.2vh, 12px);
              width: clamp(70px, 32vw, 140px);
            }
            .crest-shadow{
              bottom: clamp(10px, 2.2vh, 20px);
              width: 60%;
              height: clamp(8px, 1.6vh, 12px);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
