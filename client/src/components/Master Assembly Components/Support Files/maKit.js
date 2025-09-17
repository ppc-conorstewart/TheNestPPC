// ==============================
// src/components/Master Assembly Components/Support Files/maKit.js
// ==============================
import { useState } from 'react';
import { API } from '../../../api';
import {
  cardBg,
  DIGIT_COLOR,
  dogboneLegend,
  glassBorder,
  goldAccent,
  NEUTRAL_LABEL,
  palomaGreen,
  zipperLegend,
} from './maConsts';

// ==============================
// API
// ==============================
export async function apiFetchAssignments(assemblyTitle, selectedChild) {
  const res = await fetch(
    `${API}/api/master/assignments?assembly=${encodeURIComponent(assemblyTitle)}&child=${encodeURIComponent(selectedChild)}`,
    { credentials: 'include' }
  );
  if (!res.ok) return [];
  return res.json();
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
// Utils
// ==============================
export function normalizeSlotFromDB(selectedChild, rawSlot) {
  const m = /-([A-Za-z0-9]+)$/.exec((selectedChild || '').trim());
  const letter = m ? m[1] : null;
  let s = (rawSlot || '').trim();
  if (letter) {
    const re = new RegExp('^' + letter + '\\s*[-:_]\\s*', 'i');
    s = s.replace(re, '').trim();
  }
  return s.toLowerCase();
}
export function colorForLabel(label) {
  if (!label) return NEUTRAL_LABEL;
  const m = /^(\d)/i.exec(label);
  const key = m ? m[1] : null;
  return DIGIT_COLOR[key] || NEUTRAL_LABEL;
}
export function legendNumberFor(label) {
  const fromLegend = [...dogboneLegend, ...zipperLegend].find((l) => l.label === label);
  return fromLegend ? fromLegend.n : '•';
}
export function computeCounts(labels, selectedChild, state, saved) {
  let assigned = 0;
  let changed = 0;
  const total = (labels || []).length;
  for (const label of labels || []) {
    const key = `${selectedChild}-${normalizeSlotFromDB(selectedChild, label)}`;
    const cur = state[key] || '';
    const was = saved[key] || '';
    if (cur) assigned++;
    if (String(cur || '') !== String(was || '')) changed++;
  }
  return { assignedCount: assigned, changeCount: changed, totalCount: total };
}
export function computeCountsMissile(allLabels, selectedChild, activeTitle, state, saved) {
  let assigned = 0;
  let changed = 0;
  const total = allLabels.length;
  for (const label of allLabels) {
    const norm = normalizeSlotFromDB(selectedChild, `${activeTitle} - ${label}`);
    const key = `${selectedChild}-${norm}`;
    const cur = state[key] || '';
    const was = saved[key] || '';
    if (cur) assigned++;
    if (String(cur || '') !== String(was || '')) changed++;
  }
  return { assignedCount: assigned, changeCount: changed, totalCount: total };
}
export function heroBoxFor(kind) {
  if (kind === 'dogbone') return { width: 'clamp(520px,52vw,980px)', height: 'clamp(220px,28vh,360px)' };
  if (kind === 'zipper') return { width: 'clamp(420px,40vw,720px)', height: 'clamp(300px,42vh,560px)' };
  return { width: 'clamp(420px,44vw,760px)', height: 'clamp(220px,30vh,400px)' };
}

// ==============================
// Table Typography (NEW - standard across assemblies)
// ==============================
// Use these in any grid/table to avoid blurry/pixelated headers.
export const tableType = {
  thSmall: {
    padding: '1px 5px',
    lineHeight: '0.9rem',
    border: `1px solid ${palomaGreen}`,
    textAlign: 'center',
    color: palomaGreen,
    // lighter + crisper rendering:
    fontWeight: 400,
    fontSize: '0.74rem',
    letterSpacing: '0.03em',
    background: '#10110f',
    whiteSpace: 'nowrap',
    position: 'sticky',
    top: 0,
    zIndex: 1,
    fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    textRendering: 'optimizeLegibility',
  },
  tdSmall: {
    padding: '1px 5px',
    border: `1px solid ${palomaGreen}`,
    textAlign: 'center',
    verticalAlign: 'middle',
    height: 16,
    lineHeight: '0.9rem',
    fontSize: '0.74rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
  },
};

// ==============================
// UI
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
// Styles
// ==============================
export const styles = {
  // Legend
  legendBtn: (assigned) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: assigned ? 'linear-gradient(180deg,#2a3026,#1a1f18)' : 'linear-gradient(180deg,#1a1f17,#151814)',
    border: assigned ? '1px solid #4a5143' : '1px solid #2b2f27',
    boxShadow: assigned
      ? 'inset 0 1px 0 rgba(255,255,255,.08), 0 8px 16px rgba(0,0,0,.25)'
      : 'inset 0 1px 0 rgba(255,255,255,.04), 0 6px 12px rgba(0,0,0,.18)',
    color: '#c7cdb8',
    padding: '3px 3px',
    textAlign: 'left',
    cursor: 'pointer',
  }),
  legendBadge: (color) => ({
    width: 30,
    height: 30,
    borderRadius: 6,
    background: '#0e110d',
    border: '2px solid #303629',
    fontWeight: 900,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color,
  }),
  legendText: (assigned) => ({
    fontWeight: 800,
    letterSpacing: '.04em',
    fontSize: 12,
    color: assigned ? '#e8eadf' : '#b3b9a0',
  }),
  legendWrap: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))',
    gap: 8,
    alignContent: 'start',
    background: 'linear-gradient(180deg,#141612,#10120f)',
    border: '1px solid #23261F',
    boxShadow: 'inset 0 0 24px rgba(0,0,0,.25)',
    padding: 2,
  },

  // Selectors
  groupHeader: {
    fontSize: 18,
    fontWeight: 600,
    letterSpacing: '.25em',
    color: '#c8cfb5',
    textTransform: 'uppercase',

    paddingLeft: 12,
    margin: '13px 0px 14px 0',
  },
  gridAutoFit: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: 16,
    alignItems: 'stretch',
  },
  selectorCard: (assigned) => ({
    display: 'grid',
    gridTemplateRows: 1,
    minHeight: 40,
    background: assigned ? 'linear-gradient(180deg,#1b1f18,#151813)' : 'linear-gradient(180deg,#141612,#10110f)',
    border: assigned ? '1.5px solid #3f4638' : '1.5px solid #2a2e26',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,.04), 0 10px 22px rgba(0,0,0,.35)',
    padding: 4,
  }),
  selectorTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  selectorLabel: (assigned) => ({
    fontWeight: 900,
    letterSpacing: '.06em',
    fontSize: 8,
    color: assigned ? '#e8eadf' : '#b3b9a0',
  }),
  statusPill: (assigned) => ({
    padding: 'px 2px',
    fontSize: 2,
    fontWeight: 600,
    letterSpacing: '.26em',
    background: assigned ? 'rgba(106,114,87,.18)' : 'rgba(150,150,150,.08)',
    border: assigned ? '1px solid #454d3f' : '1px solid #2e342b',
    color: assigned ? '#ffffffff' : '#a8ae99',
  }),
  clearBtn: (enabled) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: enabled ? '#e53939' : '#35392E',
    color: '#fff',
    border: 'none',
    fontWeight: 500,
    height: 24,
    minWidth: 64,
    padding: '0 4px',
    fontSize: 12,
    cursor: enabled ? 'pointer' : 'not-allowed',
    opacity: enabled ? 1 : 0.53,
  }),
  idDot: (assigned) => ({
    width: 34,
    height: 34,
    borderRadius: 8,
    background: '#0e110d',
    border: '2px solid #303629',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: assigned ? palomaGreen : '#a0a68f',
    fontWeight: 900,
  }),

  // Hero
  heroBox: (box) => ({
    width: box.width,
    height: box.height,
    border: 'none',
    boxShadow: 'none',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: `
      radial-gradient(ellipse at top left, rgba(106,114,87,.12), rgba(0,0,0,0)),
      repeating-linear-gradient(0deg, rgba(87,96,70,.08) 0px, rgba(87,96,70,.08) 1px, transparent 1px, transparent 18px),
      repeating-linear-gradient(90deg, rgba(87,96,70,.08) 0px, rgba(87,96,70,.08) 1px, transparent 1px, transparent 18px)
    `,
    backgroundColor: '#1a1d17',
  }),
  heroImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    objectPosition: 'center center',
    padding: 12,
    background: 'rgba(0,0,0,.35)',
    display: 'block',
  },

  // Headers
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
  },
  title: (color = goldAccent) => ({
    fontSize: 34,
    fontWeight: 900,
    color,
    letterSpacing: 0.09,
    lineHeight: 1.18,
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    fontFamily: 'Rajdhani, Bank Gothic, Arial Black, sans-serif',
  }),
  subTitle: (color = palomaGreen) => ({
    fontWeight: 800,
    fontSize: 17,
    color,
    textTransform: 'uppercase',
    letterSpacing: '.07em',
  }),
  idLine: {
    fontSize: 8,
    fontWeight: 800,
    color: '#e53939',
    letterSpacing: '.08em',
    opacity: 0.9,
  },
  statusIcon: (status) => ({
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid',
    borderColor: status === 'success' ? '#7CFF6B' : '#ff5a5a',
    color: status === 'success' ? '#7CFF6B' : '#ff5a5a',
    background: 'rgba(0,0,0,.65)',
    borderRadius: '50%',
    fontWeight: 900,
    fontSize: 16,
    boxShadow: status === 'success' ? '0 0 12px rgba(124,255,107,.45)' : '0 0 12px rgba(255,90,90,.45)',
    marginRight: 2,
  }),
  qrBtn: (accent = palomaGreen) => ({
    background: '#191e19',
    border: `2px solid ${accent}`,
    color: accent,
    borderRadius: 0,
    padding: 10,
    cursor: 'pointer',
    height: 0,
  }),

  // Section wrap
  selectorWrap: {
    width: '100%',
    background: 'rgba(14,15,14,0.95)',
    borderTop: '1.5px solid #23261F',
    borderBottom: '1.5px solid #23261F',
    padding: '10px',
    boxSizing: 'border-box',
  },

  // History pane
  historyPane: (bg = cardBg, border = glassBorder) => ({
    width: 400,
    maxWidth: 420,
    minWidth: 340,
    background: bg,
    borderLeft: border,
    borderTop: border,
    borderBottom: border,
    boxShadow: '0 10px 48px #000f',
    borderRight: 'none',
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    overflow: 'hidden',
  }),
  historyHeader: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  historyTitle: {
    color: 'white',
    letterSpacing: '.12em',
    fontSize: 22,
    fontWeight: 900,
    textAlign: 'left',
    textTransform: 'uppercase',
    textShadow: '0 1px 8px #6a725744',
  },
  historyCloseBtn: (accent = palomaGreen) => ({
    background: '#191e19',
    border: `2px solid ${accent}`,
    color: accent,
    borderRadius: 0,
    padding: '6px 10px',
    fontWeight: 800,
    letterSpacing: '.08em',
    cursor: 'pointer',
  }),
  historyBody: {
    width: '100%',
    flex: 1,
    overflowY: 'auto',
    paddingRight: 2,
    fontSize: 10,
  },

  // Sticky save bar
  saveBar: {
    position: 'fixed',
    left: '400px',
    right: 0,
    bottom: '72px',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    padding: '12px 18px',
    background: 'linear-gradient(180deg, rgba(16,17,15,.96) 0%, rgba(10,11,9,.96) 100%)',
    borderTop: '2px solid #2f3329',
    boxShadow: '0 -10px 32px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.05)',
  },

  // Missile tabs
  missileTab: (active) => ({
    padding: '8px 12px',
    fontWeight: 800,
    letterSpacing: '.08em',
    textTransform: 'uppercase',
    borderRadius: 0,
    border: `2px solid ${palomaGreen}`,
    background: active ? palomaGreen : '#0e0f0e',
    color: active ? '#0f120e' : palomaGreen,
    cursor: 'pointer',
  }),
};

