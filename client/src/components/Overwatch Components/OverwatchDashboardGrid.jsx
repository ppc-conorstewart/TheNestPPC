// ==============================
// components/Overwatch Components/OverwatchDashboardGrid.jsx — Derives live props from job_update_json
// ==============================

import React, { useMemo } from 'react';
import BodyPressureChartCard from './BodyPressureChartCard';
import CoilTabCard from './CoilTabCard';
import LastShiftUpdateCard from './LastShiftUpdateCard';
import LiveBodyPressureCard from './LiveBodyPressureCard';
import RequiredItemsCard from './RequiredItemsCard';
import ZoneCountCard from './ZoneCountCard';
import ZonesCompletedCard from './ZonesCompletedCard';

// Dashboard grid styles
const dashboardTopGrid = {
  width: '100%',
  flex: 1,
  minHeight: 0,
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gridGap: '0px',
  marginBottom: '0px',
  alignItems: 'stretch'
};

const dashboardBottomGrid = {
  width: '100%',
  flex: 1,
  minHeight: 0,
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr 1fr',
  gridGap: '0px',
  alignItems: 'center'
};

// ------------------------------
// Helpers to read job_update_json
// ------------------------------
function parsePair(txt) {
  // supports "3/10", " 3 / 10 ", or number -> [n, n]
  if (txt == null) return [0, 0];
  if (typeof txt === 'number') return [Number(txt) || 0, 0];
  const m = String(txt).match(/^\s*(\d+)\s*\/\s*(\d+)\s*$/);
  if (!m) return [0, 0];
  return [Number(m[1]) || 0, Number(m[2]) || 0];
}

function deriveZoneProgress(job) {
  const u = (job && job.job_update_json) || {};
  // 1) If totalZones is present as "x/y", use that
  if (u.totalZones) {
    const [completed, total] = parsePair(u.totalZones);
    return { completed, total };
  }

  // 2) Otherwise sum across per-zone fields (A/B/C or 1/2/3)
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

  // 3) Fallback
  return { completed: 0, total: 0 };
}

export default function OverwatchDashboardGrid({
  job,
  zoneProgress,          // optional explicit override
  onZoneEdit,
  requiredItems,         // optional explicit override
  onAddRequiredItem
}) {
  const jobObj = job || {};

  // Drive cards from latest snapshot if explicit props aren’t provided
  const computedZoneProgress = useMemo(
    () => zoneProgress || deriveZoneProgress(jobObj),
    [zoneProgress, jobObj]
  );

  const items = useMemo(
    () => requiredItems || jobObj.requiredItems || [],
    [requiredItems, jobObj]
  );

  return (
    <React.Fragment>
      <div style={dashboardTopGrid}>
        <ZonesCompletedCard job={jobObj} />
        <BodyPressureChartCard job={jobObj} />
        <LiveBodyPressureCard job={jobObj} />
      </div>
      <div style={dashboardBottomGrid}>
        <ZoneCountCard
          job={jobObj}
          zoneProgress={computedZoneProgress}
          onZoneEdit={onZoneEdit}
        />
        <LastShiftUpdateCard job={jobObj} />
        <CoilTabCard job={jobObj} />
        <RequiredItemsCard
          job={jobObj}
          items={items}
          onAddItem={onAddRequiredItem}
        />
      </div>
    </React.Fragment>
  );
}
