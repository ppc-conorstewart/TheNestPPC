// ==============================
// Master Assemblies Hub Components/GasketUsagePanel.jsx
// ==============================
import { styles } from '../Support Files/maKit';

// ==============================
// Component
// ==============================
export default function GasketUsagePanel({ gasketState, setGasketState, hoverGasket }) {
  const gasketLocations = [
    '1. Rotator X Tee',
    '2. Tee x Spool',
    '3. Adapter X Tee',
    '4. Spool X Tee',
    '5. Blind x Tee',
    '6. Tee X Rotator',
  ];

  const options = [
    { value: 'BX-156 LCS', label: 'BX-156 LCS' },
    { value: 'BX-156 SS', label: 'BX-156 SS' },
  ];

  const numberBadge = (n) => ({
    width: 24,
    height: 24,
    minWidth: 24,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    fontSize: 12,
    color: '#10110f',
    background: '#70c12aff',
    border: '1px solid #70c12aff',
    boxShadow: '0 0 0 2px #000 inset, 0 3px 14px #0007',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      {/* tighter top/bottom spacing for header */}
      <div style={{ ...styles.groupHeader, margin: '4px 0', paddingLeft: 8 }}>Gasket Usage</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 4 }}>
        {gasketLocations.map((loc) => {
          const val = gasketState[loc] || '';
          const assigned = !!val;
          const n = String(loc).split('.')[0].trim();
          const isHot = hoverGasket && loc.toLowerCase() === hoverGasket.toLowerCase();
          const dateKey = `${loc}__date`;
          const dateVal = gasketState[dateKey] || '';

          return (
            <div
              key={loc}
              style={{
                ...styles.selectorCard(assigned),
                padding: 8,
                ...(isHot
                  ? { boxShadow: '0 0 0 2px #70c12aff, 0 0 18px #70c12a88' }
                  : {}),
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  flexWrap: 'nowrap',
                  minHeight: 20,
                }}
              >
                {/* left: number + label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 200 }}>
                  <div style={numberBadge(n)}>{n}</div>
                  <div style={{ ...styles.selectorLabel(assigned), fontSize: 10 }}>{loc}</div>
                </div>

                {/* middle: selector */}
                <div style={{ flex: '0 0 200px', maxWidth: 240 }}>
                  <select
                    value={val}
                    onChange={(e) =>
                      setGasketState((prev) => ({ ...prev, [loc]: e.target.value }))
                    }
                    style={{
                      width: '100%',
                      padding: '4px 4px',
                      background: '#0f100e',
                      color: '#ffffffbe',
                      border: isHot ? '1px solid #70c12aff' : '1px solid #3b3f33',
                      boxShadow: isHot ? '0 0 12px #70c12a55' : 'none',
                      borderRadius: 6,
                      fontWeight: 700,
                      fontSize: 10,
                      lineHeight: 1,
                    }}
                  >
                    <option value="">Select…</option>
                    {options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* date selector */}
                <div style={{ flex: '0 0 170px', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="date"
                    value={dateVal}
                    onChange={(e) =>
                      setGasketState((prev) => ({ ...prev, [dateKey]: e.target.value }))
                    }
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      background: '#0f100e',
                      color: '#ffffffcc',
                      border: isHot ? '1px solid #70c12aff' : '1px solid #3b3f33',
                      boxShadow: isHot ? '0 0 12px #70c12a55' : 'none',
                      borderRadius: 6,
                      fontWeight: 700,
                      fontSize: 10,
                      lineHeight: 1,
                    }}
                  />
                </div>

                {/* right: clear */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    style={styles.clearBtn(assigned || !!dateVal)}
                    disabled={!assigned && !dateVal}
                    onClick={() =>
                      setGasketState((prev) => {
                        const next = { ...prev };
                        delete next[loc];
                        delete next[dateKey];
                        return next;
                      })
                    }
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
