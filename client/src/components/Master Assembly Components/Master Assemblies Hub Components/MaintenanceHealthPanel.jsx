// ==============================
// MaintenanceHealthPanel.jsx
// Animated maintenance gauges + mini timeline
// WINDOW = 6 MONTHS (strict) • Responsive & contained
// ==============================

import { useEffect, useMemo, useState } from 'react';
import {
    AmbientGlow,
    colorForStatus,
    GlassPanel,
    goldAccent,
    GradientDivider,
    palomaGreen,
} from '../Support Files/maShared';

// ---------- helpers ----------
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
  if (t.getMonth() !== (d.getMonth() + months) % 12) t.setDate(0);
  return t.toISOString().slice(0, 10);
}
function gaugeColor(p) {
  if (p < 0.5) return '#9dff57';
  if (p < 0.8) return '#ffd24a';
  return '#ff6b6b';
}
function useWindowWidth() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920);
  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return w;
}

// ---------- donut gauge ----------
function Donut({ percent = 0, size = 140, label = '', sub = '' }) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = Math.PI * 2 * r;
  const dash = clamp01(percent) * c;
  const color = gaugeColor(percent);

  return (
    <div style={{ position: 'relative', width: size, height: size, maxWidth: '100%' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#222721" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dasharray 700ms ease, stroke 300ms ease' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 500,
          color: '#e8eadf',
          letterSpacing: '.06em',
          textTransform: 'uppercase',
        }}
      >
        <div style={{ fontSize: 28, lineHeight: 1 }}>{Math.round(percent * 100)}%</div>
        <div style={{ fontSize: 10, opacity: 0.85 }}>{label}</div>
        {sub ? <div style={{ fontSize: 9, opacity: 0.6, marginTop: 2 }}>{sub}</div> : null}
      </div>
    </div>
  );
}

// ---------- timeline ----------
function Timeline({ creationDate, dueDate }) {
  const today = new Date().toISOString().slice(0, 10);
  const total = Math.max(1, daysBetween(creationDate, dueDate));
  const done = Math.max(0, Math.min(total, daysBetween(creationDate, today)));
  const p = clamp01(done / total);

  return (
    <div style={{ position: 'relative', width: '100%', height: 36, marginTop: 8, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 0,
          right: 0,
          height: 4,
          borderRadius: 2,
          background: 'linear-gradient(90deg, #2a2f26, #171a14)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,.08)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 0,
          width: `${p * 100}%`,
          height: 4,
          borderRadius: 2,
          background: 'linear-gradient(90deg, #6a7257, #b0b79f)',
          transition: 'width 700ms ease',
        }}
      />
      <div style={{ position: 'absolute', top: -4, left: 0, fontSize: 10, color: '#aab094', whiteSpace: 'nowrap' }}>
        {creationDate || '—'}
      </div>
      <div style={{ position: 'absolute', top: -4, right: 0, fontSize: 10, color: '#aab094', whiteSpace: 'nowrap' }}>
        {dueDate || '—'}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: `calc(${p * 100}% - 9px)`,
          width: 18,
          height: 18,
          borderRadius: 9,
          background: '#0f120e',
          border: '2px solid #6a7257',
          boxShadow: '0 0 0 3px rgba(106,114,87,.25)',
          transition: 'left 700ms ease',
        }}
        title="Today"
      />
    </div>
  );
}

// ---------- main ----------
export default function MaintenanceHealthPanel({
  assemblyTitle,
  child,
  status,
  creationDate,
  recertDate,
}) {
  const today = new Date().toISOString().slice(0, 10);
  const ww = useWindowWidth();

  // Strict 6-month window regardless of stored recert; show recert for label if present.
  const memo = useMemo(() => {
    const hasCreation = !!creationDate;
    const baseDue = hasCreation ? addMonthsISO(creationDate, 6) : '';
    const shownDue = recertDate || baseDue;

    const total = hasCreation ? Math.max(1, daysBetween(creationDate, baseDue)) : 1;
    const elapsed = hasCreation ? Math.max(0, Math.min(total, daysBetween(creationDate, today))) : 0;
    const percent = total ? elapsed / total : 0;

    const daysLeft = hasCreation && shownDue ? daysBetween(today, shownDue) : 0;

    const statusColor = colorForStatus(status);
    return { percent: clamp01(percent), daysLeft, statusColor, total, elapsed, dueBase: baseDue, dueShown: shownDue };
  }, [creationDate, recertDate, status, today]);

  // responsive layout
  const donutSize = ww >= 1500 ? 160 : ww >= 1200 ? 140 : ww >= 980 ? 120 : 110;
  const layout =
    ww >= 1500 ? '3col' :
    ww >= 1100 ? '2col' : '1col';

  const heading = `${(assemblyTitle || '').toUpperCase()} — ${child}`;

  return (
    <GlassPanel pad={14} style={{ position: 'relative', overflow: 'hidden', maxWidth: '100%' }}>
      <AmbientGlow color={memo.statusColor} intensity={0.18} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 8, minWidth: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: '.18em', color: goldAccent, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          Maintenance Health
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 400,
            color: '#c7cdb8',
            letterSpacing: '.04em',
            opacity: 0.9,
            textTransform: 'uppercase',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={heading}
        >
          {heading}
        </div>
      </div>

      {!creationDate ? (
        <div style={{ padding: 10, color: '#b0b79f', fontWeight: 300, letterSpacing: '.06em' }}>
          Set a <span style={{ color: palomaGreen }}>Creation Date</span> to enable gauges and the 6-month timeline.
        </div>
      ) : (
        <>
          {layout === '3col' && (
            <div style={{ display: 'grid', gridTemplateColumns: `minmax(120px, ${donutSize}px) 1fr minmax(180px, 220px)`, gap: 16, alignItems: 'center', minWidth: 0 }}>
              <Donut
                percent={memo.percent}
                size={donutSize}
                label="To 6-Mo Service"
                sub={memo.daysLeft >= 0 ? `${memo.daysLeft} days left` : `${Math.abs(memo.daysLeft)} days overdue`}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.08em', color: '#c7cdb8', textTransform: 'uppercase' }}>
                  Creation → 6-Month Timeline
                </div>
                <Timeline creationDate={creationDate} dueDate={memo.dueBase} />
                <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                  <Tile label="STATUS" value={status} accent={memo.statusColor} />
                  <Tile label="AGE (DAYS)" value={String(memo.elapsed || 0)} />
                  <Tile label="WINDOW (DAYS)" value={String(memo.total || 0)} />
                </div>
              </div>
              <div style={{ alignSelf: 'stretch', display: 'grid', gap: 8 }}>
                <MiniGauge title="Risk" percent={memo.percent} />
                <MiniGauge title="Readiness" percent={1 - memo.percent} invert />
              </div>
            </div>
          )}

          {layout === '2col' && (
            <div style={{ display: 'grid', gridTemplateColumns: `minmax(120px, ${donutSize}px) 1fr`, gap: 16, alignItems: 'center', minWidth: 0 }}>
              <Donut
                percent={memo.percent}
                size={donutSize}
                label="To 6-Mo Service"
                sub={memo.daysLeft >= 0 ? `${memo.daysLeft} days left` : `${Math.abs(memo.daysLeft)} days overdue`}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 400, letterSpacing: '.08em', color: '#c7cdb8', textTransform: 'uppercase' }}>
                  Creation → 6-Month Timeline
                </div>
                <Timeline creationDate={creationDate} dueDate={memo.dueBase} />
                <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                  <Tile label="STATUS" value={status} accent={memo.statusColor} />
                  <Tile label="AGE (DAYS)" value={String(memo.elapsed || 0)} />
                  <Tile label="WINDOW (DAYS)" value={String(memo.total || 0)} />
                </div>
                <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                  <MiniGauge title="Risk" percent={memo.percent} />
                  <MiniGauge title="Readiness" percent={1 - memo.percent} invert />
                </div>
              </div>
            </div>
          )}

          {layout === '1col' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
                <Donut
                  percent={memo.percent}
                  size={donutSize}
                  label="To 6-Mo Service"
                  sub={memo.daysLeft >= 0 ? `${memo.daysLeft} days left` : `${Math.abs(memo.daysLeft)} days overdue`}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 400, letterSpacing: '.08em', color: '#c7cdb8', textTransform: 'uppercase' }}>
                    Creation → 6-Month Timeline
                  </div>
                  <Timeline creationDate={creationDate} dueDate={memo.dueBase} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                <Tile label="STATUS" value={status} accent={memo.statusColor} />
                <Tile label="AGE (DAYS)" value={String(memo.elapsed || 0)} />
                <Tile label="WINDOW (DAYS)" value={String(memo.total || 0)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                <MiniGauge title="Risk" percent={memo.percent} />
                <MiniGauge title="Readiness" percent={1 - memo.percent} invert />
              </div>
            </div>
          )}
        </>
      )}

      <GradientDivider />
    </GlassPanel>
  );
}

// ---------- tiles & mini gauges ----------
function Tile({ label, value, accent = palomaGreen }) {
  return (
    <div
      style={{
        background: 'linear-gradient(180deg,#1a1f18,#151813)',
        border: '1px solid #2e342b',
        padding: '10px 12px',
        display: 'grid',
        gap: 4,
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 400, letterSpacing: '.08em', color: '#aab094', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 400, letterSpacing: '.06em', color: accent, overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {value}
      </div>
    </div>
  );
}
function MiniGauge({ title, percent, invert = false }) {
  const p = clamp01(invert ? 1 - percent : percent);
  const color = gaugeColor(percent);
  return (
    <div
      style={{
        background: 'linear-gradient(180deg,#1a1f18,#151813)',
        border: '1px solid #2e342b',
        padding: 10,
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 300, letterSpacing: '.08em', color: '#aab094', textTransform: 'uppercase' }}>
        {title}
      </div>
      <div style={{ marginTop: 6, height: 10, background: '#10130f', border: '1px solid #2b2f27', borderRadius: 3, overflow: 'hidden' }}>
        <div
          style={{
            width: `${Math.round(p * 100)}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${color}, #ffffff20)`,
            transition: 'width 700ms ease',
          }}
        />
      </div>
    </div>
  );
}
