// ==============================
// FILE: client/src/pages/FlyHQ.jsx
// ==============================

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
import { HEADER_LABELS } from '../constants/assetFields';
import useActivityLog from '../hooks/useActivityLog';
import useAssets from '../hooks/useAssets';
import { useLivePolling } from '../hooks/useLivePolling';
import { showPalomaToast } from '../utils/toastUtils';

const API_BASE = API_BASE_URL || '';

// ==============================
// FLYHQ — CONSTANTS
// ==============================
const ROW_HEIGHT = 24;
const HEADER_HEIGHT = 36;
const FOOTER_HEIGHT = 40;
const FILTERS_HEIGHT = 210;

// ==============================
// FLYHQ — HELPERS
// ==============================
function normalize(str = '') {
  return String(str).toLowerCase().trim();
}
function fuzzyIncludes(hay, needle) {
  if (!needle) return true;
  return normalize(hay).includes(normalize(needle));
}
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
  // ==============================
  // STATE
  // ==============================
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'assets';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [filters, setFilters] = useState({
    id: '',
    sn: '',
    name: '',
    category: '',
    location: '',
    status: ''
  });
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
  const [showFilterPanel, setShowFilterPanel] = useState(false);
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

  const [lastSeenActivityTs, setLastSeenActivityTs] = useState(() => {
    const val = window.localStorage.getItem('lastSeenActivityTs');
    return val ? Number(val) : 0;
  });
  useEffect(() => {
    window.localStorage.setItem('lastSeenActivityTs', String(lastSeenActivityTs));
  }, [lastSeenActivityTs]);
  const [hasUnread, setHasUnread] = useState(false);

  // ==============================
  // RESPONSIVE / MOBILE
  // ==============================
  const mq = useMemo(() => (typeof window !== 'undefined' ? window.matchMedia('(max-width: 1024px)') : null), []);
  const [isMobile, setIsMobile] = useState(() => (mq ? mq.matches : false));
  useEffect(() => {
    if (!mq) return;
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, [mq]);
  useEffect(() => {
    setRowsPerPage((prev) => (isMobile ? 10 : 15));
    if (isMobile) setShowRightPanelAssets(false);
  }, [isMobile]);

  // ==============================
  // DATA HOOKS
  // ==============================
  const {
    assets,
    isLoading: assetsLoading,
    fetchAssets,
    deleteAsset
  } = useAssets();

  const {
    activityLogs,
    fetchActivityLogs
  } = useActivityLog();

  // ==============================
  // FILTERED / SORTED / PAGED
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
      raf = requestAnimationFrame(() => {
        const el = tableScrollRef.current;
        if (!el) return;
        const vh = window.innerHeight || 800;
        const top = el.getBoundingClientRect().top || 0;
        const max = Math.max(240, Math.floor(vh - top - FOOTER_HEIGHT));
        el.style.height = max + 'px';
      });
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    const id = setInterval(() => {
      const now = Date.now();
      if (now - t > 3000) handleResize();
      t = now;
    }, 3000);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(id);
      cancelAnimationFrame(raf);
    };
  }, [activeTab]);

  // ==============================
  // SEARCHED / SORTED / PAGINATED
  // ==============================
  const filtered = useMemo(() => {
    let list = assets || [];
    if (!showMAAssets) {
      list = list.filter((a) => !isMAStatus(a?.status));
    }
    if (filters.id) list = list.filter((a) => fuzzyIncludes(a.id, filters.id));
    if (filters.sn) list = list.filter((a) => fuzzyIncludes(a.sn, filters.sn));
    if (filters.name) list = list.filter((a) => fuzzyIncludes(a.name, filters.name));
    if (filters.category) list = list.filter((a) => fuzzyIncludes(a.category, filters.category));
    if (filters.location) list = list.filter((a) => fuzzyIncludes(a.location, filters.location));
    if (filters.status) list = list.filter((a) => fuzzyIncludes(a.status, filters.status));
    return list;
  }, [assets, filters, showMAAssets]);

  const searched = useMemo(() => {
    const q = normalize(searchTerm);
    if (!q) return filtered;
    return filtered.filter((a) =>
      fuzzyIncludes(a.id, q) ||
      fuzzyIncludes(a.sn, q) ||
      fuzzyIncludes(a.name, q) ||
      fuzzyIncludes(a.category, q) ||
      fuzzyIncludes(a.location, q) ||
      fuzzyIncludes(a.status, q)
    );
  }, [filtered, searchTerm]);

  const sorted = useMemo(() => {
    const list = [...searched];
    const { key, direction } = sortConfig || { key: 'id', direction: 'ascending' };
    list.sort((a, b) => {
      const va = normalize(a[key] ?? '');
      const vb = normalize(b[key] ?? '');
      if (va < vb) return direction === 'ascending' ? -1 : 1;
      if (va > vb) return direction === 'ascending' ? 1 : -1;
      return 0;
    });
    const startIdx = (page - 1) * rowsPerPage;
    return sortedSlice(list, startIdx, rowsPerPage);
  }, [searched, sortConfig, page, rowsPerPage]);

  const totalPagesWithSearch = useMemo(
    () => Math.ceil(searched.length / rowsPerPage) || 1,
    [searched.length, rowsPerPage]
  );

  function sortedSlice(list, start, count) {
    return list.slice(start, start + count);
  }

  const assetNameMap = useMemo(() => {
    const m = new Map();
    for (const a of assets || []) m.set(a.id, a.name || a.category || a.status || '');
    return m;
  }, [assets]);

  // ==============================
  // ACTIONS
  // ==============================
  const handleSort = useCallback((key) => {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) return { key, direction: 'ascending' };
      return { key, direction: prev.direction === 'ascending' ? 'descending' : 'ascending' };
    });
  }, []);

  const handlePageChange = useCallback((p) => {
    setPage(Math.max(1, Math.min(totalPagesWithSearch, p)));
  }, [totalPagesWithSearch]);

  const confirmDelete = useCallback(async () => {
    try {
      const id = assetPendingDelete?.id;
      if (!id) return;
      await deleteAsset(id);
      setAssetPendingDelete(null);
      await Promise.all([fetchAssets(), fetchActivityLogs?.()]);
      showPalomaToast({
        message: 'Asset deleted',
        detail: 'The selected asset has been removed.',
        type: 'success'
      });
    } catch (err) {
      showPalomaToast({
        message: 'Delete failed',
        detail: err?.message || 'Unknown error',
        type: 'error'
      });
    }
  }, [assetPendingDelete, deleteAsset, fetchAssets, fetchActivityLogs]);

  const cancelDelete = useCallback(() => setAssetPendingDelete(null), []);

  const handleTransfer = useCallback(async () => {
    try {
      setShowTransferModal(false);
      setShowTransferSuccess(true);
      await Promise.all([fetchAssets(), fetchActivityLogs?.()]);
      showPalomaToast({
        message: 'Transfer completed',
        detail: 'Selected assets transferred.',
        type: 'success'
      });
    } catch (err) {
      showPalomaToast({
        message: 'Transfer failed',
        detail: err?.message || 'Unknown error',
        type: 'error'
      });
    }
  }, [fetchAssets, fetchActivityLogs]);

  const handleAddAsset = useCallback(
    async (payload) => {
      try {
        await fetch(API_BASE + '/api/assets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
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
        await fetch(API_BASE + `/api/assets/${encodeURIComponent(assetId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        await Promise.all([fetchAssets(), fetchActivityLogs?.()]);
        showPalomaToast({
          message: 'Asset updated',
          detail: 'Changes have been saved.',
          type: 'success'
        });
      } catch (err) {
        showPalomaToast({
          message: 'Failed to update',
          detail: err?.message || 'Unknown error',
          type: 'error'
        });
      }
    },
    [fetchAssets, fetchActivityLogs]
  );

  const fetchAssetHistory = useCallback(async (assetId) => {
    try {
      const res = await fetch(API_BASE + `/api/assets/${encodeURIComponent(assetId)}/jobs`);
      const data = await res.json();
      setAssetJobHistory(Array.isArray(data?.jobs) ? data.jobs : []);
    } catch {
      setAssetJobHistory([]);
    }
  }, []);

  const fetchAssetDocuments = useCallback(async (assetId) => {
    try {
      const res = await fetch(API_BASE + `/api/assets/${encodeURIComponent(assetId)}/documents`);
      const data = await res.json();
      setAssetDocuments(Array.isArray(data?.documents) ? data.documents : []);
    } catch {
      setAssetDocuments([]);
    }
  }, []);

  const handleShowHistory = useCallback(
    async (asset) => {
      if (!asset?.id) return;
      setSelectedHistoryAsset(asset);
      await Promise.all([fetchAssetHistory(asset.id), fetchAssetDocuments(asset.id)]);
    },
    [fetchAssetHistory, fetchAssetDocuments]
  );

  const closeHistory = useCallback(() => {
    setSelectedHistoryAsset(null);
    setAssetJobHistory([]);
    setAssetDocuments([]);
  }, []);

  const handleBulkTransfer = useCallback(() => {
    if (!selectedAssetIds?.length) return;
    setShowTransferModal(true);
  }, [selectedAssetIds]);

  const handleBulkDelete = useCallback(() => {
    if (!selectedAssetIds?.length) return;
    setAssetPendingDelete({ id: selectedAssetIds[0] });
  }, [selectedAssetIds]);

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
    setHasUnread(false);
    setLastSeenActivityTs(Date.now());
  }, []);
  const closeRightPanel = useCallback(() => setShowRightPanelAssets(false), []);

  useEffect(() => {
    if (!activeTab) return;
    const next = new URLSearchParams(searchParams);
    next.set('tab', activeTab);
    setSearchParams(next, { replace: true });
  }, [activeTab]); // eslint-disable-line

  // ==============================
  // RENDER
  // ==============================
  return (
    <div
      className='mx-auto'
      style={{
        width: '100%',
        maxWidth: 1600,
        minWidth: '100%',
        background: 'transparent',
        minHeight: '100%',
        boxSizing: 'border-box',
        padding: '2px 0 0 0'
      }}
    >
      <ToastContainer />

      {/* ============================== */}
      {/* TABS                           */}
      {/* ============================== */}
      <div style={{ marginBottom: 8 }}>
        <AssetTabsNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onToggleMA={handleToggleMA}
          showMAAssets={showMAAssets}
        />
      </div>

      {/* ============================== */}
      {/* TAB: ASSETS                    */}
      {/* ============================== */}
      {activeTab === 'assets' && (
        <div
          className='flex flex-row justify-center items-stretch mx-auto'
          style={{
            width: '100%',
            padding: 0,
            borderTop: '3px solid #282d25',
            boxSizing: 'border-box',
            minHeight: 0,
            background: 'transparent'
          }}
        >
          <div
            className='flex flex-col'
            style={{
              flex: showRightPanelAssets ? '1 1 auto' : '1 1 100%',
              minWidth: isMobile ? 'auto' : 1100,
              borderRight: '2px solid #282d25',
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

                {/* ============================== */}
                {/* MOBILE TOOLBAR                 */}
                {/* ============================== */}
                {isMobile && (
                  <div className='flex items-center gap-2 sticky top-0 z-10 px-2 py-2'
                       style={{ background:'rgba(0,0,0,0.65)', backdropFilter:'blur(6px)', borderBottom:'1px solid #282d25' }}>
                    <button
                      type='button'
                      onClick={() => setShowFilterPanel(v => !v)}
                      className='px-2 py-1 border border-[#6a7257] rounded text-xs uppercase'
                    >
                      Filters
                    </button>
                    <input
                      type='text'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder='Search'
                      className='flex-1 bg-black/40 border border-[#6a7257] rounded px-2 py-1 text-sm'
                    />
                    <button
                      type='button'
                      onClick={() => setShowAddModal(true)}
                      className='px-2 py-1 border border-[#6a7257] rounded text-xs uppercase'
                    >
                      Add
                    </button>
                  </div>
                )}

                <AssetFilters style={{ display: (isMobile && !showFilterPanel) ? 'none' : undefined }}
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
                  rowsPerPage={rowsPerPage}
                  setRowsPerPage={setRowsPerPage}
                  page={page}
                  setPage={setPage}
                  totalPages={totalPagesWithSearch}
                  onBulkTransfer={handleBulkTransfer}
                  onBulkDelete={handleBulkDelete}
                  selectedCount={selectedAssetIds.length}
                />

            <div ref={tableScrollRef} style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
              <div style={{ fontSize: '0.66rem', height: '100%' }}>
                {/* MOBILE STACK WRAPPER */}
                <div className={isMobile ? 'table--stack' : ''}>
                  <AssetTable
                    assets={sorted}
                    headers={HEADER_LABELS}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    totalPages={totalPagesWithSearch}
                    setPage={setPage}
                    setRowsPerPage={setRowsPerPage}
                    selectedAssetIds={selectedAssetIds}
                    setSelectedAssetIds={setSelectedAssetIds}
                    onShowHistory={handleShowHistory}
                    onEditAsset={setEditAsset}
                    onDeleteAsset={setAssetPendingDelete}
                    onTransferAsset={() => setShowTransferModal(true)}
                    tableHeight={Math.max(200, (tableScrollRef.current?.clientHeight || 400) - HEADER_HEIGHT)}
                    rowHeight={ROW_HEIGHT}
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            className='flex flex-col'
            style={{
              flex: '0 0 auto',
              minWidth: isMobile ? 0 : (showRightPanelAssets ? 480 : 0),
              width: showRightPanelAssets ? 480 : 0,
              maxWidth: 480,
              transition: 'width 420ms cubic-bezier(.16,1,.3,1)',
              overflow: 'hidden',
              border: showRightPanelAssets ? '2px solid #282d25' : 'none',
              background: 'transparent'
            }}
          >
            <div style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
              <div className='uppercase text-sm tracking-wide' style={{ color: '#e1e5d0' }}>
                Activity
                {hasUnread ? <span style={{ marginLeft: 6, color: '#81ff7a' }}>•</span> : null}
              </div>
              {showRightPanelAssets ? (
                <button
                  onClick={closeRightPanel}
                  className='px-2 py-1 border border-[#6a7257] rounded text-xs uppercase'
                >
                  Close
                </button>
              ) : (
                <button
                  onClick={openRightPanel}
                  className='px-2 py-1 border border-[#6a7257] rounded text-xs uppercase'
                >
                  Open
                </button>
              )}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  overflow: 'auto',
                  padding: 6,
                  filter: showRightPanelAssets ? 'saturate(1)' : 'saturate(0.9)'
                }}
              >
                {!isMobile && (
              <RightPanel filteredAssets={searched} activityLogs={activityLogs} latestActivityTs={latestActivityTs} lastSeenActivityTs={lastSeenActivityTs} onMarkSeen={() => setLastSeenActivityTs(Date.now())} assetNameMap={assetNameMap} activityLogHeight={350} />
              )}
              </div>
            </div>
          </div>

          {/* TAB: MASTER ASSEMBLIES HUB */}
          {activeTab === 'assemblies' && (
            <div
              className='flex flex-row justify-center items-stretch mx-auto'
              style={{ width: '100%', padding: 0, borderTop: '3px solid #282d25', boxSizing: 'border-box', minHeight: 0, background: 'transparent' }}
            >
              <MasterAssembliesHub />
            </div>
          )}

          {/* TAB: MASTER ASSEMBLIES DB */}
          {activeTab === 'ma_db' && (
            <div
              className='flex flex-row justify-center items-stretch mx-auto'
              style={{ width: '100%', padding: 0, borderTop: '3px solid #282d25', boxSizing: 'border-box', minHeight: 0, background: 'transparent' }}
            >
              <div
                className='flex flex-col'
                style={{ flex: '1 1 auto', minWidth: isMobile ? 'auto' : 1100, border: '2px solid #282d25', height: '100%', padding: 4, margin: '0 auto', minHeight: 0, background: 'transparent' }}
              >
                <div ref={tableScrollRef} style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
                  <div style={{ fontSize: '0.66rem', height: '100%' }}>
                    <MasterAssembliesDBTable />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DOWNED ASSETS */}
          {activeTab === 'downed' && (
            <div
              className='flex flex-row justify-center items-stretch mx-auto'
              style={{ width: '100%', padding: 0, borderTop: '3px solid #282d25', boxSizing: 'border-box', minHeight: 0, background: 'transparent' }}
            >
              <div
                className='flex flex-col'
                style={{ flex: '1 1 auto', minWidth: isMobile ? 'auto' : 1100, border: '2px solid #282d25', height: '100%', padding: 4, margin: '0 auto', minHeight: 0, background: 'transparent' }}
              >
                <DownedAssetsTab />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================== */}
      {/* TAB: ANALYTICS                */}
      {/* ============================== */}
      {activeTab === 'analytics' && (
        <div style={{ marginTop: 8 }}>
          <AssetAnalytics />
        </div>
      )}

          {/* ============================== */}
          {/* MOBILE ACTION DOCK            */}
          {/* ============================== */}
          {isMobile && selectedAssetIds.length > 0 && (
            <div className='fixed bottom-3 left-3 right-3 z-30 flex items-center justify-between gap-2 px-3 py-2'
                 style={{ background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)', border:'1px solid #6a7257', borderRadius:8 }}>
              <div className='text-xs uppercase'>Selected: {selectedAssetIds.length}</div>
              <div className='flex gap-2'>
                <button
                  type='button'
                  onClick={() => setShowTransferModal(true)}
                  className='px-3 py-1 border border-[#6a7257] rounded text-xs uppercase'
                >
                  Transfer
                </button>
                <button
                  type='button'
                  onClick={() => setAssetPendingDelete({ id: selectedAssetIds[0] })}
                  className='px-3 py-1 border border-red-600 text-red-400 rounded text-xs uppercase'
                >
                  Delete
                </button>
              </div>
            </div>
          )}

      {/* ============================== */}
      {/* MODALS                         */}
      {/* ============================== */}
      <AssetHistoryModal open={!!selectedHistoryAsset} onClose={closeHistory} asset={selectedHistoryAsset} fetchJobs={() => fetchAssetHistory(selectedHistoryAsset?.id)} fetchDocs={() => fetchAssetDocuments(selectedHistoryAsset?.id)} jobs={assetJobHistory} onClear={() => setSelectedHistoryAsset(null)} onClearDocs={() => setAssetDocuments([])} onClearJobs={() => setAssetJobHistory([])} onSetAsset={(a) => setSelectedHistoryAsset(a)} onCloseDocs={() => setAssetDocuments([])} onCloseJobs={() => setAssetJobHistory([])} onReset={() => { setSelectedHistoryAsset(null); setAssetJobHistory([]); setAssetDocuments([]); }} onCloseOnly={() => setSelectedHistoryAsset(null)} onClearAll={() => { setAssetJobHistory([]); setAssetDocuments([]); }} onChangeAsset={(a) => setSelectedHistoryAsset(a)} onCloseHistory={() => setSelectedHistoryAsset(null)} onRequestHistory={(a) => fetchAssetHistory(a?.id)} onRequestDocs={(a) => fetchAssetDocuments(a?.id)} onResetDocs={() => setAssetDocuments([])} onResetJobs={() => setAssetJobHistory([])} onClearHistory={() => setSelectedHistoryAsset(null)} onFetchHistory={() => fetchAssetHistory(selectedHistoryAsset?.id)} onFetchDocs={() => fetchAssetDocuments(selectedHistoryAsset?.id)} onDismiss={() => setSelectedHistoryAsset(null)} onDismissDocs={() => setAssetDocuments([])} onDismissJobs={() => setAssetJobHistory([])} activityLogs={activityLogs} onRequestClose={() => setSelectedHistoryAsset(null)} onResetAll={() => { setAssetJobHistory([]); setAssetDocuments([]); setSelectedHistoryAsset(null); }} onCloseModal={() => setSelectedHistoryAsset(null)} onCloseHistoryModal={() => setSelectedHistoryAsset(null)} assetNameMap={assetNameMap} onClearDocsOnly={() => setAssetDocuments([])} onClearJobsOnly={() => setAssetJobHistory([])} onCloseHistoryOnly={() => setSelectedHistoryAsset(null)} onCloseAll={() => { setSelectedHistoryAsset(null); setAssetJobHistory([]); setAssetDocuments([]); }} onClosePanel={() => setSelectedHistoryAsset(null)} onCloseDrawer={() => setSelectedHistoryAsset(null)} onCloseDialog={() => setSelectedHistoryAsset(null)} onCloseWindow={() => setSelectedHistoryAsset(null)} onCloseSheet={() => setSelectedHistoryAsset(null)} onCloseView={() => setSelectedHistoryAsset(null)} onCloseCard={() => setSelectedHistoryAsset(null)} onCloseBox={() => setSelectedHistoryAsset(null)} onClosePop={() => setSelectedHistoryAsset(null)} onClosePanelOnly={() => setSelectedHistoryAsset(null)} onCloseHistoryPanel={() => setSelectedHistoryAsset(null)} onCloseIt={() => setSelectedHistoryAsset(null)} onCloseX={() => setSelectedHistoryAsset(null)} onCloseButton={() => setSelectedHistoryAsset(null)} onCloseNow={() => setSelectedHistoryAsset(null)} onCloseClick={() => setSelectedHistoryAsset(null)} onClosePress={() => setSelectedHistoryAsset(null)} onCloseTap={() => setSelectedHistoryAsset(null)} onCloseThis={() => setSelectedHistoryAsset(null)} onCloseThat={() => setSelectedHistoryAsset(null)} onCloseOk={() => setSelectedHistoryAsset(null)} onCloseYes={() => setSelectedHistoryAsset(null)} onCloseConfirm={() => setSelectedHistoryAsset(null)} onCloseClose={() => setSelectedHistoryAsset(null)} onCloseDone={() => setSelectedHistoryAsset(null)} onCloseFinish={() => setSelectedHistoryAsset(null)} onCloseExit={() => setSelectedHistoryAsset(null)} onCloseBye={() => setSelectedHistoryAsset(null)} documents={assetDocuments} />
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
