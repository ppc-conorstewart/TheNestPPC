// ==============================
// src/components/Master Assembly Components/Master Assemblies Hub Components/MetaHeader.jsx
// Master Assembly: Header row (Glass depth on status + actions • Animated divider)
// ==============================

import { QrCode } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { styles } from '../Support Files/maKit';
import { GlassPanel, GradientDivider, Paloma3DButton, goldAccent, palomaGreen } from '../Support Files/maShared';

// ==============================
// Status config (purely visual)
// ==============================
const STATUS_ITEMS = [
  { label: 'ACTIVE',     value: 'Active',     bg: '#0b2f16', border: '#2c7a33', text: '#9dff57' },
  { label: 'OFFLINE',    value: 'Offline',    bg: '#2f2a0b', border: '#7a6f2c', text: '#ffd24a' },
  { label: 'IN‑ACTIVE',  value: 'Inactive',   bg: '#2f0b0b', border: '#7a2c2c', text: '#ff6b6b' },
  { label: 'TORN‑DOWN',  value: 'Torn Down',  bg: '#2f1c0b', border: '#7a4a2c', text: '#ffa857' },
];

function StatusPill({ item }) {
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
      }}
    >
      {item.label}
    </div>
  );
}

export default function MetaHeader({
  selectedChild = '',
  status = 'Inactive',
  setStatus = () => {},
  updateStatus = 'idle',
  onUpdate = () => {},
  setQrModalOpen = null,
  isSaving = false,
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const current = STATUS_ITEMS.find(i => i.value === status) || STATUS_ITEMS[2];
  const updateLabel = `Update ${selectedChild || ''}`;

  return (
    <div style={{ ...styles.headerRow, position: 'relative' }}>
      {/* Left: Title + Status (in a subtle glass panel) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={styles.title(goldAccent)}>{selectedChild}</div>

        <GlassPanel pad={8} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <div style={styles.subTitle(palomaGreen)}>STATUS:</div>
          <div ref={wrapRef} style={{ position: 'relative', display: 'inline-block' }}>
            <button
              onClick={() => setOpen(v => !v)}
              style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', outline: 'none' }}
              aria-haspopup="listbox"
              aria-expanded={open}
            >
              <StatusPill item={current} />
            </button>

            {open && (
              <div
                role="listbox"
                style={{
                  position: 'absolute',
                  zIndex: 20,
                  top: 'calc(100% + 8px)',
                  left: 0,
                  background: '#0f100e',
                  border: '1px solid #3b3f33',
                  borderRadius: 10,
                  padding: 8,
                  minWidth: 180,
                  boxShadow: '0 10px 28px rgba(0,0,0,.55)',
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
                      padding: '6px 4px',
                      cursor: 'pointer',
                      borderRadius: 8,
                      transition: 'background .15s',
                      ...(item.value === status ? { background: '#171a14' } : {}),
                    }}
                  >
                    <StatusPill item={item} />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ ...styles.idLine, marginLeft: 10 }}>ID: {selectedChild || '—'}</div>
        </GlassPanel>
      </div>

      {/* Right: Actions in a glass panel */}
      <GlassPanel pad={10} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {updateStatus !== 'idle' && (
          <div style={styles.statusIcon(updateStatus)} aria-hidden>
            {updateStatus === 'success' ? '✓' : '✗'}
          </div>
        )}
        <Paloma3DButton label={isSaving ? 'Saving…' : updateLabel} onClick={onUpdate} minWidth={240} />
        <button
          title="Show QR Code"
          style={styles.qrBtn(palomaGreen)}
          onClick={() => setQrModalOpen && setQrModalOpen(true)}
        >
          <QrCode size={30} strokeWidth={2} />
        </button>
      </GlassPanel>

      {/* Faint animated gradient divider under the header */}
      <GradientDivider />
    </div>
  );
}
