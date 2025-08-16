// ==============================
// Master Assemblies Hub Components/GasketMaintenancePanel.jsx
// Per-gasket gauges with a strict 6-month window
// ONE horizontal panel: 6 rings wide, ring at left + compact info at right
// Green number badge is rendered INSIDE each ring
// ==============================

import { useMemo } from 'react';
import {
    AmbientGlow,
    GlassPanel,
    goldAccent,
    GradientDivider,
} from '../Support Files/maShared';

// ==============================
// Helpers
// ==============================
function daysBetween(a, b) {
  const d1 = new Date(a);
  const d2 = new Date(b);
  if (isNaN(d1) || isNaN(d2)) return 0;
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

function clamp01(v) {
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

function addMonthsISO(dateStr, months) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  const t = new Date(d.getTime());
  t.setMonth(t.getMonth() + months);
  // handle end-of-month rollover
  if (t.getMonth() !== (d.getMonth() + months) % 12) t.setDate(0);
  return t.toISOString().slice(0, 10);
}

function gaugeColor(p) {
  if (p < 0.5) return '#9dff57';
  if (p < 0.8) return '#ffd24a';
  return '#ff6b6b';
}

function numberFromSlot(slot = '') {
  const m = String(slot).trim().match(/^(\d+)\./);
  return m ? m[1] : '•';
}

// ==============================
// Tiny donut with centered green number badge
// ==============================
function Donut({ percent = 0, size = 70, label = '•' }) {
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = Math.PI * 2 * r;
  const dash = clamp01(percent) * c;
  const color = gaugeColor(percent);
  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* track */}
      <circle cx={cx} cy={cy} r={r} stroke="#222721" strokeWidth={stroke} fill="none" />
      {/* progress */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={`${dash} ${c}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dasharray 700ms ease, stroke 300ms ease' }}
      />
      {/* centered green number badge */}
      <g>
        <circle cx={cx} cy={cy} r={14} fill="#70c12a" stroke="#0b2f16" strokeWidth="2" />
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontWeight="900"
          fontSize="12"
          fill="#10110f"
        >
          {label}
        </text>
      </g>
    </svg>
  );
}

// ==============================
// Small label row (reduced font + tight spacing)
// ==============================
function LabelRow({ k, v }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'baseline', minWidth: 0 }}>
      <div
        style={{
          fontSize: 6,
          fontWeight: 600,
          letterSpacing: '.06em',
          color: '#4cf023a6',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        {k}:
      </div>
      <div
        style={{
          fontSize: 6,
          fontWeight: 200,
          
          color: '#e6e8df',
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {v}
      </div>
    </div>
  );
}

// ==============================
// Single gasket cell (ring + info)
// ==============================
function GasketCell({ slot, gasketId, installedDate }) {
  const today = new Date().toISOString().slice(0, 10);
  const n = numberFromSlot(slot);

  const memo = useMemo(() => {
    const has = !!installedDate;
    const due = has ? addMonthsISO(installedDate, 6) : '';
    const total = has ? Math.max(1, daysBetween(installedDate, due)) : 1;
    const elapsed = has ? Math.max(0, Math.min(total, daysBetween(installedDate, today))) : 0;
    const percent = has ? elapsed / total : 0;
    const daysLeft = has ? daysBetween(today, due) : 0;
    return { percent: clamp01(percent), daysLeft, due };
  }, [installedDate, today]);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        alignItems: 'center',
        gap: 8,
        padding: 4, // tighter padding
        background: 'linear-gradient(180deg,#1a1f18,#151813)',
        border: '1px solid #2e342b',
        minWidth: 0,
      }}
      title={installedDate ? `Installed: ${installedDate} • Due: ${memo.due}` : 'No install date'}
    >
      <div style={{ display: 'grid', placeItems: 'center' }}>
        <Donut percent={memo.percent} label={n} />
      </div>

      <div style={{ display: 'grid', gap: 2, minWidth: 0 }}>
        <div
          style={{
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: '.08em',
            color: '#c7cdb8',
            textTransform: 'uppercase',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {slot}
        </div>

        {/* Compact triple-line spec */}
        <LabelRow k="Gasket" v={gasketId || '—'} />
        <LabelRow k="In.Date" v={installedDate || '—'} />
        <LabelRow
          k="St"
          v={
            installedDate
              ? memo.daysLeft >= 0
                ? `${memo.daysLeft} days left`
                : `${Math.abs(memo.daysLeft)} overdue`
              : 'no date'
          }
        />
      </div>
    </div>
  );
}

// ==============================
// Main: single horizontal panel, 6 cells wide
// ==============================
export default function GasketMaintenancePanel({
  assemblyTitle,
  child,
  gasketLabels = [],
  gasketState = {},
}) {
  const heading = `${(assemblyTitle || '').toUpperCase()} — ${child}`;

  return (
    <GlassPanel pad={12} style={{ position: 'relative', overflow: 'hidden', maxWidth: '100%' }}>
      <AmbientGlow color="#6a7257" intensity={0.14} />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 6,
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: '.18em',
            color: goldAccent,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          Gasket Maintenance
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: '#c7cdb8',
            letterSpacing: '.04em',
            opacity: 0.9,
            textTransform: 'uppercase',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {heading}
        </div>
      </div>

      {/* ONE BAR — 6 columns; will wrap only if viewport is extremely narrow */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, minmax(220px, 1fr))',
          gap: 8,
          minWidth: 0,
        }}
      >
        {gasketLabels.map((slot) => (
          <GasketCell
            key={slot}
            slot={slot}
            gasketId={gasketState[slot] || ''}
            installedDate={gasketState[`${slot}__date`] || ''}
          />
        ))}
      </div>

      <div style={{ marginTop: 8 }}>
        <GradientDivider />
        <div style={{ fontSize: 9, color: '#aab094', marginTop: 4, letterSpacing: '.05em' }}>
          Tip: refresh individual gaskets as they’re replaced; gauges reset on install date change.
        </div>
      </div>
    </GlassPanel>
  );
}
