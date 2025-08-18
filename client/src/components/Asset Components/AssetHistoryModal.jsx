// =================== Imports and Dependencies ===================
import { ClipboardList, FolderOpen, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { API } from '../../api';

// =================== Asset History Modal Component ===================
export default function AssetHistoryModal({ asset, open, onClose, documents = [] }) {
  // --------- Local State ---------
  const [activeTab, setActiveTab] = useState('history');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');

  // --------- Fetch Logs For This Asset Only ---------
  useEffect(() => {
    if (!open || !asset?.id) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`${API}/api/activity/${encodeURIComponent(asset.id)}`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to load asset history');
        const rows = await res.json();
        if (!alive) return;
        setLogs(Array.isArray(rows) ? rows : []);
      } catch (e) {
        if (!alive) return;
        setError(e.message || 'Failed to load history');
        setLogs([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [open, asset?.id]);

  // --------- Normalize for UI (and final client-side guard filters) ---------
  const parsedLogs = useMemo(() => {
    const mapped = (logs || []).map((row) => {
      const dt = row.timestamp ? new Date(row.timestamp) : null;
      return {
        id: `${row.id || ''}-${row.asset_id || ''}-${row.timestamp || ''}`,
        ts: dt,
        timeText: dt ? dt.toLocaleTimeString() : '-',
        action: row.action || '',
        user: row.user || 'Unknown',
        formatted: row.formatted || '',
        status_to: row.status_to || null,
        notes: row.notes || null
      };
    });

    // Final filter: drop "Updated Asset" rows that slip through
    return mapped.filter(r => !(r.action.toLowerCase().includes('updated asset') && (!r.status_to || r.status_to === '-')));
  }, [logs]);

  // --------- Group by date for sticky headings ---------
  const groups = useMemo(() => {
    const map = new Map();
    for (const r of parsedLogs) {
      const key = r.ts ? r.ts.toLocaleDateString() : 'Unknown';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    }
    return Array.from(map.entries());
  }, [parsedLogs]);

  // --------- Render Guard ---------
  if (!open || !asset) return null;

  // =================== Modal Rendering ===================
  return (
    <div
      style={{
        position: 'fixed', inset: 0, width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.62)', zIndex: 1101,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      <div
        style={{
          background: '#181818',
          borderRadius: 22,
          width: 1000,
          maxWidth: '99vw',
          maxHeight: '90vh',
          color: '#e6e8df',
          boxShadow: '0 12px 64px #000c',
          border: '2.5px solid #6a7257',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* --------- Close Button --------- */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', right: 18, top: 14,
            background: 'transparent', border: 'none',
            color: '#ccc', fontSize: 25, cursor: 'pointer', zIndex: 10
          }}
          title="Close"
        >
          <X size={28} />
        </button>

        {/* --------- Title --------- */}
        <div style={{ padding: '28px 40px 8px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.23em', fontWeight: 800, letterSpacing: 1.5 }}>
            ASSET HISTORY — <span style={{ color: '#6a7257' }}>{asset.id}</span>
          </div>
          <div style={{ color: '#b0b79f', fontWeight: 600, fontSize: '0.98em', marginTop: 6 }}>
            {asset.name}
          </div>
        </div>

        {/* --------- Tabs --------- */}
        <div style={{ display: 'flex', borderBottom: '2px solid #282d25', margin: '0 35px' }}>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              flex: 1,
              padding: '11px 0 10px 0',
              background: activeTab === 'history' ? '#23251d' : 'transparent',
              color: activeTab === 'history' ? '#fff' : '#b0b79f',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.99em',
              letterSpacing: 1,
              borderRadius: '12px 12px 0 0',
              borderBottom: activeTab === 'history' ? '3px solid #6a7257' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', opacity: activeTab === 'history' ? 1 : 0.74 }}>
              <ClipboardList size={22} style={{ marginBottom: -2 }} />
            </span>
            <span>History</span>
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            style={{
              flex: 1,
              padding: '11px 0 10px 0',
              background: activeTab === 'docs' ? '#23251d' : 'transparent',
              color: activeTab === 'docs' ? '#fff' : '#b0b79f',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.99em',
              letterSpacing: 1,
              borderRadius: '12px 12px 0 0',
              borderBottom: activeTab === 'docs' ? '3px solid #6a7257' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', opacity: activeTab === 'docs' ? 1 : 0.74 }}>
              <FolderOpen size={22} style={{ marginBottom: -2 }} />
            </span>
            <span>Documentation</span>
          </button>
        </div>

        {/* --------- Panels (Scrollable Area) --------- */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 35px 18px 35px',
            fontSize: '0.98em'
          }}
        >
          {activeTab === 'history' && (
            <HistoryPanel groups={groups} loading={loading} error={error} />
          )}
          {activeTab === 'docs' && (
            <DocsPanel documents={documents} />
          )}
        </div>
      </div>
    </div>
  );
}

// =================== Tab Panel: History ===================
function HistoryPanel({ groups, loading, error }) {
  if (loading) return <div style={{ color: '#b0b79f', textAlign: 'center', marginTop: 25 }}>Loading…</div>;
  if (error) return <div style={{ color: '#e35151', textAlign: 'center', marginTop: 25 }}>{error}</div>;
  if (!groups || groups.length === 0) return <div style={{ color: '#b0b79f', textAlign: 'center', marginTop: 25 }}>No history for this asset.</div>;

  return (
    <div>
      {groups.map(([date, rows]) => (
        <div key={date}>
          <div
            style={{
              position: 'sticky',
              top: 0,
              background: '#151915',
              zIndex: 2,
              padding: '6px 10px',
              margin: '0 -5px 6px -5px',
              borderBottom: '1px solid #282d25',
              color: '#6a7257',
              fontWeight: 800,
              letterSpacing: 1
            }}
          >
            {date}
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {rows.map((log) => (
              <HistoryRow key={log.id} log={log} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// --------- Single Row: colored action, status pill, collapsible notes ---------
function HistoryRow({ log }) {
  const [openNotes, setOpenNotes] = useState(Boolean(log.notes));
  const actionColor =
    log.action === 'Added to Master Assembly' ? '#74c365' :
    log.action === 'Removed from Master Assembly' ? '#e35151' :
    '#e6e8df';

  const pill = (text) => (
    <span
      style={{
        display: 'inline-block',
        border: '1px solid #3a3f34',
        padding: '2px 8px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
        marginLeft: 8,
        textTransform: 'uppercase',
        background: '#20231b'
      }}
    >
      {text}
    </span>
  );

  return (
    <li
      style={{
        padding: '10px 8px',
        marginBottom: 6,
        background: '#161816',
        border: '1px solid #23251d',
        borderRadius: 10,
        transition: 'transform 160ms ease, background 160ms ease, border-color 160ms ease'
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.borderColor = '#2c3127'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#23251d'; }}
    >
      {/* Top line */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ width: 120, color: '#b0b79f', fontWeight: 700 }}>{log.timeText}</div>
        <div style={{ fontWeight: 900, color: actionColor }}>{log.action}</div>
        {log.status_to ? pill(`→ ${log.status_to}`) : null}
        <div style={{ marginLeft: 'auto', color: '#9aa086', fontWeight: 700 }}>{log.user || 'Unknown'}</div>
      </div>

      {/* Details */}
      <div style={{ marginTop: 6, color: '#e6e8df' }}>
        {log.formatted}
      </div>

      {/* Notes */}
      {log.notes ? (
        <div style={{ marginTop: 8 }}>
          <button
            onClick={() => setOpenNotes((v) => !v)}
            style={{
              fontSize: 12,
              border: '1px solid #3a3f34',
              background: 'transparent',
              color: '#b7c495',
              padding: '2px 8px',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 800
            }}
            title="Toggle notes"
          >
            {openNotes ? 'Hide Notes' : 'Show Notes'}
          </button>
          <div
            style={{
              maxHeight: openNotes ? 400 : 0,
              overflow: 'hidden',
              transition: 'max-height 220ms ease',
              marginTop: openNotes ? 8 : 0,
              border: '1px dashed #3a3f34',
              borderRadius: 8,
              padding: openNotes ? '8px 10px' : '0 10px',
              background: '#141614',
              color: '#d4d8c8',
              fontSize: 13,
              whiteSpace: 'pre-wrap'
            }}
          >
            {log.notes}
          </div>
        </div>
      ) : null}
    </li>
  );
}

// =================== Tab Panel: Documentation ===================
function DocsPanel({ documents }) {
  const cleaned = (documents || []).filter((doc) => {
    const n = String(doc?.name || '').toLowerCase().trim();
    if (doc?.placeholder === true) return false;
    if (n === 'pressure test certificate' || n === 'maintenance log') return false;
    if (!doc?.url) return false;
    return true;
  });

  if (cleaned.length === 0) {
    return <div style={{ color: '#b0b79f', fontSize: '0.97em', textAlign: 'center', marginTop: 25 }}>No documents uploaded for this asset.</div>;
  }

  return (
    <div>
      <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
        {cleaned.map((doc, i) => (
          <li key={i} style={{ marginBottom: 15, borderBottom: '1.2px solid #23251d', paddingBottom: 10 }}>
            <div style={{ fontWeight: 700, color: '#fff', textTransform: 'uppercase' }}>{doc.name}</div>
            <div style={{ color: '#b0b79f', fontSize: '0.94em', textTransform: 'uppercase' }}>{doc.type || ''}</div>
            <div>
              <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ color: '#6a7257', fontWeight: 700 }}>
                Download / View
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
