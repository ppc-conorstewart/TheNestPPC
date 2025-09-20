// ==============================
// FLYHQ OPTIMIZED — PERFORMANCE VERSION
// ==============================
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, startTransition } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { API_BASE_URL } from '../api';
import { HEADER_LABELS } from '../constants/assetFields';
import useActivityLog from '../hooks/useActivityLog';
import useAssets from '../hooks/useAssets';
import useMediaQuery from '../hooks/useMediaQuery';
import { showPalomaToast } from '../utils/toastUtils';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../components/ui/resizable';

// Lazy load heavy components
const AssetFilters = lazy(() => import('../components/Asset Components/AssetFilters'));
const AssetHistoryModal = lazy(() => import('../components/Asset Components/AssetHistoryModal'));
const AssetTable = lazy(() => import('../components/Asset Components/AssetTable'));
const RightPanel = lazy(() => import('../components/Asset Components/RightPanel'));
const AssetAnalytics = lazy(() => import('../components/AssetAnalytics'));
const AssetTabsNav = lazy(() => import('../components/AssetTabsNav'));
const DownedAssetsTab = lazy(() => import('../components/DownedAssetsTab'));
const MasterAssembliesDBTable = lazy(() => import('../components/Master Assembly Components/MasterAssembliesDBTable'));
const MasterAssembliesHub = lazy(() => import('../components/MasterAssembliesHub'));
const ModalsContainer = lazy(() => import('../components/ModalsContainer'));
const TableControls = lazy(() => import('../components/TableControls'));

const API_BASE = API_BASE_URL || '';

// ==============================
// CONSTANTS
// ==============================
const ROW_HEIGHT = 24;
const HEADER_HEIGHT = 24;
const DEFAULT_ROWS_PER_PAGE = 50; // Increased for better performance

// ==============================
// HELPERS - Memoized outside component
// ==============================
const isMAStatus = (status) => {
  if (!status) return false;
  return /ma\s*\(/i.test(status) || /^in-use\s+on\s+ma[-a-z0-9]+/i.test(status?.trim());
};

const coerceTs = (x) => {
  if (!x) return 0;
  const s = typeof x === 'string' ? x : (x.timestamp || x.created_at || x.createdAt || x.time || '');
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
};

// Loading component
const LoadingFallback = () => (
  <div style={{ padding: '20px', color: '#6a7257' }}>Loading...</div>
);

// Optimized filter/search function
const filterAndSearchAssets = (assets, filters, searchTerm, showMAAssets) => {
  let result = assets;

  // Apply filters
  if (filters.id) result = result.filter(a => a.id === filters.id);
  if (filters.sn) result = result.filter(a => a.sn === filters.sn);
  if (filters.name) result = result.filter(a => a.name === filters.name);
  if (filters.category) result = result.filter(a => a.category === filters.category);
  if (filters.location) result = result.filter(a => a.location === filters.location);
  if (filters.status) result = result.filter(a => a.status === filters.status);

  // Apply MA filter
  if (!showMAAssets) {
    result = result.filter(a => !isMAStatus(a.status));
  }

  // Apply search
  if (searchTerm) {
    const t = searchTerm.toLowerCase();
    result = result.filter(a =>
      (a?.id ? String(a.id) : '').toLowerCase().includes(t) ||
      (a?.sn || '').toLowerCase().includes(t) ||
      (a?.name || '').toLowerCase().includes(t) ||
      (a?.category || '').toLowerCase().includes(t) ||
      (a?.location || '').toLowerCase().includes(t) ||
      (a?.status || '').toLowerCase().includes(t)
    );
  }

  return result;
};

// ==============================
// MAIN COMPONENT
// ==============================
export default function FlyHQOptimized() {
  const isCompactLayout = useMediaQuery('(max-width: 1100px)');

  // URL / TAB STATE
  const [searchParams, setSearchParams] = useSearchParams();
  // Derive activeTab directly from URL instead of using separate state
  const activeTab = (searchParams.get('tab') || 'assets').toLowerCase();

  // Core state
  const [filters, setFilters] = useState({ id: '', sn: '', name: '', category: '', location: '', status: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  // Modal states - lazy loaded
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

  // Preferences with lazy localStorage
  const [showMAAssets, setShowMAAssets] = useState(() => {
    if (typeof window === 'undefined') return true;
    const val = window.localStorage.getItem('showMAAssets');
    return val === null ? true : val === 'true';
  });

  const [showRightPanelAssets, setShowRightPanelAssets] = useState(() => {
    if (typeof window === 'undefined') return true;
    const val = window.localStorage.getItem('showRightPanelAssets');
    return val === null ? true : val === 'true';
  });

  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [showMasterHistory, setShowMasterHistory] = useState(false);
  const [lastSeenActivityTs, setLastSeenActivityTs] = useState(() => {
    if (typeof window === 'undefined') return 0;
    const v = window.localStorage.getItem('lastSeenActivityTs');
    return v ? parseInt(v, 10) : 0;
  });
  const [hasUnread, setHasUnread] = useState(false);

  // Panel sizes state for resizable panels
  const [panelSizes, setPanelSizes] = useState(() => {
    if (typeof window === 'undefined') return [70, 30];
    const saved = window.localStorage.getItem('flyHQPanelSizes');
    return saved ? JSON.parse(saved) : [70, 30];
  });

  const panelVisible = isCompactLayout ? mobilePanelOpen : showRightPanelAssets;

  // Data hooks
  const { assets: rawAssets, fetchAssets } = useAssets();
  const assets = useMemo(() => Array.isArray(rawAssets) ? rawAssets : [], [rawAssets]);
  const { activityLogs: rawActivityLogs, fetchActivityLogs } = useActivityLog();
  const activityLogs = useMemo(() => Array.isArray(rawActivityLogs) ? rawActivityLogs : [], [rawActivityLogs]);

  // OPTIMIZED: Single-pass filtering and searching
  const processedAssets = useMemo(() => {
    return filterAndSearchAssets(assets, filters, searchTerm, showMAAssets);
  }, [assets, filters, searchTerm, showMAAssets]);

  // OPTIMIZED: Sort only what's needed for current page
  const sortedAssets = useMemo(() => {
    const sorted = [...processedAssets].sort((a, b) => {
      const aVal = a[sortConfig.key] ?? '';
      const bVal = b[sortConfig.key] ?? '';
      if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [processedAssets, sortConfig]);

  // Pagination
  const paginatedAssets = useMemo(() => {
    const startIdx = (page - 1) * rowsPerPage;
    return sortedAssets.slice(startIdx, startIdx + rowsPerPage);
  }, [sortedAssets, page, rowsPerPage]);

  const totalPages = useMemo(
    () => Math.ceil(sortedAssets.length / rowsPerPage) || 1,
    [sortedAssets.length, rowsPerPage]
  );

  // OPTIMIZED: Calculate options only when assets change
  const filterOptions = useMemo(() => {
    const options = {
      id: new Set(),
      sn: new Set(),
      name: new Set(),
      category: new Set(),
      location: new Set(),
      status: new Set()
    };

    // Single pass through assets
    for (const asset of assets) {
      if (asset.id) options.id.add(asset.id);
      if (asset.sn) options.sn.add(asset.sn);
      if (asset.name) options.name.add(asset.name);
      if (asset.category) options.category.add(asset.category);
      if (asset.location) options.location.add(asset.location);
      if (asset.status) options.status.add(asset.status);
    }

    return {
      idOptions: Array.from(options.id).sort(),
      snOptions: Array.from(options.sn).sort(),
      nameOptions: Array.from(options.name).sort(),
      categoryOptions: Array.from(options.category).sort(),
      locationOptions: Array.from(options.location).sort(),
      statusOptions: Array.from(options.status).sort()
    };
  }, [assets]);

  // Function to update tab in URL
  const setTab = useCallback((tab) => {
    startTransition(() => {
      const next = new URLSearchParams(searchParams);
      next.set('tab', tab);
      setSearchParams(next, { replace: true });
    });
  }, [searchParams, setSearchParams]);

  // Debounced localStorage updates
  useEffect(() => {
    const timer = setTimeout(() => {
      window.localStorage.setItem('showMAAssets', showMAAssets);
    }, 500);
    return () => clearTimeout(timer);
  }, [showMAAssets]);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.localStorage.setItem('showRightPanelAssets', showRightPanelAssets);
    }, 500);
    return () => clearTimeout(timer);
  }, [showRightPanelAssets]);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.localStorage.setItem('flyHQPanelSizes', JSON.stringify(panelSizes));
    }, 500);
    return () => clearTimeout(timer);
  }, [panelSizes]);

  // Reset page on filter/search changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm, filters, showMAAssets]);

  // Table height calculation - simplified
  const tableScrollRef = useRef(null);
  useEffect(() => {
    if (activeTab !== 'assets' || isCompactLayout) {
      setRowsPerPage(DEFAULT_ROWS_PER_PAGE);
      return;
    }

    const calculateRows = () => {
      if (tableScrollRef.current) {
        const tableHeight = tableScrollRef.current.offsetHeight || 0;
        const fitRows = Math.floor((tableHeight - HEADER_HEIGHT) / ROW_HEIGHT);
        setRowsPerPage(fitRows > 0 ? fitRows : DEFAULT_ROWS_PER_PAGE);
      }
    };

    // Debounced resize handler
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(calculateRows, 150);
    };

    calculateRows();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [activeTab, isCompactLayout]);

  // Asset name map for activity logs
  const assetNameMap = useMemo(() => {
    const map = {};
    for (const asset of assets) {
      map[asset.id] = asset.name;
    }
    return map;
  }, [assets]);

  // Handlers
  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  }, []);

  const toggleSelect = useCallback((id) => {
    setSelectedAssetIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedAssetIds(prev => {
      const idsOnPage = paginatedAssets.map(a => a.id);
      const allSelected = idsOnPage.every(id => prev.includes(id));
      return allSelected
        ? prev.filter(id => !idsOnPage.includes(id))
        : Array.from(new Set([...prev, ...idsOnPage]));
    });
  }, [paginatedAssets]);

  const handleToggleMA = useCallback(() => setShowMAAssets(prev => !prev), []);

  const handlePanelResize = useCallback((sizes) => {
    setPanelSizes(sizes);
  }, []);

  // CRUD operations
  const handleAddAsset = useCallback(async (payload) => {
    try {
      const apiPayload = {
        id: payload.id,
        name: payload.name,
        category: payload.category,
        location: payload.location,
        status: payload.status,
        sn: payload.sn
      };

      // Remove empty values
      Object.keys(apiPayload).forEach(key => {
        if (!apiPayload[key]) delete apiPayload[key];
      });

      const res = await fetch(`${API_BASE}/api/assets`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload)
      });

      if (!res.ok) {
        let msg = 'Unknown error';
        try {
          const data = await res.json();
          msg = data.error || msg;
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
  }, [fetchAssets, fetchActivityLogs]);

  const handleUpdateAsset = useCallback(async (id, updates) => {
    try {
      const res = await fetch(`${API_BASE}/api/assets/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!res.ok) {
        let msg = 'Unknown error';
        try {
          const data = await res.json();
          msg = data.error || msg;
        } catch {}
        throw new Error(msg);
      }

      setEditAsset(null);
      await Promise.all([fetchAssets(), fetchActivityLogs?.()]);

      showPalomaToast({
        message: 'Successfully updated asset',
        detail: 'Asset has been updated.',
        type: 'success'
      });
    } catch (err) {
      showPalomaToast({
        message: 'Failed to update asset',
        detail: err?.message || 'Unknown error',
        type: 'error'
      });
    }
  }, [fetchAssets, fetchActivityLogs]);

  const handleDeleteAsset = useCallback(async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/assets/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!res.ok) {
        let msg = 'Unknown error';
        try {
          const data = await res.json();
          msg = data.error || msg;
        } catch {}
        throw new Error(msg);
      }

      setAssetPendingDelete(null);
      await Promise.all([fetchAssets(), fetchActivityLogs?.()]);

      showPalomaToast({
        message: 'Successfully deleted asset',
        detail: 'Asset has been removed from the database.',
        type: 'success'
      });
    } catch (err) {
      showPalomaToast({
        message: 'Failed to delete asset',
        detail: err?.message || 'Unknown error',
        type: 'error'
      });
    }
  }, [fetchAssets, fetchActivityLogs]);

  const handleBulkTransfer = useCallback(async () => {
    if (!newLocation || selectedAssetIds.length === 0) return;

    try {
      const res = await fetch(`${API_BASE}/api/assets/bulk-transfer`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetIds: selectedAssetIds,
          newLocation
        })
      });

      if (!res.ok) {
        let msg = 'Unknown error';
        try {
          const data = await res.json();
          msg = data.error || msg;
        } catch {}
        throw new Error(msg);
      }

      setShowTransferModal(false);
      setShowTransferSuccess(true);
      setSelectedAssetIds([]);
      setNewLocation('');
      await Promise.all([fetchAssets(), fetchActivityLogs?.()]);

      setTimeout(() => setShowTransferSuccess(false), 3000);
    } catch (err) {
      showPalomaToast({
        message: 'Failed to transfer assets',
        detail: err?.message || 'Unknown error',
        type: 'error'
      });
    }
  }, [newLocation, selectedAssetIds, fetchAssets, fetchActivityLogs]);

  // Render based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'analytics':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <AssetAnalytics assets={assets} />
          </Suspense>
        );
      case 'downed':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <DownedAssetsTab allAssets={assets} activityLogs={activityLogs} />
          </Suspense>
        );
      case 'assemblies':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <MasterAssembliesHub />
          </Suspense>
        );
      case 'ma_db':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <MasterAssembliesDBTable />
          </Suspense>
        );
      case 'assets':
      default:
        return (
          <div className="flex flex-col h-full min-w-0 overflow-hidden">
            <Suspense fallback={<LoadingFallback />}>
              <AssetFilters
                filters={filters}
                setFilters={setFilters}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onOpenPhysicalTransfer={() => setShowPhysicalTransfer(true)}
                onOpenAssetTransfer={() => setShowTransferModal(true)}
                onAddNewAsset={() => setShowAddModal(true)}
                showMAAssets={showMAAssets}
                onToggleMAAssets={handleToggleMA}
                {...filterOptions}
              />
              <TableControls
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedCount={selectedAssetIds.length}
                onAddClick={() => setShowAddModal(true)}
                onTransferClick={() => setShowTransferModal(true)}
                showMAAssets={showMAAssets}
                onToggleMA={handleToggleMA}
                showRightPanel={showRightPanelAssets}
                onToggleRightPanel={() => setShowRightPanelAssets(!showRightPanelAssets)}
                isCompactLayout={isCompactLayout}
                onMobilePanelToggle={() => setMobilePanelOpen(!mobilePanelOpen)}
              />
              <div className="flex-1 min-w-0 overflow-auto" ref={tableScrollRef}>
                <AssetTable
                  assets={paginatedAssets}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  selectedIds={selectedAssetIds}
                  onToggle={toggleSelect}
                  onToggleAll={toggleSelectAll}
                  onEdit={setEditAsset}
                  onDelete={setAssetPendingDelete}
                  onViewQR={setQrAsset}
                  onViewHistory={setSelectedHistoryAsset}
                  headerLabels={HEADER_LABELS}
                />
              </div>
              <div className="flex justify-between items-center p-2">
                <span className="text-sm text-gray-600">
                  Showing {paginatedAssets.length} of {sortedAssets.length} assets
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </Suspense>
          </div>
        );
    }
  };

  return (
    <div className="h-full w-full min-w-0 overflow-hidden">
      {isCompactLayout ? (
        // Mobile layout - no resizing
        <div className="flex h-full w-full min-w-0 overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Suspense fallback={<LoadingFallback />}>
              <AssetTabsNav activeTab={activeTab} setActiveTab={setTab} />
            </Suspense>
            {renderTabContent()}
          </div>

          {panelVisible && (
            <Suspense fallback={<LoadingFallback />}>
              <RightPanel
                filteredAssets={processedAssets}
                activityLogs={activityLogs}
                assetNameMap={assetNameMap}
                isCompactLayout={isCompactLayout}
                onClose={() => setMobilePanelOpen(false)}
                lastSeenActivityTs={lastSeenActivityTs}
                setLastSeenActivityTs={setLastSeenActivityTs}
                hasUnread={hasUnread}
                setHasUnread={setHasUnread}
              />
            </Suspense>
          )}
        </div>
      ) : (
        // Desktop layout - with resizing
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full w-full"
          onLayout={handlePanelResize}
        >
          <ResizablePanel
            defaultSize={panelVisible ? panelSizes[0] : 100}
            minSize={50}
            className="flex flex-col min-w-0 overflow-hidden"
          >
            <Suspense fallback={<LoadingFallback />}>
              <AssetTabsNav activeTab={activeTab} setActiveTab={setTab} />
            </Suspense>
            {renderTabContent()}
          </ResizablePanel>

          {panelVisible && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel
                defaultSize={panelSizes[1]}
                minSize={15}
                maxSize={50}
              >
                <Suspense fallback={<LoadingFallback />}>
                  <RightPanel
                    filteredAssets={processedAssets}
                    activityLogs={activityLogs}
                    assetNameMap={assetNameMap}
                    isCompactLayout={isCompactLayout}
                    onClose={() => setShowRightPanelAssets(false)}
                    lastSeenActivityTs={lastSeenActivityTs}
                    setLastSeenActivityTs={setLastSeenActivityTs}
                    hasUnread={hasUnread}
                    setHasUnread={setHasUnread}
                  />
                </Suspense>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      )}

      {/* Lazy load modals only when needed */}
      {(showAddModal || showTransferModal || editAsset || assetPendingDelete || selectedHistoryAsset || qrAsset || showPhysicalTransfer) && (
        <Suspense fallback={<LoadingFallback />}>
          <ModalsContainer
            showAddModal={showAddModal}
            setShowAddModal={setShowAddModal}
            showTransferModal={showTransferModal}
            setShowTransferModal={setShowTransferModal}
            showTransferSuccess={showTransferSuccess}
            selectedAssetIds={selectedAssetIds}
            newLocation={newLocation}
            setNewLocation={setNewLocation}
            handleBulkTransfer={handleBulkTransfer}
            editAsset={editAsset}
            setEditAsset={setEditAsset}
            handleUpdateAsset={handleUpdateAsset}
            assetPendingDelete={assetPendingDelete}
            setAssetPendingDelete={setAssetPendingDelete}
            handleDeleteAsset={handleDeleteAsset}
            selectedHistoryAsset={selectedHistoryAsset}
            setSelectedHistoryAsset={setSelectedHistoryAsset}
            assetJobHistory={assetJobHistory}
            assetDocuments={assetDocuments}
            qrAsset={qrAsset}
            setQrAsset={setQrAsset}
            showPhysicalTransfer={showPhysicalTransfer}
            setShowPhysicalTransfer={setShowPhysicalTransfer}
            handleAddAsset={handleAddAsset}
          />
        </Suspense>
      )}

      {selectedHistoryAsset && (
        <Suspense fallback={<LoadingFallback />}>
          <AssetHistoryModal
            asset={selectedHistoryAsset}
            jobHistory={assetJobHistory}
            documents={assetDocuments}
            onClose={() => setSelectedHistoryAsset(null)}
          />
        </Suspense>
      )}

      <ToastContainer />
    </div>
  );
}