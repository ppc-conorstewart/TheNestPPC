// ==============================
// pages/OverwatchPage.jsx — Context-synced active job, seamless re-render on JobUpdate
// ==============================

import { useEffect, useMemo, useState } from 'react';

// Modular Overwatch components
import ActivePadsNav from '../components/Overwatch Components/ActivePadsNav';
import OverwatchDashboardGrid from '../components/Overwatch Components/OverwatchDashboardGrid';
import OverwatchHeader from '../components/Overwatch Components/OverwatchHeader';
import { useJobContext } from '../context/JobContext';

export default function OverwatchPage() {
  const context = useJobContext?.();
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!context) {
    return (
      <div style={{ color: 'red', fontSize: 28, padding: 40 }}>
        No JobContext available. Check your provider setup!
      </div>
    );
  }

  const { jobs, loading, activeJob } = context;
  const activeJobs = Array.isArray(jobs) ? jobs : [];

  // Keep list selection in sync with context's activeJob when it changes
  useEffect(() => {
    if (!activeJob) return;
    const idx = activeJobs.findIndex(j => j.id === activeJob.id);
    if (idx >= 0) setSelectedIndex(idx);
  }, [activeJob, activeJobs]);

  // Choose the job to render: selected from list, else activeJob, else first
  const jobToRender = useMemo(() => {
    return activeJobs[selectedIndex] || activeJob || activeJobs[0] || null;
  }, [activeJobs, selectedIndex, activeJob]);

  const padSubtitle = jobToRender
    ? `${(jobToRender.customer || '').toUpperCase()} ${(jobToRender.surface_lsd || '').toUpperCase()}`
    : '';

  return (
    <div
      className="w-full flex justify-center items-top"
      style={{
        minHeight: '100%',
        height: '100%',
        width: '100%',
        margin: 0,
        padding: 12,
        boxSizing: "border-box",
        background: 'rgba(0,0,0,0.86)',
      }}
    >
      {/* Main content block: PadsNav + Grid */}
      <div
        className="main-content-block rounded-xl mt-0 shadow-xl flex flex-row"
        style={{
          width: "100%",
          maxWidth: "100%",
          minWidth: "100%",
          height: "100%",
          minHeight: "0",
          marginTop: "0",
          marginBottom: 100,
          background: 'rgba(0,0,0,0.86)',
          boxShadow: '0 4px 42px 0 #2229',
          alignItems: "stretch",
          border: '2px solid #6a7257',
          boxSizing: "border-box",
        }}
      >
        {/* LEFT: PadsNav */}
        <div
          style={{
            minWidth: 260,
            maxWidth: 320,
            width: 320,
            height: '100%',
            background: '#181f17',
            borderRight: '2px solid #7b8660',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            boxSizing: 'border-box',
            padding: 0,
            margin: 0,
            borderTop: 'none',
            borderBottom: 'none',
            zIndex: 10
          }}>
          <ActivePadsNav
            jobs={activeJobs}
            selectedIndex={selectedIndex}
            onSelectJob={setSelectedIndex}
          />
        </div>

        {/* Main Grid Content */}
        <div
          className="flex-1 flex flex-col min-w-0"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: 0,
            minWidth: 0,
            boxSizing: 'border-box',
            overflow: 'hidden',
            padding: 0,
            margin: 0,
            background: 'none',
            zIndex: 5
          }}>
          <OverwatchHeader
            padSubtitle={padSubtitle}
            activeJob={jobToRender}
          />
          <OverwatchDashboardGrid
            job={jobToRender}
            // zoneProgress & requiredItems are derived from job_update_json when omitted
          />
        </div>
      </div>
    </div>
  );
}
