// ==========================================
// FILE: client/src/components/BackgroundFX.jsx
// ==========================================

// ==============================
// IMPORTS
// ==============================
import { useEffect, useRef } from 'react';

// ==============================
// CONSTANTS
// ==============================
const PARTICLE_COUNT_BASE = 10;
const PARTICLE_SIZE = 0.8;
const SPEED = 0.10;
const DRIFT = 0.0010;
const OPACITY = 0.9;
const CONNECTION_DISTANCE = 105;
const LINE_ALPHA = 0.20;

const LOGO_OPACITY = 0.07;
const LOGO_SIZE_RATIO = 0.40;
const LOGO_Y_OFFSET = 0.2; // shift faded logo downward

// ===== Cursor / Interactions =====
const CURSOR_RADIUS = 30;
const CURSOR_FORCE = 0.55;
const CURSOR_EASE = 0.08;

// ===== Softer click ripple =====
const RIPPLE_SPEED = 3.0;
const RIPPLE_WIDTH = 8;
const RIPPLE_DECAY = 0.90;
const RIPPLE_MAX_RADIUS = 600;
const RIPPLE_INTENSITY = 0.18;

// ===== Sparkle =====
const SPARKLE_MIN_MS = 20000;
const SPARKLE_MAX_MS = 30000;
const SPARKLE_COUNT = 12;
const SPARKLE_TTL_MS = 700;

// ===== Halo =====
const HALO_OPACITY = 0.12;
const HALO_ROT_SPEED = 0.0035;
const HALO_RADIUS_FACTOR = 0.7;
const HALO_LINE_WIDTH = 1.25;

// ===== Palette =====
const PALOMA_GREEN = { r: 106, g: 114, b: 87 };

// ===== Logo Exclusion Zone (No-Overlap) =====
const LOGO_CLEAR_INNER = 1.40;     // hard kill radius (particles vanish + respawn)
const LOGO_CLEAR_SHELL = 1.15;     // deflection shell radius (flow-around band)
const LOGO_FLOW_TANGENTIAL = 0.095; // tangential velocity boost to prevent pooling
const LOGO_FLOW_PUSH = 0.085;       // slight outward push to avoid edge buildup
const RESPAWN_RING_FACTOR = 1.42;   // where particles reappear around logo
const RESPAWN_SPEED = 0.35;         // initial speed for respawned particles

// ==============================
// HELPERS
// ==============================
const now = () => performance.now();
const rand = (a, b) => a + Math.random() * (b - a);
const rgba = (r, g, b, a) => `rgba(${r},${g},${b},${a})`;

// ==============================
// COMPONENT
// ==============================
export default function BackgroundFX() {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const particlesRef = useRef([]);
  const logoRef = useRef(null);

  const hasPointerRef = useRef(false);
  const cursorRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  const ripplesRef = useRef([]);                 // {x,y,r,strength}
  const sparkleUntilRef = useRef(new Map());     // idx -> endTime
  const nextSparkleAtRef = useRef(0);

  const haloAngleRef = useRef(0);
  const attractModeRef = useRef(false);          // false=repel, true=attract

  // ==============================
  // INIT / RESIZE
  // ==============================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });

    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
      const { innerWidth: w, innerHeight: h } = window;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const area = w * h;
      const density = prefersReducedMotion ? 0.4 : 1.2;
      const target = Math.max(60, Math.floor((PARTICLE_COUNT_BASE * area) / (1280 * 720) * density));

      particlesRef.current = new Array(target).fill(0).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * SPEED * (prefersReducedMotion ? 0.5 : 1),
        vy: (Math.random() - 0.5) * SPEED * (prefersReducedMotion ? 0.5 : 1),
        s: PARTICLE_SIZE * (0.5 + Math.random() * 1.8),
        o: OPACITY * (0.5 + Math.random() * 0.5),
        p: Math.random() * Math.PI * 2,
      }));
    }

    resize();
    window.addEventListener('resize', resize);

    const img = new Image();
    img.src = '/assets/Paloma_Logo_White_Rounded.png';
    img.onload = () => { logoRef.current = img; };

    nextSparkleAtRef.current = now() + rand(SPARKLE_MIN_MS, SPARKLE_MAX_MS);

    // ==============================
    // EVENTS
    // ==============================
    function onPointerMove(e) {
      hasPointerRef.current = true;
      const rect = canvas.getBoundingClientRect();
      cursorRef.current.x = e.clientX - rect.left;
      cursorRef.current.y = e.clientY - rect.top;
    }
    function onPointerLeave() { hasPointerRef.current = false; }
    function onClick(e) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ripplesRef.current.push({ x, y, r: 0, strength: 0.35 });
    }
    function onKeyDown(e) {
      if (e.key.toLowerCase() === 'g') attractModeRef.current = !attractModeRef.current;
    }
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('click', onClick);
    window.addEventListener('keydown', onKeyDown);

    // ==============================
    // ANIMATE
    // ==============================
    function tick() {
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);

      const c = cursorRef.current;
      c.tx += (c.x - c.tx) * CURSOR_EASE;
      c.ty += (c.y - c.ty) * CURSOR_EASE;

      ctx.clearRect(0, 0, w, h);

      // ===== Prepare Logo Box =====
      let logoBox = null;
      const logo = logoRef.current;
      if (logo) {
        const size = Math.min(w, h) * LOGO_SIZE_RATIO;
        const lx = (w - size) / 2;
        const ly = (h - size) / 2 + (h * LOGO_Y_OFFSET);
        logoBox = { cx: lx + size / 2, cy: ly + size / 2, r: size / 2, x: lx, y: ly, size };
      }

      // ===== Sparkle scheduler =====
      const t = now();
      if (t >= nextSparkleAtRef.current) {
        const ps = particlesRef.current;
        for (let i = 0; i < SPARKLE_COUNT; i++) {
          const idx = (Math.random() * ps.length) | 0;
          sparkleUntilRef.current.set(idx, t + SPARKLE_TTL_MS);
        }
        nextSparkleAtRef.current = t + rand(SPARKLE_MIN_MS, SPARKLE_MAX_MS);
      }

      // ===== Ripples evolve =====
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const rp = ripplesRef.current[i];
        rp.r += RIPPLE_SPEED;
        rp.strength *= RIPPLE_DECAY;
        if (rp.r > RIPPLE_MAX_RADIUS || rp.strength < 0.05) {
          ripplesRef.current.splice(i, 1);
        }
      }

      const ps = particlesRef.current;

      // ==============================
      // DRAW PARTICLES (BEHIND LOGO)
      // ==============================
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];

        // Organic drift
        p.p += DRIFT;
        p.vx += Math.cos(p.p) * 0.0006;
        p.vy += Math.sin(p.p * 0.7) * 0.0006;

        // Cursor interaction
        if (!prefersReducedMotion && hasPointerRef.current) {
          const dxc = p.x - c.tx;
          const dyc = p.y - c.ty;
          const dc = Math.hypot(dxc, dyc);
          if (dc < CURSOR_RADIUS) {
            const mode = attractModeRef.current ? -1 : 1;
            const force = (1 - dc / CURSOR_RADIUS) * CURSOR_FORCE * mode;
            const nxc = dxc / (dc || 1);
            const nyc = dyc / (dc || 1);
            p.vx += nxc * force * 0.6;
            p.vy += nyc * force * 0.6;
          }
        }

        // Softer click ripple push
        for (let r = 0; r < ripplesRef.current.length; r++) {
          const rp = ripplesRef.current[r];
          const dxr = p.x - rp.x;
          const dyr = p.y - rp.y;
          const dr = Math.hypot(dxr, dyr);
          const band = Math.abs(dr - rp.r);
          if (band < RIPPLE_WIDTH) {
            const falloff = 1 - (band / RIPPLE_WIDTH);
            const intensity = falloff * rp.strength * RIPPLE_INTENSITY;
            const nxr = dxr / (dr || 1);
            const nyr = dyr / (dr || 1);
            p.vx += nxr * intensity;
            p.vy += nyr * intensity;
          }
        }

        // ===== Logo Exclusion: vanish + respawn inside inner radius =====
        if (logoBox) {
          const dxL = p.x - logoBox.cx;
          const dyL = p.y - logoBox.cy;
          const dL = Math.hypot(dxL, dyL);
          const rInner = logoBox.r * LOGO_CLEAR_INNER;
          const rShell = logoBox.r * LOGO_CLEAR_SHELL;

          // Hard kill zone — particle disappears and respawns on an outer ring
          if (dL < rInner) {
            const theta = Math.random() * Math.PI * 2;
            const rr = logoBox.r * RESPAWN_RING_FACTOR;
            p.x = logoBox.cx + Math.cos(theta) * rr;
            p.y = logoBox.cy + Math.sin(theta) * rr;

            // Give it tangential velocity so it flows around the logo immediately
            const tx = -Math.sin(theta);
            const ty = Math.cos(theta);
            p.vx = tx * RESPAWN_SPEED * (0.5 + Math.random());
            p.vy = ty * RESPAWN_SPEED * (0.5 + Math.random());
          }
          // Deflection shell — steer tangentially + slight outward push (no pooling)
          else if (dL < rShell) {
            const nx = dxL / (dL || 1);
            const ny = dyL / (dL || 1);
            const txv = -ny; // tangential unit vector
            const tyv = nx;

            p.vx += txv * LOGO_FLOW_TANGENTIAL;
            p.vy += tyv * LOGO_FLOW_TANGENTIAL;

            p.vx += nx * LOGO_FLOW_PUSH * 0.6;
            p.vy += ny * LOGO_FLOW_PUSH * 0.6;
          }
        }

        // Integrate + friction
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Wrap
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // Draw (behind logo)
        const sparkleOn = sparkleUntilRef.current.has(i) && t < sparkleUntilRef.current.get(i);
        const alpha = sparkleOn ? Math.min(1, p.o + 0.35) : p.o;
        const blur = sparkleOn ? 10 : 5;
        const size = sparkleOn ? p.s * 1.4 : p.s;

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = rgba(PALOMA_GREEN.r, PALOMA_GREEN.g, PALOMA_GREEN.b, alpha);
        ctx.shadowColor = rgba(PALOMA_GREEN.r, PALOMA_GREEN.g, PALOMA_GREEN.b, 0.48);
        ctx.shadowBlur = blur;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ==============================
      // CONNECTIONS (skip lines crossing logo)
      // ==============================
      if (logoBox) {
        for (let i = 0; i < ps.length; i++) {
          const pi = ps[i];
          for (let j = i + 1; j < ps.length; j++) {
            const pj = ps[j];
            const dx = pi.x - pj.x;
            const dy = pi.y - pj.y;
            const dist = Math.hypot(dx, dy);
            if (dist < CONNECTION_DISTANCE) {
              // Quick reject if either endpoint is close to logo edge
              const di = Math.hypot(pi.x - logoBox.cx, pi.y - logoBox.cy);
              const dj = Math.hypot(pj.x - logoBox.cx, pj.y - logoBox.cy);
              const cutR = logoBox.r * LOGO_CLEAR_SHELL;

              // If segment intersects the logo circle, skip drawing
              let draw = true;
              if (di < cutR || dj < cutR) {
                draw = false;
              } else {
                // Approximate intersection test using projection
                const vx = pj.x - pi.x;
                const vy = pj.y - pi.y;
                const wx = logoBox.cx - pi.x;
                const wy = logoBox.cy - pi.y;
                const proj = Math.max(0, Math.min(1, (vx * wx + vy * wy) / ((vx * vx + vy * vy) || 1)));
                const cx = pi.x + proj * vx;
                const cy = pi.y + proj * vy;
                const dClosest = Math.hypot(cx - logoBox.cx, cy - logoBox.cy);
                if (dClosest < cutR) draw = false;
              }

              if (draw) {
                ctx.globalAlpha = (1 - dist / CONNECTION_DISTANCE) * LINE_ALPHA;
                ctx.beginPath();
                ctx.moveTo(pi.x, pi.y);
                ctx.lineTo(pj.x, pj.y);
                ctx.strokeStyle = rgba(PALOMA_GREEN.r, PALOMA_GREEN.g, PALOMA_GREEN.b, 1);
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.globalAlpha = 1;
              }
            }
          }
        }
      } else {
        // No logo yet — normal connections
        for (let i = 0; i < ps.length; i++) {
          for (let j = i + 1; j < ps.length; j++) {
            const dx = ps[i].x - ps[j].x;
            const dy = ps[i].y - ps[j].y;
            const dist = Math.hypot(dx, dy);
            if (dist < CONNECTION_DISTANCE) {
              ctx.globalAlpha = (1 - dist / CONNECTION_DISTANCE) * LINE_ALPHA;
              ctx.beginPath();
              ctx.moveTo(ps[i].x, ps[i].y);
              ctx.lineTo(ps[j].x, ps[j].y);
              ctx.strokeStyle = rgba(PALOMA_GREEN.r, PALOMA_GREEN.g, PALOMA_GREEN.b, 1);
              ctx.lineWidth = 1;
              ctx.stroke();
              ctx.globalAlpha = 1;
            }
          }
        }
      }

      // ==============================
      // DRAW LOGO + HALO (ON TOP)
      // ==============================
      if (logoBox && logo) {
        // Logo
        ctx.globalAlpha = LOGO_OPACITY;
        ctx.drawImage(logo, logoBox.x, logoBox.y, logoBox.size, logoBox.size);
        ctx.globalAlpha = 1;

        // Halo
        haloAngleRef.current += HALO_ROT_SPEED;
        const haloR = logoBox.size * HALO_RADIUS_FACTOR;
        ctx.save();
        const grad = ctx.createConicGradient(haloAngleRef.current, logoBox.cx, logoBox.cy);
        const gCol = rgba(PALOMA_GREEN.r, PALOMA_GREEN.g, PALOMA_GREEN.b, HALO_OPACITY);
        grad.addColorStop(0.00, 'rgba(255,255,255,0)');
        grad.addColorStop(0.15, gCol);
        grad.addColorStop(0.30, 'rgba(255,255,255,0)');
        grad.addColorStop(0.50, gCol);
        grad.addColorStop(0.70, 'rgba(255,255,255,0)');
        grad.addColorStop(0.85, gCol);
        grad.addColorStop(1.00, 'rgba(255,255,255,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = HALO_LINE_WIDTH;
        ctx.beginPath();
        ctx.arc(logoBox.cx, logoBox.cy, haloR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    // ==============================
    // CLEANUP
    // ==============================
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('click', onClick);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  // ==============================
  // RENDER
  // ==============================
  return (
    <div className='bgfx-root' aria-hidden>
      <canvas ref={canvasRef} className='bgfx-canvas' />
    </div>
  );
}
