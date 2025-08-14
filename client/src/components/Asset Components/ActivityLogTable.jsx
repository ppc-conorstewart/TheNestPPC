// =================== Imports and Constants ===================
import { FILTER_KEYS } from '../../constants/assetFields';

// =================== Activity Log Table Component ===================
export default function ActivityLogTable({ logs, assetNameMap, compact }) {
  // --------- Font Size Definitions ---------
  const containerFont = compact ? '0.6em' : '0.6em';
  const tableFont = '0.6em';
  const headerFont = '0.6em';
  const rowFont = '0.6em';
  const userFont = '0.6em';
  const emptyFont = '0.6em';

  // =================== Table Container ===================
  return (
    <div
      style={{
        background: '#000',
        padding: compact ? 3 : 6,
        borderRadius: 8,
        color: '#e6e8df',
        fontSize: containerFont,
        minHeight: 16,
        width: '100%',
        boxShadow: '0 2px 10px #000a',
        borderBottom: 'white',
        borderRight: 'white',
        border: '1',
      }}
    >
      {/* =================== Activity Log Table =================== */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          background: '#000',
          color: '#e6e8df',
          fontSize: tableFont
        }}
      >
        <thead>
          <tr style={{
            background: '#181818',
            color: '#6a7257'
          }}>
            <th style={{ padding: '3px 5px', fontWeight: 700, fontSize: headerFont, background: '#181818' }}>Timestamp / User</th>
            <th style={{ padding: '3px 5px', fontWeight: 700, fontSize: headerFont, background: '#181818' }}>Description</th>
          </tr>
        </thead>
        <tbody>
          {/* =================== Log Entry Rendering =================== */}
          {logs.length > 0 ? (
            logs.map((log) => {
              let detailsObj = {};
              try {
                detailsObj = log.details
                  ? (typeof log.details === 'string'
                      ? JSON.parse(log.details)
                      : log.details)
                  : {};
              } catch {
                detailsObj = {};
              }

              let descriptionNode = null;

              // --------- Multiple Asset Transfer ---------
              if (
                log.action === 'Transferred Multiple Assets' &&
                Array.isArray(detailsObj.items) &&
                detailsObj.newLocation
              ) {
                const itemList = detailsObj.items.map((ppc, idx) => (
                  <span key={ppc} style={{ color: '#ef4444', fontWeight: 400 }}>
                    {ppc}{idx < detailsObj.items.length - 1 ? ', ' : ''}
                  </span>
                ));
                descriptionNode = (
                  <div style={{ whiteSpace: 'pre-line' }}>
                    <div>Admin Transfer:</div>
                    <div>
                      Transferred Asset{detailsObj.items.length > 1 ? 's' : ''} {itemList} to {detailsObj.newLocation}
                    </div>
                  </div>
                );
              }
              // --------- Asset Update ---------
              else if (log.action === 'Updated Asset') {
                const assetId = log.asset_id;
                const existingName = assetNameMap[assetId] || 'Unknown';
                if (detailsObj.newLocation || detailsObj.location) {
                  const toLoc = detailsObj.newLocation || detailsObj.location;
                  descriptionNode = (
                    <div style={{ whiteSpace: 'pre-line' }}>
                      <div>Shop to Shop Transfer:</div>
                      <div>
                        Transferred Asset{' '}
                        <span style={{ color: '#ef4444', fontWeight: 500 }}>{assetId}</span> ({existingName}) to {toLoc}
                      </div>
                    </div>
                  );
                } else {
                  const changes = [];
                  FILTER_KEYS.forEach((key) => {
                    if (
                      key in detailsObj &&
                      detailsObj[key] !== undefined &&
                      detailsObj[key] !== '' &&
                      (key !== 'name' || detailsObj[key] !== existingName)
                    ) {
                      changes.push(
                        `${key.charAt(0).toUpperCase() + key.slice(1)} → ${detailsObj[key]}`
                      );
                    }
                  });
                  const changesText = changes.join(', ');
                  descriptionNode = (
                    <div style={{ whiteSpace: 'pre-line' }}>
                      <div>Asset Edited:</div>
                      <div>
                        <span style={{ color: '#ef4444', fontWeight: 700 }}>{assetId}</span> ({existingName}){' '}
                        {changesText ? `fields: ${changesText}` : ''}
                      </div>
                    </div>
                  );
                }
              }
              // --------- Asset Addition ---------
              else if (
                (log.action === 'Added Asset' || log.action === 'Add Asset') &&
                (detailsObj.location || detailsObj.newLocation)
              ) {
                const assetId = log.asset_id;
                const location = detailsObj.location || detailsObj.newLocation;
                const name = detailsObj.name || assetNameMap[assetId] || 'Unknown';
                descriptionNode = (
                  <div style={{ whiteSpace: 'pre-line' }}>
                    Added Asset{' '}
                    <span style={{ color: '#ef4444', fontWeight: 700 }}>{assetId}</span> ({name}) to {location}
                  </div>
                );
              }
              // --------- Asset Deletion ---------
              else if (log.action === 'Deleted Asset') {
                const assetId = log.asset_id;
                const name = detailsObj.name || assetNameMap[assetId] || 'Unknown';
                const location = detailsObj.location || 'Unknown';
                descriptionNode = (
                  <div style={{ whiteSpace: 'pre-line' }}>
                    Deleted Asset{' '}
                    <span style={{ color: '#ef4444', fontWeight: 700 }}>{assetId}</span> ({name}) from {location}
                  </div>
                );
              }
              // --------- Fallback Action Description ---------
              else {
                descriptionNode = (
                  <div>
                    {log.action} {log.asset_id} – {log.details || '[No Details]'}
                  </div>
                );
              }

              // --------- Single Activity Row ---------
              return (
                <tr key={log.id} style={{ background: '#111' }}>
                  <td style={{ padding: '2.5px 5px', border: 'none', color: '#d4d6c5', fontSize: rowFont }}>
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                      <span style={{ whiteSpace: 'nowrap', fontWeight: 700 }}>
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : '[No Time]'}
                      </span>
                      <span style={{ color: '#888', fontSize: userFont, wordBreak: 'break-all' }}>
                        {log.user}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '2.5px 5px', border: 'none', color: '#d4d6c5', fontSize: rowFont }}>
                    {descriptionNode}
                  </td>
                </tr>
              );
            })
          ) : (
            // --------- Empty Log Message Row ---------
            <tr>
              <td colSpan="2" style={{ textAlign: 'center', color: '#888', padding: 6, fontSize: emptyFont }}>
                No activity recorded.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
