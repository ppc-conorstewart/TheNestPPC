// ==============================
// Master Assemblies DB Components / ViewAssemblyPanel.jsx
// ==============================

import { useEffect, useMemo, useRef, useState } from 'react';
import masterDogboneImg from '../../../assets/Master Assemblies/MasterDogbone.png';
import masterZipperImg from '../../../assets/Master Assemblies/MasterZipper.png';
// import GasketMaintenancePanel from '../Master Assemblies Hub Components/GasketMaintenancePanel'; // (kept intentionally commented to avoid unused-import breaks)
import { tableType } from '../Support Files/maKit';
import { STATUS_COLORS } from '../Support Files/maShared';

// ==============================
// Theme
// ==============================
const palomaGreen = '#6a7257';
const cardBorder  = '1px solid #6a7257';
const headerBg    = '#10110f';

// ==============================
// Component
// ==============================
export default function ViewAssemblyPanel({ assembly = null }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const heroSrc = useMemo(() => getHeroSrc(assembly?.type), [assembly?.type]);

  const [localAssets, setLocalAssets] = useState(Array.isArray(assembly?.assets) ? assembly.assets : []);
  useEffect(() => { setLocalAssets(Array.isArray(assembly?.assets) ? assembly.assets : []); }, [assembly?.assets]);

  const [openAssets, setOpenAssets] = useState(true);
  const [openGaskets, setOpenGaskets] = useState(true);
  const [openGasketMaint, setOpenGasketMaint] = useState(false);

  const assetsRef = useRef(null);
  const gasketsRef = useRef(null);
  const gasketMaintRef = useRef(null);

  const [assetsMaxH, setAssetsMaxH] = useState('9999px');
  const [gasketsMaxH, setGasketsMaxH] = useState('9999px');
  const [gasketMaintMaxH, setGasketMaintMaxH] = useState('0px');

  useEffect(() => {
    const h = assetsRef.current ? `${assetsRef.current.scrollHeight}px` : '0px';
    setAssetsMaxH(openAssets ? h : '0px');
  }, [openAssets, localAssets]);

  useEffect(() => {
    const h = gasketsRef.current ? `${gasketsRef.current.scrollHeight}px` : '0px';
    setGasketsMaxH(openGaskets ? h : '0px');
  }, [openGaskets, assembly?.gaskets]);

  useEffect(() => {
    const h = gasketMaintRef.current ? `${gasketMaintRef.current.scrollHeight}px` : '0px';
    setGasketMaintMaxH(openGasketMaint ? h : '0px');
  }, [openGasketMaint, assembly?.gaskets, assembly?.name, assembly?.type]);

  const creationTip = useMemo(() => buildDateTooltip(assembly?.creation_date, 'Creation Date'), [assembly?.creation_date]);
  const recertTip   = useMemo(() => buildDateTooltip(assembly?.recert_date, 'Re-Cert Date'), [assembly?.recert_date]);
  const [showCTip, setShowCTip] = useState(false);
  const [showRTip, setShowRTip] = useState(false);

  // Inject keyframes once (shared by MetaHeader too)
  useEffect(() => {
    const id = '__paloma_status_glow_keyframes__';
    if (typeof document !== 'undefined' && !document.getElementById(id)) {
      const style = document.createElement('style');
      style.id = id;
      style.textContent = `
        @keyframes va-slide-in { from { opacity:.0; transform: translateX(12px); } to { opacity:1; transform: translateX(0); } }
        @keyframes hero-appear { from { opacity:.0; transform: scale(0.98); } to { opacity:1; transform: scale(1); } }
        @keyframes glowPulse {
          0%   { box-shadow: 0 0 0 0 rgba(var(--pulse), .30); }
          70%  { box-shadow: 0 0 14px 7px rgba(var(--pulse), .08); }
          100% { box-shadow: 0 0 0 0 rgba(var(--pulse), 0); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Build gasket maintenance data from assembly.gaskets
  const gasketMaintData = useMemo(() => {
    const list = Array.isArray(assembly?.gaskets) ? assembly.gaskets : [];
    const labels = list.map(g => g?.name || '').slice(0, 6);
    const state = {};
    let hasLCS = false, hasSS = false;

    list.slice(0, 6).forEach(g => {
      const slot = g?.name || '';
      const id   = g?.id || '';
      const date = g?.meta || '';
      state[slot] = id;
      state[`${slot}__date`] = date;

      const idUp = String(id).toUpperCase();
      if (idUp.includes('LCS')) hasLCS = true;
      if (idUp.includes('SS'))  hasSS  = true;
    });

    let profile = '—';
    if (labels.length > 0) {
      if (hasLCS && !hasSS) profile = 'LCS';
      else if (hasSS && !hasLCS) profile = 'SS';
      else if (hasLCS && hasSS) profile = 'Mixed';
      else profile = 'Mixed';
    }

    return { labels, state, profile };
  }, [assembly?.gaskets]);

  return (
    <div
      style={{
        display:'flex',
        flexDirection:'column',
        height:'100%',
        minHeight:0,
        overflow:'hidden',
        background:'#000',
        border:cardBorder,
        animation: mounted ? 'va-slide-in 340ms cubic-bezier(.16,1,.3,1)' : 'none'
      }}
    >
      {/* ============================== */}
      {/* Header */}
      {/* ============================== */}
      <div style={{ background:headerBg, color:'#fff', borderBottom:cardBorder, position:'sticky', top:0, zIndex:2 }}>
        <div style={titleHeader}>
          <div style={titleTextCenter}>
            {assembly ? `${assembly?.type} — ${assembly?.name}` : 'Select an assembly to view details.'}
          </div>
          <div style={actionRow}>
            <button onClick={assembly?.onModifyStatus} style={iconBtn} disabled={!assembly}>⚙️</button>
            <button onClick={assembly?.onExportPDF} style={iconBtn} disabled={!assembly}>🧾</button>
          </div>
        </div>

        {heroSrc ? (
          <div style={heroWrap}>
            <img src={heroSrc} alt="assembly" style={{ ...heroImg, animation:'hero-appear 260ms ease-out' }} />
          </div>
        ) : null}

        <div style={statusHeroRow}>
          <span style={statusLabel}>Status:</span>
          <StatusTag value={assembly?.status} xl animated />
        </div>

        <div style={compactMetaRow}>
          <div
            style={{ position:'relative', display:'flex', alignItems:'center', gap:6 }}
            onMouseEnter={() => setShowCTip(true)}
            onMouseLeave={() => setShowCTip(false)}
          >
            <MetaItem label="Creation Date" value={fmt(assembly?.creation_date)} />
            {showCTip && creationTip && <Tip text={creationTip} />}
          </div>

          <div
            style={{ position:'relative', display:'flex', alignItems:'center', gap:6 }}
            onMouseEnter={() => setShowRTip(true)}
            onMouseLeave={() => setShowRTip(false)}
          >
            <MetaItem label="Re-Cert Date" value={fmt(assembly?.recert_date)} />
            {showRTip && recertTip && <Tip text={recertTip} />}
          </div>
        </div>
      </div>

      {/* ============================== */}
      {/* Body */}
      {/* ============================== */}
      <div style={{ flex:'1 1 auto', minHeight:0, overflowY:'auto', overflowX:'hidden', padding:'8px' }}>
        {/* Assets Used */}
        <div style={{ border:cardBorder, background:'#0b0c09', minHeight:0, marginBottom:8 }}>
          <div
            style={{ ...subHeader, cursor:'pointer', userSelect:'none' }}
            onClick={() => setOpenAssets(v => !v)}
            aria-expanded={openAssets}
          >
            Assets Used {openAssets ? '▾' : '▸'}
          </div>
          <div
            ref={assetsRef}
            style={{
              overflow:'hidden',
              minWidth:0,
              transition:'max-height 320ms cubic-bezier(.16,1,.3,1), opacity 220ms ease',
              maxHeight: assetsMaxH,
              opacity: openAssets ? 1 : 0.0
            }}
          >
            <table style={miniTable}>
              <colgroup>
                <col style={{ width:'28%' }} />
                <col style={{ width:'22%' }} />
                <col style={{ width:'50%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={tableType.thSmall}>Slot</th>
                  <th style={tableType.thSmall}>PPC #</th>
                  <th style={tableType.thSmall}>Name</th>
                </tr>
              </thead>
              <tbody>
                {(localAssets && localAssets.length)
                  ? localAssets.map((a, idx) => (
                      <tr key={idx} style={{ background: idx%2 ? '#0d0d0d' : '#161616' }}>
                        <td style={tableType.tdSmall} title={a?.meta || ''}>{a?.meta || '—'}</td>
                        <td style={tableType.tdSmall} title={a?.id || ''}>{a?.id || '—'}</td>
                        <td style={{ ...tableType.tdSmall, overflow:'hidden', textOverflow:'ellipsis' }} title={a?.name || ''}>
                          {a?.name || '—'}
                        </td>
                      </tr>
                    ))
                  : (<tr><td colSpan={3} style={tableType.tdSmall}>{assembly ? 'No assets assigned.' : '—'}</td></tr>)
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* Gaskets Used */}
        <div style={{ border:cardBorder, background:'#0b0c09', minHeight:0, marginBottom:8 }}>
          <div
            style={{ ...subHeader, cursor:'pointer', userSelect:'none' }}
            onClick={() => setOpenGaskets(v => !v)}
            aria-expanded={openGaskets}
          >
            Gaskets Used {openGaskets ? '▾' : '▸'}
          </div>
          <div
            ref={gasketsRef}
            style={{
              overflow:'hidden',
              minWidth:0,
              transition:'max-height 320ms cubic-bezier(.16,1,.3,1), opacity 220ms ease',
              maxHeight: gasketsMaxH,
              opacity: openGaskets ? 1 : 0.0
            }}
          >
            <table style={miniTable}>
              <thead>
                <tr>
                  <th style={tableType.thSmall}>Slot</th>
                  <th style={tableType.thSmall}>Gasket ID</th>
                  <th style={tableType.thSmall}>Date</th>
                </tr>
              </thead>
              <tbody>
                {(assembly?.gaskets && assembly.gaskets.length)
                  ? assembly.gaskets.map((g, idx) => (
                      <tr key={idx} style={{ background: idx%2 ? '#0d0d0d' : '#161616' }}>
                        <td style={tableType.tdSmall} title={g?.name || ''}>{g?.name || '—'}</td>
                        <td style={tableType.tdSmall} title={g?.id || ''}>{g?.id || '—'}</td>
                        <td style={tableType.tdSmall} title={fmt(g?.meta)}>{fmt(g?.meta)}</td>
                      </tr>
                    ))
                  : (<tr><td colSpan={3} style={tableType.tdSmall}>{assembly ? 'No gaskets set.' : '—'}</td></tr>)
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* Gasket Maintenance (compact rings only, rendered directly here) */}
        <div style={{ border:cardBorder, background:'#0b0c09', minHeight:0 }}>
          <div
            style={{ ...subHeader, cursor:'pointer', userSelect:'none' }}
            onClick={() => setOpenGasketMaint(v => !v)}
            aria-expanded={openGasketMaint}
          >
            Gasket Maintenance {openGasketMaint ? '▾' : '▸'}
          </div>

          <div
            ref={gasketMaintRef}
            style={{
              overflow:'hidden',
              minWidth:0,
              transition:'max-height 320ms cubic-bezier(.16,1,.3,1), opacity 220ms ease',
              maxHeight: gasketMaintMaxH,
              opacity: openGasketMaint ? 1 : 0.0
            }}
          >
            <div style={{ padding: 10 }}>
              {/* Profile label */}
              <div style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                marginBottom:6, gap:12, flexWrap:'wrap'
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 900, letterSpacing: '.12em',
                  color: '#9fa48b', textTransform:'uppercase'
                }}>
                  Gasket Profile: <span style={{ color:'#e6e8df' }}>{gasketMaintData.profile}</span>
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 800, color:'#c7cdb8',
                  letterSpacing:'.04em', textTransform:'uppercase', opacity:.9
                }}>
                  {(assembly?.type || '').toUpperCase()} — {assembly?.name || ''}
                </div>
              </div>

              {/* 2 × 3 grid — rings only */}
              <div style={{
                display:'grid',
                gridTemplateColumns:'repeat(3, minmax(120px, 1fr))',
                gridAutoRows:'minmax(120px, auto)',
                gap:10,
                minWidth:0
              }}>
                {gasketMaintData.labels.map((slot) => (
                  <RingOnlyCell
                    key={slot}
                    slot={slot}
                    gasketId={gasketMaintData.state[slot] || ''}
                    installedDate={gasketMaintData.state[`${slot}__date`] || ''}
                  />
                ))}
              </div>

              {/* Tip */}
              <div style={{ fontSize: 9, color: '#aab094', marginTop: 8, letterSpacing: '.05em' }}>
                Tip: refresh individual gaskets as they’re replaced; gauges reset on install date change.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==============================
// Subcomponents
// ==============================
function StatusTag({ value, mini=false, xl=false, animated=false }) {
  const { bg, border, fg, label, pulse } = statusPill(value);
  return (
    <span
      style={{
        ...pill(bg, border, fg, mini, xl),
        ...(animated ? { animation:'glowPulse 1800ms ease-in-out infinite', '--pulse': pulse } : null)
      }}
    >
      {label}
    </span>
  );
}

function MetaItem({ label, value }) {
  return (
    <div style={metaItem}>
      <span style={metaKey}>{label}:</span>
      <span style={metaVal}>{value}</span>
    </div>
  );
}

function Tip({ text }) {
  return <div style={tipBox}>{text}</div>;
}

// ==============================
// Gasket ring-only subcomponents (local to this panel)
// ==============================
function RingOnlyCell({ slot, gasketId, installedDate }) {
  const today = new Date().toISOString().slice(0, 10);
  const n = numberFromSlot(slot);

  const { percent, due } = (() => {
    const has = !!installedDate;
    const dueISO = has ? addMonthsISO(installedDate, 6) : '';
    const total = has ? Math.max(1, daysBetween(installedDate, dueISO)) : 1;
    const elapsed = has ? Math.max(0, Math.min(total, daysBetween(installedDate, today))) : 0;
    const pct = has ? elapsed / total : 0;
    return { percent: clamp01(pct), due: dueISO };
  })();

  return (
    <div
      style={{
        display:'grid',
        placeItems:'center',
        padding:10,
        background:'linear-gradient(180deg,#1a1f18,#151813)',
        border:'1px solid #2e342b',
      }}
      title={installedDate ? `Installed: ${installedDate} • Due: ${due}` : 'No install date'}
    >
      <Donut percent={percent} label={n} size={64} />
    </div>
  );
}

function Donut({ percent = 0, size = 42, label = '•' }) {
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = Math.PI * 2 * r;
  const dash = clamp01(percent) * c;
  const color = gaugeColor(percent);
  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} stroke="#222721" strokeWidth={stroke} fill="none" />
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
        style={{ transition:'stroke-dasharray 600ms ease, stroke 300ms ease' }}
      />
      <g>
        <circle cx={cx} cy={cy} r={11} fill="#70c12a" stroke="#0b2f16" strokeWidth="2" />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontWeight="900" fontSize="10" fill="#10110f">
          {label}
        </text>
      </g>
    </svg>
  );
}

// ==============================
// Styles
// ==============================
const titleHeader = {
  position:'relative',
  textAlign:'center',
  padding:'6px 10px 6px 10px',
  borderBottom: cardBorder,
};
const titleTextCenter = {
  fontWeight:600,
  letterSpacing:'0.12em',
  fontSize:'1.05rem',
  fontFamily:'Font-cornero, sans-serif',
};
const actionRow = {
  position:'absolute',
  right:10,
  top:6,
  display:'flex',
  alignItems:'center',
  gap:8,
};

const heroWrap = {
  display:'flex',
  alignItems:'center',
  justifyContent:'center',
  padding:'4px 0 2px 0',
};
const heroImg = {
  maxWidth:'420px',
  maxHeight:'120px',
  objectFit:'contain',
  display:'block',
};

const statusHeroRow = {
  display:'flex',
  alignItems:'center',
  justifyContent:'center',
  gap:10,
  padding:'4px 0 6px 0',
  background: headerBg,
  borderBottom: cardBorder,
};
const statusLabel = {
  color:'#9fa48b',
  fontFamily:'Font-cornero, sans-serif',
  fontWeight:400,
  fontSize:'0.8rem',
  letterSpacing:'0.06em',
  textTransform:'uppercase',
};

const iconBtn = {
  border:'1px solid #2c2f27',
  background:'#0e100c',
  color:'#e6e8df',
  width:28,
  height:28,
  display:'grid',
  placeItems:'center',
  borderRadius:6,
  cursor:'pointer',
  fontSize:'0.85rem'
};

const subHeader = {
  background:headerBg,
  color:'#fff',
  padding:'8px 10px',
  borderBottom: cardBorder,
  fontWeight: 300,
  letterSpacing:'0.02em',
  alignItems:'center',
  fontFamily:'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"',
  position:'sticky',
  top:0,
  zIndex:1,
  textAlign:'center',
  fontSize:'0.96rem',
};

const miniTable = {
  width:'100%',
  borderCollapse:'collapse',
  tableLayout:'fixed',
  boxSizing:'border-box',
};

const compactMetaRow = {
  borderTop: cardBorder,
  background:'#0b0c09',
  display:'flex',
  alignItems:'center',
  gap:12,
  padding:'6px 8px',
  whiteSpace:'normal',
  flexWrap:'wrap',
};

const metaItem = {
  display:'flex',
  alignItems:'center',
  gap:6,
  minWidth:0,
};

const metaKey = {
  color:'#9fa48b',
  fontFamily:'Font-cornero, sans-serif',
  fontWeight:500,
  fontSize:'0.72rem',
  letterSpacing:'0.04em',
  textTransform:'uppercase',
};

const metaVal = {
  color:'#e6e8df',
  fontFamily:'Font-erbaum, Erbaum, sans-serif',
  fontWeight:500,
  fontSize:'0.82rem',
};

const tipBox = {
  position:'absolute',
  top:'100%',
  left:0,
  marginTop:6,
  background:'#0e100c',
  color:'#e6e8df',
  border:'1px solid #2c2f27',
  borderRadius:6,
  padding:'6px 8px',
  fontSize:'0.76rem',
  fontFamily:'Font-erbaum, Erbaum, sans-serif',
  whiteSpace:'nowrap',
  boxShadow:'0 6px 16px rgba(0,0,0,.35)',
  zIndex: 5
};

// ==============================
// Helpers
// ==============================
function statusPill(val) {
  const s = (val || '').toLowerCase();

  // Colors mimic Master Assembly Hub: black pill, colored border/text, pulse = border color.
  const activeHex   = STATUS_COLORS.Active || '#9dff57';
  const offlineHex  = STATUS_COLORS.Offline || '#ffd24a';
  const inactiveHex = STATUS_COLORS.Inactive || '#ff6b6b';
  const tornHex     = STATUS_COLORS['Torn Down'] || '#ffa857';

  if (s === 'active') {
    return { bg:'#0a0a0a', border: activeHex, fg: activeHex, label:'ACTIVE',   pulse: hexToRgb(activeHex) };
  }
  if (s === 'offline') {
    return { bg:'#0a0a0a', border: offlineHex, fg: offlineHex, label:'OFFLINE',  pulse: hexToRgb(offlineHex) };
  }
  if (s === 'in-active' || s === 'inactive') {
    return { bg:'#0a0a0a', border: inactiveHex, fg: inactiveHex, label:'IN-ACTIVE', pulse: hexToRgb(inactiveHex) };
  }
  if (s === 'torn down' || s === 'torn-down') {
    return { bg:'#0a0a0a', border: tornHex, fg: tornHex, label:'TORN-DOWN', pulse: hexToRgb(tornHex) };
  }
  const def = '#bbbbbb';
  return { bg:'#0a0a0a', border:def, fg:'#dddddd', label:(val || '—').toString().toUpperCase(), pulse: hexToRgb(def) };
}

function pill(bg, border, fg, mini, xl) {
  return {
    display:'inline-block',
    padding: xl ? '6px 12px' : (mini ? '2px 6px' : '6px 10px'),
    borderRadius:8,
    background:bg,
    color:fg,
    fontSize: xl ? '0.92rem' : (mini ? '0.62rem' : '0.80rem'),
    fontWeight:900,
    letterSpacing:'0.16em',
    textTransform:'uppercase',
    border:`2px solid ${border}`,
    boxShadow:'inset 0 0 0 1px rgba(255,255,255,0.06)',
    fontFamily:'Font-erbaum, Erbaum, sans-serif',
  };
}

function fmt(s){ return s ? String(s).slice(0,10) : '—'; }

function getHeroSrc(type){
  const t = (type || '').toLowerCase();
  if (t === 'dogbones')   return masterDogboneImg;
  if (t === 'zippers')    return masterZipperImg;
  if (t === 'flowcrosses')return null;
  return null;
}

function buildDateTooltip(raw, label){
  if (!raw) return `${label}: —`;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return `${label}: ${String(raw)}`;
  const days = Math.floor((Date.now() - d.getTime()) / (1000*60*60*24));
  return `${label}: ${d.toLocaleString()}  •  ${days} day${days!==1?'s':''} since`;
}

function hexToRgb(hex){
  const h = hex.replace('#','');
  const r = parseInt(h.substring(0,2),16);
  const g = parseInt(h.substring(2,4),16);
  const b = parseInt(h.substring(4,6),16);
  return `${r},${g},${b}`;
}

// Local helpers for gasket rings
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
function numberFromSlot(slot = '') {
  const m = String(slot).trim().match(/^(\d+)\./);
  return m ? m[1] : '•';
}
