// ============================================================
// Mater Asssemblies DB Components/MissilesTable.jsx
// MISSILES list table (no column header; parent renders header
// and also renders the right-side detail pane)
// ============================================================


// ---------- Visual Constants ----------
const cardBorder = '1px solid #6a7257';
const headerBg = '#10110f';
const zebraBg = '#161616';
const zebraAlt = '#0d0d0d';
const palomaGreen = '#6a7257';
const accentPurple = '#7f58c9';

// ---------- Shared Styles ----------
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
const assemblyCell = {
  ...tdCell,
  fontSize: '0.78rem',
  letterSpacing: '0.02em',
  fontWeight: 800,
  padding: '2px 4px',
};
const assemblyBtn = {
  background: 'transparent',
  border: 'none',
  color: '#e6e8df',
  cursor: 'pointer',
  width: '100%',
  textAlign: 'left',
  font: 'inherit',
  padding: 0,
};
const chip = (bg, fg) => ({
  display: 'inline-block',
  padding: '2px 6px',
  borderRadius: 6,
  background: bg,
  color: fg,
  fontSize: '0.68rem',
  fontWeight: 800,
  letterSpacing: '0.02em',
  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
  fontFamily: 'Font-erbaum, Erbaum, sans-serif',
});

// ---------- Helpers ----------
function statusPill(val) {
  const s = (val || '').toLowerCase();
  if (s === 'active') return { bg: '#0d2c1a', fg: '#5fe08b', label: 'ACTIVE' };
  if (s === 'in-active' || s === 'inactive') return { bg: '#3a1414', fg: '#ff6a6a', label: 'IN-ACTIVE' };
  if (s === 'offline') return { bg: '#2e2b0f', fg: '#e9e174', label: 'OFFLINE' };
  if (s === 'dis-assembled' || s === 'disassembled') return { bg: '#3a1a1a', fg: '#ff8888', label: 'DIS-ASSEMBLED' };
  return { bg: '#1d1d1d', fg: '#cfcfcf', label: val || '—' };
}
function mode(arr) {
  const m = new Map();
  for (const v of arr.filter(Boolean)) m.set(v, (m.get(v) || 0) + 1);
  let best = null, bestC = 0;
  for (const [k, c] of m) { if (c > bestC) { best = k; bestC = c; } }
  return best || '—';
}

// ---------- Component ----------
export default function MissilesTable({
  type = 'Missiles',
  names = [],
  byAssembly = new Map(),
  metaMap = {},
  localStatus = {},
  selected = null,
  setSelected = () => {},
  hoverKey = null,
  setHoverKey = () => {},
  onView = () => {},
}) {
  return (
    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: '0.64rem', tableLayout: 'fixed' }}>
      <colgroup>
        <col style={{ width: '42%' }} />
        <col style={{ width: '29%' }} />
        <col style={{ width: '29%' }} />
      </colgroup>
      <thead>
        <tr>
          <th style={stickyThCell}>Assembly</th>
          <th style={stickyThCell}>Status</th>
          <th style={stickyThCell}>Location</th>
        </tr>
      </thead>
      <tbody>
        {names.map((name, idx) => {
          const rowsAll = byAssembly.get(name) || [];
          const location = mode(rowsAll.map(r => r.location));
          const metaStatus = (metaMap[name]?.status || '').trim();
          const chosenStatus = (metaStatus || localStatus[name] || 'In-Active').trim();
          const pill = statusPill(chosenStatus);
          const isSelected = selected && selected.type === type && selected.name === name;
          const isHover = hoverKey === `${type}:${name}`;
          const zebraTextColor = ['#b08aff', '#c6a8ff'][idx % 2];

          return (
            <tr
              key={name}
              onMouseEnter={() => setHoverKey(`${type}:${name}`)}
              onMouseLeave={() => setHoverKey(null)}
              style={{
                background: idx % 2 === 0 ? zebraBg : zebraAlt,
                outline: isSelected ? '2px solid #dbd22e' : 'none',
                outlineOffset: '-2px',
                boxShadow: isSelected
                  ? 'inset 0 0 0 1px rgba(219,210,46,0.25), 0 0 0 1px rgba(0,0,0,0.6)'
                  : isHover ? 'inset 0 0 0 1px rgba(255,255,255,0.06)' : 'none',
                transition: 'background 120ms ease, box-shadow 120ms ease',
              }}
            >
              <td style={{ ...assemblyCell, paddingLeft: 8, position: 'relative', color: zebraTextColor }}>
                <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: `linear-gradient(180deg, ${accentPurple}, ${accentPurple}44)` }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ opacity: .55, fontSize: '0.66rem', minWidth: 22, textAlign: 'right' }}>{idx + 1}.</span>
                  <button
                    onClick={() => { setSelected({ type, name, rows: rowsAll }); onView(type, name); }}
                    style={{ ...assemblyBtn, color: zebraTextColor }}
                    title="Open details"
                  >
                    {name}
                  </button>
                  <span aria-hidden style={{ marginLeft: 'auto', opacity: (isHover || isSelected) ? 0.9 : 0, transition: 'opacity 120ms', fontFamily: 'Font-cornero, sans-serif', letterSpacing: '0.06em' }}>➤</span>
                </div>
              </td>
              <td style={tdCell}><span style={chip(pill.bg, '#fff')}>{pill.label}</span></td>
              <td style={tdCell}><span style={chip('#141414', '#cfcfcf')}>{location || '—'}</span></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
