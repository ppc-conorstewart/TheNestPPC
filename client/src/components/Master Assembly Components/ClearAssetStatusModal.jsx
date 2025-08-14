// ==============================
// src/components/Master Assembly Components/ClearAssetStatusModal.jsx
// ==============================

import { useEffect, useState } from 'react';

// ==============================
// Component Props
// - open / isOpen: boolean (accept both for compatibility)
// - assetId: string
// - assetName: string
// - onClose: () => void
// - onConfirm: ({ status, notes }) => void
// - defaultStatus: string (optional, defaults to "Available")
// ==============================
export default function ClearAssetStatusModal({
  open,
  isOpen,
  assetId,
  assetName,
  onClose,
  onConfirm,
  defaultStatus = 'Available',
}) {
  // ==============================
  // Derived Visibility
  // ==============================
  const shown = Boolean(open ?? isOpen);

  // ==============================
  // Local State
  // ==============================
  const [status, setStatus] = useState(defaultStatus);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (shown) {
      setStatus(defaultStatus);
      setNotes('');
    }
  }, [shown, defaultStatus]);

  if (!shown) return null;

  // ==============================
  // Styles
  // ==============================
  const borderColor = '#687257';
  const selectArrowSVG = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='#b0b79f'><path d='M5.23 7.21a.75.75 0 011.06.02L10 11.182l3.71-3.95a.75.75 0 111.08 1.04l-4.24 4.51a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z'/></svg>`
  );

  // ==============================
  // Render
  // ==============================
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        fontFamily: 'erbaum, sans-serif',
        textTransform: 'uppercase',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          background: '#101411',
          border: '2px solid #6a7257',
          boxShadow: '0 8px 44px rgba(0,0,0,0.8)',
          padding: 22,
        }}
      >
        {/* ============================== */}
        {/* Header                         */}
        {/* ============================== */}
        <h2
          style={{
            color: '#b0b79f',
            letterSpacing: '.08em',
            fontWeight: 900,
            textAlign: 'center',
            marginBottom: 14,
            fontSize: 20,
          }}
        >
          Clear Asset From Master Assembly
        </h2>

        {/* ============================== */}
        {/* Asset Info                     */}
        {/* ============================== */}
        <div style={{ marginBottom: 12, color: '#b0b79f', fontSize: 13, fontWeight: 700 }}>
          <div style={{ marginBottom: 6 }}>
            Asset ID:{' '}
            <span style={{ color: 'yellow', fontWeight: 900 }}>
              {assetId || ''}
            </span>
          </div>
          {assetName ? (
            <div>
              Name:{' '}
              <span style={{ color: 'yellow', fontWeight: 900 }}>
                {assetName}
              </span>
            </div>
          ) : null}
        </div>

        {/* ============================== */}
        {/* New Status                     */}
        {/* ============================== */}
        <label
          htmlFor="clear-status"
          style={{ display: 'block', color: '#e6e8df', fontWeight: 800, fontSize: 12, marginBottom: 6 }}
        >
          New Status
        </label>
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <select
            id="clear-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 40px 10px 10px',
              backgroundColor: '#000',
              color: '#ffffff',
              border: `2px solid ${borderColor}`,
              outline: 'none',
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              backgroundImage: `url("data:image/svg+xml,${selectArrowSVG}")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 10px center',
              backgroundSize: 18,
              fontWeight: 800,
              letterSpacing: '.05em',
            }}
          >
            <option value="Available">Available</option>
            <option value="Tear Down">Tear Down</option>
            <option value="Under Review">Under Review</option>
          </select>
        </div>

        {/* ============================== */}
        {/* Notes                          */}
        {/* ============================== */}
        <label
          htmlFor="clear-notes"
          style={{ display: 'block', color: '#e6e8df', fontWeight: 800, fontSize: 12, marginBottom: 6 }}
        >
          Notes
        </label>
        <textarea
          id="clear-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Add any notes about this change..."
          style={{
            width: '100%',
            padding: 10,
            backgroundColor: '#000',
            color: '#ffffff',
            border: `2px solid ${borderColor}`,
            outline: 'none',
            resize: 'vertical',
            marginBottom: 18,
            fontWeight: 700,
            letterSpacing: '.04em',
          }}
        />

        {/* ============================== */}
        {/* Actions                        */}
        {/* ============================== */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 16px',
              background: '#35392E',
              color: '#fff',
              border: 'none',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm({ status, notes })}
            style={{
              padding: '10px 16px',
              background: '#6a7257',
              color: '#191e19',
              border: 'none',
              fontWeight: 900,
              cursor: 'pointer',
              letterSpacing: '.06em',
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
