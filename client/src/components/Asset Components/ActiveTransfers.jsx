// =================== Imports and Constants ===================
import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../api';
import ViewBOLModal from './ViewBOLModal';

const API_BASE = API_BASE_URL || '';
const palomaGreen = '#6a7257';

const pulseDotStyle = {
  display: 'inline-block',
  width: 5,
  height: 5,
  borderRadius: '50%',
  backgroundColor: '#ffc107',
  marginRight: 4,
  animation: 'pulse 1.5s infinite',
  verticalAlign: 'middle',
};

const pulseKeyframes = `
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.7);}
  70% { box-shadow: 0 0 0 6px rgba(255, 193, 7, 0);}
  100% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0);}
}
`;

function padTicketNumber(id, length = 4) {
  return String(id).padStart(length, '0');
}

// =================== ActiveTransfers Main Component ===================
export default function ActiveTransfers() {
  // --------- State Management ---------
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewBOLId, setViewBOLId] = useState(null);
  const [partialReceiveId, setPartialReceiveId] = useState(null);
  const [partialAssets, setPartialAssets] = useState([]);

  // --------- Data Fetching Logic ---------
  const fetchTransfers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/transfers`);
      if (!res.ok) throw new Error('Failed to fetch transfers');
      const data = await res.json();
      setTransfers(data);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Unknown error');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  // --------- Transfer Action Handlers ---------
  const handleReceive = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/transfers/${id}/receive-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Failed to receive assets');
      fetchTransfers();
    } catch (err) {
      alert('Error receiving transfer: ' + err.message);
    }
  };

  const handlePartialReceiveOpen = async (id) => {
    setPartialReceiveId(id);
    try {
      const res = await fetch(`${API_BASE}/api/transfers/${id}`);
      if (!res.ok) throw new Error('Failed to get transfer');
      const data = await res.json();
      setPartialAssets((data.assets || []).map(a => ({ ...a, selected: false })));
    } catch (err) {
      alert('Error loading transfer details: ' + err.message);
    }
  };

  const handlePartialReceiveSubmit = async () => {
    const receivedAssetIds = partialAssets.filter(a => a.selected).map(a => a.id);
    if (receivedAssetIds.length === 0) return;
    try {
      const res = await fetch(`${API_BASE}/api/transfers/${partialReceiveId}/partial-receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetIds: receivedAssetIds })
      });
      if (!res.ok) throw new Error('Failed to partial receive');
      setPartialReceiveId(null);
      fetchTransfers();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleRemoveTransfer = async (id) => {
    if (!window.confirm('Are you sure you want to remove this transfer?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/transfers/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove transfer');
      fetchTransfers();
    } catch (err) {
      alert('Error removing transfer: ' + err.message);
    }
  };

  // --------- Font Size and Style Constants ---------
  const baseFont = '0.86em';
  const tableFont = '0.86em';
  const headerFont = '1em';
  const dataFont = '0.91em';
  const descFont = '1em';
  const btnFont = '1em';
  const modalFont = '0.86em';
  const modalHeader = '0.89em';
  const modalDesc = '0.83em';

  // =================== Render UI ===================
  if (loading) return <p style={{ fontSize: baseFont, fontWeight: 500 }}>Loading active transfers...</p>;
  if (error) return <p style={{ color: 'red', fontSize: baseFont, fontWeight: 500 }}>Error: {error}</p>;

  return (
    <div style={{
      width: '100%',
      maxWidth: '100%',
      background: '#000',
      fontSize: baseFont,
      borderRadius: 10,
      boxShadow: '0 3px 17px #0008',
      padding: 8,
    }}>
      {/* --------- Table Styling --------- */}
      <style>{`
        ${pulseKeyframes}
        .centered-table th, .centered-table td {
          text-align: center !important;
          vertical-align: middle !important;
        }
      `}</style>
      
      {/* --------- No Active Transfers Message --------- */}
      {transfers.length === 0 ? (
        <p style={{ fontSize: headerFont, color: '#b0b79f', fontWeight: 600 }}>No active transfers found.</p>
      ) : (
        // --------- Active Transfers Table ---------
        <table
          className="w-full centered-table"
          style={{
            border: 'none',
            background: '#10110f',
            borderRadius: 7,
            overflow: 'hidden',
            fontSize: tableFont,
            color: '#d4d6c5',
            width: '100%',
            minWidth: 0,
            margin: 0,
            tableLayout: 'fixed',
            boxShadow: '0 2px 8px #0007',
            borderCollapse: 'collapse',
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: '#efe8e8ff',
                color: '#ffffffff' ,
                border: '3px solid #a1b595ff',
                fontWeight: 800,
                textTransform: 'uppercase',
                fontSize: headerFont,
                letterSpacing: '0.04em'
              }}
            >
              <th style={{ padding: '3px 3px', border: '1px solid #282d25', width: '72px', background: '#000000ff' }}>Ticket No.</th>
              <th style={{ padding: '3px 3px', border: '2px solid #282d25', background: '#000000ff' }}>Delivery Address</th>
              <th style={{ padding: '3px 3px', border: '1px solid #282d25', background: '#000000ff' }}>Trucking Provider</th>
              <th style={{ padding: '3px 3px', border: '1px solid #282d25', background: '#000000ff' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {/* Spacer row for top margin */}
            <tr>
              <td colSpan={4} style={{ height: 10, background: '#10110f', border: 'none', padding: 0 }} />
            </tr>
            {/* --------- Transfer Rows Rendering --------- */}
            {transfers.map(({ id, delivery_address, trucking_provider, status }) => (
              <React.Fragment key={id}>
                {/* Data row */}
                <tr
                  style={{
                    background: '#131313'
                  }}
                >
                  <td style={{
                    padding: '8px 8px',
                    border: '1px solid #6a7257',
                    fontWeight: 700,
                    fontSize: dataFont,
                    color: '#fff',
                    minWidth: 30,
                  }}>{padTicketNumber(id)}</td>
                  <td style={{
                    padding: '8px 8px',
                    border: '1px solid #6a7257',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: descFont,
                  }}>{delivery_address}</td>
                  <td style={{
                    padding: '8px 8px',
                    border: '1px solid #6a7257',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: descFont,
                  }}>{trucking_provider}</td>
                  <td style={{
                    padding: '8px 8px',
                    border: '1px solid #6a7257',
                    fontSize: descFont
                  }}>
                    {status === 'In Transit' && <span style={pulseDotStyle} />}
                    {status}
                  </td>
                </tr>
                {/* Actions row */}
                <tr>
                  <td colSpan={4} style={{
                    padding: '8.5px 2px 4.5px 2px',
                    background: '#10110f',
                    textAlign: 'center',
                    borderTop: '1px solid #6a7257',
                    borderBottom: '1px solid #6a7257',
                    borderLeft: '1px solid #6a7257',
                    borderRight: '1px solid #6a7257',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 8,
                      flexWrap: 'nowrap'
                    }}>
                      <button
                        style={{
                          background: '#181818',
                          color: palomaGreen,
                          border: '1px solid #6a7257',
                          borderRadius: 8,
                          fontWeight: 700,
                          padding: '6px 18px',
                          fontSize: btnFont,
                          cursor: 'pointer',
                          letterSpacing: 0.25,
                          marginRight: 3,
                          marginBottom: 2,
                          minWidth: 52
                        }}
                        onClick={() => setViewBOLId(id)}
                      >
                        View BOL
                      </button>
                      <button
                        style={{
                          background: '#23251d',
                          color: '#6bdf82',
                          border: '1.25px solid #365c3e',
                          borderRadius: 8,
                          fontWeight: 700,
                          padding: '6px 18px',
                          fontSize: btnFont,
                          cursor: 'pointer',
                          letterSpacing: 0.25,
                          marginRight: 3,
                          marginBottom: 2,
                          minWidth: 52
                        }}
                        onClick={() => handleReceive(id)}
                      >
                        Receive
                      </button>
                      <button
                        style={{
                          background: '#191d18',
                          color: '#ffc107',
                          border: '1.25px solid #b9a62f',
                          borderRadius: 8,
                          fontWeight: 700,
                          padding: '6px 18px',
                          fontSize: btnFont,
                          cursor: 'pointer',
                          letterSpacing: 0.25,
                          marginRight: 3,
                          marginBottom: 2,
                          minWidth: 52
                        }}
                        onClick={() => handlePartialReceiveOpen(id)}
                      >
                        Partial Receive
                      </button>
                      <button
                        style={{
                          background: '#2a0d0d',
                          color: '#ff8888',
                          border: '1.25px solid #cc5858',
                          borderRadius: 8,
                          fontWeight: 700,
                          padding: '6px 18px',
                          fontSize: btnFont,
                          cursor: 'pointer',
                          letterSpacing: 0.25,
                          minWidth: 52
                        }}
                        onClick={() => handleRemoveTransfer(id)}
                      >
                        Remove Transfer
                      </button>
                    </div>
                  </td>
                </tr>
                {/* Spacer row for visual separation */}
                <tr><td colSpan={4} style={{ height: 8, background: '#000', border: 'none' }} /></tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}

      {/* --------- View BOL Modal Section --------- */}
      <ViewBOLModal
        bolId={viewBOLId}
        isOpen={!!viewBOLId}
        onClose={() => setViewBOLId(null)}
      />

      {/* --------- Partial Receive Modal Section --------- */}
      {partialReceiveId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{
            background: '#191d18', color: '#d4d6c5', borderRadius: 10, padding: 19, minWidth: 180, maxWidth: 330, fontSize: modalFont
          }}>
            <h2 style={{ margin: 0, color: palomaGreen, fontWeight: 700, fontSize: modalHeader }}>Partial Receive</h2>
            <div style={{ marginTop: 12 }}>
              {partialAssets.length === 0
                ? <i>Loading...</i>
                : (
                  <>
                    <div style={{ marginBottom: 10, fontSize: modalDesc }}>Select assets you are receiving now:</div>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {partialAssets.map((a, idx) => (
                        <li key={a.id || idx} style={{ marginBottom: 7 }}>
                          <label style={{ cursor: 'pointer', fontWeight: 500, fontSize: modalDesc }}>
                            <input
                              type="checkbox"
                              checked={!!a.selected}
                              onChange={e => setPartialAssets(prev => prev.map(x =>
                                x.id === a.id ? { ...x, selected: e.target.checked } : x
                              ))}
                              style={{ marginRight: 5, accentColor: palomaGreen }}
                            />
                            {a.name || a.serial || a.id}
                          </label>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={handlePartialReceiveSubmit}
                      style={{
                        background: '#23251d',
                        color: '#4caf50',
                        border: 'none',
                        borderRadius: 8,
                        fontWeight: 700,
                        padding: '6px 15px',
                        fontSize: btnFont,
                        cursor: 'pointer',
                        marginTop: 7,
                        marginRight: 6,
                      }}
                    >
                      Mark Received
                    </button>
                  </>
                )}
            </div>
            <div style={{ textAlign: 'right', marginTop: 9 }}>
              <button onClick={() => setPartialReceiveId(null)}
                style={{
                  background: '#23251d', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px',
                  fontWeight: 700, fontSize: btnFont, marginTop: 6, cursor: 'pointer'
                }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
