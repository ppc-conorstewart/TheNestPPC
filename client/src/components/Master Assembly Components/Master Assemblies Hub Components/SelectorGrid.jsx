// ==============================
// Master Assemblies Hub Components/SelectorGrid.jsx
// ==============================
import AssetSelector from '../AssetSelector';
import { legendNumberFor, styles } from '../Support Files/maKit';

// Square badge used in the left-side asset selectors (yellow squares)
const selectorSquare = (assigned, isHot) => ({
  width: 28,
  height: 28,
  minWidth: 28,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 900,
  fontSize: 10,
  lineHeight: 1,
  color: '#10110f',
  background: '#ffd84a',
  border: '2px solid #9b8510',
  borderRadius: 2,
  boxShadow: isHot ? '0 0 0 1px #000 inset, 0 0 0 2px #d6dc24ff, 0 0 12px #d6dc24ff' : '0 0 0 1px #000 inset',
});

// ==============================
// Props:
// - groupings: [{ title, labels[] }]
// - selectedChild
// - getAssetStateSetterFields(): [assets, setAssets]
// - assetOptions
// - hoverLabel
// - rowRefs (ref object passed from parent)
// - setClearTarget(), setClearModalOpen()
// ==============================
export default function SelectorGrid({
  groupings = [],
  selectedChild,
  getAssetStateSetterFields,
  assetOptions = [],
  hoverLabel = null,
  rowRefs,
  setClearTarget,
  setClearModalOpen,
}) {
  if (typeof getAssetStateSetterFields !== 'function') return null;
  const [assets, setAssets] = getAssetStateSetterFields();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {groupings.map((g) => (
        <div key={g.title || 'assets'} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {g.title ? <div style={styles.groupHeader}>{g.title}</div> : null}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
            {g.labels.map((label) => {
              const slotKey = `${selectedChild}-${label}`;
              const assetId = assets[slotKey] || '';
              const assigned = !!assetId;
              const isHot = hoverLabel && label.toLowerCase() === hoverLabel.toLowerCase();

              return (
                <div
                  key={label}
                  ref={(el) => {
                    if (rowRefs && rowRefs.current) rowRefs.current[label] = el;
                  }}
                  style={{
                    ...styles.selectorCard(assigned),
                    padding: 8,
                    ...(isHot ? { boxShadow: '0 0 0 2px #d6dc24ff, 0 0 18px #d6dc24ff' } : {}),
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      flexWrap: 'nowrap',
                      minHeight: 36,
                    }}
                  >
                    {/* left: square number + label */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 220 }}>
                      <div style={selectorSquare(assigned, isHot)}>{legendNumberFor(label)}</div>
                      <div style={{ ...styles.selectorLabel(assigned), fontSize: 8 }}>{label}</div>
                    </div>

                    {/* middle: selector */}
                    <div style={{ flex: '0 0 320px', maxWidth: 360 }}>
                      <AssetSelector
                        label=""
                        asset={assetId}
                        assetOptions={assetOptions}
                        onChange={(val) => setAssets((a) => ({ ...a, [slotKey]: val }))}
                      />
                    </div>

                    {/* right: status + clear */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={styles.statusPill(assigned)}>
                        {assigned ? String(assetId) : 'UNASSIGNED'}
                      </div>
                      <button
                        style={styles.clearBtn(assigned)}
                        disabled={!assigned}
                        onClick={() => {
                          if (!assetId) return;
                          setClearTarget &&
                            setClearTarget({
                              assetId,
                              assetName: '',
                              slotKey,
                              slotLabel: label,
                            });
                          setClearModalOpen && setClearModalOpen(true);
                        }}
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
      ))}
    </div>
  );
}
