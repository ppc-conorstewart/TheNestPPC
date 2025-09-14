// ==============================
// src/components/Master Assembly Components/AssembliesNav.jsx
// ==============================
import { Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useCustomers } from '../../hooks/useCustomers';

const palomaGreen = '#6a7257';
const limeSelected = '#99ff00';

// ===== Tabs styling =====
const tabBase = {
  padding: '6px 14px',
  fontWeight: 700,
  border: 'none',
  outline: 'none',
  borderRadius: '0px 0px 0 0',
  fontSize: '0.9em',
  marginRight: 6,
  cursor: 'pointer',
  letterSpacing: 1,
  textTransform: 'uppercase',
  background: 'transparent',
  borderBottom: '3px solid transparent',
  transition:
    'background 0.18s, color 0.18s, border-bottom 0.18s, box-shadow 160ms ease, transform 160ms ease',
  position: 'relative',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  whiteSpace: 'normal',
  lineHeight: 1.1,
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
    ? 'inset 0 2px 0 0 rgba(255,255,255,.08), inset 0 -1px 0 0 rgba(0,0,0,.55), 0 3px 8px rgba(0,0,0,.3), 0 0 0 1px rgba(106,114,87,.22)'
    : 'inset 0 1px 0 0 rgba(255,255,255,.05), 0 0 0 1px rgba(106,114,87,.15)',
  borderTop: '1px solid rgba(255,255,255,.06)',
  borderLeft: '1px solid rgba(106,114,87,.25)',
  borderRight: '1px solid rgba(106,114,87,.25)',
  flex: '1 1 auto',
  textAlign: 'center',
  minWidth: 0,
});

const underline = (isActive) => ({
  position: 'absolute',
  bottom: -5,
  left: 0,
  width: '100%',
  height: 3,
  background: isActive
    ? 'linear-gradient(90deg, transparent 0%, #6a7257 10%, #ffffffff 50%, #6a7257 90%, transparent 100%)'
    : 'transparent',
  boxShadow: isActive ? '0 0 12px rgba(106,114,87,.55)' : 'none',
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
  assignedMap = {},
  showOnlyAssigned = false,
  fadeTooltip = 'No assets assigned yet.',
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

  // Tabs list (Dog Bones / Zippers / Flow Crosses / Coil Trees)
  const assemblyTabs = useMemo(
    () =>
      (assemblies || []).filter(
        (a) =>
          a.title === 'Dog Bones' ||
          a.title === 'Zippers' ||
          a.title === 'Flow Crosses' ||
          a.title === 'Coil Trees'
      ),
    [assemblies]
  );
  const defaultTabId =
    assemblyTabs.find((t) => t.id === selectedAssembly?.id)?.id || assemblyTabs[0]?.id || '';
  const [activeTab, setActiveTab] = useState(defaultTabId);

  // ---- Keep activeTab in sync with external selection ----
  useEffect(() => {
    if (defaultTabId && activeTab !== defaultTabId) {
      setActiveTab(defaultTabId);
    }
  }, [defaultTabId, activeTab]);

  // ==============================
  // Helpers
  // ==============================
  const numericLabelMap = {
    'Dog Bones': function (i) { return 'Dogbone-' + i; },
    Zippers: function (i) { return 'Zipper-' + i; },
    'Flow Crosses': function (i) { return 'Flowcross-' + i; },
    'Coil Trees': function (i) { return 'CoilTree-' + i; },
  };

  const buildNumericChildren = (assembly) => {
    if (!assembly || !assembly.title) return (assembly && assembly.children) || [];
    const maker = numericLabelMap[assembly.title];
    if (!maker) return assembly.children || [];
    const out = [];
    const max = assembly.title === 'Coil Trees' ? 20 : 40;
    for (let i = 1; i <= max; i++) out.push(maker(i));
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
    return !!(assignedMap[k] || assignedMap[k && k.toLowerCase()] || assignedMap[k && k.toUpperCase()] || preSet.has(k));
  };

  // ==============================
  // Missiles: Assigned-To (Customers)
  // ==============================
  const { customers } = useCustomers();
  const [missileAssignees, setMissileAssignees] = useState({}); // { [childName]: customer_id|null }

  const customersById = useMemo(() => {
    const m = new Map();
    (customers || []).forEach((c) => {
      const key = typeof c.id === 'number' ? c.id : Number(c.id) || c.id;
      m.set(key, c);
    });
    return m;
  }, [customers]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/master/missiles/assignees', { credentials: 'include' });
        if (!res.ok) return;
        const rows = await res.json();
        if (!alive) return;
        const next = {};
        (rows || []).forEach((r) => { next[String(r.child)] = r.customer_id || null; });
        setMissileAssignees(next);
      } catch {}
    })();
    return () => { alive = false; };
  }, []);

  async function saveMissileAssignee(child, customer_id) {
    setMissileAssignees((m) => ({ ...m, [child]: customer_id || null }));
    try {
      await fetch('/api/master/missiles/assignee', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ child, customer_id }),
      });
    } catch {}
  }

  // ==============================
  // Render
  // ==============================
  return (
    <div
      className='uppercase text-[#6a7257]'
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
          onClick={() => setShowAddPanel(function (s) { return !s; })}
          title='Add new child to an assembly'
          aria-label='Add assembly child'
          style={sectionAddBtnStyle}
        >
          <Plus size={18} />
        </button>
      </div>

      {/* ==========================
         Tabs (responsive grid, no horizontal scroll)
      =========================== */}
      <div
        className='grid gap-2'
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}
      >
        {assemblyTabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role='tab'
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
            const childKey = base + '-' + num;
            const assigned = isAssignedByKey(childKey);

            if (showOnlyAssigned && !assigned) return null;

            const isChildSelected =
              selectedAssembly && selectedAssembly.id === activeAssembly.id && selectedChild === child;

            return (
              <button
                key={child}
                onClick={() => handleSelectChild(activeAssembly, child)}
                className='text-left'
                title={!assigned ? fadeTooltip : undefined}
                style={{
                  position: 'relative',
                  padding: '2px 4px',
                  height: 34,
                  borderRadius: 8,
                  border: '1px solid ' + (isChildSelected ? childSelectedBorder : (assigned ? childBorder : 'rgba(255,255,255,.35)')),
                  background: childBg,
                  color: assigned ? childText : '#485040',
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '.06em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: assigned ? 1 : 0.45,
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
                    minWidth: 28,
                    height: 24,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 6,
                    border: '1px solid ' + (assigned ? '#ffffffff' : 'rgba(255,255,255,.35)'),
                    background: 'black',
                    color: assigned ? '#6a7257' : '#485040',
                    fontWeight: 900,
                    fontSize: 13,
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
         MISSILES
      =========================== */}
      <div style={{ position: 'relative', height: 40, marginTop: 12 }}>
        <div style={sectionTitleStyle}>MISSILES</div>
        <button
          onClick={onAddMissile}
          title='Add new missile'
          aria-label='Add missile'
          style={sectionAddBtnStyle}
        >
          <Plus size={18} />
        </button>
      </div>

      <div style={{ marginLeft: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {(assemblies.find((a) => a.title === 'Missiles')?.children || []).map((child) => {
          const isSelected =
            selectedAssembly && selectedAssembly.title === 'Missiles' && selectedChild === child;

          const value = missileAssignees[child] || '';
          const valueNum = typeof value === 'number' ? value : Number(value) || value;
          const selectedCustomer = customersById.get(valueNum);

          return (
            <div
              key={child}
              style={{
                padding: '2px 10px',
                borderRadius: 8,
                border: '1px solid ' + (isSelected ? limeSelected : childBorder),
                background: childBg,
                color: childText,
                fontSize: 14,
                fontWeight: 700,
                display: 'grid',
                gridTemplateColumns: '1fr 140px',
                gap: 10,
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  onClick={() =>
                    handleSelectChild(assemblies.find((a) => a.title === 'Missiles'), child)
                  }
                  className='w-full text-left'
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: childText,
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: 'pointer',
                    textAlign: 'left',
                    lineHeight: 1.2,
                  }}
                >
                  {child}
                </button>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: '#b0b79f',
                      fontWeight: 800,
                      letterSpacing: '.06em',
                    }}
                  >
                    ASSIGNED TO:
                  </span>
                  <select
                    value={value || ''}
                    onChange={(e) =>
                      saveMissileAssignee(child, e.target.value ? Number(e.target.value) : null)
                    }
                    style={{
                      height: 32,
                      background: '#0e100d',
                      color: '#e8eadf',
                      border: '1px solid #2c2f26',
                      borderRadius: 6,
                      fontWeight: 700,
                      letterSpacing: '.02em',
                      minWidth: 220,
                    }}
                  >
                    <option value=''>Unassigned</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                style={{
                  height: 64,
                  border: '1px solid rgba(255,255,255,.15)',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#0a0b09',
                  overflow: 'hidden',
                }}
              >
                {selectedCustomer && (selectedCustomer.logo || selectedCustomer.logo_url) ? (
                  <img
                    src={selectedCustomer.logo || selectedCustomer.logo_url}
                    alt={selectedCustomer.name + ' logo'}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
