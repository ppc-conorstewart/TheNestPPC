// =================== Imports and Dependencies ===================
import ActiveTransfers from './ActiveTransfers';
import ActivityLogTable from './ActivityLogTable';

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

  return (
    <div
      style={{
        width: 520,
        minWidth: 480,
        flex: '0 0 520px',
        background: '#000',
        margin: 0,
        height: '100%',
        fontSize: '1em',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'stretch',
        minHeight: 0,
      }}
      className="right-panel"
    >
      <div
        style={{
          background: bgCard,
          borderRadius: 0,
          padding: '0px',
          flex: '0.3 0.5 0%',
          display: 'flex',
          flexDirection: 'column',
          marginBottom: 0,
          boxShadow: '0 8px 36px #000c 0.12',
        }}
      >
        <div style={sectionTitleStyle}>Asset Summary</div>
        <div style={{ display: 'flex', gap: 0, justifyContent: 'center', alignItems: 'center', padding: 0, marginBottom: 0 }}>
          <SummaryCard label="AVAILABLE" value={filteredAssets.filter((a) => a.status === 'Available').length} color="#00ff0da3" />
          <SummaryCard label="NEW" value={filteredAssets.filter((a) => a.status === 'New').length} color="#ffc107d3" />
          <SummaryCard label="IN-USE" value={filteredAssets.filter((a) => a.status === 'In-Use').length} color="#ff0202b8" />
          <SummaryCard label="TOTAL" value={filteredAssets.length} color="#ffffff" strong />
        </div>
      </div>

      <div style={dividerStyle}></div>

      <div
        style={{
          background: bgCard,
          borderRadius: 0,
          border: 2,
          padding: '0px 0px 0px 1px',
          flex: '1.2 1.2 0%',
          display: 'flex',
          flexDirection: 'column',
          marginBottom: 0,
          boxShadow: '0 8px 36px #000c 0.12',
          minHeight: 0,
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
          flex: '1 1 0%',
          border: 2,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          boxShadow: '0 8px 36px #000c 0.12',
        }}
      >
        <div style={sectionTitleStyle}>Activity Log</div>
        <div style={{
          background: bgAccent,
          borderRadius: 0,
          border: 2,
          padding: 6,
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
        }}>
          <ActivityLogTable logs={activityLogs} assetNameMap={assetNameMap} compact />
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, strong, color }) {
  return (
    <div style={{ background: '#10110f', borderRadius: 0, minWidth: 105, padding: '10px 10px', margin: '0 4px', textAlign: 'center', flex: 1 }}>
      <div style={{ color: '#b0b79f', fontSize: '0.97em', marginBottom: 3, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: '1.5em', fontWeight: 700, color: strong ? '#fff' : color, letterSpacing: 1 }}>{value}</div>
    </div>
  );
}
