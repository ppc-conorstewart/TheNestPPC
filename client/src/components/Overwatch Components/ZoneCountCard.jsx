// ==============================
// components/Overwatch Components/ZoneCountCard.jsx — Live Zone Progress (Context-Friendly)
// ==============================

import { useMemo } from 'react';

// ==============================
// Styling Constants
// ==============================
const cardStyle = {
  background: '#10110f',
  borderRadius: 0,
  border: '1.5px solid #949C7F',
  padding: 0,
  minHeight: 120,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  height: '100%',
  boxSizing: 'border-box',
  minWidth: 0,
  minHeight: 0,
  overflow: 'hidden'
};

const cardHeaderStyle = {
  background: '#000',
  color: '#b0b79f',
  borderBottom: '2.5px solid #35392e',
  padding: '13px 0 8px 0',
  fontSize: '1.17rem',
  textTransform: 'uppercase',
  fontWeight: 'bold',
  letterSpacing: '1.13px',
  margin: 0,
  textAlign: 'center',
  width: '100%',
  lineHeight: 1.1,
  boxShadow: '0 2px 10px #22291e25'
};

const mainBox = {
  color: '#E6E8DF',
  fontSize: '0.92rem',
  fontWeight: 500,
  padding: '8px 12px 6px 16px',
  minHeight: 88,
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
};

const totalHeader = {
  fontWeight: 900,
  fontSize: '1rem',
  marginBottom: 2,
  marginTop: 0,
  color: '#d2e6b1',
  textShadow: '0 1px 2px #7aff4320'
};

const totalRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 7,
  fontWeight: 700,
  fontSize: '1.08rem',
  marginBottom: 5,
  marginTop: 0,
  letterSpacing: 0.1
};

const totalNum = { color: '#7aff43', fontSize: '1.13rem', fontWeight: 900, marginRight: 2 };
const totalOut = { color: '#fff', fontSize: '1.13rem', fontWeight: 900, marginLeft: 0, marginRight: 6 };
const percentText = { color: '#b0b79f', fontWeight: 600, fontSize: '0.98rem', marginLeft: 1 };

const progressBarWrap = {
  width: '88%',
  height: 9,
  background: '#191f18',
  borderRadius: 6,
  margin: '3px auto 9px auto',
  overflow: 'hidden',
  boxShadow: '0 2px 6px 0 #2a2d1745'
};

const progressBar = percent => ({
  height: '100%',
  background: 'linear-gradient(90deg, #7aff43 0%, #45ff9c 100%)',
  borderRadius: 8,
  width: `${percent}%`,
  transition: 'width 0.5s',
  boxShadow: '0 0 6px #7aff43a0'
});

// ==============================
// Helpers
// ==============================
function parsePair(val) {
  // Accept "X/Y" or number; returns {c, t}
  if (typeof val === 'string' && val.includes('/')) {
    const [a, b] = val.split('/').map(s => parseInt(String(s).trim(), 10) || 0);
    return { c: a, t: b };
  }
  if (typeof val === 'number') {
    return { c: 0, t: val };
  }
  return { c: 0, t: 0 };
}

function deriveZoneProgressFromJob(job) {
  const j = job?.job_update_json || {};
  // Prefer a single total string if present
  let { c, t } = parsePair(j.totalZones);
  // Also aggregate per-zone fields like aZone/bZone/...
  const letters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p'];
  for (const k of letters) {
    const key = `${k}Zone`;
    if (j[key] != null) {
      const pair = parsePair(j[key]);
      c += pair.c;
      t += pair.t;
    }
  }
  return { completed: c, total: t };
}

// ==============================
// Component
// ==============================
export default function ZoneCountCard({ job, zoneProgress }) {
  const computed = useMemo(() => {
    if (zoneProgress && typeof zoneProgress === 'object') return zoneProgress;
    return deriveZoneProgressFromJob(job);
  }, [zoneProgress, job]);

  const completed = computed?.completed ?? 0;
  const total = computed?.total ?? 0;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div style={cardStyle}>
      <div style={cardHeaderStyle}>
        ZONE COUNT
      </div>
      <div style={mainBox}>
        <div style={totalHeader}>
          Zones:
        </div>
        <div style={totalRow}>
          <span style={totalNum}>{completed}</span>
          <span style={{ fontSize: '1.01rem', color: '#b0b79f', marginRight: 1 }}>/</span>
          <span style={totalOut}>{total}</span>
          <span style={percentText}>{percent}% Complete</span>
        </div>
        <div style={progressBarWrap}>
          <div style={progressBar(percent)} />
        </div>
      </div>
    </div>
  );
}
