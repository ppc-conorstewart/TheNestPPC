// ==============================
// components/Overwatch Components/OverwatchDashboardGrid.jsx — Derives live props from job_update_json
// ==============================

import { useMemo, useState } from 'react';
import BodyPressureChartCard from './BodyPressureChartCard';
import CoilTabCard from './CoilTabCard';
import LastShiftUpdateCard from './LastShiftUpdateCard';
import LiveBodyPressureCard from './LiveBodyPressureCard';
import RequiredItemsCard from './RequiredItemsCard';
import ZoneCountCard from './ZoneCountCard';
import ZonesCompletedCard from './ZonesCompletedCard';

// ==============================
// Layout (no background here)
// ==============================
const wrapperStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative'
};

const dashboardTopGrid = {
  width: '100%',
  flex: 1,
  minHeight: 0,
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gridGap: '4px',
  marginBottom: '8px',
  alignItems: 'stretch'
};

const dashboardBottomGrid = {
  width: '100%',
  flex: 1,
  minHeight: 0,
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr 1fr',
  gridGap: '4px',
  alignItems: 'stretch'
};

// ==============================
// Helpers
// ==============================
function parsePair(txt) {
  if (txt == null) return [0, 0];
  if (typeof txt === 'number') return [Number(txt) || 0, 0];
  const m = String(txt).match(/^\s*(\d+)\s*\/\s*(\d+)\s*$/);
  if (!m) return [0, 0];
  return [Number(m[1]) || 0, Number(m[2]) || 0];
}

function deriveZoneProgress(job) {
  const u = (job && job.job_update_json) || {};
  if (u.totalZones) {
    const [completed, total] = parsePair(u.totalZones);
    return { completed, total };
  }
  const perZoneKeys = Object.keys(u || {}).filter(
    k => /^(aZone|bZone|cZone|dZone|eZone|zone\d+)$/i.test(k)
  );
  if (perZoneKeys.length > 0) {
    return perZoneKeys.reduce(
      (acc, key) => {
        const [c, t] = parsePair(u[key]);
        acc.completed += c;
        acc.total += t;
        return acc;
      },
      { completed: 0, total: 0 }
    );
  }
  return { completed: 0, total: 0 };
}

// ==============================
// Collapsible Glass Wrapper
// ==============================
const glassCardShell = {
  position: 'relative',
  height: '100%',
  minHeight: 0,
  backdropFilter: 'blur(4px) saturate(140%)',
  
  background: 'rgba(24,28,20,0.58)',
 
  borderRadius: 14,
  boxShadow: '0 4px 24px rgba(0,0,0,0.45)',
  overflow: 'hidden'
};

const collapseBtn = {
  position: 'absolute',
  top: 6,
  right: 8,
  zIndex: 5,
  background: '#23281c',
  color: '#E6E8DF',
  border: '1px solid #35392e',
  borderRadius: 6,
  padding: '2px 8px',
  lineHeight: 1,
  cursor: 'pointer'
};

const collapsedBar = {
  background: 'rgba(11,12,10,0.72)',
  color: '#b0b79f',
  border: '1px solid #35392e',
  borderRadius: 14,
  padding: '8px 12px',
  fontWeight: 800,
  letterSpacing: '0.04em',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  userSelect: 'none',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(4px)'
};

function CollapsibleCard({ id, title, children, collapsed, onToggle }) {
  if (collapsed) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, padding: 6 }}>
        <div onClick={() => onToggle(id)} style={collapsedBar}>
          <span>{title}</span>
          <span style={{ fontSize: 18 }}>+</span>
        </div>
      </div>
    );
  }
  return (
    <div style={{ ...glassCardShell, margin: 6 }}>
      <button onClick={() => onToggle(id)} title='Collapse' style={collapseBtn}>−</button>
      <div style={{ height: '100%', minHeight: 0 }}>{children}</div>
    </div>
  );
}

// ==============================
// Component
// ==============================
export default function OverwatchDashboardGrid({
  job,
  zoneProgress,
  onZoneEdit,
  requiredItems,
  onAddRequiredItem
}) {
  const jobObj = job || {};

  const computedZoneProgress = useMemo(
    () => zoneProgress || deriveZoneProgress(jobObj),
    [zoneProgress, jobObj]
  );

  const items = useMemo(
    () => requiredItems || jobObj.requiredItems || [],
    [requiredItems, jobObj]
  );

  const [collapsedCards, setCollapsedCards] = useState({});

  function toggleCard(id) {
    setCollapsedCards(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function collapseAll() {
    setCollapsedCards({
      zonesCompleted: true,
      bodyPressure: true,
      livePressure: true,
      zoneCount: true,
      lastShift: true,
      coilTab: true,
      requiredItems: true
    });
  }

  function expandAll() {
    setCollapsedCards({});
  }

  return (
    <div style={wrapperStyle}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '0px 0px 0px' }}>
        <button
          onClick={collapseAll}
          style={{ background: '#35392e', color: '#fff', padding: '0px 0px', borderRadius: 6, }}
        >
          Collapse All
        </button>
        <button
          onClick={expandAll}
          style={{ background: '#6a7257', color: '#fff', padding: '0px 8px', borderRadius: 6, }}
        >
          ⤢
        </button>
      </div>

      <div style={dashboardTopGrid}>
        <CollapsibleCard
          id='zonesCompleted'
          title='Zones Completed'
          collapsed={collapsedCards['zonesCompleted']}
          onToggle={toggleCard}
        >
          <ZonesCompletedCard job={jobObj} />
        </CollapsibleCard>

        <CollapsibleCard
          id='bodyPressure'
          title='Body Pressure Chart'
          collapsed={collapsedCards['bodyPressure']}
          onToggle={toggleCard}
        >
          <BodyPressureChartCard job={jobObj} />
        </CollapsibleCard>

        <CollapsibleCard
          id='livePressure'
          title='Live Pressure Data'
          collapsed={collapsedCards['livePressure']}
          onToggle={toggleCard}
        >
          <LiveBodyPressureCard job={jobObj} />
        </CollapsibleCard>
      </div>

      <div style={dashboardBottomGrid}>
        <CollapsibleCard
          id='zoneCount'
          title='Zone Count'
          collapsed={collapsedCards['zoneCount']}
          onToggle={toggleCard}
        >
          <ZoneCountCard
            job={jobObj}
            zoneProgress={computedZoneProgress}
            onZoneEdit={onZoneEdit}
          />
        </CollapsibleCard>

        <CollapsibleCard
          id='lastShift'
          title='Last Shift Update'
          collapsed={collapsedCards['lastShift']}
          onToggle={toggleCard}
        >
          <LastShiftUpdateCard job={jobObj} />
        </CollapsibleCard>

        <CollapsibleCard
          id='coilTab'
          title='Coil Tab'
          collapsed={collapsedCards['coilTab']}
          onToggle={toggleCard}
        >
          <CoilTabCard job={jobObj} />
        </CollapsibleCard>

        <CollapsibleCard
          id='requiredItems'
          title='Required Items'
          collapsed={collapsedCards['requiredItems']}
          onToggle={toggleCard}
        >
          <RequiredItemsCard
            job={jobObj}
            items={items}
            onAddItem={onAddRequiredItem}
          />
        </CollapsibleCard>
      </div>
    </div>
  );
}
