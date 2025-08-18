// ==============================
// src/components/Master Assembly Components/Master Assemblies Hub Components/MetaDatesCard.jsx
// Master Assembly: Dates card (Creation & Auto-Calculated Service Due) + Static QR
// ==============================

import { QRCodeCanvas } from 'qrcode.react';
import { useEffect, useMemo } from 'react';

// ==============================
// Helpers
// ==============================
function normDate(v) {
  if (!v) return '';
  const s = typeof v === 'string' ? v : String(v);
  const m = s.match(/^\d{4}-\d{2}-\d{2}/);
  return m ? m[0] : '';
}

function addMonthsISO(isoYYYYMMDD, months = 6) {
  if (!isoYYYYMMDD) return '';
  const [y, m, d] = isoYYYYMMDD.split('-').map((n) => parseInt(n, 10));
  if (!y || !m || !d) return '';
  const dt = new Date(Date.UTC(y, m - 1, d));
  const targetMonth = dt.getUTCMonth() + months;
  const targetYear = dt.getUTCFullYear() + Math.floor(targetMonth / 12);
  const monthIndex = ((targetMonth % 12) + 12) % 12;
  const endOfTarget = new Date(Date.UTC(targetYear, monthIndex + 1, 0)).getUTCDate();
  const safeDay = Math.min(d, endOfTarget);
  const out = new Date(Date.UTC(targetYear, monthIndex, safeDay));
  const yyyy = out.getUTCFullYear();
  const mm = String(out.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(out.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// ==============================
// Component
// ==============================
export default function MetaDatesCard({
  creationDate,
  setCreationDate,
  recertDate,
  setRecertDate,
  onClearDates,
  qrData = '',
  qrLabel = '',
}) {
  const sixMonthDue = useMemo(() => addMonthsISO(creationDate || ''), [creationDate]);

  useEffect(() => {
    if (typeof setRecertDate === 'function') setRecertDate(sixMonthDue || '');
  }, [sixMonthDue, setRecertDate]);

  const qrSize = 120;

  const handleClearBoth = () => {
    if (typeof onClearDates === 'function') onClearDates();
    if (typeof setCreationDate === 'function') setCreationDate('');
    if (typeof setRecertDate === 'function') setRecertDate('');
  };

  const smallBtnStyle = (disabled = false) => ({
    border: '1px solid #6a7257',
    background: disabled ? '#1a1b16' : '#0e100c',
    color: disabled ? '#777' : '#e6e8df',
    padding: '6px 10px',
    borderRadius: 6,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 900,
    letterSpacing: '.06em',
    textTransform: 'uppercase',
    lineHeight: 1,
    fontSize: 11,
  });

  const inputStyle = {
    width: '100%',
    padding: '6px 8px',
    background: '#10110f',
    color: '#e6e8df',
    border: '1px solid #3b3f33',
    borderRadius: 6,
    fontWeight: 700,
    letterSpacing: '.02em',
    outline: 'none',
    fontSize: 12,
  };

  const labelStyle = {
    fontWeight: 900,
    letterSpacing: '.08em',
    color: '#dfe3d1',
    textTransform: 'uppercase',
    fontSize: 16,
    marginBottom: 4,
  };

  return (
    <div
      style={{
        border: '1px solid #3b3f33',
        background: '#0b0c09',
        padding: 12,
        display: 'grid',
        gridTemplateColumns: '1fr minmax(120px, 160px)',
        gap: 12,
        alignItems: 'stretch',
      }}
    >
      {/* Left: Dates */}
      <div style={{ display: 'grid', gap: 10 }}>
        {/* Creation Date */}
        <div>
          <div style={labelStyle}>Creation Date:</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
            <input
              type="date"
              value={creationDate || ''}
              onChange={(e) => setCreationDate(normDate(e.target.value))}
              style={inputStyle}
            />
            <button
              onClick={handleClearBoth}
              disabled={!creationDate && !recertDate}
              style={smallBtnStyle(!creationDate && !recertDate)}
            >
              Clear
            </button>
          </div>
        </div>

        {/* 6 Month Service Due */}
        <div>
          <div style={labelStyle}>6 Month Service Due On:</div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
             
              borderRadius: 6,
              padding: '4px 8px',
              minHeight: 32,
            }}
          >
            <span
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: '#ffe066',
                letterSpacing: '.06em',
              }}
            >
              {sixMonthDue || '—'}
            </span>
          </div>
        </div>
      </div>

      {/* QR */}
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          background: '#0f100e',
          border: '1px solid #2e342b',
          borderRadius: 10,
          minHeight: 150,
        }}
      >
        <div style={{ display: 'grid', gap: 4, justifyItems: 'center' }}>
          <QRCodeCanvas value={String(qrData || '')} size={qrSize} includeMargin />
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '.08em',
              color: '#c7cdb8',
              textTransform: 'uppercase',
            }}
          >
            {qrLabel}
          </div>
        </div>
      </div>
    </div>
  );
}
