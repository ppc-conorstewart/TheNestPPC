// ==============================
// src/components/Master Assembly Components/Master Assemblies Hub Components/MetaHeader.jsx
// ==============================

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { styles } from '../Support Files/maKit';
import { GlassPanel, GradientDivider, Paloma3DButton, goldAccent, palomaGreen } from '../Support Files/maShared';

// ==============================
// Helpers
// ==============================
function hexToRgb(hex){
  const h = hex.replace('#','');
  const r = parseInt(h.substring(0,2),16);
  const g = parseInt(h.substring(2,4),16);
  const b = parseInt(h.substring(4,6),16);
  return `${r},${g},${b}`;
}

// ==============================
// Status config
// ==============================
const STATUS_ITEMS = [
  { label: 'ACTIVE',     value: 'Active',     bg: '#000000ff', border: '#2c7a33', text: '#9dff57' },
  { label: 'OFFLINE',    value: 'Offline',    bg: '#000000ff', border: '#7a6f2c', text: '#ffd24a' },
  { label: 'IN-ACTIVE',  value: 'Inactive',   bg: '#000000ff', border: '#7a2c2c', text: '#ff6b6b' },
  { label: 'TORN-DOWN',  value: 'Torn Down',  bg: '#000000ff', border: '#7a4a2c', text: '#ffa857' },
];

// ==============================
// Status pill
// ==============================
function StatusPill({ item, animated=false }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 8px',
        borderRadius: 6,
        fontWeight: 900,
        letterSpacing: '.06em',
        background: item.bg,
        color: item.text,
        border: `1px solid ${item.border}`,
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.35)',
        userSelect: 'none',
        ...(animated ? { animation:'glowPulse 1800ms ease-in-out infinite', '--pulse': hexToRgb(item.border) } : null)
      }}
    >
      {item.label}
    </div>
  );
}

// ==============================
// Main
// ==============================
export default function MetaHeader({
  selectedChild = '',
  status = 'Inactive',
  setStatus = () => {},
  updateStatus = 'idle',
  onUpdate = () => {},
  isSaving = false,
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const id = '__paloma_status_glow_keyframes__';
    if (typeof document !== 'undefined' && !document.getElementById(id)) {
      const style = document.createElement('style');
      style.id = id;
      style.textContent = `
        @keyframes glowPulse {
          0%   { box-shadow: 0 0 0 0 rgba(var(--pulse), .30); }
          70%  { box-shadow: 0 0 14px 7px rgba(var(--pulse), .08); }
          100% { box-shadow: 0 0 0 0 rgba(var(--pulse), 0); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // ------------------------------
  // Dropdown overlay
  // ------------------------------
  const menuRef = useRef(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 180 });

  useLayoutEffect(() => {
    if (!open) return;
    const anchor = wrapRef.current;
    if (!anchor) return;

    const compute = () => {
      const r = anchor.getBoundingClientRect();
      setMenuPos({
        top: r.bottom + 8 + window.scrollY,
        left: r.left + window.scrollX,
        width: Math.max(180, r.width),
      });
    };

    compute();
    window.addEventListener('scroll', compute, { passive: true });
    window.addEventListener('resize', compute);
    return () => {
      window.removeEventListener('scroll', compute);
      window.removeEventListener('resize', compute);
    };
  }, [open]);

  useEffect(() => {
    const onDocClick = (e) => {
      const a = wrapRef.current;
      const m = menuRef.current;
      if (!a) return;
      if (a.contains(e.target)) return;
      if (m && m.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const current = STATUS_ITEMS.find(i => i.value === status) || STATUS_ITEMS[2];
  const updateLabel = `Update ${selectedChild || ''}`;

  return (
    <div style={{ ...styles.headerRow, position: 'relative', alignText: 'center' }}>
      <div style={styles.title(goldAccent)}>{selectedChild}</div>

      <GlassPanel pad={8} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={styles.subTitle(palomaGreen)}>STATUS:</div>
        <div ref={wrapRef} style={{ position: 'relative', display: 'inline-block' }}>
          <button
            onClick={() => setOpen(v => !v)}
            style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', outline: 'none' }}
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            <StatusPill item={current} animated />
          </button>
        </div>

        {updateStatus !== 'idle' && (
          <div style={styles.statusIcon(updateStatus)} aria-hidden>
            {updateStatus === 'success' ? '✓' : '✗'}
          </div>
        )}
        <Paloma3DButton
          label={isSaving ? 'Saving…' : updateLabel}
          onClick={onUpdate}
          minWidth={200}
          fullHeight={false}
        />
      </GlassPanel>

      <GradientDivider />

      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            style={{
              position: 'absolute',
              top: menuPos.top,
              left: menuPos.left,
              minWidth: menuPos.width,
              background: '#0f100e',
              border: '1px solid #3b3f33',
              borderRadius: 10,
              padding: 4,
              boxShadow: '0 10px 28px rgba(0,0,0,.55)',
              zIndex: 100000,
            }}
          >
            {STATUS_ITEMS.map(item => (
              <div
                key={item.value}
                role="option"
                aria-selected={item.value === status}
                onClick={() => { setStatus(item.value); setOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '2px 2px',
                  cursor: 'pointer',
                  borderRadius: 8,
                  transition: 'background .15s',
                  ...(item.value === status ? { background: '#171a14' } : {}),
                }}
              >
                <StatusPill item={item} />
              </div>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
