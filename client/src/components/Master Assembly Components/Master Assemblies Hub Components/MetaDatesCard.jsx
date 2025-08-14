// ==============================
// src/components/Master Assembly Components/Master Assemblies Hub Components/MetaDatesCard.jsx
// Master Assembly: Dates card (Creation date input • Auto 6‑month due display • Clear button)
// ==============================

import { useMemo } from 'react';

// ------------------------------
// Local helpers (kept minimal to avoid cross-file coupling)
// ------------------------------
function normDate(v) {
  if (!v) return '';
  const s = typeof v === 'string' ? v : String(v);
  const m = s.match(/^\d{4}-\d{2}-\d{2}/);
  return m ? m[0] : '';
}

function addMonths(dateStr, months) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

// ==============================
// Component
// ==============================
export default function MetaDatesCard({
  creationDate = '',
  setCreationDate = () => {},
  recertDate = '',
  onClearCreationDate = null, // when provided, triggers immediate DB clear
}) {
  const sixMonthDue = useMemo(
    () => recertDate || addMonths(creationDate, 6),
    [creationDate, recertDate]
  );

  return (
    <div
      style={{
        background:'#0f100e',
        border:'1px solid #3b3f33',
        borderRadius:10,
        padding:'12px',
        display:'grid',
        gridTemplateColumns:'1fr',
        gap:0
      }}
    >
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ fontWeight:900, letterSpacing:'.08em', color:'#dfe3d1', minWidth:170 }}>Creation date:</div>
        <input
          type="date"
          value={creationDate}
          onChange={(e) => setCreationDate(normDate(e.target.value))}
          style={{
            width:220,
            padding:'8px 10px',
            background:'#10110f',
            color:'#e6e8df',
            border:'1px solid #3b3f33',
            borderRadius:6,
            fontWeight:700,
            fontSize:12,
            lineHeight:1
          }}
        />
        <button
          title="Clear creation date"
          onClick={() => onClearCreationDate && onClearCreationDate()}
          style={{
            marginLeft: 6,
            padding:'6px 10px',
            background:'#10110f',
            color:'#e6e8df',
            border:'1px solid #3b3f33',
            borderRadius:6,
            fontWeight:800,
            fontSize:12,
            lineHeight:1
          }}
        >
          Clear
        </button>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:8 }}>
        <div style={{ fontWeight:900, letterSpacing:'.08em', color:'#dfe3d1', minWidth:170 }}>6 Month service due on:</div>
        <div style={{ fontWeight:800, color:'#f7fa4aff' }}>{sixMonthDue || '—'}</div>
      </div>
    </div>
  );
}
