// =================== Imports and Dependencies ===================
import { useEffect, useState } from 'react';
import ActiveTransfers from './ActiveTransfers';
import ActivityLogTable from './ActivityLogTable';
import useMediaQuery from '../../hooks/useMediaQuery';

// =================== Style Constants ===================
const bgCard = '#000';
const bgAccent = '#10110f';
const textMain = '#e6e8df';

// =================== Right Panel Component ===================
export default function RightPanel({
  filteredAssets,
  activityLogs,
  assetNameMap,
  activityLogHeight,
}) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [activityCollapsed, setActivityCollapsed] = useState(false);

  useEffect(() => {
    setActivityCollapsed(isMobile);
  }, [isMobile]);

  const sectionTitleStyle = {
    color: '#fff',
    fontWeight: 700,
    border: 2,
    fontSize: '1.06rem',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textAlign: 'center',
    margin: '0 0 0px 0',
    padding: 0,
    userSelect: 'none',
  };

  const dividerStyle = {
    height: 2,
    width: '100%',
    borderRight: 2,
    background: '#23251d',
    border: '#6a7257',
    margin: '0 0 0px 0',
  };

  const availableCount = filteredAssets.filter(a => a.status === 'Available').length;
  const newCount = filteredAssets.filter(a => a.status === 'New').length;
  const inUseCount = filteredAssets.filter(a => a.status === 'In-Use').length;
  const underReviewCount = filteredAssets.filter(a => a.status === 'Under Review').length;
  const downedCount = filteredAssets.filter(a => a.status === 'Downed').length;
  const masterAssembliesCount = filteredAssets.filter(a => a.category === 'Master Assembly').length;
  const totalCount = filteredAssets.length;

  return (
    <div
      style={{
        width: '100%',
        background: '#000',
        margin: 0,
        height: '100%',
        fontSize: '1em',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'stretch',
        minHeight: 0,
        overflow: 'hidden',
      }}
      className="right-panel"
    >
      <div
        style={{
          background: bgCard,
          borderRadius: 0,
          padding: '0px',
          flex: '0 0 auto',
          display: 'flex',
          flexDirection: 'column',
          marginBottom: 0,
          boxShadow: '0 8px 36px #000c 0.12',
        }}
      >
        <div style={sectionTitleStyle}>Asset Summary</div>

        {/* ===== Compact Table Layout (Two Columns) ===== */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            columnGap: 12,
            rowGap: 2,
            padding: '6px 8px 6px 8px',
          }}
        >
          <SummaryPair label="AVAILABLE" value={availableCount} color="#7CFC00" />
          <SummaryPair label="NEW" value={newCount} color="#1E90FF" />
          <SummaryPair label="IN-USE" value={inUseCount} color="#FFFF00" />
          <SummaryPair label="UNDER REVIEW" value={underReviewCount} color="#A0522D" />
          <SummaryPair label="DOWNED" value={downedCount} color="#FF0000" />
          <SummaryPair label="MASTER ASSEMBLIES" value={masterAssembliesCount} color="#800080" />
        </div>

        {/* ===== Total Row ===== */}
        <div
          style={{
            padding: '6px 8px 8px 8px',
            borderTop: '1px solid #23251d',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ color: '#b0b79f', fontSize: '0.95em' }}>TOTAL</span>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.1em' }}>{totalCount}</span>
        </div>
      </div>

      <div style={dividerStyle}></div>

      <div
        style={{
          background: bgCard,
          borderRadius: 0,
          border: 2,
          padding: '0px 0px 0px 1px',
          flex: '1 1 200px',
          display: 'flex',
          flexDirection: 'column',
          marginBottom: 0,
          boxShadow: '0 8px 36px #000c 0.12',
          minHeight: 0,
          maxHeight: '40%',
        }}
      >
        <div style={sectionTitleStyle}>Active Transfers</div>
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          <ActiveTransfers section="right-panel" />
        </div>
      </div>

      <div style={dividerStyle}></div>

      <div
        style={{
          background: bgCard,
          borderRadius: 0,
          padding: '0px 0px 0px 0px',
          flex: isMobile && activityCollapsed ? '0 0 auto' : '2 2 300px',
          border: 2,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          boxShadow: '0 8px 36px #000c 0.12',
        }}
      >
        <button
          type='button'
          onClick={() => {
            if (isMobile) setActivityCollapsed(prev => !prev);
          }}
          style={{
            ...sectionTitleStyle,
            background: 'transparent',
            border: 'none',
            cursor: isMobile ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: '8px 0',
            opacity: isMobile ? 0.96 : 1,
          }}
        >
          Activity Log
          {isMobile && (
            <span
              style={{
                display: 'inline-block',
                transform: activityCollapsed ? 'rotate(180deg)' : 'none',
                transition: 'transform 180ms ease',
                fontSize: '0.9em',
              }}
              aria-hidden='true'
            >
              {'v'}
            </span>
          )}
        </button>
        {(!isMobile || !activityCollapsed) && (
          <div
            style={{
              background: bgAccent,
              borderRadius: 0,
              border: 2,
              padding: 6,
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
            }}
          >
            <ActivityLogTable logs={activityLogs} assetNameMap={assetNameMap} compact />
          </div>
        )}
      </div>
    </div>
  );
}

// =================== Summary Pair Component ===================
function SummaryPair({ label, value, color }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
        padding: '2px 4px',
      }}
    >
      <span style={{ color: '#b0b79f', fontSize: '0.92em' }}>{label}</span>
      <span style={{ color: color, fontWeight: 700 }}>{value}</span>
    </div>
  );
}
