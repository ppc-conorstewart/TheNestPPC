// ============================================================
// Mater Asssemblies DB Components/ZippersTable.jsx
// Zippers: blue theme • Filters outside • 4-line clockwise row orbit
// Debounced orbit measurement • Hover micro-animations • Health gauge
// ============================================================

import { QRCodeCanvas } from 'qrcode.react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// ==============================
// THEME — Zippers (cool blue)
// ==============================
const ZIP_BG_EVEN   = '#0f141b';
const ZIP_BG_ODD    = '#0a1016';
const ZIP_SHEEN     = 'linear-gradient(180deg, rgba(123,162,210,0.06), rgba(0,0,0,0))';
const ZIP_STRIPE    = '#4f6faf';
const ZIP_HEADER_BG = '#0d1118';
const ZIP_TEXT_MAIN = '#e3e9f5';
const ZIP_TEXT_SOFT = '#c7d4ec';
const ORBIT_COLOR   = '#6e8dcc';

// ======================================
// GLOBAL KEYFRAMES + ORBIT CSS (clockwise lines)
// ======================================
const KF_ID = '__ma_db_kf_zippers_orbit_lines__';
if (typeof document !== 'undefined' && !document.getElementById(KF_ID)) {
  const style = document.createElement('style');
  style.id = KF_ID;
  style.textContent = `
    @keyframes pillPulse { 0% { filter: drop-shadow(0 0 0 rgba(95,224,139,0)); } 50% { filter: drop-shadow(0 0 6px rgba(95,224,139,.55)); } 100% { filter: drop-shadow(0 0 0 rgba(95,224,139,0)); } }
    @keyframes pillBreath { 0% { opacity:.85 } 50% { opacity:.6 } 100% { opacity:.85 } }
    @keyframes textGloss { 0% { background-position:-120% 50% } 100% { background-position:220% 50% } }
    @keyframes maOrbitCW { to { offset-distance: 100%; } }

    .zip-orbitLayer {
      position: absolute;
      pointer-events: none;
      z-index: 40;
      border-radius: 6px;
      box-shadow: inset 0 0 0 1px rgba(110,141,204,0.30), 0 4px 14px rgba(110,141,204,0.12);
    }
    .zip-orbitLayer .seg {
      position: absolute;
      width: 18px;
      height: 2px;
      background: ${ORBIT_COLOR};
      border-radius: 1px;
      filter: drop-shadow(0 0 4px rgba(110,141,204,0.35));
      offset-path: inset(2px 2px 2px 2px round 6px);
      offset-rotate: auto;
      animation: maOrbitCW 3150ms linear infinite;
    }
    .zip-orbitLayer .seg:nth-child(1){ animation-delay: 0ms; }
    .zip-orbitLayer .seg:nth-child(2){ animation-delay: -787ms; }
    .zip-orbitLayer .seg:nth-child(3){ animation-delay: -1575ms; }
    .zip-orbitLayer .seg:nth-child(4){ animation-delay: -2362ms; }
  `;
  document.head.appendChild(style);
}


// ==============================
// SHARED STYLES
// ==============================
const tableStyle = { width:'100%', borderCollapse:'separate', borderSpacing:0, fontSize:'0.64rem', tableLayout:'fixed' };
const thStyle = {
  padding:'4px 6px', lineHeight:'1rem', textAlign:'left', color:ZIP_TEXT_SOFT, fontWeight:700, letterSpacing:'0.05em',
  background:ZIP_HEADER_BG, position:'sticky', top:0, zIndex:2, boxShadow:'0 2px 0 rgba(0,0,0,0.6)', fontFamily:'Font-cornero, sans-serif'
};
const tdBase = {
  padding:'2px 3px', textAlign:'left', verticalAlign:'middle', height:26, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
  fontFamily:'Font-erbaum, Erbaum, sans-serif', backgroundImage:ZIP_SHEEN,
  transition:'background-color 140ms ease, box-shadow 140ms ease, transform 120ms ease'
};
const assemblyCell = { ...tdBase, fontSize:'0.78rem', letterSpacing:'0.02em', fontWeight:700, padding:'2px 6px 2px 10px', position:'relative' };
const assemblyBtn = { background:'transparent', border:'none', color:ZIP_TEXT_MAIN, cursor:'pointer', width:'100%', textAlign:'left', font:'inherit', padding:0 };

// ==============================
// STATUS PILL
// ==============================
const chip = (bg, fg, anim) => ({
  display:'inline-block', padding:'2px 6px', borderRadius:6, background:bg, color:fg, fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.02em',
  boxShadow:'inset 0 0 0 1px rgba(255,255,255,0.06)', fontFamily:'Font-erbaum, Erbaum, sans-serif', animation:anim || 'none'
});
function statusPill(val) {
  const s = (val || '').toLowerCase();
  if (s === 'active') return { bg:'#0d2c1a', fg:'#5fe08b', label:'ACTIVE', anim:'pillPulse 1800ms ease-in-out infinite' };
  if (s === 'in-active' || s === 'inactive') return { bg:'#3a1414', fg:'#ff6a6a', label:'IN-ACTIVE', anim:'pillBreath 2200ms ease-in-out infinite' };
  if (s === 'offline') return { bg:'#2e2b0f', fg:'#e9e174', label:'OFFLINE' };
  if (s === 'torn down' || s === 'torn-down') return { bg:'#3a1a2f', fg:'#ff7ad1', label:'TORN DOWN' };
  return { bg:'#1d1d1d', fg:'#cfcfcf', label:(val || '—').toString().toUpperCase() };
}

// ==============================
// HELPERS
// ==============================
function mode(arr){ const m=new Map(); for(const v of arr.filter(Boolean)) m.set(v,(m.get(v)||0)+1); let best=null,b=0; for(const [k,c] of m){ if(c>b){best=k;b=c;} } return best||'—'; }
function fmt(s){ return s ? String(s).slice(0,10) : '—'; }
function daysBetween(a,b){ const da=new Date(a), db=new Date(b); return Math.round((db-da)/86400000); }
function clamp(n,min,max){ return Math.max(min, Math.min(max, n)); }

// ==============================
// HEALTH GAUGE
// ==============================
function Gauge({ pct=0, size=18 }) {
  const r=(size-4)/2, c=2*Math.PI*r, cl=clamp(pct,0,100), dash=(cl/100)*c;
  const color = cl<70 ? '#5fe08b' : cl<90 ? '#ffe066' : '#ff6a6a';
  return (
    <svg width={size} height={size} style={{ display:'inline-block', verticalAlign:'middle' }} aria-label={`Service ${cl}%`}>
      <circle cx={size/2} cy={size/2} r={r} stroke="#222a36" strokeWidth="3" fill="none" />
      <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth="3" fill="none"
        strokeDasharray={`${dash} ${c-dash}`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} />
    </svg>
  );
}

// ============================================================
// FILTERS BAR (outside; full width; no borders)
// ============================================================
function FiltersBar({ statusFilter, setStatusFilter, healthFilter, setHealthFilter }) {
  const wrap = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, margin:'6px 0 8px 0', padding:0 };
  const input = {
    width:'100%', appearance:'none', background:'rgba(18,23,31,.65)', color:ZIP_TEXT_MAIN, border:'none',
    outline:'none', borderRadius:8, padding:'8px 10px', fontSize:'0.76rem', fontFamily:'Font-erbaum, Erbaum, sans-serif',
    letterSpacing:'0.02em', boxShadow:'inset 0 0 0 0 rgba(0,0,0,0)', transition:'box-shadow 140ms ease'
  };
  const label = { fontFamily:'Font-cornero, sans-serif', letterSpacing:'0.06em', fontSize:'0.66rem', color:ZIP_TEXT_SOFT, marginBottom:4, opacity:.85 };
  const cell = { display:'flex', flexDirection:'column' };
  return (
    <div style={wrap}>
      <div style={cell}>
        <span style={label}>Status</span>
        <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)} style={input}
          onFocus={(e)=>e.currentTarget.style.boxShadow='0 0 0 3px rgba(110,141,204,.35) inset'}
          onBlur={(e)=>e.currentTarget.style.boxShadow='inset 0 0 0 0 rgba(0,0,0,0)'} >
          <option value="ALL">All Statuses</option><option value="ACTIVE">Active</option>
          <option value="IN-ACTIVE">In-Active</option><option value="OFFLINE">Offline</option><option value="TORN DOWN">Torn Down</option>
        </select>
      </div>
      <div style={cell}>
        <span style={label}>Health</span>
        <select value={healthFilter} onChange={(e)=>setHealthFilter(e.target.value)} style={input}
          onFocus={(e)=>e.currentTarget.style.boxShadow='0 0 0 3px rgba(110,141,204,.35) inset'}
          onBlur={(e)=>e.currentTarget.style.boxShadow='inset 0 0 0 0 rgba(0,0,0,0)'} >
          <option value="ALL">All Health</option><option value="0-25">0–25%</option><option value="25-50">25–50%</option>
          <option value="50-75">50–75%</option><option value="75-100">75–100%</option>
        </select>
      </div>
    </div>
  );
}

// ============================================================
// MAIN — debounced orbit measurement
// ============================================================
export default function ZippersTable(props){
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [healthFilter, setHealthFilter] = useState('ALL');

  const wrapRef = useRef(null);
  const selectedElRef = useRef(null);
  const lastElRef = useRef(null);
  const lastRectRef = useRef(null);
  const rafRef = useRef(0);
  const [orbitRect, setOrbitRect] = useState(null);

  const updateOrbitRect = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const wrap = wrapRef.current;
      const el = selectedElRef.current;
      if (!wrap || !el) { setOrbitRect(null); lastRectRef.current = null; return; }
      const wr = wrap.getBoundingClientRect();
      const rr = el.getBoundingClientRect();
      const next = { left: rr.left - wr.left, top: rr.top - wr.top, width: rr.width, height: rr.height };
      const prev = lastRectRef.current;
      if (!prev || prev.left!==next.left || prev.top!==next.top || prev.width!==next.width || prev.height!==next.height) {
        lastRectRef.current = next; setOrbitRect(next);
      }
    });
  }, []);

  const onSelectedRowEl = useCallback((el) => {
    if (el && el !== lastElRef.current) {
      lastElRef.current = el; selectedElRef.current = el; updateOrbitRect();
    }
  }, [updateOrbitRect]);

  useEffect(() => {
    const handle = () => updateOrbitRect();
    window.addEventListener('resize', handle);
    const wrap = wrapRef.current;
    if (wrap) wrap.addEventListener('scroll', handle, { passive: true });
    return () => { window.removeEventListener('resize', handle); if (wrap) wrap.removeEventListener('scroll', handle); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [updateOrbitRect]);

  return (
    <div ref={wrapRef} style={{ position:'relative', overflowY: 'auto', overflowX: 'hidden', flex: 1, minHeight: 0 }}>
      <FiltersBar statusFilter={statusFilter} setStatusFilter={setStatusFilter} healthFilter={healthFilter} setHealthFilter={setHealthFilter} />
      <TableBody {...props} type="Zippers" statusFilter={statusFilter} healthFilter={healthFilter} onSelectedRowEl={onSelectedRowEl} />
      {orbitRect && (
        <div className="zip-orbitLayer" style={{ left: orbitRect.left, top: orbitRect.top, width: orbitRect.width, height: orbitRect.height }}>
          <span className="seg" /><span className="seg" /><span className="seg" /><span className="seg" />
        </div>
      )}
    </div>
  );
}

// ============================================================
// TABLE BODY
// ============================================================
function TableBody({
  type,
  names = [],
  byAssembly = new Map(),
  metaMap = {},
  localStatus = {},
  selected = null,
  setSelected = () => {},
  hoverKey = null,
  setHoverKey = () => {},
  onView = () => {},
  statusFilter = 'ALL',
  healthFilter = 'ALL',
  onSelectedRowEl = () => {},
}) {
  const rangeOk = (pct) => {
    if (healthFilter === 'ALL') return true;
    if (healthFilter === '0-25')   return pct >= 0  && pct < 25;
    if (healthFilter === '25-50')  return pct >= 25 && pct < 50;
    if (healthFilter === '50-75')  return pct >= 50 && pct < 75;
    if (healthFilter === '75-100') return pct >= 75 && pct <= 100;
    return true;
  };

  const filteredNames = useMemo(() => {
    return names.filter((name) => {
      const metaStatus = (metaMap[name]?.status || '').trim();
      const chosenStatus = (metaStatus || localStatus[name] || 'In-Active').trim();
      const statusUpper = chosenStatus.toUpperCase();
      const statusPass = statusFilter === 'ALL' || statusUpper === statusFilter;
      if (!statusPass) return false;

      const creation = metaMap[name]?.creation_date || '';
      const recert   = metaMap[name]?.recert_date || '';
      const totalDays = creation && recert ? Math.max(1, daysBetween(creation, recert)) : 0;
      const usedDays  = creation ? clamp(daysBetween(creation, new Date().toISOString().slice(0,10)), 0, totalDays || 1) : 0;
      const pct       = totalDays ? clamp(Math.round((usedDays / totalDays) * 100), 0, 100) : 0;

      return rangeOk(pct);
    });
  }, [names, metaMap, localStatus, statusFilter, healthFilter]);

  const cellRefSetter = useCallback((isSel) => (el) => { if (isSel && el) onSelectedRowEl(el); }, [onSelectedRowEl]);

  const emptyCellStyle = useMemo(() => ({
    ...tdBase,
    background: 'transparent',
    boxShadow: 'none',
    border: 'none',
    height: 30,
  }), []);

  const pairs = useMemo(() => {
    const out = [];
    for (let i = 0; i < filteredNames.length; i += 2) {
      out.push([filteredNames[i], filteredNames[i + 1] || null]);
    }
    return out;
  }, [filteredNames]);

  const renderBlock = (name, idx, keyPrefix) => {
    if (!name) {
      return [
        <td key={`${keyPrefix}-assembly-empty`} style={emptyCellStyle} />,
        <td key={`${keyPrefix}-status-empty`} style={emptyCellStyle} />,
        <td key={`${keyPrefix}-health-empty`} style={emptyCellStyle} />,
      ];
    }

    const rowsAll = byAssembly.get(name) || [];
    const metaStatus = (metaMap[name]?.status || '').trim();
    const chosenStatus = (metaStatus || localStatus[name] || 'In-Active').trim();
    const pill = statusPill(chosenStatus);
    const isSelected = selected && selected.type === type && selected.name === name;
    const isHover = hoverKey === `${type}:${name}`;

    const creation = metaMap[name]?.creation_date || '';
    const recert   = metaMap[name]?.recert_date || '';
    const totalDays = creation && recert ? Math.max(1, daysBetween(creation, recert)) : 0;
    const usedDays  = creation ? clamp(daysBetween(creation, new Date().toISOString().slice(0,10)), 0, totalDays || 1) : 0;
    const pct       = totalDays ? clamp(Math.round((usedDays / totalDays) * 100), 0, 100) : 0;

    const rowBg = idx % 2 === 0 ? ZIP_BG_EVEN : ZIP_BG_ODD;

    const fancyText = {
      color: ZIP_TEXT_MAIN,
      textShadow: ['0.5px 0.5px 0 #09111a','0 1px 0 #09111a','0 -1px 0 rgba(255,255,255,0.03)','0 0 6px rgba(110,141,204,.10)'].join(','),
      backgroundImage: isHover ? 'linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(180,202,238,.45) 30%, rgba(255,255,255,0) 60%)' : 'none',
      backgroundClip: isHover ? 'text' : 'initial',
      WebkitBackgroundClip: isHover ? 'text' : 'initial',
      animation: isHover ? 'textGloss 900ms linear 1' : 'none',
    };

    const cellInner = isHover ? 'inset 0 0 20px rgba(110,141,204,.10), inset 0 0 0 1px rgba(255,255,255,.06)' : 'inset 0 0 0 1px rgba(255,255,255,.04)';
    const transformStyle = isSelected ? 'scale(1.015)' : (isHover ? 'translateY(-0.25px)' : 'none');

    const assemblyTdStyle = {
      ...assemblyCell,
      boxShadow: cellInner,
      background: rowBg,
      transform: transformStyle,
      transition: 'transform 160ms ease, box-shadow 140ms ease, background-color 140ms ease',
    };

    const statusTdStyle = {
      ...tdBase,
      boxShadow: cellInner,
      background: rowBg,
      transform: transformStyle,
      transition: 'transform 160ms ease, box-shadow 140ms ease, background-color 140ms ease',
    };

    const healthTdStyle = {
      ...tdBase,
      boxShadow: cellInner,
      background: rowBg,
      transform: transformStyle,
      transition: 'transform 160ms ease, box-shadow 140ms ease, background-color 140ms ease',
    };

    return [
      <td
        key={`${keyPrefix}-assembly`}
        ref={cellRefSetter(isSelected)}
        onMouseEnter={() => setHoverKey(`${type}:${name}`)}
        onMouseLeave={() => setHoverKey(null)}
        style={assemblyTdStyle}
      >
        <span style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:`linear-gradient(180deg, ${ZIP_STRIPE}, ${ZIP_STRIPE}44)` }} />
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ opacity:.55, fontSize:'0.66rem', minWidth:22, textAlign:'right', color:ZIP_TEXT_SOFT }}>{idx + 1}.</span>
          <button
            onClick={() => { setSelected({ type, name, rows: rowsAll }); onView(type, name); }}
            style={{ ...assemblyBtn }}
            title="Open details"
          >
            <span style={fancyText}>{name}</span>
          </button>
          <span
            aria-hidden
            style={{ marginLeft:'auto', opacity:(isHover||isSelected)?0.9:0, transition:'opacity 120ms',
              fontFamily:'Font-cornero, sans-serif', letterSpacing:'0.06em', color:ZIP_TEXT_SOFT }}
          >
            ➤
          </span>
        </div>

        {isHover ? <PopCard name={name} status={pill.label} creation={creation} recert={recert} pct={pct} /> : null}
      </td>,
      <td key={`${keyPrefix}-status`} style={statusTdStyle}>
        <span style={chip(pill.bg, pill.fg, pill.anim)}>{pill.label}</span>
      </td>,
      <td key={`${keyPrefix}-health`} style={healthTdStyle}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <Gauge pct={pct} /><span style={{ fontWeight:800, letterSpacing:'.04em', color:ZIP_TEXT_SOFT }}>{pct}%</span>
        </div>
      </td>,
    ];
  };

  return (
    <table style={tableStyle}>
      <colgroup>
        <col style={{ width:'26%' }} /><col style={{ width:'12%' }} /><col style={{ width:'12%' }} />
        <col style={{ width:'26%' }} /><col style={{ width:'12%' }} /><col style={{ width:'12%' }} />
      </colgroup>

      <thead>
        <tr>
          <th style={thStyle}>Assembly</th>
          <th style={thStyle}>Status</th>
          <th style={thStyle}>Health</th>
          <th style={thStyle}>Assembly</th>
          <th style={thStyle}>Status</th>
          <th style={thStyle}>Health</th>
        </tr>
      </thead>

      <tbody>
        {pairs.map((pair, pairIdx) => {
          const leftCells = renderBlock(pair[0], pairIdx * 2, `left-${pairIdx}-${pair[0] || 'empty'}`);
          const rightCells = renderBlock(pair[1], pairIdx * 2 + 1, `right-${pairIdx}-${pair[1] || 'empty'}`);
          return (
            <tr key={`row-${pairIdx}`}>
              {leftCells}
              {rightCells}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ============================================================
// HOVER POP CARD
// ============================================================
function PopCard({ name, status, creation, recert, pct }) {
  return (
    <div style={{ position:'absolute', right:-6, top:'100%', transform:'translate(100%, 6px)', background:'#0f1217',
                  border:'1px solid #1c2a44', boxShadow:'0 10px 24px rgba(0,0,0,.45)', borderRadius:10, padding:10, zIndex:40, width:260 }}>
      <div style={{ display:'grid', gridTemplateColumns:'70px 1fr', gap:10, alignItems:'center' }}>
        <div style={{ display:'grid', placeItems:'center' }}><QRCodeCanvas value={name} size={64} includeMargin /></div>
        <div style={{ display:'grid', gap:4 }}>
          <div style={{ fontFamily:'Font-cornero, sans-serif', letterSpacing:'.08em', fontWeight:800, color:'#e6ebf7' }}>{name}</div>
          <div style={{ fontSize:12, color:'#c7d4ec', display:'flex', gap:8, alignItems:'center' }}>
            <span style={{ padding:'2px 6px', border:'1px solid #27406a', borderRadius:6 }}>{status}</span>
          </div>
          <div style={{ display:'grid', gap:2, fontSize:11, color:'#c7d4ec' }}>
            <div><strong style={{ color:'#b8c7e6' }}>Creation:</strong> {fmt(creation)}</div>
            <div><strong style={{ color:'#b8c7e6' }}>Service Due:</strong> {fmt(recert)}</div>
          </div>
          <div style={{ marginTop:4 }}><HealthBar pct={pct} /></div>
        </div>
      </div>
    </div>
  );
}
function HealthBar({ pct=0 }) {
  const color = pct<70 ? '#5fe08b' : pct<90 ? '#ffe066' : '#ff6a6a';
  return <div style={{ background:'#0d1219', border:'1px solid #1c2a44', borderRadius:6, height:10, overflow:'hidden' }}>
    <div style={{ width:`${pct}%`, height:'100%', background:color, transition:'width 200ms linear' }} />
  </div>;
}
