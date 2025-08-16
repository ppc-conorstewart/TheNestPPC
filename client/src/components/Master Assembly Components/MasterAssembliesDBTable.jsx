// ==============================
// src/components/Master Assembly Components/MasterAssembliesDBTable.jsx
// Master DB view — branding header (animated Paloma logo, two-line title),
// ring+legend clustered at far right, stable counters; four columns below.
// ==============================

import { useEffect, useMemo, useRef, useState } from 'react';
import { API } from '../../api';

import DogbonesTable from './Mater Asssemblies DB Components/DogbonesTable';
import FlowcrossesTable from './Mater Asssemblies DB Components/FlowcrossesTable';
import ViewAssemblyPanel from './Mater Asssemblies DB Components/ViewAssemblyPanel';
import ZippersTable from './Mater Asssemblies DB Components/ZippersTable';

const cardBorder = '1px solid #6a7257';
const headerBg = '#10110f';
const palomaGreen = '#6a7257';
const textMain = '#e6e8df';

const palomaIcon = '/assets/Paloma_Icon_White_large.png';

const range = (n) => Array.from({ length: n }, (_, i) => i + 1);
const mode = (arr) => {
  const m = new Map();
  for (const v of arr.filter(Boolean)) m.set(v, (m.get(v) || 0) + 1);
  let best = null, bestC = 0;
  for (const [k, c] of m) if (c > bestC) { best = k; bestC = c; }
  return best || '—';
};
const toTitle = (s) => s.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
const fmtDate = (s) => (s ? String(s).slice(0, 10) : '—');
const numToLetter = (n) => String.fromCharCode('A'.charCodeAt(0) + (n - 1));
const tryLetterVariant = (name) => {
  const m = /(Dogbone|Zipper|Flowcross)-(\d+)$/i.exec(name || '');
  if (!m) return null;
  const base = m[1][0].toUpperCase() + m[1].slice(1).toLowerCase();
  const n = parseInt(m[2], 10);
  if (!Number.isFinite(n) || n < 1) return null;
  return base === 'Zipper'
    ? `Zipper - ${numToLetter(n)}`
    : `${base}-${numToLetter(n)}`;
};
const typeToAssemblyTitle = (type) => {
  switch ((type || '').toLowerCase()) {
    case 'dogbones': return 'Dog Bones';
    case 'zippers': return 'Zippers';
    case 'flowcrosses': return 'Flowcrosses';
    default: return '';
  }
};

// ==============================
// Assignments / Assets Join
// ==============================
function useAssignments() {
  const [rows, setRows] = useState([]);
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const fetchAssignments = async () => {
          const urls = [`${API}/api/master/assignments?all=1`, `${API}/api/master/assignments/all`];
          for (const u of urls) {
            const r = await fetch(u, { credentials: 'include' });
            if (r.ok) return r.json();
          }
          return [];
        };
        const [assignments, assetsRes] = await Promise.all([
          fetchAssignments(),
          fetch(`${API}/api/assets`, { credentials: 'include' }),
        ]);
        const assetsJson = assetsRes.ok ? await assetsRes.json() : [];
        if (!alive) return;
        setRows(assignments || []);
        setAssets(Array.isArray(assetsJson) ? assetsJson : []);
      } catch { /* noop */ }
    })();
    return () => { alive = false; };
  }, []);

  const assetMap = useMemo(() => {
    const m = new Map();
    for (const a of assets) {
      const id = (a.ppc || a.PPC || a.id || '').toString().trim();
      if (id) m.set(id, a);
    }
    return m;
  }, [assets]);

  const joined = useMemo(() => {
    return rows
      .map((r) => {
        const a = assetMap.get(r.asset_id || '') || {};
        const rawStatus = (a.status || a.Status || '').toString().trim();
        let status = rawStatus;
        const m = /^MA-MI-(\d+)$/i.exec(rawStatus);
        if (m) status = `MA (MI-${m[1]})`;
        return {
          ppc: r.asset_id || '',
          sn: a.serial || a.Serial || '',
          name: a.name || a.Name || '',
          category: a.category || a.Category || '',
          location: a.location || a.Location || '',
          status,
          assembly: r.child || '',
          slot: r.slot || '',
          updatedBy: r.updated_by || '',
          updatedAt: r.updated_at || null,
        };
      })
      .sort((a, b) => {
        const ta = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const tb = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return tb - ta;
      });
  }, [rows, assetMap]);

  return { joined };
}

// ==============================
// Master Meta
// ==============================
function useMasterMeta(groups) {
  const [metaMap, setMetaMap] = useState({});

  useEffect(() => {
    let alive = true;
    (async () => {
      const next = {};
      for (const [type, names] of Object.entries(groups)) {
        const assemblyTitle = typeToAssemblyTitle(type);
        for (const name of names) {
          const one = await fetchMeta(assemblyTitle, name);
          if (one) { next[name] = one; continue; }
          const alt = tryLetterVariant(name);
          if (alt) {
            const two = await fetchMeta(assemblyTitle, alt);
            if (two) next[name] = two;
          }
        }
      }
      if (alive) setMetaMap(next);
    })();
    return () => { alive = false; };
  }, [JSON.stringify(groups)]);

  const updateMeta = async (type, name, patch) => {
    const assemblyTitle = typeToAssemblyTitle(type);
    let ok = await saveMeta(assemblyTitle, name, patch);
    if (!ok) {
      const alt = tryLetterVariant(name);
      if (alt) ok = await saveMeta(assemblyTitle, alt, patch);
    }
    if (ok) setMetaMap((m) => ({ ...m, [name]: { ...(m[name] || {}), ...patch } }));
    return ok;
  };

  return { metaMap, updateMeta };
}

async function fetchMeta(assemblyTitle, child) {
  if (!assemblyTitle || !child) return null;
  const res = await fetch(`${API}/api/master/meta/${encodeURIComponent(assemblyTitle)}/${encodeURIComponent(child)}`, { credentials: 'include' });
  if (!res.ok) return null;
  const j = await res.json();
  return {
    status: j?.status || '—',
    creation_date: j?.creation_date || '',
    recert_date: j?.recert_date || '',
  };
}
async function saveMeta(assemblyTitle, child, patch) {
  try {
    const res = await fetch(`${API}/api/master/meta`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assembly: assemblyTitle,
        child,
        status: patch.status ?? undefined,
        creation_date: patch.creation_date ?? undefined,
        recert_date: patch.recert_date ?? undefined,
        updated_by: 'Master DB',
      }),
    });
    return res.ok;
  } catch { return false; }
}

// ==============================
// Gaskets
// ==============================
async function fetchGaskets(assemblyTitle, child) {
  try {
    const res = await fetch(`${API}/api/master/gaskets/${encodeURIComponent(assemblyTitle)}/${encodeURIComponent(child)}`, { credentials: 'include' });
    if (!res.ok) return [];
    return await res.json();
  } catch { return []; }
}

// ==============================
// Animated Number (used by counters)
// ==============================
function useAnimatedNumber(value, duration = 600) {
  const [n, setN] = useState(0);
  const startRef = useRef(0);
  const fromRef = useRef(0);
  const toRef = useRef(value);

  useEffect(() => {
    if (value === toRef.current) return; // avoid redundant anims (prevents twitch)
    fromRef.current = n;
    toRef.current = value;
    startRef.current = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(fromRef.current + (toRef.current - fromRef.current) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]); // eslint-disable-line

  return n;
}

// ==============================
// Donut + Legend + Counters
// ==============================
function DonutChart({ data, colors, size = 64, stroke = 10, label = '' }) {
  const total = Math.max(1, data.reduce((a, b) => a + b, 0));
  const radius = (size - stroke) / 2;
  let start = 0;
  const center = size / 2;

  return (
    <svg width={size} height={size} role="img" aria-label={label}>
      <g transform={`translate(${center},${center})`}>
        {data.map((v, i) => {
          const a0 = (start / total) * 2 * Math.PI;
          const a1 = ((start + v) / total) * 2 * Math.PI;
          start += v;
          const x0 = Math.cos(a0) * radius, y0 = Math.sin(a0) * radius;
          const x1 = Math.cos(a1) * radius, y1 = Math.sin(a1) * radius;
          const largeArc = v / total > 0.5 ? 1 : 0;
          return (
            <path
              key={i}
              d={`M ${x0} ${y0} A ${radius} ${radius} 0 ${largeArc} 1 ${x1} ${y1}`}
              stroke={colors[i]}
              strokeWidth={stroke}
              fill="none"
            />
          );
        })}
        <circle r={radius} fill="transparent" />
      </g>
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" style={{ fill:'#e6e8df', fontWeight:800, fontSize:9, letterSpacing:'.06em' }}>
        {label}
      </text>
    </svg>
  );
}

function Counter({ label, value, bg, fg }) {
  return (
    <div style={{
      background: bg,
      color: fg,
      padding: '6px 10px',
      borderRadius: 8,
      boxShadow: '0 6px 16px rgba(0,0,0,.35), inset 0 0 0 1px rgba(0,0,0,.2)',
      minWidth: 112,
      textAlign: 'center',
    }}>
      <div style={{ fontWeight: 900, letterSpacing: '.08em', fontSize: 12, fontVariantNumeric:'tabular-nums' }}>{label}</div>
      <div style={{ fontWeight: 900, fontSize: 22, lineHeight: 1, width:'3ch', margin:'0 auto', fontVariantNumeric:'tabular-nums' }}>{value}</div>
    </div>
  );
}

function Legend() {
  const item = (c, t) => (
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      <span style={{ width:8, height:8, borderRadius:2, background:c, display:'inline-block' }} />
      <span style={{ color:'#c7cdb8', fontSize:11, fontWeight:800, letterSpacing:'.06em' }}>{t}</span>
    </div>
  );
  return (
    <div style={{ display:'grid', gap:4 }}>
      {item('#5fe08b','Active')}
      {item('#ff6a6a','In-Active')}
      {item('#e9e174','Offline')}
      {item('#ff7ad1','Torn Down')}
    </div>
  );
}

// ==============================
// Branding Title (logo + two-line title with dynamic width)
// (Scaled up; DATABASE stays larger; removed polling to avoid twitch)
// ==============================
function BrandingTitle() {
  const wrapRef = useRef(null);
  const topRef = useRef(null);
  const dbRef = useRef(null);
  const imgRef = useRef(null);
  const [dbLetterSpacing, setDbLetterSpacing] = useState(0);

  // Inject keyframes (once) for the logo animation
  useEffect(() => {
    const id = '__paloma_anim_keyframes__';
    if (typeof document !== 'undefined' && !document.getElementById(id)) {
      const style = document.createElement('style');
      style.id = id;
      style.textContent = `
        @keyframes paloma-breathe {
          0%,100% { transform: translateZ(0) scale(1); filter: drop-shadow(0 6px 16px rgba(106,114,87,0.30)); }
          50%     { transform: translateZ(0) scale(1.12); filter: drop-shadow(0 10px 26px rgba(106,114,87,0.55)); }
        }
        @keyframes paloma-orbit {
          0%   { transform: rotate(0deg) translateX(0); opacity:.9; }
          50%  { transform: rotate(180deg) translateX(0); opacity:.6; }
          100% { transform: rotate(360deg) translateX(0); opacity:.9; }
        }
        @keyframes paloma-radiate {
          0%   { box-shadow: 0 0 0 0 rgba(106,114,87,0.55), inset 0 0 0 0 rgba(106,114,87,0.25); }
          70%  { box-shadow: 0 0 0 22px rgba(106,114,87,0), inset 0 0 0 10px rgba(106,114,87,0.15); }
          100% { box-shadow: 0 0 0 0 rgba(106,114,87,0), inset 0 0 0 0 rgba(106,114,87,0.15); }
        }
        .paloma-anim {
          position: relative;
          isolation: isolate;
          display: inline-grid;
          place-items: center;
          border-radius: 50%;
          padding: 6px;
          background: radial-gradient(120px 120px at 40% 30%, rgba(106,114,87,0.25), transparent 60%);
          animation: paloma-radiate 2.8s ease-out infinite;
        }
        .paloma-anim::before,
        .paloma-anim::after {
          content: '';
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          pointer-events: none;
          mix-blend-mode: screen;
        }
        .paloma-anim::before {
          border: 2px solid rgba(106,114,87,0.45);
          border-top-color: rgba(106,114,87,0.95);
          border-left-color: rgba(106,114,87,0.25);
          animation: paloma-orbit 5.5s linear infinite;
          filter: blur(.2px);
        }
        .paloma-anim::after {
          border: 2px dashed rgba(106,114,87,0.55);
          transform: scale(.86);
          animation: paloma-orbit 7.5s linear infinite reverse;
          opacity: .9;
          filter: blur(.1px);
        }
        .paloma-anim img {
          display:block;
          height:auto;
          transform-origin: 50% 50%;
          animation: paloma-breathe 3.8s ease-in-out infinite;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Width sync (no polling; uses ResizeObserver + window resize)
  useEffect(() => {
    const compute = () => {
      if (!topRef.current || !dbRef.current || !wrapRef.current) return;
      const targetW = topRef.current.getBoundingClientRect().width;
      const dbEl = dbRef.current;
      dbEl.style.letterSpacing = '0px';
      const baseW = dbEl.getBoundingClientRect().width;
      const chars = dbEl.textContent.length - 1;
      const extra = Math.max(0, targetW - baseW);
      const per = chars > 0 ? extra / chars : 0;
      setDbLetterSpacing(per);
      if (imgRef.current) {
        const H = wrapRef.current.getBoundingClientRect().height;
        imgRef.current.style.height = `${Math.max(56, Math.floor(H * 1.18))}px`; // scaled up with text
      }
    };
    compute();
    const ro = new ResizeObserver(compute);
    if (wrapRef.current) ro.observe(wrapRef.current);
    if (topRef.current) ro.observe(topRef.current);
    if (dbRef.current) ro.observe(dbRef.current);
    window.addEventListener('resize', compute);
    return () => { ro.disconnect(); window.removeEventListener('resize', compute); };
  }, []);

  return (
    <div style={{ display:'flex', alignItems:'center', gap:24, flex:'0 0 auto' }}>
      <div className="paloma-anim">
        <img
          ref={imgRef}
          src={palomaIcon}
          alt="Paloma"
          style={{ filter:'drop-shadow(0 4px 8px rgba(0,0,0,.55))' }}
        />
      </div>
      <div ref={wrapRef} style={{ display:'grid', lineHeight:1 }}>
        <div
          ref={topRef}
          style={{
            letterSpacing: '0.14em',
            fontWeight: 300,
            fontSize: '1.6rem',      // ↑ scaled up
            margin: 0,
            color: '#ffffffc4',
            textShadow: '0 1px 0 #000, 0 0 16px rgba(106,114,87,0.35)',
            fontFamily: 'Font-cornero, sans-serif',
            textTransform: 'uppercase',
            whiteSpace:'nowrap',
          }}
        >
          MASTER ASSEMBLIES
        </div>
        <div
  ref={dbRef}
  style={{
    letterSpacing: `${dbLetterSpacing}px`,
    fontWeight: 400,
    fontSize: '3rem',   // doubled from ~2.3rem, remains larger
    margin: 0,
    color: '#6A7257',
    textShadow: '0 1px 0 #000, 0 0 18px rgba(106,114,87,0.45)',
    fontFamily: 'Font-cornero, sans-serif',
    textTransform: 'uppercase',
    whiteSpace:'nowrap',
  }}
>
  DATABASE
</div>
      </div>
    </div>
  );
}

// ==============================
// Main
// ==============================
export default function MasterAssembliesDBTable() {
  const { joined } = useAssignments();

  const groups = useMemo(() => ({
    Dogbones: range(40).map((n) => `Dogbone-${n}`),
    Zippers: range(40).map((n) => `Zipper-${n}`),
    Flowcrosses: range(40).map((n) => `Flowcross-${n}`),
  }), []);

  const { metaMap, updateMeta } = useMasterMeta(groups);

  const byAssembly = useMemo(() => {
    const m = new Map();
    for (const r of joined) {
      const key = (r.assembly || '').trim();
      if (!key) continue;
      if (!m.has(key)) m.set(key, []);
      m.get(key).push(r);
    }
    return m;
  }, [joined]);

  const [gasketMap, setGasketMap] = useState({});
  const [selected, setSelected] = useState(null);
  const onView = async (type, name) => {
    const rows = byAssembly.get(name) || [];
    setSelected({ type, name, rows });
    const assemblyTitle = typeToAssemblyTitle(type);
    const list = await fetchGaskets(assemblyTitle, name) || [];
    setGasketMap((m) => ({ ...m, [name]: list }));
  };

  const [localStatus, setLocalStatus] = useState({});
  const selectedAssembly = useMemo(() => {
    if (!selected) return null;
    const rows = byAssembly.get(selected.name) || [];
    const assets = rows
      .filter(r => (r.slot || '').toLowerCase() !== '__meta__')
      .map(r => ({ meta: r.slot ? r.slot.toUpperCase() : '—', id: r.ppc, name: r.name, status: r.status }));
    const gList = (gasketMap[selected.name] || []).map(g => ({ name: g.gasket_slot, id: g.gasket_id || '—', meta: g.gasket_date || '' }));
    return {
      type: selected.type,
      name: toTitle(selected.name),
      status: (metaMap[selected.name]?.status || '—'),
      location: mode(rows.map(r => r.location)),
      creation_date: metaMap[selected.name]?.creation_date || '',
      recert_date: metaMap[selected.name]?.recert_date || '',
      assets,
      gaskets: gList,
    };
  }, [selected, metaMap, gasketMap, byAssembly]);

  // Status counters
  const statusCounts = useMemo(() => {
    const all = [...groups.Dogbones, ...groups.Zippers, ...groups.Flowcrosses];
    const norm = (s='') => s.toString().trim().toLowerCase();
    const counts = { active:0, inactive:0, offline:0, torn:0 };
    for (const name of all) {
      const s = norm(metaMap[name]?.status || localStatus[name] || 'in-active');
      const b = s === 'active' ? 'active'
        : (s === 'in-active' || s === 'inactive') ? 'inactive'
        : (s === 'offline') ? 'offline'
        : (s === 'torn down' || s === 'torn-down') ? 'torn'
        : 'inactive';
      counts[b]++;
    }
    return { total: all.length, counts };
  }, [metaMap, localStatus, groups]);

  const nActive = useAnimatedNumber(statusCounts.counts.active);
  const nInactive = useAnimatedNumber(statusCounts.counts.inactive);
  const nOffline = useAnimatedNumber(statusCounts.counts.offline);
  const nTorn = useAnimatedNumber(statusCounts.counts.torn);

  const donutData = [statusCounts.counts.active, statusCounts.counts.inactive, statusCounts.counts.torn, statusCounts.counts.offline];
  const donutCols = ['#5fe08b','#ff6a6a','#ff7ad1','#e9e174'];

  return (
    <div style={{ position: 'relative', height: 'calc(89vh - 26px)', display: 'flex', flexDirection: 'column', border: cardBorder, background: '#000', color: textMain, boxShadow: '0 2px 12px #111a', overflow: 'hidden' }}>
      {/* HEADER */}
      <div style={{ position:'relative', borderBottom:'1px solid #2a2d26', background: 'linear-gradient(180deg, rgba(12,12,12,0.92) 0%, rgba(10,10,10,0.6) 100%)', flex:'0 0 auto' }}>
        <div aria-hidden style={headerGrid} />
        <div
          style={{
            display:'flex',
            alignItems:'center',
            gap:12,
            padding:'8px 10px',
            overflowX:'auto',
            whiteSpace:'nowrap',
          }}
        >
          {/* Left: Branding Title (animated logo + two-line text) */}
          <BrandingTitle />

          {/* Right: cluster ring+legend and counters together on the far right */}
          <div style={{ display:'flex', marginLeft:'auto', alignItems:'center', gap:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <DonutChart data={donutData} colors={donutCols} label={`${statusCounts.total || 0} TOTAL`} />
              <Legend />
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <Counter label="ACTIVE" value={nActive} fg="#0f120e" bg="#5fe08b" />
              <Counter label="IN-ACTIVE" value={nInactive} fg="#0f120e" bg="#ff6a6a" />
              <Counter label="OFFLINE" value={nOffline} fg="#0f120e" bg="#e9e174" />
              <Counter label="TORN" value={nTorn} fg="#0f120e" bg="#ff7ad1" />
            </div>
          </div>
        </div>
      </div>

      {/* FOUR COLUMNS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap: 8,
          padding: 6,
          position:'relative',
          zIndex:1,
          flex: '1 1 auto',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* DOGBONES */}
        <div style={{ border: cardBorder, background: '#0b0c09', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          <div style={colHeaderStyle}>DOG BONES</div>
          <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            <DogbonesTable
              names={groups.Dogbones}
              byAssembly={byAssembly}
              metaMap={metaMap}
              localStatus={localStatus}
              selected={selected}
              setSelected={setSelected}
              onView={(type, name) => onView('Dogbones', name)}
            />
          </div>
        </div>

        {/* ZIPPERS */}
        <div style={{ border: cardBorder, background: '#0b0c09', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          <div style={colHeaderStyle}>ZIPPERS</div>
          <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            <ZippersTable
              names={groups.Zippers}
              byAssembly={byAssembly}
              metaMap={metaMap}
              localStatus={localStatus}
              selected={selected}
              setSelected={setSelected}
              onView={(type, name) => onView('Zippers', name)}
            />
          </div>
        </div>

        {/* FLOWCROSSES */}
        <div style={{ border: cardBorder, background: '#0b0c09', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          <div style={colHeaderStyle}>FLOWCROSSES</div>
          <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            <FlowcrossesTable
              names={groups.Flowcrosses}
              byAssembly={byAssembly}
              metaMap={metaMap}
              localStatus={localStatus}
              selected={selected}
              setSelected={setSelected}
              onView={(type, name) => onView('Flowcrosses', name)}
            />
          </div>
        </div>

        {/* DETAILS */}
        <div style={{ border: cardBorder, background: '#0b0c09', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          <div style={colHeaderStyle}>DETAILS</div>
          <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 6 }}>
            <ViewAssemblyPanel assembly={selectedAssembly} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ==============================
// Styles
// ==============================
const headerGrid = {
  position:'absolute',
  inset:0,
  backgroundImage: `
    radial-gradient(ellipse at top left, rgba(106,114,87,.10), rgba(0,0,0,0)),
    repeating-linear-gradient(0deg, rgba(87,96,70,.08) 0px, rgba(87,96,70,.08) 1px, transparent 1px, transparent 18px),
    repeating-linear-gradient(90deg, rgba(87,96,70,.08) 0px, rgba(87,96,70,.08) 1px, transparent 1px, transparent 18px)
  `,
  backgroundColor: 'transparent',
  pointerEvents:'none',
  animation: 'grid-pan 18s linear infinite',
};
const styleSheetId = '__ma_db_grid_keyframes__';
if (typeof document !== 'undefined' && !document.getElementById(styleSheetId)) {
  const style = document.createElement('style');
  style.id = styleSheetId;
  style.textContent = `
    @keyframes grid-pan {
      0% { background-position: 0 0, 0 0, 0 0; }
      100% { background-position: 0 0, 0 40px, 40px 0; }
    }
  `;
  document.head.appendChild(style);
}

const colHeaderStyle = {
  background: headerBg,
  color: 'white',
  padding: '10px 10px',
  fontWeight: 900,
  letterSpacing: '0.12em',
  borderBottom: cardBorder,
  textTransform: 'uppercase',
  position: 'sticky',
  top: 0,
  zIndex: 3,
  textAlign: 'center',
  fontFamily: 'Font-cornero, sans-serif',
  fontSize: '1.25rem',
};

// ==============================
// Export (unchanged helper)
// ==============================
function buildExportHTML(type, name, rows, gaskets = []) {
  const date = new Date().toLocaleString();
  const style = `
    <style>
      body { font-family: Arial, sans-serif; color: #111; }
      h1 { margin: 0 0 8px 0; font-size: 22px; }
      h2 { margin: 18px 0 8px 0; font-size: 16px; }
      .meta { margin-bottom: 12px; color: #444; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid  #444; padding: 6px 8px; font-size: 12px; text-align: left; }
      th { background: #eee; }
    </style>
  `;
  const rowsHtml = rows
    .filter(r => (r.slot || '').toLowerCase() !== '__meta__')
    .map(r => `
    <tr>
      <td>${r.slot ? r.slot.toUpperCase() : '—'}</td>
      <td>${r.ppc}</td>
      <td>${escapeHTML(r.name)}</td>
      <td>${escapeHTML(r.status || '')}</td>
      <td>${escapeHTML(r.location || '')}</td>
    </tr>
  `).join('');

  const gHtml = (gaskets || []).length
    ? gaskets.map(g => `
      <tr>
        <td>${escapeHTML(g.gasket_slot)}</td>
        <td>${escapeHTML(g.gasket_id || '—')}</td>
        <td>${escapeHTML(fmtDate(g.gasket_date))}</td>
      </tr>
    `).join('')
    : `<tr><td colspan="3">No gaskets set.</td></tr>`;

  return `
    <!doctype html>
    <html>
      <head><meta charset="utf-8" />${style}<title>${name} — Export</title></head>
      <body>
        <h1>${type} — ${name}</h1>
        <div class="meta">Exported ${date}</div>

        <h2>Assets Used</h2>
        <table>
          <thead>
            <tr><th>Slot</th><th>PPC #</th><th>Name</th><th>Status</th><th>Location</th></tr>
          </thead>
          <tbody>${rowsHtml || `<tr><td colspan="5">No assets assigned.</td></tr>`}</tbody>
        </table>

        <h2>Gaskets Used</h2>
        <table>
          <thead>
            <tr><th>Slot</th><th>Gasket ID</th><th>Date</th></tr>
          </thead>
          <tbody>${gHtml}</tbody>
        </table>
      </body>
    </html>
  `;
}
function escapeHTML(s) {
  return String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
