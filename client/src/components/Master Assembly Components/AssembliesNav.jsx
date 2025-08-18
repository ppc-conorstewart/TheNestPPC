// ==============================
// src/components/Master Assembly Components/AssembliesNav.jsx
// ==============================
import { Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const palomaGreen = '#6a7257';
const limeSelected = '#99ff00';

// ===== Tabs styling (mirrors AssetTabsNav.jsx) =====
const tabBase = {
  padding: '7px 28px 7px 28px',
  fontWeight: 700,
  border: 'none',
  outline: 'none',
  borderRadius: '0px 0px 0 0',
  fontSize: '1em',
  marginRight: 8,
  cursor: 'pointer',
  letterSpacing: 1.2,
  textTransform: 'uppercase',
  background: 'transparent',
  borderBottom: '4px solid transparent',
  transition:
    'background 0.18s, color 0.18s, border-bottom 0.18s, box-shadow 180ms ease, transform 160ms ease',
  position: 'relative',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
};

const railAccent = '#6a7257';
const railText = '#ffffffff';
const railMuted = '#b0b79f';

const getTabStyle = (isActive) => ({
  ...tabBase,
  color: isActive ? '#6a7257' : railMuted,
  background: isActive
    ? 'linear-gradient(180deg, #121310 0%, #0f100e 55%, #0b0c0a 100%)'
    : 'linear-gradient(180deg, rgba(20,22,18,.35) 0%, rgba(14,15,13,.15) 100%)',
  boxShadow: isActive
    ? `inset 0 2px 0 0 rgba(255,255,255,.08),
       inset 0 -1px 0 0 rgba(0,0,0,.55),
       0 4px 10px rgba(0,0,0,.35),
       0 0 0 1px rgba(106,114,87,.22)`
    : `inset 0 1px 0 0 rgba(255,255,255,.05),
       0 0 0 1px rgba(106,114,87,.15)`,
  borderTop: `2px solid rgba(255,255,255,.06)`,
  borderLeft: `2px solid rgba(106,114,87,.25)`,
  borderRight: `2px solid rgba(106,114,87,.25)`,
});

const underline = (isActive) => ({
  position: 'absolute',
  bottom: -6,
  left: 0,
  width: '100%',
  height: 4,
  background: isActive
    ? `linear-gradient(90deg, transparent 0%, ${railAccent} 10%, ${railText} 50%, ${railAccent} 90%, transparent 100%)`
    : 'transparent',
  boxShadow: isActive ? '0 0 14px rgba(106,114,87,.55)' : 'none',
  transition: 'opacity 160ms ease',
  opacity: isActive ? 1 : 0,
});

const topGlow = (isActive) => ({
  position: 'absolute',
  top: -1,
  left: 10,
  right: 10,
  height: 2,
  background: isActive
    ? 'linear-gradient(90deg, transparent, rgba(255,255,255,.28), transparent)'
    : 'transparent',
  filter: 'blur(.2px)',
});

// ==============================
// Component
// ==============================
export default function AssembliesNav({
  assemblies,
  selectedAssembly,
  selectedChild,
  openDropdowns,
  toggleDropdown,
  handleSelectAssembly,
  handleSelectChild,
  onAddAssemblyChild,
  onAddMissile,
  // === Visibility helpers ===
  assignedMap = {},
  showOnlyAssigned = false,
  fadeTooltip = 'No assets assigned yet.',
  // NEW: preAssigned (ACTIVE + has assets) loaded from server, per assembly title
  preAssignedSetByAssembly = {},
}) {
  // ==============================
  // Visual Tokens (children)
  // ==============================
  const childBg = '#000000ff';
  const childText = '#6a7257';
  const childBorder = '#ffffffff';
  const childSelectedBorder = limeSelected;

  // ==============================
  // Section Header Styles
  // ==============================
  const sectionHeaderStyle = { position: 'relative', height: 40, marginBottom: 10 };
  const sectionTitleStyle = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: 18,
    letterSpacing: '.12em',
    fontWeight: 900,
    color: '#6a7257',
    textDecoration: 'underline',
    textUnderlineOffset: '4px',
    textDecorationThickness: '2px',
    textAlign: 'center',
    width: '100%',
    pointerEvents: 'none',
  };
  const sectionAddBtnStyle = {
    position: 'absolute',
    right: 4,
    top: '50%',
    transform: 'translateY(-50%)',
    padding: 2,
    border: '1px solid #2c2f26',
    background: 'transparent',
    lineHeight: 1,
    borderRadius: 6,
  };

  // ==============================
  // Local State
  // ==============================
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [newType, setNewType] = useState('dog-bones');

  // Tabs list (Dog Bones / Zippers / Flowcrosses)
  const assemblyTabs = useMemo(
    () =>
      (assemblies || []).filter(
        (a) => a.title === 'Dog Bones' || a.title === 'Zippers' || a.title === 'Flowcrosses'
      ),
    [assemblies]
  );
  const defaultTabId =
    assemblyTabs.find((t) => t.id === selectedAssembly?.id)?.id || assemblyTabs[0]?.id || '';
  const [activeTab, setActiveTab] = useState(defaultTabId);

  // ---- Keep activeTab in sync with external selection (no setState in render) ----
  useEffect(() => {
    if (defaultTabId && activeTab !== defaultTabId) {
      setActiveTab(defaultTabId);
    }
  }, [defaultTabId, activeTab]);

  // ==============================
  // Helpers
  // ==============================
  const numericLabelMap = {
    'Dog Bones': (i) => `Dogbone-${i}`,
    Zippers: (i) => `Zipper-${i}`,
    Flowcrosses: (i) => `Flowcross-${i}`,
  };

  const buildNumericChildren = (assembly) => {
    if (!assembly?.title) return assembly?.children || [];
    const maker = numericLabelMap[assembly.title];
    if (!maker) return assembly?.children || [];
    const out = [];
    for (let i = 1; i <= 40; i++) out.push(maker(i));
    return out;
  };

  const baseLabelFor = (child) => String(child).replace(/\s*-\s*\d+$/, '').replace(/-\d+$/, '');
  const numberFor = (child) => {
    const m = /(\d+)\s*$/.exec(String(child));
    return m ? m[1] : '';
  };

  const activeAssembly =
    assemblyTabs.find((t) => t.id === activeTab) || assemblyTabs[0] || null;
  const activeChildren = activeAssembly ? buildNumericChildren(activeAssembly) : [];
  const preSet = activeAssembly ? (preAssignedSetByAssembly[activeAssembly.title] || new Set()) : new Set();

  const isAssignedByKey = (key) => {
    const k = String(key);
    return !!(assignedMap?.[k] || assignedMap?.[k.toLowerCase()] || assignedMap?.[k.toUpperCase()] || preSet.has(k));
  };

  // ==============================
  // Render
  // ==============================
  return (
    <div
      className="uppercase text-[#6a7257]"
      style={{
        width: '100%',
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        padding: '6px 8px',
        gap: 10,
        overflowY: 'auto',
        boxSizing: 'border-box',
      }}
    >
      {/* ==========================
         Assemblies Header
      =========================== */}
      <div style={sectionHeaderStyle}>
        <div style={sectionTitleStyle}>ASSEMBLIES</div>
        <button
          onClick={() => setShowAddPanel((s) => !s)}
          title="Add new child to an assembly"
          aria-label="Add assembly child"
          style={sectionAddBtnStyle}
        >
          <Plus size={18} />
        </button>
      </div>

      {/* ==========================
         Tabs (styled like AssetTabsNav)
      =========================== */}
      <div className="flex justify-start gap-1" style={{ position: 'relative' }}>
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: -8,
            right: 0,
            bottom: 0,
            height: 26,
            background:
              'linear-gradient(180deg, rgba(255,255,255,.03), rgba(0,0,0,0))',
          }}
        />
        {assemblyTabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              style={getTabStyle(isActive)}
              onClick={() => {
                setActiveTab(tab.id);
                handleSelectAssembly(tab);
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
            >
              <span style={{ position: 'relative', zIndex: 2 }}>{tab.title}</span>
              <span style={topGlow(isActive)} />
              <span style={underline(isActive)} />
            </button>
          );
        })}
      </div>

      {/* ==========================
         Add Popover
      =========================== */}
      {showAddPanel && (
        <div
          className="absolute z-20"
          style={{
            right: 10,
            top: 44,
            background: '#0e0f0c',
            border: '1px solid #2c2f26',
            borderRadius: 6,
            padding: 10,
            width: 300,
            boxShadow: '0 8px 24px rgba(0,0,0,.6)',
            textAlign: 'left',
          }}
        >
          <div className="text-[#b0b79f]" style={{ fontSize: 13, marginBottom: 6 }}>
            Create in:
          </div>
          <div className="flex flex-col gap-1">
            {assemblyTabs.map((t) => (
              <label key={t.id} className="flex items-center gap-2" style={{ fontSize: 14 }}>
                <input
                  type="radio"
                  name="newType"
                  value={t.id}
                  checked={newType === t.id}
                  onChange={() => setNewType(t.id)}
                />
                {t.title}
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2" style={{ marginTop: 8 }}>
            <button
              style={{
                fontSize: 14,
                padding: '3px 8px',
                border: '1px solid #2c2f26',
                color: '#cdd3bf',
                background: 'transparent',
                borderRadius: 4,
              }}
              onClick={() => setShowAddPanel(false)}
            >
              Cancel
            </button>
            <button
              style={{
                fontSize: 14,
                padding: '3px 8px',
                borderRadius: 4,
                background: '#6a7257',
                color: '#000',
                fontWeight: 800,
              }}
              onClick={
                onAddAssemblyChild
                  ? () => {
                      onAddAssemblyChild(newType);
                      setShowAddPanel(false);
                    }
                  : undefined
              }
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* ==========================
         Active Tab Children (grid)
      =========================== */}
      {activeAssembly && (
        <div
          style={{
            marginLeft: 6,
            marginTop: 4,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 6,
          }}
        >
          {activeChildren.map((child) => {
            const base = baseLabelFor(child);
            const num = numberFor(child);
            const childKey = `${base}-${num}`;
            const assigned = isAssignedByKey(childKey);

            if (showOnlyAssigned && !assigned) return null;

            const isChildSelected =
              selectedAssembly?.id === activeAssembly.id && selectedChild === child;

            return (
              <button
                key={child}
                onClick={() => handleSelectChild(activeAssembly, child)}
                className="text-left"
                title={!assigned ? fadeTooltip : undefined}
                style={{
                  position: 'relative',
                  padding: '2px 4px',
                  height: 36,
                  borderRadius: 8,
                  border: `1px solid ${
                    isChildSelected
                      ? childSelectedBorder
                      : assigned
                      ? childBorder
                      : 'rgba(255,255,255,.35)'
                  }`,
                  background: childBg,
                  color: assigned ? childText : '#485040',
                  fontSize: 12,
                  textTransform: 'Uppercase',
                  fontWeight: 800,
                  letterSpacing: '.06em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: assigned ? 1 : 0.45,
                  filter: assigned ? 'none' : 'grayscale(35%)',
                }}
              >
                {assigned && (
                  <span
                    aria-hidden
                    style={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: '#6aff58',
                      boxShadow: '0 0 8px #6aff58aa',
                    }}
                  />
                )}
                <span style={{ whiteSpace: 'nowrap' }}>{base}</span>
                <span
                  style={{
                    minWidth: 34,
                    height: 26,
                    padding: '0 0px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    border: `1px solid ${assigned ? '#ffffffff' : 'rgba(255,255,255,.35)'}`,
                    background: 'black',
                    color: assigned ? '#6a7257' : '#485040',
                    fontWeight: 900,
                    fontSize: 14,
                    letterSpacing: '.06em',
                    boxShadow: isChildSelected ? '0 0 0 1px #ffffffff inset' : 'none',
                  }}
                >
                  {num}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ==========================
         Missiles Header
      =========================== */}
      <div style={{ position: 'relative', height: 40, marginTop: 12 }}>
        <div style={sectionTitleStyle}>MISSILES</div>
        <button
          onClick={onAddMissile}
          title="Add new missile"
          aria-label="Add missile"
          style={sectionAddBtnStyle}
        >
          <Plus size={18} />
        </button>
      </div>

      {/* ==========================
         Missiles List
      =========================== */}
      <div style={{ marginLeft: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {assemblies.find((a) => a.title === 'Missiles')?.children?.map((child) => {
          const isSelected = selectedAssembly?.title === 'Missiles' && selectedChild === child;
          return (
            <button
              key={child}
              onClick={() =>
                handleSelectChild(assemblies.find((a) => a.title === 'Missiles'), child)
              }
              className="w-full text-left"
              style={{
                padding: '3px 10px',
                height: 31,
                borderRadius: 8,
                border: `1px solid ${isSelected ? limeSelected : childBorder}`,
                background: childBg,
                color: childText,
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {child}
            </button>
          );
        })}
      </div>
    </div>
  );
}
