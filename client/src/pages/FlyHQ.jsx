// ==============================
// FLYHQ — IMPORTS
// ==============================
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { API_BASE_URL } from '../api';
import AssetFilters from '../components/Asset Components/AssetFilters';
import AssetHistoryModal from '../components/Asset Components/AssetHistoryModal';
import AssetTable from '../components/Asset Components/AssetTable';
import RightPanel from '../components/Asset Components/RightPanel';
import AssetAnalytics from '../components/AssetAnalytics';
import AssetTabsNav from '../components/AssetTabsNav';
import DownedAssetsTab from '../components/DownedAssetsTab';
import MasterAssembliesDBTable from '../components/Master Assembly Components/MasterAssembliesDBTable';
import MasterAssembliesHub from '../components/MasterAssembliesHub';
import ModalsContainer from '../components/ModalsContainer';
import TableControls from '../components/TableControls';
import { HEADER_LABELS } from '../constants/assetFields';
import useActivityLog from '../hooks/useActivityLog';
import useAssets from '../hooks/useAssets';
import useFilteredPaginated from '../hooks/useFilteredPaginated';
import { useLivePolling } from '../hooks/useLivePolling';
import useMediaQuery from '../hooks/useMediaQuery';
import { showPalomaToast } from '../utils/toastUtils';


const API_BASE = API_BASE_URL || '';

// ==============================
// FLYHQ — CONSTANTS
// ==============================
const ROW_HEIGHT = 24;
const HEADER_HEIGHT = 24;

// ==============================
// FLYHQ — HELPERS
// ==============================
function isMAStatus(status) {
  if (!status) return false;
  return /ma\s*\(/i.test(status) || /^in-use\s+on\s+ma[-a-z0-9]+/i.test(status?.trim());
}
function coerceTs(x) {
  if (!x) return 0;
  const s = typeof x === 'string' ? x : (x.timestamp || x.created_at || x.createdAt || x.time || '');
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

// ==============================
// FLYHQ — COMPONENT
// ==============================
export default function FlyHQ() {
  const isCompactLayout = useMediaQuery('(max-width: 1100px)');
  // ==============================
  // URL / TAB STATE
  // ==============================
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = (searchParams.get('tab') || 'assets').toLowerCase();
  const [activeTab, setActiveTab] = useState(urlTab);
  useEffect(() => {
    const next = (searchParams.get('tab') || 'assets').toLowerCase();
    if (next !== activeTab) setActiveTab(next);
  }, [searchParams]);
  const setTab = useCallback(
    (tab) => {
      const next = new URLSearchParams(searchParams);
      next.set('tab', tab);
      setSearchParams(next, { replace: true });
      setActiveTab(tab);
    },
    [searchParams, setSearchParams]
  );

  // ==============================
  // FILTER / SORT / SELECTION
  // ==============================
  const [filters, setFilters] = useState({ id: '', sn: '', name: '', category: '', location: '', status: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showTransferSuccess, setShowTransferSuccess] = useState(false);
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);
  const [newLocation, setNewLocation] = useState('');
  const [editAsset, setEditAsset] = useState(null);
  const [assetPendingDelete, setAssetPendingDelete] = useState(null);
  const [showPhysicalTransfer, setShowPhysicalTransfer] = useState(false);
  const [qrAsset, setQrAsset] = useState(null);
  const [selectedHistoryAsset, setSelectedHistoryAsset] = useState(null);
  const [assetJobHistory, setAssetJobHistory] = useState([]);
  const [assetDocuments, setAssetDocuments] = useState([]);
  const [page, setPage] = useState(1);

  // ==============================
  // PREFERENCES
  // ==============================
  const [showMAAssets, setShowMAAssets] = useState(() => {
    const val = window.localStorage.getItem('showMAAssets');
    return val === null ? true : val === 'true';
  });
  useEffect(() => {
    window.localStorage.setItem('showMAAssets', showMAAssets);
  }, [showMAAssets]);
  const handleToggleMA = useCallback(() => setShowMAAssets((prev) => !prev), []);

  const [showRightPanelAssets, setShowRightPanelAssets] = useState(() => {
    const val = window.localStorage.getItem('showRightPanelAssets');
    return val === null ? true : val === 'true';
  });
  useEffect(() => {
    window.localStorage.setItem('showRightPanelAssets', showRightPanelAssets);
  }, [showRightPanelAssets]);

  const [showMasterHistory, setShowMasterHistory] = useState(false);
  const [lastSeenActivityTs, setLastSeenActivityTs] = useState(() => {
    const v = window.localStorage.getItem('lastSeenActivityTs');
    return v ? parseInt(v, 10) : 0;
  });
  const [hasUnread, setHasUnread] = useState(false);

  // ==============================
  // DATA HOOKS
  // ==============================
  const { assets: rawAssets, fetchAssets } = useAssets();
  const assets = Array.isArray(rawAssets) ? rawAssets : [];
  const { activityLogs, fetchActivityLogs } = useActivityLog();

  // ==============================
  // FILTERING / SEARCH / PAGINATION
  // ==============================
  const FULL = Math.max(assets.length, 1);
  const { filtered: rawFiltered } = useFilteredPaginated(assets, filters, sortConfig, 1, FULL);
  const filteredBase = useMemo(() => (Array.isArray(rawFiltered) ? rawFiltered : []), [rawFiltered]);
  const filtered = useMemo(
    () => (showMAAssets ? filteredBase : filteredBase.filter((a) => !isMAStatus(a.status))),
    [filteredBase, showMAAssets]
  );

  const searched = useMemo(() => {
    if (!searchTerm) return filtered;
    const t = searchTerm.toLowerCase();
    return filtered.filter(
      (a) =>
        (a?.id ? String(a.id) : '').toLowerCase().includes(t) ||
        (a?.sn || '').toLowerCase().includes(t) ||
        (a?.name || '').toLowerCase().includes(t) ||
        (a?.category || '').toLowerCase().includes(t) ||
        (a?.location || '').toLowerCase().includes(t) ||
        (a?.status || '').toLowerCase().includes(t)
    );
  }, [filtered, searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filters, showMAAssets]);

  const paginatedWithSearch = useMemo(() => {
    const sorted = [...searched].sort((a, b) => {
      const aVal = a[sortConfig.key] ?? '';
      const bVal = b[sortConfig.key] ?? '';
      if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
    const startIdx = (page - 1) * rowsPerPage;
    return sorted.slice(startIdx, startIdx + rowsPerPage);
  }, [searched, sortConfig, page, rowsPerPage]);

  const totalPagesWithSearch = useMemo(
    () => Math.ceil(searched.length / rowsPerPage) || 1,
    [searched.length, rowsPerPage]
  );

  // ==============================
  // OPTIONS FOR FILTER DROPDOWNS
  // ==============================
  const idOptions = useMemo(
    () => Array.from(new Set(assets.map((a) => a.id).filter(Boolean))).sort(),
    [assets]
  );
  const snOptions = useMemo(
    () => Array.from(new Set(assets.map((a) => a.sn).filter(Boolean))).sort(),
    [assets]
  );
  const nameOptions = useMemo(
    () => Array.from(new Set(assets.map((a) => a.name).filter(Boolean))).sort(),
    [assets]
  );
  const categoryOptions = useMemo(
    () => Array.from(new Set(assets.map((a) => a.category).filter(Boolean))).sort(),
    [assets]
  );
  const locationOptions = useMemo(
    () => Array.from(new Set(assets.map((a) => a.location).filter(Boolean))).sort(),
    [assets]
  );
  const statusOptions = useMemo(
    () => Array.from(new Set(assets.map((a) => a.status).filter(Boolean))).sort(),
    [assets]
  );

  // ==============================
  // TABLE HEIGHT CALC
  // ==============================
  const tableScrollRef = useRef(null);
  useEffect(() => {
    if (activeTab !== 'assets') return;

    let raf = 0;
    let t = 0;

    function handleResize() {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      t = setTimeout(() => {
        raf = requestAnimationFrame(() => {
          if (tableScrollRef.current) {
            const tableHeight = tableScrollRef.current.offsetHeight || 0;
            const fitRows = Math.floor((tableHeight - HEADER_HEIGHT) / ROW_HEIGHT);
            setRowsPerPage(fitRows > 0 ? fitRows : 1);
          }
        });
      }, 100);
    }

    handleResize();

    window.addEventListener('resize', handleResize);

    const ro = new ResizeObserver(() => handleResize());
    if (tableScrollRef.current) ro.observe(tableScrollRef.current);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(raf);
      clearTimeout(t);
      try { ro.disconnect(); } catch {}
    };
  }, [activeTab, showRightPanelAssets]);

  useEffect(() => {
    if (activeTab === 'assets') {
      requestAnimationFrame(() => {
        if (tableScrollRef.current) {
          const tableHeight = tableScrollRef.current.offsetHeight || 0;
          const fitRows = Math.floor((tableHeight - HEADER_HEIGHT) / ROW_HEIGHT);
          setRowsPerPage(fitRows > 0 ? fitRows : 1);
        }
      });
    }
  }, [activeTab, showRightPanelAssets]);

  // ==============================
  // RIGHT PANEL / ACTIVITY
  // ==============================
  const assetNameMap = useMemo(() => {
    const m = {};
    for (const a of assets) m[a.id] = a.name;
    return m;
  }, [assets]);

  const handleSort = useCallback((key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  }, []);
  const toggleSelect = useCallback((id) => {
    setSelectedAssetIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }, []);
  const toggleSelectAll = useCallback(() => {
    setSelectedAssetIds((prev) => {
      const idsOnPage = paginatedWithSearch.map((a) => a.id);
      const all = idsOnPage.every((id) => prev.includes(id));
      return all ? prev.filter((id) => !idsOnPage.includes(id)) : Array.from(new Set([...prev, ...idsOnPage]));
    });
  }, [paginatedWithSearch]);

  // ==============================
  // CRUD
  // ==============================
  const handleAddAsset = useCallback(
    async (payload) => {
      try {
        const apiPayload = {
          id: payload.id,
          name: payload.name,
          category: payload.category,
          location: payload.location,
          status: payload.status,
          sn: payload.sn
        };
        Object.keys(apiPayload).forEach(
          (k) => (apiPayload[k] === undefined || apiPayload[k] === null || apiPayload[k] === '') && delete apiPayload[k]
        );
        const res = await fetch(`${API_BASE}/api/assets`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiPayload)
        });
        if (!res.ok) {
          let msg = 'Unknown error';
          try {
            msg = (await res.json()).error || msg;
          } catch {}
          throw new Error(msg);
        }
        setShowAddModal(false);
        await Promise.all([fetchAssets(), fetchActivityLogs?.()]);
        showPalomaToast({
          message: 'Successfully added asset',
          detail: 'Asset has been added to the database.',
          type: 'success'
        });
      } catch (err) {
        showPalomaToast({
          message: 'Failed to add asset',
          detail: err?.message || 'Unknown error',
          type: 'error'
        });
      }
    },
    [fetchAssets, fetchActivityLogs]
  );

  const handleEditAsset = useCallback(
    async (updated) => {
      try {
        const assetId = updated.id;
        const payload = {
          name: updated.name,
          category: updated.category,
          location: updated.location,
          status: updated.status,
          sn: updated.sn
        };
        Object.keys(payload).forEach(
          (k) => (payload[k] === undefined || payload[k] === null || payload[k] === '') && delete payload[k]
        );
        const res = await fetch(`${API_BASE}/api/assets/` + encodeURIComponent(assetId), {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          let msg = 'Unknown error';
          try {
            msg = (await res.json()).error || msg;
          } catch {}
          throw new Error(msg);
        }
        setEditAsset(null);
        await Promise.all([fetchAssets(), fetchActivityLogs?.()]);
        showPalomaToast({
          message: 'Successfully edited asset',
          detail: 'All changes have been saved.',
          type: 'success'
        });
      } catch (err) {
        showPalomaToast({
          message: 'Failed to update asset',
          detail: err?.message || 'Unknown error',
          type: 'error'
        });
      }
    },
    [fetchAssets, fetchActivityLogs]
  );

  const handleDeleteClick = useCallback((asset) => setAssetPendingDelete(asset), []);
  const confirmDelete = useCallback(async () => {
    if (!assetPendingDelete) return;
    try {
      await fetch(`${API_BASE}/api/assets/` + encodeURIComponent(assetPendingDelete.id), {
        method: 'DELETE',
        credentials: 'include'
      });
      setAssetPendingDelete(null);
      await Promise.all([fetchAssets(), fetchActivityLogs()]);
      showPalomaToast({
        message: 'Asset deleted',
        detail: 'The asset has been removed from the system.',
        type: 'success'
      });
    } catch (err) {
      showPalomaToast({
        message: 'Failed to delete asset',
        detail: err?.message || 'Unknown error',
        type: 'error'
      });
    }
  }, [assetPendingDelete, fetchAssets, fetchActivityLogs]);
  const cancelDelete = useCallback(() => setAssetPendingDelete(null), []);

  const handleTransfer = useCallback(async () => {
    const idsToTransfer = selectedAssetIds;
    if (!idsToTransfer.length || !newLocation) return;
    try {
      const res = await fetch(`${API_BASE}/api/assets/transfer`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetIds: idsToTransfer, newLocation })
      });
      if (res.ok) {
        setShowTransferModal(false);
        setSelectedAssetIds([]);
        setNewLocation('');
        await fetchAssets();
        setShowTransferSuccess(true);
        await fetchActivityLogs();
        showPalomaToast({ message: 'Successfully transferred assets', detail: 'Location updated.', type: 'success' });
      } else {
        const errText = await res.text();
        showPalomaToast({ message: 'Failed to transfer assets', detail: errText, type: 'error' });
      }
    } catch (err) {
      showPalomaToast({
        message: 'Error transferring assets',
        detail: err?.message || 'Unknown error',
        type: 'error'
      });
    }
  }, [fetchAssets, fetchActivityLogs, newLocation, selectedAssetIds]);

  // ==============================
  // POLLING / UNREAD
  // ==============================
  const pollUpdates = useCallback(() => {
    const g = typeof window !== 'undefined' ? window : globalThis;
    if (g && Number(g.__palomaMenuOpenAny) > 0) return;
    fetchAssets();
    fetchActivityLogs();
  }, [fetchAssets, fetchActivityLogs]);
  useLivePolling(pollUpdates, 5000);

  const latestActivityTs = useMemo(() => {
    if (!Array.isArray(activityLogs) || !activityLogs.length) return 0;
    let max = 0;
    for (const log of activityLogs) {
      const ts = coerceTs(log.timestamp || log.created_at || log.createdAt || log.time);
      if (ts > max) max = ts;
    }
    return max;
  }, [activityLogs]);

  useEffect(() => {
    if (!showRightPanelAssets && latestActivityTs > lastSeenActivityTs) {
      setHasUnread(true);
    }
  }, [latestActivityTs, showRightPanelAssets, lastSeenActivityTs]);

  const openRightPanel = useCallback(() => {
    setShowRightPanelAssets(true);
    if (latestActivityTs > 0) {
      setLastSeenActivityTs(latestActivityTs);
      window.localStorage.setItem('lastSeenActivityTs', String(latestActivityTs));
    }
    setHasUnread(false);
  }, [latestActivityTs]);
  const closeRightPanel = useCallback(() => setShowRightPanelAssets(false), []);

  const initialSelection = useMemo(() => {
    const tab = (searchParams.get('tab') || '').toLowerCase();
    const assembly = searchParams.get('assembly') || '';
    const child = searchParams.get('child') || '';
    return { tab, assembly, child };
  }, [searchParams]);

  // ==============================
  // LAYOUT
  // ==============================
  return (
    <div
      className='relative font-erbaum uppercase text-sm text-white'
      style={{
        minHeight: '100%',
        marginLeft: 6,
        width: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* TOASTS */}
      <ToastContainer
        position='bottom-right'
        autoClose={4100}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme='dark'
      />

      <div
        className='absolute top-0 left-0 right-0 bottom-0 flex items-stretch justify-center'
        style={{ zIndex: 1, paddingRight: 0, minHeight: '100%', minWidth: '100%', boxSizing: 'border-box', width: '100%' }}
      >
        <div
          style={{
            borderRadius: '0px',
            maxWidth: 'none',
            width: '100%',
            height: '100%',
            margin: '0 auto',
            border: '2px solid #282d25',
            boxShadow: '0 4px 36px 0 #10141177',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            background: 'transparent'
          }}
        >
          {/* TABS NAV */}
          <div style={{ background: 'transparent', borderRadius: 0, border: 3, width: '100%', boxSizing: 'border-box', minHeight: 50, margin: 0, padding: 0 }}>
            <AssetTabsNav
              activeTab={activeTab}
              setActiveTab={setTab}
              showRightPanelAssets={showRightPanelAssets}
              setShowRightPanelAssets={(val) => (val ? openRightPanel() : closeRightPanel())}
              unreadBadge={hasUnread}
              masterHistoryOpen={showMasterHistory}
              onToggleMasterHistory={() => setShowMasterHistory((v) => !v)}
            />
          </div>

          {/* TAB: ASSETS MAIN */}
          {activeTab === 'assets' && (
            <div
              className='flex flex-row justify-center items-stretch mx-auto'
              style={{
                width: '100%',
                padding: 0,
                borderTop: '3px solid #6a7257',
                border: '2px solid #282d25',
                borderRadius: '4px 4px 2px 6px',
                height: '100%',
                boxSizing: 'border-box',
                minHeight: 0,
                marginBottom: 20,
                position: 'relative',
                background: 'transparent',
                flexDirection: isCompactLayout ? 'column' : 'row',
                gap: isCompactLayout ? 16 : 0
              }}
            >
              <div
                className='flex flex-col'
                style={{
                  flex: showRightPanelAssets ? '1 1 auto' : '1 1 100%',
                  minWidth: isCompactLayout ? '100%' : 1100,
                  borderRight: isCompactLayout ? '0' : '2px solid #282d25',
                  border: '2px solid #282d25',
                  height: '100%',
                  padding: '4px 4px 4px 4px',
                  boxSizing: 'border-box',
                  fontSize: '0.75rem',
                  minHeight: 0,
                  paddingBottom: 14,
                  transition: 'flex 420ms cubic-bezier(.16,1,.3,1)',
                  background: 'transparent'
                }}
              >
                <AssetFilters
                  filters={filters}
                  setFilters={setFilters}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  idOptions={idOptions}
                  snOptions={snOptions}
                  nameOptions={nameOptions}
                  categoryOptions={categoryOptions}
                  locationOptions={locationOptions}
                  statusOptions={statusOptions}
                  onOpenPhysicalTransfer={() => setShowPhysicalTransfer(true)}
                  onOpenAssetTransfer={() => setShowTransferModal(true)}
                  onAddNewAsset={() => setShowAddModal(true)}
                  showMAAssets={showMAAssets}
                  onToggleMAAssets={handleToggleMA}
                />

                <div ref={tableScrollRef} style={{ flex: 1, overflowX: isCompactLayout ? 'auto' : 'hidden', overflowY: 'hidden', minHeight: 0, WebkitOverflowScrolling: isCompactLayout ? 'touch' : 'auto' }}>
                  <div style={{ fontSize: '0.66rem', height: '100%' }}>
                    <AssetTable
                      assets={paginatedWithSearch}
                      selectedIds={selectedAssetIds}
                      onToggle={toggleSelect}
                      onToggleAll={toggleSelectAll}
                      onSort={handleSort}
                      sortConfig={sortConfig}
                      headerLabels={HEADER_LABELS}
                      onEdit={(asset) => setEditAsset(asset)}
                      onDelete={handleDeleteClick}
                      onViewQR={setQrAsset}
                      onViewHistory={(asset) => {
                        setSelectedHistoryAsset(asset);
                        setAssetJobHistory([]);
                        setAssetDocuments([]);
                      }}
                    />
                  </div>
                </div>
                <TableControls currentPage={page} totalPages={totalPagesWithSearch} onPageChange={setPage} />
              </div>

              <div
                style={{
                  width: isCompactLayout ? '100%' : showRightPanelAssets ? 520 : 0,
                  minWidth: isCompactLayout ? '100%' : showRightPanelAssets ? 480 : 0,
                  flex: isCompactLayout ? '1 1 100%' : `0 0 ${showRightPanelAssets ? 520 : 0}px`,
                  overflowX: isCompactLayout ? 'auto' : 'hidden',
                  overflowY: 'hidden',
                  WebkitOverflowScrolling: isCompactLayout ? 'touch' : 'auto',
                  display: 'flex',
                  opacity: showRightPanelAssets || isCompactLayout ? 1 : 0,
                  transform: isCompactLayout ? 'translateX(0)' : showRightPanelAssets ? 'translateX(0)' : 'translateX(14px)',
                  transitionProperty: 'flex-basis, width, min-width, opacity, transform, box-shadow, filter',
                  transitionDuration: '420ms',
                  transitionTimingFunction: 'cubic-bezier(.16,1,.3,1)',
                  boxShadow: showRightPanelAssets && !isCompactLayout ? 'inset 0 0 0 1px #23251d, -10px 0 26px #000a' : 'none',
                  filter: showRightPanelAssets || isCompactLayout ? 'saturate(1)' : 'saturate(0.9)',
                  marginTop: isCompactLayout ? 12 : 0
                }}
              >
                <RightPanel filteredAssets={searched} activityLogs={activityLogs} assetNameMap={assetNameMap} activityLogHeight={350} />
              </div>
            </div>
          )}

          {/* TAB: MASTER ASSEMBLIES HUB */}
          {activeTab === 'assemblies' && (
            <div
              className='flex flex-row justify-center items-stretch mx-auto'
              style={{ width: '100%', padding: 0, borderRight: '3px solid #282d25', borderTop: '2px solid #6a7257', borderRadius: '4px 4px 2px 6px', height: '100%', boxSizing: 'border-box', minHeight: 0, background: 'transparent' }}
            >
              <MasterAssembliesHub historyOpen={showMasterHistory} setHistoryOpen={setShowMasterHistory} initialSelection={initialSelection} />
            </div>
          )}

          {/* TAB: MASTER ASSEMBLIES DB */}
          {activeTab === 'ma_db' && (
            <div
              className='flex flex-row justify-center items-stretch mx-auto'
              style={{ width: '100%', padding: 0, borderTop: '3px solid #6a7257', border: '2px solid #282d25', borderRadius: '4px 4px 2px 6px', height: '100%', boxSizing: 'border-box', minHeight: 0, background: 'transparent' }}
            >
              <div
                className='flex flex-col'
                style={{ flex: '1 1 auto', minWidth: isCompactLayout ? '100%' : 1100, border: '2px solid #282d25', height: '100%', padding: isCompactLayout ? '12px' : '18px 18px 10px 10px', boxSizing: 'border-box', fontSize: '0.75rem', margin: '0 auto', minHeight: 0, background: 'transparent', overflowX: isCompactLayout ? 'auto' : 'hidden', overflowY: 'hidden', WebkitOverflowScrolling: isCompactLayout ? 'touch' : 'auto' }}
              >
                <div ref={tableScrollRef} style={{ flex: 1, overflowX: isCompactLayout ? 'auto' : 'hidden', overflowY: 'hidden', minHeight: 0, WebkitOverflowScrolling: isCompactLayout ? 'touch' : 'auto' }}>
                  <div style={{ fontSize: '0.66rem', height: '100%' }}>
                    <MasterAssembliesDBTable />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div
              className='flex flex-row justifycenter items-stretch mx-auto'
              style={{ width: '100%', padding: 0, borderTop: '3px solid #6a7257', border: '2px solid #282d25', borderRadius: '4px 4px 2px 6px', height: '100%', boxSizing: 'border-box', minHeight: 0, background: 'transparent' }}
            >
              <div
                className='flex flex-col'
                style={{ flex: '1 1 auto', minWidth: isCompactLayout ? '100%' : 1100, border: '2px solid #282d25', height: '100%', padding: isCompactLayout ? '12px' : '18px 18px 10px 10px', boxSizing: 'border-box', fontSize: '0.75rem', margin: '0 auto', minHeight: 0, background: 'transparent', overflowX: isCompactLayout ? 'auto' : 'hidden', overflowY: 'hidden', WebkitOverflowScrolling: isCompactLayout ? 'touch' : 'auto' }}
              >
                <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
                  <AssetAnalytics assets={assets} activityLogs={activityLogs} />
                </div>
              </div>
            </div>
          )}

          {/* TAB: DOWNED ASSETS */}
          {activeTab === 'downed' && <DownedAssetsTab allAssets={assets} activityLogs={activityLogs} />}
        </div>
      </div>

      {/* MODALS / DIALOGS */}
      <AssetHistoryModal asset={selectedHistoryAsset} open={!!selectedHistoryAsset} onClose={() => setSelectedHistoryAsset(null)} documents={assetDocuments} />
      <ModalsContainer
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        showTransferModal={showTransferModal}
        newLocation={newLocation}
        setNewLocation={setNewLocation}
        setShowTransferModal={setShowTransferModal}
        showTransferSuccess={showTransferSuccess}
        setShowTransferSuccess={setShowTransferSuccess}
        assetPendingDelete={assetPendingDelete}
        setAssetPendingDelete={setAssetPendingDelete}
        qrAsset={qrAsset}
        setQrAsset={setQrAsset}
        showPhysicalTransfer={showPhysicalTransfer}
        setShowPhysicalTransfer={setShowPhysicalTransfer}
        onAddAsset={handleAddAsset}
        onEditAsset={handleEditAsset}
        editAsset={editAsset}
        setEditAsset={setEditAsset}
        onDeleteConfirm={confirmDelete}
        onDeleteCancel={cancelDelete}
        onTransfer={handleTransfer}
        assets={assets}
        selectedAssetIds={selectedAssetIds}
        nameOptions={nameOptions}
        categoryOptions={categoryOptions}
        locationOptions={locationOptions}
        statusOptions={statusOptions}
      />
    </div>
  );
}

