// ==============================
// src/components/Master Assembly Components/Master Assemblies Hub Components/HistoryPane.jsx
// Right-side history panel
// ==============================

export default function HistoryPane({
  cardBg = '#000',
  glassBorder = '1px solid rgba(255,255,255,.06)',
  styles = {},
  historyLog = [],
}) {
  const wrapperStyle = typeof styles.historyPane === 'function'
    ? styles.historyPane(cardBg, glassBorder)
    : { width: 420, borderLeft: glassBorder, background: cardBg };

  return (
    <div style={wrapperStyle}>
      <div style={{ padding: 12, borderBottom: glassBorder, fontWeight: 900, letterSpacing: '.1em', color: '#dfe3d1' }}>
        HISTORY
      </div>
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Array.isArray(historyLog) && historyLog.length > 0 ? (
          historyLog.map((h, idx) => (
            <div key={idx} style={{ border: '1px solid #2a2d24', borderRadius: 8, padding: 10, background: '#0f100e' }}>
              <div style={{ fontWeight: 800, color: '#e6e8df' }}>{h.action || '—'}</div>
              <div style={{ fontSize: 12, color: '#b0b79f' }}>{h.slot || ''}</div>
              <div style={{ fontSize: 12, color: '#8a9278' }}>{h.assetId || ''}</div>
              <div style={{ fontSize: 11, color: '#6a7257' }}>{h.time ? new Date(h.time).toLocaleString() : ''}</div>
            </div>
          ))
        ) : (
          <div style={{ color: '#8a9278', fontSize: 12 }}>No history yet.</div>
        )}
      </div>
    </div>
  );
}
