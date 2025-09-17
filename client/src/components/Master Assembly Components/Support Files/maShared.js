// ==============================
// Shared: Master Assembly Utilities / Constants / API / UI
// ==============================
import { useState } from 'react';
import { API } from '../../../api';

// ==============================
// Colors & Constants
// ==============================
export const palomaGreen = '#6a7257';
export const goldAccent = '#ebeee3ff';
export const cardBg = 'rgba(14,15,14,0.98)';
export const glassBorder = '2.5px solid #35392E';
export const NEUTRAL_LABEL = '#8e9481';

const DIGIT_COLOR = {
  '1': '#59b6ff',
  '2': '#ff6268',
  '3': '#43d089',
  '4': '#ffd95e',
  '5': '#9b6cff',
  '6': '#ff6eb3',
  '7': '#ffa44d',
};

// Status → brand color (used for ambient glow only; UI colors remain unchanged)
export const STATUS_COLORS = {
  Active:    '#9dff57',
  Offline:   '#ffd24a',
  Inactive:  '#ff6b6b',
  'Torn Down': '#ffa857',
};

// ==============================
// Label Color Helper
// ==============================
export function colorForLabel(label) {
  if (!label) return NEUTRAL_LABEL;
  const m = /^(\d)/i.exec(label);
  const key = m ? m[1] : null;
  return DIGIT_COLOR[key] || NEUTRAL_LABEL;
}

export function colorForStatus(status) {
  return STATUS_COLORS[status] || STATUS_COLORS['Inactive'];
}

// ==============================
// Slot Normalizer
// ==============================
export function normalizeSlotFromDB(selectedChild, rawSlot) {
  const m = /-([A-Za-z0-9]+)$/.exec((selectedChild || '').trim());
  const letter = m ? m[1] : null;
  let s = (rawSlot || '').trim();
  if (letter) {
    const re = new RegExp('^' + letter + '\\s*[-:_]\\s*', 'i');
    s = s.replace(re, '').trim();
  }
  return s;
}

// ==============================
// API Helpers
// ==============================
// Use query-string API exclusively to avoid 404s/twitching:
//   /api/master/assignments?assembly=Dog%20Bones&child=Dogbone-1
export async function apiFetchAssignments(assemblyTitle, selectedChild) {
  try {
    const url = `${API}/api/master/assignments?assembly=${encodeURIComponent(assemblyTitle)}&child=${encodeURIComponent(selectedChild)}`;
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json) ? json : [];
  } catch {
    return [];
  }
}

export async function apiUpsertAssignment({ assembly, child, slot, asset_id }) {
  await fetch(`${API}/api/master/assignment`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assembly, child, slot, asset_id, updated_by: 'Current User' }),
  });
}

export async function apiDeleteAssignment({ assembly, child, slot, new_status, notes }) {
  await fetch(`${API}/api/master/assignment`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assembly, child, slot, new_status, notes, updated_by: 'Current User' }),
  });
}

export async function apiUpdateAssetStatus(assetId, status) {
  await fetch(`${API}/api/assets/${encodeURIComponent(assetId)}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

// ==============================
// Paloma 3D Button (unchanged functionality)
// ==============================
export function Paloma3DButton({ label, onClick, minWidth = 220 }) {
  const [isPressing, setIsPressing] = useState(false);
  const [shine, setShine] = useState(false);

  return (
    <button
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: isPressing
          ? 'linear-gradient(180deg,#7f876c 0%, #59604e 55%, #3b4133 100%)'
          : 'linear-gradient(180deg,#b9c1a5 0%, #6a7257 48%, #454c3e 100%)',
        color: '#0f120e',
        border: '2px solid #313629',
        outline: '1px solid #aab094',
        fontWeight: 900,
        textTransform: 'uppercase',
        borderRadius: 10,
        padding: '12px 30px',
        fontSize: 18,
        letterSpacing: '.12em',
        textShadow: '0 1px 0 rgba(255,255,255,.25)',
        boxShadow: isPressing
          ? 'inset 0 3px 8px rgba(0,0,0,.55), 0 3px 0 #2f3529, 0 6px 14px rgba(0,0,0,.35)'
          : 'inset 0 1px 0 rgba(255,255,255,.35), 0 4px 0 #2f3529, 0 12px 22px rgba(0,0,0,.35)',
        transform: isPressing ? 'translateY(4px) scale(0.99)' : 'translateY(0) scale(1)',
        transition: 'transform 120ms ease, box-shadow 160ms ease, background 160ms ease',
        cursor: 'pointer',
        minWidth,
      }}
      onMouseDown={() => setIsPressing(true)}
      onMouseUp={() => setIsPressing(false)}
      onMouseLeave={() => setIsPressing(false)}
      onMouseEnter={() => {
        setShine(true);
        setTimeout(() => setShine(false), 600);
      }}
      onClick={onClick}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: -20,
          left: shine ? '120%' : '-120%',
          width: '140%',
          height: 60,
          transform: 'rotate(12deg)',
          background:
            'linear-gradient(120deg, rgba(255,255,255,.35) 0%, rgba(255,255,255,.12) 30%, rgba(255,255,255,0) 60%)',
          transition: 'left 600ms ease-out',
        }}
      />
      {label}
    </button>
  );
}

// ==============================
// Glass UI + Ambient Glow (visual only)
// ==============================
export function GlassPanel({ children, pad = 8, style = {} }) {
  return (
    <div
      style={{
        position: 'relative',
        padding: pad,
        borderRadius: 12,
        background:
          'linear-gradient(180deg, rgba(29,31,27,0.85) 0%, rgba(18,19,17,0.85) 100%)',
        border: '1px solid rgba(90,100,80,0.35)',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.55), 0 8px 24px rgba(0,0,0,0.35)',
        backdropFilter: 'blur(2px)',
        ...style,
      }}
    >
      <span
        aria-hidden
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          inset: 0,
          borderRadius: 12,
          boxShadow: 'inset 0 0 0 1px rgba(53,57,46,0.55)',
        }}
      />
      {children}
    </div>
  );
}

export function GradientDivider() {
  return (
    <>
      <style>{`
        @keyframes palomaSweep {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }
      `}</style>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: -8,
          height: 2,
          borderRadius: 2,
          background:
            'linear-gradient(90deg, rgba(90,100,80,0.1), rgba(220,230,200,0.45), rgba(90,100,80,0.1))',
          backgroundSize: '200px 2px',
          animation: 'palomaSweep 3.5s linear infinite',
          opacity: 0.65,
        }}
      />
    </>
  );
}

// Soft animated radial glow behind hero image
export function AmbientGlow({ color = '#9dff57', intensity = 0.25 }) {
  const rgba = (hex, a) => {
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  };
  return (
    <>
      <style>{`
        @keyframes palomaGlowPulse {
          0%   { transform: translate(-50%,-50%) scale(0.96); opacity: .65; }
          50%  { transform: translate(-50%,-50%) scale(1.04); opacity: .85; }
          100% { transform: translate(-50%,-50%) scale(0.96); opacity: .65; }
        }
      `}</style>
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '90%',
          height: '90%',
          maxWidth: 900,
          maxHeight: 900,
          transform: 'translate(-50%,-50%)',
          borderRadius: '50%',
          filter: 'blur(24px)',
          background: `radial-gradient(closest-side, ${rgba(color, intensity)}, transparent 70%)`,
          animation: 'palomaGlowPulse 4.5s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
    </>
  );
}
