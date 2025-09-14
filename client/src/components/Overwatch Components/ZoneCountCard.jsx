// =====================================================
// Overwatch • ZoneCountCard.jsx — Glass Morphism
// Sections: Imports • Styles • Helpers • Component
// =====================================================

import { useMemo } from 'react';

// -----------------------------
// Styles
// -----------------------------
const cardStyle = {
  background: 'rgba(24,28,20,0.58)',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.12)',
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
  overflow: 'hidden',
  backdropFilter: 'blur(14px) saturate(140%)',
  WebkitBackdropFilter: 'blur(14px) saturate(140%)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.45)'
};

const cardHeaderStyle = {
  background: 'rgba(0,0,0,0.55)',
  color: '#b0b79f',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  padding: '13px 0 8px 0',
  fontSize: '1.17rem',
  textTransform: 'uppercase',
  fontWeight: 'bold',
  letterSpacing: '1.13px',
  margin: 0,
  textAlign: 'center',
  width: '100%',
  lineHeight: 1.1
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

const totalHeader = { fontWeight: 900, fontSize: '1rem', marginBottom: 2, marginTop: 0, color: '#d2e6b1' };
const totalRow = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontWeight: 700, fontSize: '1.08rem', marginBottom: 5, marginTop: 0, letterSpacing: 0.1 };
const totalNum = { color: '#7aff43', fontSize: '1.13rem', fontWeight: 900, marginRight: 2 };
const totalOut = { color: '#fff', fontSize: '1.13rem', fontWeight: 900, marginLeft: 0, marginRight: 6 };
const percentText = { color: '#b0b79f', fontWeight: 600, fontSize: '0.98rem', marginLeft: 1 };

const progressBarWrap = {
  width: '88%',
  height: 9,
  background: 'rgba(25,31,24,0.65)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 6,
  margin: '3px auto 9px auto',
  overflow: 'hidden',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)'
};

const progressBar = percent => ({
  height: '100%',
  background: 'linear-gradient(90deg, #7aff43 0%, #45ff9c 100%)',
  borderRadius: 8,
  width: `${percent}%`,
  transition: 'width 0.5s',
  boxShadow: '0 0 6px #7aff43a0'
});

// -----------------------------
// Helpers
// -----------------------------
function parsePair(val){
  if (typeof val === 'string' && val.includes('/')) {
    const [a,b]=val.split('/').map(s=>parseInt(String(s).trim(),10)||0);
    return { c:a, t:b };
  }
  if (typeof val === 'number') return { c:0, t:val };
  return { c:0, t:0 };
}

function deriveZoneProgressFromJob(job){
  const j = job?.job_update_json || {};
  let { c, t } = parsePair(j.totalZones);
  const letters=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p'];
  for (const k of letters){
    const key=`${k}Zone`;
    if (j[key]!=null){const p=parsePair(j[key]); c+=p.c; t+=p.t;}
  }
  return { completed:c, total:t };
}

// -----------------------------
// Component
// -----------------------------
export default function ZoneCountCard({ job, zoneProgress }) {
  const computed = useMemo(() => (zoneProgress && typeof zoneProgress==='object') ? zoneProgress : deriveZoneProgressFromJob(job), [zoneProgress, job]);
  const completed = computed?.completed ?? 0;
  const total = computed?.total ?? 0;
  const percent = total>0 ? Math.round((completed/total)*100) : 0;

  return (
    <div style={cardStyle}>
      <div style={cardHeaderStyle}>ZONE COUNT</div>
      <div style={mainBox}>
        <div style={totalHeader}>Zones:</div>
        <div style={totalRow}>
          <span style={totalNum}>{completed}</span>
          <span style={{ fontSize:'1.01rem', color:'#b0b79f', marginRight:1 }}>/</span>
          <span style={totalOut}>{total}</span>
          <span style={percentText}>{percent}% Complete</span>
        </div>
        <div style={progressBarWrap}><div style={progressBar(percent)} /></div>
      </div>
    </div>
  );
}
