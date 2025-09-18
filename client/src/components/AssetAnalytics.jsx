// ==============================
// ASSET ANALYTICS — IMPORTS
// ==============================
import { useEffect, useMemo, useRef, useState } from 'react';

// ==============================
// ASSET ANALYTICS — THEME
// ==============================
const THEME = {
  bgAppOverlay: 'linear-gradient(rgba(5,6,4,.72), rgba(5,6,4,.72))',
  bgHeader: 'rgba(10,11,9,.92)',
  bgCard: 'rgba(10,12,9,.96)',
  bgWell: '#0c0f0b',
  border: '#2e362a',
  grid: '#2b3227',
  text: '#f0f2ea',
  textDim: '#cfd6c0',
  textLow: '#9eaa90',
  accentSpool: '#69e07a',
  accentValve: '#b28dff',
  ringTrack: '#121510',
  ringGlow: 'drop-shadow(0 0 10px rgba(105,224,122,.35))',
  ringGlowValve: 'drop-shadow(0 0 10px rgba(178,141,255,.35))',
  success: '#69e07a',
  danger: '#e07a5f',
  neutral: '#b0b79f',
  modelFilter: 'saturate(1.35) contrast(1.25) brightness(1.02)'
};

// ==============================
// ASSET ANALYTICS — HELPERS
// ==============================
function pct(n, d) {
  const dn = typeof d === 'number' && d > 0 ? d : 0;
  if (dn === 0) return 0;
  const x = Math.round((Math.max(0, Number(n) || 0) / dn) * 100);
  return x > 100 ? 100 : x;
}
function norm(s) { return (s || '').toString().toLowerCase(); }
function fmtFeet(x) { return Math.round((Number(x) || 0)).toLocaleString('en-US'); }
function sanitizeKey(k) { return String(k || '').trim().toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,''); }
function onlyDigits(s){ const m=String(s||'').match(/(\d+)/g); return m?m.join(''):''; }
function normalizePPC(s){ const d=onlyDigits(s); return d.replace(/^0+/,'') || (d? '0':''); }
function parseMaybeDate(v){ const t=Date.parse(v); return Number.isFinite(t)?t:0; }
function hexToLin(hex){ const h=hex.replace('#',''); const r=parseInt(h.slice(0,2),16)/255; const g=parseInt(h.slice(2,4),16)/255; const b=parseInt(h.slice(4,6),16)/255; return [r,g,b]; }

// ==============================
// ASSET ANALYTICS — CSV LOADER
// ==============================
const VALVE_MFV_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTVHS7FlbKTZtslOKoa6x8GsTW02jqRttmMgArSkJ2AzLr3jyxF9lR0YXb4zMoJZ-yl6__OLVuAFYW3/pub?output=csv';
const VALVE_OEM_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRFbz1FlLmX9w-sJMhtsnyRQ5DaLXuiWaw9nEJ7nRfV1CZUIBxEKk9UTurxIhaLq7491cAXWYoEfyS1/pub?output=csv';

function parseCSV(text){
  const rows=[]; let cur='',row=[],q=false;
  for(let i=0;i<text.length;i++){ const c=text[i];
    if(c==='"'){ if(q&&text[i+1]==='"'){cur+='"';i++;} else q=!q; }
    else if(c===','&&!q){ row.push(cur); cur=''; }
    else if((c==='\n'||c==='\r')&&!q){ if(cur.length||row.length){row.push(cur);rows.push(row);row=[];cur='';} if(c==='\r'&&text[i+1]==='\n') i++; }
    else cur+=c;
  }
  if(cur.length||row.length){ row.push(cur); rows.push(row); }
  if(!rows.length) return [];
  const header=rows[0].map(h=>h.trim()); const keys=header.map(sanitizeKey);
  const out=[]; for(let r=1;r<rows.length;r++){ const cols=rows[r]; if(!cols||!cols.length) continue;
    const obj={}; for(let c=0;c<keys.length;c++) obj[keys[c]]=(cols[c]??'').toString().trim(); out.push(obj);
  }
  return out;
}

// ==============================
// COLUMN CHART — FIXED SIZE + FULLSCREEN
// ==============================
function ColumnChart({ title, series, categories, accent = THEME.accentSpool, unit = 'ft', onFullscreen }) {
  const width = 920, height = 280;
  const padL = 56, padR = 24, padT = 28, padB = 42;

  const maxVal = Math.max(1, ...series);
  const colW = (width - padL - padR) / series.length;
  const bars = series.map((v, i) => {
    const x = padL + i * colW + 12;
    const h = Math.round(((height - padT - padB) * v) / maxVal);
    const y = height - padB - h;
    const w = Math.max(18, colW - 24);
    return { x, y, w, h, v };
  });

  return (
    <div style={{ border:`1px solid ${THEME.border}`, background:THEME.bgCard, borderRadius:8, width:'fit-content', position:'relative' }}>
      <div style={{ padding:10, borderBottom:`1px solid ${THEME.grid}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontSize:18, fontWeight:800, color:THEME.text, letterSpacing:'.12em' }}>{title}</div>
        <button onClick={onFullscreen} title='Fullscreen' style={{ background:'transparent', border:`1px solid ${THEME.border}`, color:THEME.textLow, padding:'4px 8px', fontSize:11, borderRadius:4, cursor:'pointer' }}>FULL</button>
      </div>
      <div style={{ padding:10 }}>
        <svg width={width} height={height} style={{ display:'block' }}>
          <defs>
            <linearGradient id='barGrad' x1='0' x2='0' y1='0' y2='1'>
              <stop offset='0%' stopColor={accent} stopOpacity='1.0' />
              <stop offset='100%' stopColor={accent} stopOpacity='0.65' />
            </linearGradient>
          </defs>
          <rect x='0' y='0' width={width} height={height} fill='transparent' />
          {[0,0.25,0.5,0.75,1].map((p,i)=>{ const y=padT+(height-padT-padB)*p; return <line key={i} x1={padL} y1={y} x2={width-padR} y2={y} stroke={THEME.grid} strokeWidth='1' />; })}
          {bars.map((b,i)=>(
            <g key={i}>
              <rect x={b.x} y={b.y} width={b.w} height={b.h} fill='url(#barGrad)' stroke={accent} strokeOpacity='0.6'>
                <title>{categories[i]}: {b.v.toLocaleString('en-US')} {unit}</title>
              </rect>
              <text x={b.x+b.w/2} y={b.y-8} textAnchor='middle' style={{ fill:THEME.text, fontSize:18, fontWeight:900 }}>{b.v.toLocaleString('en-US')} {unit}</text>
              <text x={b.x+b.w/2} y={height-padB+18} textAnchor='middle' style={{ fill:THEME.textLow, fontSize:11 }}>{categories[i]}</text>
            </g>
          ))}
          <text x={10} y={18} style={{ fill:THEME.textLow, fontSize:11 }}>Max: {maxVal.toLocaleString('en-US')} {unit}</text>
        </svg>
      </div>
    </div>
  );
}

// ==============================
// MODEL-VIEWER LOADER (ONCE)
// ==============================
function useModelViewerReady(){
  const [ready, setReady] = useState(!!window?.customElements?.get?.('model-viewer'));
  useEffect(()=>{
    if (window?.customElements?.get?.('model-viewer')) { setReady(true); return; }
    const s=document.createElement('script');
    s.type='module';
    s.src='https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
    s.onload=()=>setReady(true);
    document.head.appendChild(s);
  },[]);
  return ready;
}

// ==============================
// RING CHART — % MFV  (with true material tint)
// ==============================
function RingChart({ title, percent, accent = THEME.accentSpool, modelSrc, glow = THEME.ringGlow, tint = '#67d87a', boost = 1.35 }) {
  const ready = useModelViewerReady();
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const handleLoad = () => {
      const mv = el;
      const model = mv.model;
      if (!model || !model.materials) return;
      const [tr, tg, tb] = hexToLin(tint);
      model.materials.forEach(m => {
        const pbr = m.pbrMetallicRoughness || {};
        const f = Array.isArray(pbr.baseColorFactor) ? pbr.baseColorFactor.slice() : [1,1,1,1];
        const a = f[3] ?? 1;
        pbr.baseColorFactor = [
          Math.min(1, (f[0] ?? 1) * tr * boost),
          Math.min(1, (f[1] ?? 1) * tg * boost),
          Math.min(1, (f[2] ?? 1) * tb * boost),
          a
        ];
        if ('metallicFactor' in pbr) pbr.metallicFactor = 0.2;
        if ('roughnessFactor' in pbr) pbr.roughnessFactor = 0.35;
        m.pbrMetallicRoughness = pbr;
      });
      mv.requestRender();
    };
    el.addEventListener('load', handleLoad);
    return () => el.removeEventListener('load', handleLoad);
  }, [tint, boost]);

  const size = 190;
  const innerBox = 110;
  const stroke = 20;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, Math.round(percent || 0)));
  const offset = c * (1 - clamped / 100);

  return (
    <div style={{ border:`1px solid ${THEME.border}`, background:THEME.bgCard, borderRadius:10, padding:10, display:'flex', alignItems:'center', gap:14, width:'fit-content' }}>
      <div style={{ position:'relative', width:size, height:size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform:'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill='none' stroke={THEME.ringTrack} strokeWidth={stroke} />
          <circle
            cx={size/2} cy={size/2} r={r} fill='none' stroke={accent} strokeWidth={stroke}
            strokeDasharray={`${c} ${c}`} strokeDashoffset={offset} strokeLinecap='round'
            style={{ filter: glow }}
          />
        </svg>

        {modelSrc && (
          <div style={{ position:'absolute', left:'50%', top:'50%', width:innerBox, height:innerBox, transform:'translate(-50%, -50%)', pointerEvents:'auto' }}>
            {ready ? (
              <model-viewer
                ref={ref}
                src={modelSrc}
                autoplay
                auto-rotate
                rotation-per-second='25deg'
                camera-controls
                disable-zoom
                interaction-prompt='none'
                tone-mapping='neutral'
                exposure='1.25'
                shadow-intensity='0.5'
                shadow-softness='0.9'
                environment-image='neutral'
                style={{ width:'100%', height:'100%', background:'transparent', filter: THEME.modelFilter }}
              />
            ) : (
              <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:THEME.textLow, fontSize:12 }}>Loading…</div>
            )}
          </div>
        )}
      </div>

      <div>
        <div style={{ fontSize:18, color:THEME.textLow, letterSpacing:'.12em', marginBottom:6 }}>{title}</div>
        <div style={{ fontSize:34, fontWeight:900, color:THEME.text, lineHeight:1 }}>{clamped}%</div>
        <div style={{ fontSize:11, color:THEME.textDim, marginTop:4 }}>MFV share</div>
      </div>
    </div>
  );
}

// ==============================
// TREND BADGE — DELTA vs LAST VISIT
// ==============================
function useTrends(valuesMap, ns='NEST_ANALYTICS'){
  const [deltas, setDeltas] = useState({});
  useEffect(()=>{
    const prevRaw = localStorage.getItem(ns);
    const prev = prevRaw ? JSON.parse(prevRaw) : {};
    const next = {};
    for(const k of Object.keys(valuesMap)){
      const cur = Math.round(Number(valuesMap[k]) || 0);
      const old = Math.round(Number(prev[k]) || 0);
      next[k] = { cur, old, delta: cur - old };
    }
    setDeltas(next);
    localStorage.setItem(ns, JSON.stringify(Object.fromEntries(Object.entries(next).map(([k,v])=>[k, v.cur]))));
  }, [JSON.stringify(valuesMap), ns]);
  return deltas;
}
function TrendBadge({ delta, unit='' }){
  const up = delta>0, down = delta<0;
  const color = up ? THEME.success : down ? THEME.danger : THEME.neutral;
  const arrow = up ? '▲' : down ? '▼' : '■';
  const txt = `${up?'+':''}${delta.toLocaleString('en-US')}${unit?` ${unit}`:''}`;
  return (
    <span style={{ marginLeft:8, fontSize:11, color, border:`1px solid ${color}40`, padding:'2px 6px', borderRadius:10 }}>
      {arrow} {txt}
    </span>
  );
}

// ==============================
// SECTION (ANIMATED EXPAND/COLLAPSE + WIDE)
// ==============================
function Section({
  id,
  title,
  accent = THEME.accentSpool,
  children,
  dense = false,
  collapsed = false,
  expanded = false,
  onToggleCollapse = ()=>{},
  onToggleExpand = ()=>{}
}){
  const bodyRef = useRef(null);
  const [h, setH] = useState('auto');
  const [ready, setReady] = useState(false);

  useEffect(()=>{
    const el = bodyRef.current;
    if(!el) return;
    const measure = () => setH(collapsed ? 0 : el.scrollHeight);
    measure();
    let ro;
    if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
      ro = new window.ResizeObserver(measure);
      ro.observe(el);
    } else if (typeof window !== 'undefined') {
      window.addEventListener('resize', measure);
    }
    setReady(true);
    return () => {
      if (ro) {
        ro.disconnect();
      } else if (typeof window !== 'undefined') {
        window.removeEventListener('resize', measure);
      }
    };
  }, [collapsed, children]);

  const cardStyle = {
    border:`1px solid ${THEME.border}`,
    background:THEME.bgCard,
    borderRadius:10,
    padding: dense?10:12,
    gridColumn: expanded ? '1 / -1' : 'auto',
    transition: 'transform 220ms ease, box-shadow 220ms ease, grid-column 220ms ease',
    transform: collapsed ? 'scale(0.99)' : 'scale(1)',
    boxShadow: collapsed ? '0 0 0 rgba(0,0,0,0)' : '0 8px 28px rgba(0,0,0,.25)'
  };

  const bodyStyle = {
    overflow: 'hidden',
    height: typeof h === 'number' ? `${h}px` : h,
    opacity: collapsed ? 0 : 1,
    transform: collapsed ? 'translateY(-6px)' : 'translateY(0)',
    transition: ready ? 'height 300ms ease, opacity 220ms ease, transform 220ms ease' : 'none'
  };

  return (
    <div style={cardStyle}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingBottom:8, marginBottom:10, borderBottom:`1px solid ${THEME.grid}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:6, height:24, background:accent, borderRadius:3 }} />
          <div style={{ fontSize:16, fontWeight:900, color:THEME.text, letterSpacing:'.16em' }}>{title}</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button
            onClick={()=>onToggleExpand(id)}
            style={{ background:'transparent', border:`1px solid ${THEME.border}`, color:THEME.textLow, padding:'4px 8px', fontSize:11, borderRadius:4, cursor:'pointer' }}
            title={expanded ? 'Shrink width' : 'Expand to full row'}
          >
            {expanded ? 'SHRINK' : 'WIDE'}
          </button>
          <button
            onClick={()=>onToggleCollapse(id)}
            style={{ background:'transparent', border:`1px solid ${THEME.border}`, color:THEME.textLow, padding:'4px 8px', fontSize:11, borderRadius:4, cursor:'pointer' }}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? 'EXPAND' : 'COLLAPSE'}
          </button>
        </div>
      </div>
      <div ref={bodyRef} style={bodyStyle}>
        {children}
      </div>
    </div>
  );
}

// ==============================
// ASSET ANALYTICS — MAIN PANEL
// ==============================
export default function AssetAnalytics({ assets = [] }) {
  const safeAssets = Array.isArray(assets) ? assets : [];

  const [mfvRows, setMfvRows] = useState([]);
  const [oemRows, setOemRows] = useState([]);
  const [dense, setDense] = useState(true);
  const [full, setFull] = useState(null);

  const [collapsed, setCollapsed] = useState({});
  const [expanded, setExpanded] = useState({});

  const toggleCollapse = (id) => setCollapsed(s => ({ ...s, [id]: !s[id] }));
  const toggleExpand = (id) => setExpanded(s => ({ ...s, [id]: !s[id] }));

  useEffect(()=>{ let alive=true;
    fetch(VALVE_MFV_CSV_URL, { cache:'no-store' }).then(r=>r.ok?r.text():'').then(t=>t?parseCSV(t):[])
      .then(rows=>{ if(alive) setMfvRows(rows); }).catch(()=>{ if(alive) setMfvRows([]); });
    return ()=>{ alive=false; };
  },[]);
  useEffect(()=>{ let alive=true;
    fetch(VALVE_OEM_CSV_URL, { cache:'no-store' }).then(r=>r.ok?r.text():'').then(t=>t?parseCSV(t):[])
      .then(rows=>{ if(alive) setOemRows(rows); }).catch(()=>{ if(alive) setOemRows([]); });
    return ()=>{ alive=false; };
  },[]);

  const stats = useMemo(()=>{
    const spoolInches = { '7-1/16 15K':0, '5-1/8 15K':0, '3-1/16 15K':0, '4-1/16 15K':0 };
    for(const a of safeAssets){
      const name = a.name || ''; const nl = norm(name);
      if(!nl.includes('spool spacer')) continue;
      const parts = name.split('|').map(s=>s.trim());
      const sizeSeg = parts[1] || '';
      const sizeKey = sizeSeg.match(/7-1\/16 15K|5-1\/8 15K|3-1\/16 15K|4-1\/16 15K/i)?.[0] || '';
      const lenRaw = parts[2] || '';
      const inches = Number(String(lenRaw).match(/(\d+)/)?.[1] || '0');
      if(sizeKey){ const key = sizeKey.replace(/ {2,}/g,' ').replace(/15k/i,'15K'); spoolInches[key]=(spoolInches[key]||0)+inches; }
    }

    const mfvCols = Object.keys((mfvRows[0]||{}));
    const mfvP = mfvCols.find(k=>/ppc/.test(k)) || 'ppc';
    const mfvQ = mfvCols.find(k=>k.includes('qualified')) || mfvCols.find(k=>k.includes('valve_is_qualified')) || 'valve_is_qualified_as_an';
    const mfvT = mfvCols.find(k=>k.includes('timestamp')||k.includes('date')||k.includes('updated')) || 'timestamp';
    const latestMfv=new Map();
    for(const row of mfvRows){
      const p=normalizePPC(row[mfvP]); if(!p) continue;
      const q=(row[mfvQ]||'').toString().trim().toUpperCase(); if(q!=='MFV') continue;
      const ts=parseMaybeDate(row[mfvT]); const prev=latestMfv.get(p); if(!prev||ts>=prev.ts) latestMfv.set(p,{ts});
    }

    const oemCols = Object.keys((oemRows[0]||{}));
    const oemP = oemCols.find(k=>/ppc/.test(k)) || 'ppc';
    const oemT = oemCols.find(k=>k.includes('timestamp')||k.includes('date')||k.includes('updated')) || 'timestamp';
    const latestOem=new Map();
    for(const row of oemRows){
      const p=normalizePPC(row[oemP]); if(!p) continue;
      const ts=parseMaybeDate(row[oemT]); const prev=latestOem.get(p); if(!prev||ts>=prev.ts) latestOem.set(p,{ts});
    }

    const finalQual=new Map();
    for(const [p,{ts}] of latestOem.entries()) finalQual.set(p,{qual:'OEM',ts});
    for(const [p,{ts}] of latestMfv.entries()){ const prev=finalQual.get(p); if(!prev||ts>prev.ts) finalQual.set(p,{qual:'MFV',ts}); }

    const rx7=/(7[\s-]?1\/16)\s*15\s*[kK]/, rx5=/(5[\s-]?1\/8)\s*15\s*[kK]/;
    let v7_mfv=0,v7_oem=0,v5_mfv=0,v5_oem=0; const seen7=new Set(), seen5=new Set();
    for(const a of safeAssets){
      const name=a.name||''; const label=String(name).toUpperCase();
      const is7=rx7.test(label), is5=rx5.test(label); if(!is7&&!is5) continue;
      const p=normalizePPC(a.id); if(!p) continue; const fq=finalQual.get(p); if(!fq) continue;
      if(is7&&!seen7.has(p)){ if(fq.qual==='MFV') v7_mfv++; else v7_oem++; seen7.add(p); }
      if(is5&&!seen5.has(p)){ if(fq.qual==='MFV') v5_mfv++; else v5_oem++; seen5.add(p); }
    }
    const v7_total=v7_mfv+v7_oem, v5_total=v5_mfv+v5_oem;

    return {
      spoolFeet:{
        '5-1/8 15K': spoolInches['5-1/8 15K']/12,
        '7-1/16 15K': spoolInches['7-1/16 15K']/12,
        '3-1/16 15K': spoolInches['3-1/16 15K']/12,
        '4-1/16 15K': spoolInches['4-1/16 15K']/12
      },
      valves:{
        '7-1/16 15K': { MFV:v7_mfv, OEM:v7_oem, PCT_MFV:pct(v7_mfv, v7_total) },
        '5-1/8 15K' : { MFV:v5_mfv, OEM:v5_oem, PCT_MFV:pct(v5_mfv, v5_total) }
      }
    };
  }, [safeAssets, mfvRows, oemRows]);

  const sizes = ['5-1/8 15K','7-1/16 15K','3-1/16 15K','4-1/16 15K'];
  const feet = sizes.map(k=>Math.round(stats.spoolFeet[k]||0));

  const valveCats = ['7-1/16 MFV','7-1/16 OEM','5-1/8 MFV','5-1/8 OEM'];
  const valveSeries = [
    stats.valves['7-1/16 15K']?.MFV||0, stats.valves['7-1/16 15K']?.OEM||0,
    stats.valves['5-1/8 15K']?.MFV||0, stats.valves['5-1/8 15K']?.OEM||0
  ];
  const pct7 = stats.valves['7-1/16 15K']?.PCT_MFV||0;
  const pct5 = stats.valves['5-1/8 15K']?.PCT_MFV||0;

  const trends = useTrends({
    ft_5: Math.round(stats.spoolFeet['5-1/8 15K']||0),
    ft_7: Math.round(stats.spoolFeet['7-1/16 15K']||0),
    ft_3: Math.round(stats.spoolFeet['3-1/16 15K']||0),
    ft_4: Math.round(stats.spoolFeet['4-1/16 15K']||0),
    v_7_mfv: stats.valves['7-1/16 15K']?.MFV||0,
    v_7_oem: stats.valves['7-1/16 15K']?.OEM||0,
    v_5_mfv: stats.valves['5-1/8 15K']?.MFV||0,
    v_5_oem: stats.valves['5-1/8 15K']?.OEM||0
  });

  const bgStyle = {
    width:'100%', height:'100%', display:'flex', flexDirection:'column', position:'relative', background:'transparent'
  };
  const contentStyle = { position:'relative', zIndex:1 };
  const gap = 10;
  const pad = 10;

  return (
    <div style={bgStyle}>
      <div style={{ padding:'12px 14px', borderBottom:`1px solid ${THEME.border}`, background:THEME.bgHeader, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'baseline', gap:12 }}>
          <div style={{ fontSize:18, fontWeight:900, letterSpacing:'.14em', color:THEME.text }}>Analytics</div>
          <div style={{ fontSize:14, color:THEME.textDim, letterSpacing:'.08em' }}>Spooling & Valves</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={()=>setDense(d=>!d)} style={{ background:'transparent', border:`1px solid ${THEME.border}`, color:THEME.textLow, padding:'6px 10px', fontSize:11, borderRadius:4, cursor:'pointer' }}>
            COMPACT
          </button>
        </div>
      </div>

      <div style={{ ...contentStyle, flex:1, overflow:'auto', padding: pad }}>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap, alignItems:'start' }}>
          <Section
            id='spool'
            title='SPOOLING — TOTAL FEET BY SIZE'
            accent={THEME.accentSpool}
            dense
            collapsed={!!collapsed['spool']}
            expanded={!!expanded['spool']}
            onToggleCollapse={toggleCollapse}
            onToggleExpand={toggleExpand}
          >
            <div style={{ display:'flex', justifyContent:'center' }}>
              <ColumnChart
                title='SPOOLING — TOTAL FEET BY SIZE'
                series={feet}
                categories={sizes}
                accent={THEME.accentSpool}
                unit='ft'
                onFullscreen={()=>setFull('spool')}
              />
            </div>
          </Section>

          <Section
            id='valveCounts'
            title='VALVES — MFV VS OEM (COUNTS)'
            accent={THEME.accentValve}
            dense
            collapsed={!!collapsed['valveCounts']}
            expanded={!!expanded['valveCounts']}
            onToggleCollapse={toggleCollapse}
            onToggleExpand={toggleExpand}
          >
            <div style={{ display:'flex', justifyContent:'center' }}>
              <ColumnChart
                title='VALVES — MFV vs OEM (Counts)'
                series={valveSeries}
                categories={valveCats}
                accent={THEME.accentValve}
                unit='valves'
                onFullscreen={()=>setFull('valve')}
              />
            </div>
          </Section>
        </div>

        <div style={{ marginTop: gap }}>
          <Section
            id='metrics'
            title='KEY METRICS — 8 UP'
            accent={THEME.accentSpool}
            dense
            collapsed={!!collapsed['metrics']}
            expanded={!!expanded['metrics']}
            onToggleCollapse={toggleCollapse}
            onToggleExpand={toggleExpand}
          >
            <div style={{ display:'grid', gridTemplateColumns:'repeat(8, minmax(120px, 1fr))', gap }}>
              {[
                ['TOTAL FT — 5-1/8 15K', fmtFeet(stats.spoolFeet['5-1/8 15K'])+' ft', trends.ft_5?.delta, 'ft'],
                ['TOTAL FT — 7-1/16 15K', fmtFeet(stats.spoolFeet['7-1/16 15K'])+' ft', trends.ft_7?.delta, 'ft'],
                ['TOTAL FT — 3-1/16 15K', fmtFeet(stats.spoolFeet['3-1/16 15K'])+' ft', trends.ft_3?.delta, 'ft'],
                ['TOTAL FT — 4-1/16 15K', fmtFeet(stats.spoolFeet['4-1/16 15K'])+' ft', trends.ft_4?.delta, 'ft'],
                ['7-1/16 15K — MFV', (stats.valves['7-1/16 15K']?.MFV||0).toLocaleString('en-US'), trends.v_7_mfv?.delta, ''],
                ['7-1/16 15K — OEM', (stats.valves['7-1/16 15K']?.OEM||0).toLocaleString('en-US'), trends.v_7_oem?.delta, ''],
                ['5-1/8 15K — MFV', (stats.valves['5-1/8 15K']?.MFV||0).toLocaleString('en-US'), trends.v_5_mfv?.delta, ''],
                ['5-1/8 15K — OEM', (stats.valves['5-1/8 15K']?.OEM||0).toLocaleString('en-US'), trends.v_5_oem?.delta, ''],
              ].map(([label, value, delta, unit])=>(
                <div key={label} style={{ border:`1px solid ${THEME.border}`, background:THEME.bgCard, borderRadius:8, padding: pad }}>
                  <div style={{ fontSize:10, color:THEME.textLow, letterSpacing:'.12em' }}>{label}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <div style={{ fontSize:22, fontWeight:900, color:THEME.text }}>{value}</div>
                    {typeof delta==='number' && <TrendBadge delta={delta} unit={unit} />}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div style={{ marginTop: gap, display:'grid', gridTemplateColumns:'repeat(2, minmax(360px, 1fr))', gap }}>
          <Section
            id='mfv7'
            title='VALVES — MFV SHARE (7-1/16)'
            accent={THEME.accentSpool}
            dense
            collapsed={!!collapsed['mfv7']}
            expanded={!!expanded['mfv7']}
            onToggleCollapse={toggleCollapse}
            onToggleExpand={toggleExpand}
          >
            <div style={{ display:'flex', gap, alignItems:'stretch', flexWrap:'wrap' }}>
              <RingChart
                title='% 7-1/16 MFV'
                percent={pct7}
                accent={THEME.accentSpool}
                glow={THEME.ringGlow}
                modelSrc='/assets/Asset%202.gltf'
                tint='#6adf7a'
                boost={1.55}
              />
              <div style={{ minWidth:220, border:`1px solid ${THEME.border}`, background:THEME.bgCard, borderRadius:8, padding: pad }}>
                <div style={{ fontSize:11, color:THEME.textLow, letterSpacing:'.12em' }}>7-1/16 — MFV vs OEM</div>
                <div style={{ height:16, background:THEME.bgWell, borderRadius:8, marginTop:8, overflow:'hidden', border:`1px solid ${THEME.grid}` }}>
                  <div style={{ width:`${pct7}%`, height:'100%', background:THEME.accentSpool }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', color:THEME.textDim, fontSize:11, marginTop:6 }}>
                  <span>MFV {(stats.valves['7-1/16 15K']?.MFV||0).toLocaleString('en-US')}</span>
                  <span>OEM {(stats.valves['7-1/16 15K']?.OEM||0).toLocaleString('en-US')}</span>
                </div>
              </div>
            </div>
          </Section>

          <Section
            id='mfv5'
            title='VALVES — MFV SHARE (5-1/8)'
            accent={THEME.accentValve}
            dense
            collapsed={!!collapsed['mfv5']}
            expanded={!!expanded['mfv5']}
            onToggleCollapse={toggleCollapse}
            onToggleExpand={toggleExpand}
          >
            <div style={{ display:'flex', gap, alignItems:'center', flexWrap:'wrap' }}>
              <RingChart
                title='% 5-1/8 MFV'
                percent={pct5}
                accent={THEME.accentValve}
                glow={THEME.ringGlowValve}
              />
              <div style={{ minWidth:220, border:`1px solid ${THEME.border}`, background:THEME.bgCard, borderRadius:8, padding: pad }}>
                <div style={{ fontSize:11, color:THEME.textLow, letterSpacing:'.12em' }}>5-1/8 — MFV vs OEM</div>
                <div style={{ height:16, background:THEME.bgWell, borderRadius:8, marginTop:8, overflow:'hidden', border:`1px solid ${THEME.grid}` }}>
                  <div style={{ width:`${pct5}%`, height:'100%', background:THEME.accentValve }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', color:THEME.textDim, fontSize:11, marginTop:6 }}>
                  <span>MFV {(stats.valves['5-1/8 15K']?.MFV||0).toLocaleString('en-US')}</span>
                  <span>OEM {(stats.valves['5-1/8 15K']?.OEM||0).toLocaleString('en-US')}</span>
                </div>
              </div>
            </div>
          </Section>
        </div>
      </div>

      {full && (
        <div onClick={()=>setFull(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.85)', zIndex:99, display:'flex', alignItems:'center', justifyContent:'center', cursor:'zoom-out' }}>
          {full==='spool' && (
            <ColumnChart title='SPOOLING — TOTAL FEET BY SIZE' series={feet} categories={sizes} accent={THEME.accentSpool} unit='ft' onFullscreen={()=>setFull(null)} />
          )}
          {full==='valve' && (
            <ColumnChart title='VALVES — MFV vs OEM (Counts)' series={valveSeries} categories={valveCats} accent={THEME.accentValve} unit='valves' onFullscreen={()=>setFull(null)} />
          )}
        </div>
      )}
    </div>
  );
}


