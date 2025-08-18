// ============================================================
// Mater Asssemblies DB Components/FlowcrossesTable.jsx
// Flowcrosses: amber theme • Filters outside • 4-line clockwise row orbit @ 3150ms
// Debounced orbit measurement • Hover micro-animations • Health gauge
// ============================================================

import { QRCodeCanvas } from 'qrcode.react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// ==============================
// THEME — Flowcrosses (warm amber)
// ==============================
const FLO_BG_EVEN   = '#17120d';
const FLO_BG_ODD    = '#120e0a';
const FLO_SHEEN     = 'linear-gradient(180deg, rgba(214,155,92,0.06), rgba(0,0,0,0))';
const FLO_STRIPE    = '#a86a3a';
const FLO_HEADER_BG = '#130f0b';
const FLO_TEXT_MAIN = '#f3eadd';
const FLO_TEXT_SOFT = '#e0cdb6';
const ORBIT_COLOR   = '#c6894f';

// ======================================
// GLOBAL KEYFRAMES + ORBIT CSS (clockwise line segments @ 3150ms)
// ======================================
const KF_ID = '__ma_db_kf_flow_orbit_lines__';
if (typeof document !== 'undefined' && !document.getElementById(KF_ID)) {
  const style = document.createElement('style');
  style.id = KF_ID;
  style.textContent = `
    @keyframes pillPulse { 0% { filter: drop-shadow(0 0 0 rgba(95,224,139,0)); } 50% { filter: drop-shadow(0 0 6px rgba(95,224,139,.55)); } 100% { filter: drop-shadow(0 0 0 rgba(95,224,139,0)); } }
    @keyframes pillBreath { 0% { opacity:.85 } 50% { opacity:.6 } 100% { opacity:.85 } }
    @keyframes textGloss { 0% { background-position:-120% 50% } 100% { background-position:220% 50% } }
    @keyframes maOrbitCW { to { offset-distance: 100%; } }

    .flo-orbitLayer {
      position: absolute;
      pointer-events: none;
      z-index: 40;
      border-radius: 6px;
      box-shadow: inset 0 0 0 1px rgba(198,137,79,0.30), 0 4px 14px rgba(198,137,79,0.12);
    }
    .flo-orbitLayer .seg {
      position: absolute;
      width: 18px;
      height: 2px;
      background: ${ORBIT_COLOR};
      border-radius: 1px;
      filter: drop-shadow(0 0 4px rgba(198,137,79,0.35));
      offset-path: inset(2px 2px 2px 2px round 6px);
      offset-rotate: auto;
      animation: maOrbitCW 3150ms linear infinite;
    }
    .flo-orbitLayer .seg:nth-child(1){ animation-delay: 0ms; }
    .flo-orbitLayer .seg:nth-child(2){ animation-delay: -787ms; }
    .flo-orbitLayer .seg:nth-child(3){ animation-delay: -1575ms; }
    .flo-orbitLayer .seg:nth-child(4){ animation-delay: -2362ms; }
  `;
  document.head.appendChild(style);
}

// ==============================
// SHARED STYLES
// ==============================
const tableStyle = { width:'100%', borderCollapse:'separate', borderSpacing:0, fontSize:'0.64rem', tableLayout:'fixed' };
const thStyle = {
  padding:'4px 6px', lineHeight:'1rem', textAlign:'left', color:FLO_TEXT_SOFT, fontWeight:700, letterSpacing:'0.05em',
  background:FLO_HEADER_BG, position:'sticky', top:0, zIndex:2, boxShadow:'0 2px 0 rgba(0,0,0,0.6)', fontFamily:'Font-cornero, sans-serif'
};
const tdBase = {
  padding:'2px 3px', textAlign:'left', verticalAlign:'middle', height:26, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
  fontFamily:'Font-erbaum, Erbaum, sans-serif', backgroundImage:FLO_SHEEN,
  transition:'background-color 140ms ease, box-shadow 140ms ease, transform 120ms ease'
};
const assemblyCell = { ...tdBase, fontSize:'0.78rem', letterSpacing:'0.02em', fontWeight:700, padding:'2px 6px 2px 10px', position:'relative' };
const assemblyBtn = { background:'transparent', border:'none', color:FLO_TEXT_MAIN, cursor:'pointer', width:'100%', textAlign:'left', font:'inherit', padding:0 };

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
      <circle cx={size/2} cy={size/2} r={r} stroke="#2a221a" strokeWidth="3" fill="none" />
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
    width:'100%', appearance:'none', background:'rgba(27,20,13,.65)', color:FLO_TEXT_MAIN, border:'none',
    outline:'none', borderRadius:8, padding:'8px 10px', fontSize:'0.76rem', fontFamily:'Font-erbaum, Erbaum, sans-serif',
    letterSpacing:'0.02em', boxShadow:'inset 0 0 0 0 rgba(0,0,0,0)', transition:'box-shadow 140ms ease'
  };
  const label = { fontFamily:'Font-cornero, sans-serif', letterSpacing:'0.06em', fontSize:'0.66rem', color:FLO_TEXT_SOFT, marginBottom:4, opacity:.85 };
  const cell = { display:'flex', flexDirection:'column' };
  return (
    <div style={wrap}>
      <div style={cell}>
        <span style={label}>Status</span>
        <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)} style={input}
          onFocus={(e)=>e.currentTarget.style.boxShadow='0 0 0 3px rgba(198,137,79,.35) inset'}
          onBlur={(e)=>e.currentTarget.style.boxShadow='inset 0 0 0 0 rgba(0,0,0,0)'} >
          <option value="ALL">All Statuses</option><option value="ACTIVE">Active</option>
          <option value="IN-ACTIVE">In-Active</option><option value="OFFLINE">Offline</option><option value="TORN DOWN">Torn Down</option>
        </select>
      </div>
      <div style={cell}>
        <span style={label}>Health</span>
        <select value={healthFilter} onChange={(e)=>setHealthFilter(e.target.value)} style={input}
          onFocus={(e)=>e.currentTarget.style.boxShadow='0 0 0 3px rgba(198,137,79,.35) inset'}
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
export default function FlowcrossesTable(props){
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
    <div ref={wrapRef} style={{ position:'relative', overflowY:'auto', overflowX:'hidden', flex:1, minHeight:0 }}>
      <FiltersBar statusFilter={statusFilter} setStatusFilter={setStatusFilter} healthFilter={healthFilter} setHealthFilter={setHealthFilter} />
      <TableBody {...props} type="Flowcrosses" statusFilter={statusFilter} healthFilter={healthFilter} onSelectedRowEl={onSelectedRowEl} />
      {orbitRect && (
        <div className="flo-orbitLayer" style={{ left: orbitRect.left, top: orbitRect.top, width: orbitRect.width, height: orbitRect.height }}>
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

  const rowRefSetter = useCallback((isSel) => (el) => { if (isSel && el) onSelectedRowEl(el); }, [onSelectedRowEl]);

  return (
    <table style={tableStyle}>
      <colgroup>
        <col style={{ width:'38%' }} /><col style={{ width:'24%' }} /><col style={{ width:'18%' }} /><col style={{ width:'20%' }} />
      </colgroup>

      <thead>
        <tr>
          <th style={thStyle}>Assembly</th>
          <th style={thStyle}>Status</th>
          <th style={thStyle}>Health</th>
          <th style={thStyle}>Location</th>
        </tr>
      </thead>

      <tbody>
        {filteredNames.map((name, idx) => {
          const rowsAll = byAssembly.get(name) || [];
          const location = mode(rowsAll.map(r => r.location));
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

          const rowBg = idx % 2 === 0 ? FLO_BG_EVEN : FLO_BG_ODD;
          const baseShadow = isHover ? 'inset 0 0 0 1px rgba(255,255,255,0.05), 0 6px 10px rgba(0,0,0,.28)' : 'inset 0 0 0 1px rgba(255,255,255,0.03)';
          const rowStyle = {
            background: rowBg,
            transform: isSelected ? 'scale(1.015)' : (isHover ? 'translateY(-0.25px)' : 'none'),
            transformOrigin: 'center',
            transition: 'transform 160ms ease, box-shadow 140ms ease, background-color 140ms ease',
            boxShadow: baseShadow,
          };

          const fancyText = {
            color: FLO_TEXT_MAIN,
            textShadow: ['0.5px 0.5px 0 #0e0b08','0 1px 0 #0e0b08','0 -1px 0 rgba(255,255,255,0.03)','0 0 6px rgba(198,137,79,.10)'].join(','),
            backgroundImage: isHover ? 'linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(222,173,115,.45) 30%, rgba(255,255,255,0) 60%)' : 'none',
            backgroundClip: isHover ? 'text' : 'initial', WebkitBackgroundClip: isHover ? 'text' : 'initial',
            animation: isHover ? 'textGloss 900ms linear 1' : 'none',
          };

          const cellInner = isHover ? 'inset 0 0 20px rgba(198,137,79,.10), inset 0 0 0 1px rgba(255,255,255,.06)' : 'inset 0 0 0 1px rgba(255,255,255,.04)';

          return (
            <tr key={name} ref={rowRefSetter(isSelected)}
                onMouseEnter={() => setHoverKey(`${type}:${name}`)} onMouseLeave={() => setHoverKey(null)}
                style={rowStyle}>
              <td style={{ ...assemblyCell, boxShadow: cellInner }}>
                <span style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:`linear-gradient(180deg, ${FLO_STRIPE}, ${FLO_STRIPE}44)` }} />
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ opacity:.55, fontSize:'0.66rem', minWidth:22, textAlign:'right', color:FLO_TEXT_SOFT }}>{idx + 1}.</span>
                  <button onClick={() => { setSelected({ type, name, rows: rowsAll }); onView(type, name); }} style={{ ...assemblyBtn }} title="Open details">
                    <span style={fancyText}>{name}</span>
                  </button>
                  <span aria-hidden style={{ marginLeft:'auto', opacity:(isHover||isSelected)?0.9:0, transition:'opacity 120ms',
                    fontFamily:'Font-cornero, sans-serif', letterSpacing:'0.06em', color:FLO_TEXT_SOFT }}>➤</span>
                </div>

                {isHover ? <PopCard name={name} status={pill.label} creation={creation} recert={recert} pct={pct} /> : null}
              </td>

              <td style={{ ...tdBase, boxShadow: cellInner }}>
                <span style={chip(pill.bg, pill.fg, pill.anim)}>{pill.label}</span>
              </td>
              <td style={{ ...tdBase, boxShadow: cellInner }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <Gauge pct={pct} /><span style={{ fontWeight:800, letterSpacing:'.04em', color:FLO_TEXT_SOFT }}>{pct}%</span>
                </div>
              </td>
              <td style={{ ...tdBase, boxShadow: cellInner }}>
                <span style={{ chip:'#141414', color:'#e0d7cc' }}>{location || '—'}</span>
              </td>
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
    <div style={{ position:'absolute', right:-6, top:'100%', transform:'translate(100%, 6px)', background:'#120e0b',
                  border:'1px solid #3a2a1e', boxShadow:'0 10px 24px rgba(0,0,0,.45)', borderRadius:10, padding:10, zIndex:40, width:260 }}>
      <div style={{ display:'grid', gridTemplateColumns:'70px 1fr', gap:10, alignItems:'center' }}>
        <div style={{ display:'grid', placeItems:'center' }}><QRCodeCanvas value={name} size={64} includeMargin /></div>
        <div style={{ display:'grid', gap:4 }}>
          <div style={{ fontFamily:'Font-cornero, sans-serif', letterSpacing:'.08em', fontWeight:800, color:'#f3eadd' }}>{name}</div>
          <div style={{ fontSize:12, color:'#e0cdb6', display:'flex', gap:8, alignItems:'center' }}>
            <span style={{ padding:'2px 6px', border:'1px solid #3a2a1e', borderRadius:6 }}>{status}</span>
          </div>
          <div style={{ display:'grid', gap:2, fontSize:11, color:'#e0cdb6' }}>
            <div><strong style={{ color:'#d9c2a7' }}>Creation:</strong> {fmt(creation)}</div>
            <div><strong style={{ color:'#d9c2a7' }}>Service Due:</strong> {fmt(recert)}</div>
          </div>
          <div style={{ marginTop:4 }}><HealthBar pct={pct} /></div>
        </div>
      </div>
    </div>
  );
}
function HealthBar({ pct=0 }) {
  const color = pct<70 ? '#5fe08b' : pct<90 ? '#ffe066' : '#ff6a6a';
  return <div style={{ background:'#140f0b', border:'1px solid #3a2a1e', borderRadius:6, height:10, overflow:'hidden' }}>
    <div style={{ width:`${pct}%`, height:'100%', background:color, transition:'width 200ms linear' }} />
  </div>;
}
