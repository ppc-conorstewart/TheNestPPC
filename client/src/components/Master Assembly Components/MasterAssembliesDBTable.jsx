// ==============================
// src/components/Master Assembly Components/MasterAssembliesDBTable.jsx
// Master DB view — now modular & pixel-matched to the original:
// - Uses DogbonesTable, ZippersTable, FlowcrossesTable, MissilesTable
// - Missiles column keeps the built-in bottom detail pane (same layout)
// - Meta (status/creation/recert) + Gaskets loaded lazily per selection
// - Preserves zebra text, sticky headers, export to printable HTML
// ==============================

import { useEffect, useMemo, useState } from 'react';
import { API } from '../../api';

// ==============================
// Subcomponents (DB Components)
// ==============================
import DogbonesTable from './Mater Asssemblies DB Components/DogbonesTable';
import FlowcrossesTable from './Mater Asssemblies DB Components/FlowcrossesTable';
import MissilesTable from './Mater Asssemblies DB Components/MissilesTable';
import ZippersTable from './Mater Asssemblies DB Components/ZippersTable';

// ==============================
// Visual Constants
// ==============================
const cardBorder = '1px solid #6a7257';
const bgCard = '#000';
const headerBg = '#10110f';
const palomaGreen = '#6a7257';
const zebraBg = '#161616';
const zebraAlt = '#0d0d0d';
const textMain = '#e6e8df';
const missilePurple = '#A64DFF';

// fixed column height so all four columns align
const COLUMN_HEIGHT = '80vh';
// Missiles column: smaller table, bigger details (same as before)
const DETAIL_PANE_RATIO = 0.72; // 72% pane, 28% list

// ==============================
// Master-page hero images (match visual panel)
// ==============================
import masterDogboneImg from '../../assets/Master Assemblies/MasterDogbone.png';
import masterZipperImg from '../../assets/Master Assemblies/MasterZipper.png';

// ==============================
// Helpers
// ==============================
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

// Dogbone-1 -> Dogbone-A, Zipper-1 -> Zipper - A
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
    case 'missiles': return 'Missiles';
    default: return '';
  }
};

// ==============================
// Data Fetch + Asset Join
// ==============================
function useAssignments() {
  const [rows, setRows] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const fetchAssignments = async () => {
          const candidates = [
            `${API}/api/master/assignments?all=1`,
            `${API}/api/master/assignments/all`,
          ];
          for (const url of candidates) {
            const res = await fetch(url, { credentials: 'include' });
            if (res.ok) return res.json();
          }
          throw new Error('No assignment list endpoint responded OK');
        };

        const [assignments, assetsRes] = await Promise.all([
          fetchAssignments(),
          fetch(`${API}/api/assets`, { credentials: 'include' }),
        ]);

        const assetsJson = assetsRes.ok ? await assetsRes.json() : [];
        if (!alive) return;
        setRows(assignments || []);
        setAssets(Array.isArray(assetsJson) ? assetsJson : []);
      } catch (e) {
        if (!alive) return;
        setErr(e);
      } finally {
        if (alive) setLoading(false);
      }
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

  return { joined, loading, err };
}

// ==============================
// Master-Page Meta (status/creation/recert)
// ==============================
function useMasterMeta(groups) {
  const [metaMap, setMetaMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
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
      if (!alive) return;
      setMetaMap(next);
      setLoading(false);
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
    if (ok) {
      setMetaMap((m) => ({ ...m, [name]: { ...(m[name] || {}), ...patch } }));
    }
    return ok;
  };

  return { metaMap, loading, updateMeta };
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
  } catch {
    return false;
  }
}

// ==============================
// Gaskets loader (lazy per selected assembly)
// ==============================
async function fetchGaskets(assemblyTitle, child) {
  try {
    const res = await fetch(`${API}/api/master/gaskets/${encodeURIComponent(assemblyTitle)}/${encodeURIComponent(child)}`, { credentials: 'include' });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// ==============================
// Main Component
// ==============================
export default function MasterAssembliesDBTable() {
  const { joined } = useAssignments();

  // Build Assembly Lists
  const groups = useMemo(() => ({
    Dogbones: range(40).map((n) => `Dogbone-${n}`),
    Zippers: range(40).map((n) => `Zipper-${n}`),
    Flowcrosses: range(40).map((n) => `Flowcross-${n}`),
    Missiles: range(4).map((n) => `Missile-${n}`),
  }), []);

  // Master-page meta for all assemblies
  const { metaMap, updateMeta } = useMasterMeta(groups);

  // Map: assembly -> rows for that assembly
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

  // Gaskets cache per assembly name
  const [gasketMap, setGasketMap] = useState({}); // { [name]: [{gasket_slot, gasket_id, gasket_date, ...}] }

  // Detail Pane (missiles column)
  const [selected, setSelected] = useState(null); // { type, name, rows }
  const onView = async (type, name) => {
    const rows = byAssembly.get(name) || [];
    setSelected({ type, name, rows });
    // lazy-load gaskets
    const assemblyTitle = typeToAssemblyTitle(type);
    const list = await fetchGaskets(assemblyTitle, name) || [];
    setGasketMap((m) => ({ ...m, [name]: list }));
  };
  const onExportPDF = (type, name) => {
    const rows = byAssembly.get(name) || [];
    const gaskets = gasketMap[name] || [];
    const html = buildExportHTML(type, name, rows, gaskets);
    const w = window.open('', '_blank', 'noopener,noreferrer');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };
  const [localStatus, setLocalStatus] = useState({});
  const onModifyStatus = async (type, name) => {
    const current = metaMap[name]?.status || localStatus[name] || '—';
    const next = window.prompt(`Set status for ${name}:`, current === '—' ? '' : current);
    if (next === null) return;
    const clean = (next || '').trim() || '—';
    setLocalStatus((s) => ({ ...s, [name]: clean }));
    await updateMeta(type, name, { status: clean });
  };

  // Hover (kept to avoid bundler warnings)
  theHoverFix();
  const [hoverKey, setHoverKey] = useState(null);
  function theHoverFix() {}

  return (
    <div style={{ position: 'relative', border: cardBorder, background: bgCard, color: textMain, boxShadow: '0 2px 12px #111a' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'start',
          gap: 16,
          padding: '18px 16px 16px',
          borderBottom: '1px solid #2a2d26',
          background: 'linear-gradient(180deg, rgba(12,12,12,0.9) 0%, rgba(10,10,10,0.6) 100%)',
        }}
      >
        <h1
          style={{
            letterSpacing: '0.16em',
            fontWeight: 300,
            fontSize: '2.75rem',
            margin: 0,
            color: '#e7eadbc4',
            textShadow: '0 1px 0 #000, 0 0 16px rgba(106,114,87,0.35)',
            textAlign: 'left',
            fontFamily: 'Font-cornero, sans-serif',
          }}
        >
          MASTER ASSEMBLIES DATABASE
        </h1>
      </div>

      {/* Columns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap: 8,
          padding: 12,
          alignItems: 'start',
        }}
      >
        {/* DOGBONES */}
        <div style={{ border: cardBorder, background: '#0b0c09', display: 'flex', flexDirection: 'column', height: COLUMN_HEIGHT, minHeight: 0 }}>
          <div style={colHeaderStyle}>DOG BONES</div>
          <DogbonesTable
            names={groups.Dogbones}
            byAssembly={byAssembly}
            metaMap={metaMap}
            localStatus={localStatus}
            selected={selected}
            setSelected={setSelected}
            hoverKey={hoverKey}
            setHoverKey={setHoverKey}
            onView={(type, name) => onView('Dogbones', name)}
            onModifyStatus={(row) => onModifyStatus('Dogbones', row?.name || row?.id || row)}
            onExportPDF={(row) => onExportPDF('Dogbones', row?.name || row?.id || row)}
          />
        </div>

        {/* ZIPPERS */}
        <div style={{ border: cardBorder, background: '#0b0c09', display: 'flex', flexDirection: 'column', height: COLUMN_HEIGHT, minHeight: 0 }}>
          <div style={colHeaderStyle}>ZIPPERS</div>
          <ZippersTable
            names={groups.Zippers}
            byAssembly={byAssembly}
            metaMap={metaMap}
            localStatus={localStatus}
            selected={selected}
            setSelected={setSelected}
            hoverKey={hoverKey}
            setHoverKey={setHoverKey}
            onView={(type, name) => onView('Zippers', name)}
            onModifyStatus={(row) => onModifyStatus('Zippers', row?.name || row?.id || row)}
            onExportPDF={(row) => onExportPDF('Zippers', row?.name || row?.id || row)}
          />
        </div>

        {/* FLOWCROSSES */}
        <div style={{ border: cardBorder, background: '#0b0c09', display: 'flex', flexDirection: 'column', height: COLUMN_HEIGHT, minHeight: 0 }}>
          <div style={colHeaderStyle}>FLOWCROSSES</div>
          <FlowcrossesTable
            names={groups.Flowcrosses}
            byAssembly={byAssembly}
            metaMap={metaMap}
            localStatus={localStatus}
            selected={selected}
            setSelected={setSelected}
            hoverKey={hoverKey}
            setHoverKey={setHoverKey}
            onView={(type, name) => onView('Flowcrosses', name)}
            onModifyStatus={(row) => onModifyStatus('Flowcrosses', row?.name || row?.id || row)}
            onExportPDF={(row) => onExportPDF('Flowcrosses', row?.name || row?.id || row)}
          />
        </div>

        {/* MISSILES (list + built-in detail pane) */}
        <div style={{ border: cardBorder, background: '#0b0c09', display: 'flex', flexDirection: 'column', height: COLUMN_HEIGHT, minHeight: 0 }}>
          <div style={colHeaderStyle}>MISSILES</div>

          {/* List */}
          <div style={{ overflowY: 'auto', overflowX: 'hidden', flex: (1 - DETAIL_PANE_RATIO), minHeight: 0 }}>
            <MissilesTable
              names={groups.Missiles}
              byAssembly={byAssembly}
              metaMap={metaMap}
              localStatus={localStatus}
              selected={selected}
              setSelected={setSelected}
              hoverKey={hoverKey}
              setHoverKey={setHoverKey}
              onView={(type, name) => onView('Missiles', name)}
              onModifyStatus={(row) => onModifyStatus('Missiles', row?.name || row?.id || row)}
              onExportPDF={(row) => onExportPDF('Missiles', row?.name || row?.id || row)}
            />
          </div>

          {/* Detail pane (unchanged layout) */}
          <div
            style={{
              borderTop: cardBorder,
              background: '#000',
              boxShadow: '0 -2px 12px #0008',
              flex: DETAIL_PANE_RATIO,
              minHeight: 0,
              overflow: 'auto',
            }}
          >
            {selected ? (
              <>
                <div style={{ background: headerBg, padding: '8px 10px', borderBottom: cardBorder, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ color: palomaGreen, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Font-cornero, sans-serif' }}>
                    {selected.type} — {selected.name}
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <IconButton title="Modify Status" onClick={() => onModifyStatus(selected.type, selected.name)}>
                      <WrenchIcon />
                    </IconButton>
                    <IconButton title="Export Assembly PDF" onClick={() => onExportPDF(selected.type, selected.name)}>
                      <PdfIcon />
                    </IconButton>
                    <button onClick={() => setSelected(null)} style={closeBtn}>✕</button>
                  </div>
                </div>

                {/* Image ABOVE, then compact info */}
                <div style={{ display: 'block', padding: 12 }}>
                  <div style={{ marginBottom: 12 }}>
                    <AssemblyImage type={selected.type} name={selected.name} />
                  </div>

                  {/* NAME single full row */}
                  <div style={{ marginBottom: 6, fontFamily: 'Font-erbaum, Erbaum, sans-serif', fontSize: '0.82rem' }}>
                    <InfoRowFull label="Name" value={toTitle(selected.name)} />
                  </div>

                  {/* 2 x 2 info grid: Status/Location + Creation/Re-Cert */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 10,
                      fontFamily: 'Font-erbaum, Erbaum, sans-serif',
                      fontSize: '0.78rem',
                    }}
                  >
                    <InfoField label="Status" value={(metaMap[selected.name]?.status || '—')} />
                    <InfoField label="Location" value={mode((byAssembly.get(selected.name) || []).map(r => r.location))} />
                    <InfoField label="Creation Date" value={fmtDate(metaMap[selected.name]?.creation_date)} />
                    <InfoField label="Re-Cert Date" value={fmtDate(metaMap[selected.name]?.recert_date)} />
                  </div>

                  {/* Assets Used (filter out __META__) */}
                  <div style={{ borderTop: '1px solid #222', marginTop: 12, paddingTop: 10 }}>
                    <div style={{ fontWeight: 800, color: palomaGreen, marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'Font-cornero, sans-serif', fontSize: '0.86rem' }}>
                      Assets Used
                    </div>
                    {selected.rows.filter(r => (r.slot || '').toLowerCase() !== '__meta__').length === 0 ? (
                      <div style={{ color: '#8b8d7a', fontFamily: 'Font-erbaum, Erbaum, sans-serif', fontSize: '0.78rem' }}>No assets currently assigned.</div>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem', fontFamily: 'Font-erbaum, Erbaum, sans-serif' }}>
                        <thead>
                          <tr>
                            <th style={miniTh}>Slot</th>
                            <th style={miniTh}>PPC #</th>
                            <th style={miniTh}>Name</th>
                            <th style={miniTh}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selected.rows
                            .filter(r => (r.slot || '').toLowerCase() !== '__meta__')
                            .map((r, i) => (
                            <tr key={`${r.ppc}-${i}`} style={{ background: i % 2 === 0 ? '#0e0e0e' : '#0a0a0a' }}>
                              <td style={miniTd}>{r.slot ? r.slot.toUpperCase() : '—'}</td>
                              <td style={miniTd}>{r.ppc}</td>
                              <td style={miniTd}>{r.name}</td>
                              <td style={miniTd}>{r.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Gaskets Used */}
                  <div style={{ borderTop: '1px solid #222', marginTop: 12, paddingTop: 10 }}>
                    <div style={{ fontWeight: 800, color: palomaGreen, marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'Font-cornero, sans-serif', fontSize: '0.86rem' }}>
                      Gaskets Used
                    </div>
                    {(() => {
                      const list = gasketMap[selected.name] || [];
                      if (list.length === 0) {
                        return <div style={{ color: '#8b8d7a', fontFamily: 'Font-erbaum, Erbaum, sans-serif', fontSize: '0.78rem' }}>No gaskets set.</div>;
                      }
                      return (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem', fontFamily: 'Font-erbaum, Erbaum, sans-serif' }}>
                          <thead>
                            <tr>
                              <th style={miniTh}>Slot</th>
                              <th style={miniTh}>Gasket ID</th>
                              <th style={miniTh}>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {list.map((g, i) => (
                              <tr key={`${g.gasket_slot}-${i}`} style={{ background: i % 2 === 0 ? '#0e0e0e' : '#0a0a0a' }}>
                                <td style={miniTd}>{g.gasket_slot}</td>
                                <td style={miniTd}>{g.gasket_id || '—'}</td>
                                <td style={miniTd}>{fmtDate(g.gasket_date)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      );
                    })()}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b8d7a', fontSize: '0.8rem', fontFamily: 'Font-erbaum, Erbaum, sans-serif' }}>
                Select an assembly to view details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==============================
// Assembly Image Component
// ==============================
function AssemblyImage({ type }) {
  const t = (type || '').toLowerCase();
  const src =
    t === 'dogbones' ? masterDogboneImg :
    t === 'zippers'  ? masterZipperImg  :
    null;

  if (!src) {
    return (
      <div style={{ background: '#0d0d0d', border: '1px solid #222', height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#888', fontFamily: 'Font-erbaum, Erbaum, sans-serif' }}>
        Assembly Image
      </div>
    );
  }
  return (
    <div style={{ background: '#0d0d0d', border: '1px solid #222', height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img
        src={src}
        alt={`${type} image`}
        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
      />
    </div>
  );
}

// ==============================
// Small UI Pieces
// ==============================
function IconButton({ title, onClick, children }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        border: '1px solid #2c2f27',
        background: '#0e100c',
        color: textMain,
        width: 24,
        height: 24,
        display: 'grid',
        placeItems: 'center',
        borderRadius: 6,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}
function WrenchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#e6e8df">
      <path d="M22.7 19.3l-7.9-7.9a6 6 0 1 0-2.8 2.8l7.9 7.9a2 2 0 1 0 2.8-2.8zM10 14a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/>
    </svg>
  );
}
function PdfIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff5656">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <path d="M14 2v6h6"/>
      <text x="8" y="17" fontSize="7" fill="#fff" fontFamily="monospace">PDF</text>
    </svg>
  );
}

// ==============================
// Table + Cell Styles used in detail tables
// ==============================
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
const stickyThCell = {
  padding: '4px 6px',
  lineHeight: '1rem',
  border: cardBorder,
  textAlign: 'left',
  color: palomaGreen,
  fontWeight: 800,
  letterSpacing: '0.05em',
  background: headerBg,
  whiteSpace: 'nowrap',
  position: 'sticky',
  top: 0,
  zIndex: 2,
  boxShadow: '0 2px 0 rgba(0,0,0,0.6)',
  fontFamily: 'Font-cornero, sans-serif',
};
const tdCell = {
  padding: '2px 3px',
  border: cardBorder,
  textAlign: 'left',
  verticalAlign: 'middle',
  height: 20,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontFamily: 'Font-erbaum, Erbaum, sans-serif',
};
const miniTh = {
  ...stickyThCell,
  padding: '4px 6px',
  fontSize: '0.7rem',
};
const miniTd = {
  ...tdCell,
  padding: '4px 6px',
  fontSize: '0.7rem',
};

// Missing closeBtn/Info components (kept identical to prior file)
const closeBtn = {
  border: '1px solid #2c2f27',
  background: '#0e100c',
  color: textMain,
  width: 24,
  height: 24,
  display: 'grid',
  placeItems: 'center',
  borderRadius: 6,
  cursor: 'pointer',
};
function InfoField({ label, value }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 6 }}>
      <div style={{ color: '#9fa48b', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'Font-cornero, sans-serif' }}>{label}</div>
      <div style={{ color: '#e6e8df' }}>{value}</div>
    </div>
  );
}
function InfoRowFull({ label, value }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 6 }}>
      <div style={{ color: '#9fa48b', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'Font-cornero, sans-serif' }}>{label}</div>
      <div style={{ color: '#e6e8df' }}>{value}</div>
    </div>
  );
}

// ==============================
// Export HTML Builder (includes Gaskets)
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
      th, td { border: 1px solid #444; padding: 6px 8px; font-size: 12px; text-align: left; }
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
