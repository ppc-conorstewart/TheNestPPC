// ==============================
// src/components/Master Assembly Components/MasterAssetVisualPanel.jsx
// Visual panel — canonical slot keys, update-only toast summary,
// tiny “Changes Pending” counter, working Creation-Date “Clear”,
// and Maintenance tabs (Assembly + Gaskets)
// Responsive: maintenance area is height-contained with internal scroll
// ==============================

import { useEffect, useMemo, useRef, useState } from 'react';
import ClearAssetStatusModal from './ClearAssetStatusModal';
import MissilePanel from './MissilePanel';

import AssemblySelectors from './Master Assemblies Hub Components/AssemblySelectors';
import GasketMaintenancePanel from './Master Assemblies Hub Components/GasketMaintenancePanel';
import HeroPanel from './Master Assemblies Hub Components/HeroPanel';
import HistoryPane from './Master Assemblies Hub Components/HistoryPane';
import MaintenanceHealthPanel from './Master Assemblies Hub Components/MaintenanceHealthPanel';
import MetaDatesCard from './Master Assemblies Hub Components/MetaDatesCard';
import MetaHeader from './Master Assemblies Hub Components/MetaHeader';

import {
  apiDeleteAssignment,
  apiFetchAssignments,
  cardBg,
  glassBorder
} from './Support Files/maShared';

import {
  dogboneAssetFields,
  dogboneLegend,
  zipperAssetFields,
  zipperLegend
} from './Support Files/maConsts';

import {
  computeCounts,
  heroBoxFor,
  normalizeSlotFromDB,
  styles
} from './Support Files/maKit';

import {
  apiFetchGaskets,
  apiFetchMeta,
  normDate
} from './Support Files/masterMetaApi';

import { showPalomaToast } from '../../utils/toastUtils';
import { makeGroupings } from './Support Files/maDerived';

// ==============================
// Gasket Labels
// ==============================
const gasketLabels = [
  '1. Rotator X Tee',
  '2. Tee x Spool',
  '3. Adapter X Tee',
  '4. Spool X Tee',
  '5. Blind x Tee',
  '6. Tee X Rotator',
];

// ==============================
// Component
// ==============================
export default function MasterAssetVisualPanel({
  selectedAssembly,
  selectedChild,
  fullId,
  assetState = {},
  setAssetState = () => {},
  assetFields = [],
  assetOptions = [],
  onAssetsUpdated,
  historyLog = [],
  setHistoryLog = () => {},
  handleClearSlot = () => {},
  getAssetStateSetterFields = null,
  updateStatus = 'idle',
  historyOpen = false,
  setHistoryOpen = () => {}
}) {
  const noChild = !selectedChild;
  const assemblyTitle = (selectedAssembly?.title || '').toLowerCase();
  const isDogBones = assemblyTitle === 'dog bones';
  const isZippers  = assemblyTitle === 'zippers';
  const isMissiles = assemblyTitle === 'missiles';

  const [status, setStatus] = useState('Inactive');
  const [creationDate, setCreationDate] = useState('');
  const [recertDate, setRecertDate] = useState('');

  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [clearTarget, setClearTarget] = useState({ assetId: '', assetName: '', slotKey: '', slotLabel: '' });

  const [savedState, setSavedState] = useState({});
  const [savedGaskets, setSavedGaskets] = useState({});
  const [savedMeta, setSavedMeta] = useState({ status: 'Inactive', creationDate: '', recertDate: '' });

  const rowRefs = useRef({});
  const [isSaving, setIsSaving] = useState(false);
  const [gasketState, setGasketState] = useState({});
  const [hoverLabel, setHoverLabel] = useState(null);
  const [hoverGasket, setHoverGasket] = useState(null);

  const prevCreationRef = useRef('');

  // always have the freshest status for network calls
  const statusRef = useRef('Inactive');
  useEffect(() => { statusRef.current = status; }, [status]);

  // maintenance tabs
  const [maintTab, setMaintTab] = useState('assembly'); // 'assembly' | 'gaskets'

  // ==============================
  // Load assignments (canonical keys)
  // ==============================
  useEffect(() => {
    if (isMissiles || noChild) return;
    if (!selectedAssembly || typeof getAssetStateSetterFields !== 'function') return;
    const [assets, setAssets] = getAssetStateSetterFields();
    (async () => {
      try {
        const rows = await apiFetchAssignments(selectedAssembly.title, selectedChild);
        const fromDB = {};
        for (const r of rows) {
          const clean = normalizeSlotFromDB(selectedChild, r.slot);
          const key = `${selectedChild}-${clean}`;
          fromDB[key] = r.asset_id || '';
        }
        setAssets((prev) => ({ ...prev, ...fromDB }));
        setAssetState((prev) => ({ ...prev, ...fromDB }));
        setSavedState(fromDB);
      } catch (e) {
        console.error('load assignments failed', e);
      }
    })();
  }, [selectedAssembly, selectedChild, isMissiles, noChild]);

  // ==============================
  // Load meta (status + dates)
  // ==============================
  useEffect(() => {
    if (isMissiles || noChild) return;
    if (!selectedAssembly) return;
    (async () => {
      try {
        const meta = await apiFetchMeta(selectedAssembly.title, selectedChild);
        const s = meta.status || 'Inactive';
        const c = normDate(meta.creation_date);
        const r = normDate(meta.recert_date);
        setStatus(s);
        setCreationDate(c);
        setRecertDate(r);
        setSavedMeta({ status: s, creationDate: c, recertDate: r });
        prevCreationRef.current = c || '';
      } catch (e) {
        console.error('load meta failed', e);
      }
    })();
  }, [selectedAssembly, selectedChild, isMissiles, noChild]);

  // ==============================
  // Load gaskets (dogbones only)
  // ==============================
  useEffect(() => {
    if (!isDogBones || noChild) return;
    if (!selectedAssembly) return;
    (async () => {
      try {
        const rows = await apiFetchGaskets(selectedAssembly.title, selectedChild);
        const next = {};
        for (const r of rows) {
          const slot = r.gasket_slot || '';
          if (!slot) continue;
          next[slot] = r.gasket_id || '';
          if (r.gasket_date) next[`${slot}__date`] = normDate(r.gasket_date);
        }
        setGasketState(next);
        setSavedGaskets(next);
      } catch (e) {
        console.error('load gaskets failed', e);
      }
    })();
  }, [selectedAssembly, selectedChild, isDogBones, noChild]);

  // ==============================
  // Derived data
  // ==============================
  const heroBox = (isDogBones || isZippers) ? heroBoxFor(isDogBones ? 'dogbone' : 'zipper') : heroBoxFor('default');

  const resolvedFields = useMemo(() => {
    if (noChild) return [];
    return isDogBones ? dogboneAssetFields : isZippers ? zipperAssetFields : assetFields;
  }, [noChild, isDogBones, isZippers, assetFields]);

  const legendData = isDogBones ? dogboneLegend : isZippers ? zipperLegend : [];

  const groupings = useMemo(
    () => makeGroupings(isDogBones, isZippers, resolvedFields),
    [isDogBones, isZippers, resolvedFields]
  );

  const { assignedCount } = useMemo(() => {
    if (noChild) return { assignedCount: 0 };
    return computeCounts(resolvedFields, selectedChild, (assetState || {}), savedState);
  }, [noChild, resolvedFields, assetState, savedState, selectedChild]);

  // ==============================
  // Changes Pending counter
  // ==============================
  const changesPending = useMemo(() => {
    if (noChild || isMissiles) return 0;

    let assetDiffs = 0;
    for (const label of resolvedFields) {
      const k = `${selectedChild}-${normalizeSlotFromDB(selectedChild, label)}`;
      const now = (assetState?.[k] || '') ?? '';
      const was = (savedState?.[k] || '') ?? '';
      if (String(now) !== String(was)) assetDiffs++;
    }

    let gasketDiffs = 0;
    if (isDogBones) {
      const slots = new Set([
        ...Object.keys(savedGaskets).filter(k => !k.endsWith('__date')),
        ...Object.keys(gasketState).filter(k => !k.endsWith('__date')),
        ...gasketLabels,
      ]);
      for (const slot of slots) {
        const idNow = gasketState[slot] || '';
        const idWas = savedGaskets[slot] || '';
        const dNow = gasketState[`${slot}__date`] || '';
        const dWas = savedGaskets[`${slot}__date`] || '';
        if (String(idNow) !== String(idWas)) gasketDiffs++;
        if (String(dNow) !== String(dWas)) gasketDiffs++;
      }
    }

    let metaDiffs = 0;
    if (String(status) !== String(savedMeta.status)) metaDiffs++;
    if (String(creationDate || '') !== String(savedMeta.creationDate || '')) metaDiffs++;
    if (String(recertDate || '') !== String(savedMeta.recertDate || '')) metaDiffs++;

    return assetDiffs + gasketDiffs + metaDiffs;
  }, [noChild, isMissiles, isDogBones, resolvedFields, selectedChild, assetState, savedState, gasketState, savedGaskets, status, creationDate, recertDate, savedMeta]);

  // ==============================
  // Build update summary (toast)
  // ==============================
  const buildUpdateSummary = () => {
    const lines = [];

    if (String(status) !== String(savedMeta.status)) {
      lines.push(`STATUS: ${savedMeta.status || '—'} → ${status || '—'}`);
    }
    if (String(creationDate || '') !== String(savedMeta.creationDate || '')) {
      lines.push(`CREATION DATE: ${savedMeta.creationDate || '—'} → ${creationDate || '—'}`);
    }
    if (String(recertDate || '') !== String(savedMeta.recertDate || '')) {
      lines.push(`RE-CERT DATE: ${savedMeta.recertDate || '—'} → ${recertDate || '—'}`);
    }

    for (const label of resolvedFields) {
      const k = `${selectedChild}-${normalizeSlotFromDB(selectedChild, label)}`;
      const now = (assetState?.[k] || '') ?? '';
      const was = (savedState?.[k] || '') ?? '';
      if (String(now) !== String(was)) {
        lines.push(`ASSET • ${label}: ${was || '—'} → ${now || '—'}`);
      }
    }

    if (isDogBones) {
      const slots = new Set([
        ...Object.keys(savedGaskets).filter(k => !k.endsWith('__date')),
        ...Object.keys(gasketState).filter(k => !k.endsWith('__date')),
        ...gasketLabels,
      ]);
      for (const slot of slots) {
        const idNow = gasketState[slot] || '';
        const idWas = savedGaskets[slot] || '';
        const dNow = gasketState[`${slot}__date`] || '';
        const dWas = savedGaskets[`${slot}__date`] || '';
        if (String(idNow) !== String(idWas)) lines.push(`GASKET • ${slot}: ${idWas || '—'} → ${idNow || '—'}`);
        if (String(dNow) !== String(dWas)) lines.push(`GASKET DATE • ${slot}: ${dWas || '—'} → ${dNow || '—'}`);
      }
    }

    return lines;
  };

  // ==============================
  // Unified save (Update button) + toast
  // ==============================
  const handleUpdate = async () => {
    if (noChild) return;
    const summaryLines = buildUpdateSummary();
    setIsSaving(true);
    try {
      const assignments = resolvedFields.map((label) => {
        const key = `${selectedChild}-${normalizeSlotFromDB(selectedChild, label)}`;
        return { slot: label, asset_id: assetState[key] || null };
      });

      let gaskets = [];
      if (isDogBones) {
        gaskets = Object.keys(gasketState)
          .filter((k) => !k.endsWith('__date'))
          .map((slot) => ({
            gasket_slot: slot,
            gasket_id: gasketState[slot] || '',
            gasket_date: gasketState[`${slot}__date`] || null,
          }));
        for (const slot of gasketLabels) {
          if (!gaskets.find((i) => i.gasket_slot === slot)) {
            gaskets.push({ gasket_slot: slot, gasket_id: '', gasket_date: null });
          }
        }
      }

      await fetch(`/api/master/save`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assembly: selectedAssembly.title,
          child: selectedChild,
          status: statusRef.current,
          creation_date: creationDate || null,
          recert_date: recertDate || null,
          assignments,
          gaskets,
          updated_by: 'Current User'
        })
      });

      const snap = {};
      for (const label of resolvedFields) {
        const k = `${selectedChild}-${normalizeSlotFromDB(selectedChild, label)}`;
        snap[k] = assetState[k] || '';
      }
      setSavedState(snap);
      if (isDogBones) setSavedGaskets({ ...gasketState });
      setSavedMeta({ status: statusRef.current, creationDate, recertDate });

      const title = `${selectedAssembly.title.toUpperCase()} — ${selectedChild}`;
      const detail = summaryLines.length ? summaryLines.join(' • ') : 'No fields changed.';
      showPalomaToast({ message: `Updated ${title}`, detail });
    } catch (e) {
      console.error('update failed', e);
      showPalomaToast({ message: 'Update failed', detail: String(e?.message || e), type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // ==============================
  // Clear-slot (assets)
  // ==============================
  const handleConfirmClear = async ({ status, notes }) => {
    const { assetId, slotKey, slotLabel } = clearTarget;
    try {
      await apiDeleteAssignment({
        assembly: selectedAssembly?.title,
        child: selectedChild,
        slot: slotLabel,
        new_status: status,
        notes
      });
      handleClearSlot(assetId, slotKey, setAssetState, slotKey);
      setAssetState((prev) => {
        const n = { ...prev };
        delete n[slotKey];
        return n;
      });
      if (onAssetsUpdated) {
        await onAssetsUpdated([{
          time: new Date(),
          action: 'Removed from Master Assembly',
          slot: slotKey,
          assetId,
          assetName: '',
          user: 'Current User',
        }]);
      }
    } catch (e) {
      console.error('clear failed', e);
    } finally {
      setClearModalOpen(false);
      setClearTarget({ assetId: '', assetName: '', slotKey: '', slotLabel: '' });
    }
  };

  // ==============================
  // Clear Creation/Recert dates (button in MetaDatesCard)
  // ==============================
  const clearDatesNow = async () => {
    if (noChild) return;
    setCreationDate('');
    setRecertDate('');
    try {
      await fetch(`/api/master/meta`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assembly: selectedAssembly.title,
          child: selectedChild,
          status: statusRef.current,
          creation_date: null,
          recert_date: null,
          updated_by: 'Current User'
        })
      });
      setSavedMeta({ status: statusRef.current, creationDate: '', recertDate: '' });
      prevCreationRef.current = '';
      showPalomaToast({
        message: `Cleared dates — ${selectedChild}`,
        detail: 'Creation Date → null • 6 Month Service Date → null'
      });
    } catch (e) {
      console.error('clear dates failed', e);
      showPalomaToast({ message: 'Failed to clear dates', detail: String(e?.message || e), type: 'error' });
    }
  };

  // Detect manual clear from inner component (creationDate -> '')
  useEffect(() => {
    const prev = prevCreationRef.current || '';
    if (prev && creationDate === '') {
      clearDatesNow();
    }
    prevCreationRef.current = creationDate || '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creationDate]);

  // ==============================
  // Render
  // ==============================
  const showHero = (isDogBones || isZippers) && !noChild;
  const qrData = fullId || `${selectedAssembly?.title || ''}:${selectedChild || ''}`;

  return (
    <div style={{ width: '100%', height: '100%', background: '#10110f', display: 'flex', flexDirection: 'row' }}>
      <div style={{ flex: 1, background: cardBg, borderRight: glassBorder }}>
        {isMissiles ? (
          <MissilePanel
            selectedAssembly={selectedAssembly}
            selectedChild={selectedChild}
            assetOptions={assetOptions}
            assetState={assetState}
            setAssetState={setAssetState}
            getAssetStateSetterFields={getAssetStateSetterFields}
            handleClearSlot={handleClearSlot}
            onAssetsUpdated={onAssetsUpdated}
            updateStatus={updateStatus}
          />
        ) : noChild ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div style={{ textAlign: 'center', padding: 48, background: cardBg, border: glassBorder }}>
              <div style={{ fontSize: 36, color: '#6a7257', marginBottom: 8 }}>CHOOSE A MASTER ASSEMBLY</div>
              <div style={{ fontSize: 12, color: '#b0b79f' }}>Select Dog Bones, Zippers, Flowcrosses, or Missiles.</div>
            </div>
          </div>
        ) : (
          <>
            {/* 2 columns: Hero | Meta (title + dates + QR in dates card) */}
            <div style={{ display: 'grid', gridTemplateColumns: (showHero ? `${heroBoxFor(isDogBones ? 'dogbone' : 'zipper').width} 1fr` : '1fr'), gap: 8, padding: 12 }}>
              {showHero && (
                <div style={{ height: heroBox.height }}>
                  <HeroPanel
                    isDogBones={isDogBones}
                    isZippers={isZippers}
                    status={status}
                    hoverLabel={hoverLabel}
                    setHoverLabel={setHoverLabel}
                    hoverGasket={hoverGasket}
                    setHoverGasket={setHoverGasket}
                  />
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', gap: 4 }}>
                <div style={{ position: 'relative' }}>
                  <MetaHeader
                    selectedChild={selectedChild}
                    status={status}
                    setStatus={setStatus}
                    updateStatus={updateStatus}
                    onUpdate={handleUpdate}
                    isSaving={isSaving}
                  />
                  <ChangesBadge count={changesPending} isSaving={isSaving} />
                </div>

                <MetaDatesCard
                  creationDate={creationDate}
                  setCreationDate={setCreationDate}
                  recertDate={recertDate}
                  onClearDates={clearDatesNow}
                  qrData={qrData}
                  qrLabel={selectedChild}
                />
              </div>
            </div>

            <AssemblySelectors
              isDogBones={isDogBones}
              selectedChild={selectedChild}
              groupings={groupings}
              getAssetStateSetterFields={getAssetStateSetterFields}
              assetOptions={assetOptions}
              hoverLabel={hoverLabel}
              rowRefs={rowRefs}
              setClearTarget={setClearTarget}
              setClearModalOpen={setClearModalOpen}
              gasketState={gasketState}
              setGasketState={setGasketState}
              hoverGasket={hoverGasket}
            />

            {/* ----- Maintenance Tabs (contained height with internal scroll) ----- */}
            <div style={{ padding: '12px', paddingTop: 6 }}>
              <div style={{ display:'flex', gap:8, marginBottom:8, flexWrap:'wrap' }}>
                <button
                  onClick={() => setMaintTab('assembly')}
                  style={{
                    border:'1px solid #3b3f33',
                    background: maintTab==='assembly' ? '#141712' : '#0f100e',
                    color:'#e6e8df',
                    borderRadius:8,
                    padding:'8px 10px',
                    fontWeight:900,
                    letterSpacing:'.08em',
                    textTransform:'uppercase',
                    cursor:'pointer'
                  }}
                >
                  Master Assembly Maintenance
                </button>
                <button
                  onClick={() => setMaintTab('gaskets')}
                  style={{
                    border:'1px solid #3b3f33',
                    background: maintTab==='gaskets' ? '#141712' : '#0f100e',
                    color:'#e6e8df',
                    borderRadius:8,
                    padding:'8px 10px',
                    fontWeight:900,
                    letterSpacing:'.08em',
                    textTransform:'uppercase',
                    cursor:'pointer'
                  }}
                >
                  Gasket Maintenance
                </button>
              </div>

              {/* CONTAINMENT: clamp the max height and enable internal scroll */}
              <div
                style={{
                  maxHeight: 'clamp(240px, 28vh, 380px)',
                  overflowY: 'auto',
                  paddingRight: 6,
                 
                  background: 'linear-gradient(180deg,#121512,#0e100d)',
                }}
              >
                {maintTab === 'assembly' ? (
                  <MaintenanceHealthPanel
                    assemblyTitle={selectedAssembly?.title}
                    child={selectedChild}
                    status={status}
                    creationDate={creationDate}
                    recertDate={recertDate}
                  />
                ) : (
                  <GasketMaintenancePanel
                    assemblyTitle={selectedAssembly?.title}
                    child={selectedChild}
                    gasketLabels={gasketLabels}
                    gasketState={gasketState}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>
      {historyOpen && (
        <HistoryPane
          cardBg={cardBg}
          glassBorder={glassBorder}
          styles={styles}
          historyLog={historyLog}
        />
      )}
      {clearModalOpen && (
        <ClearAssetStatusModal
          isOpen={clearModalOpen}
          onClose={() => setClearModalOpen(false)}
          onConfirm={handleConfirmClear}
          defaultStatus="Available"
        />
      )}
    </div>
  );
}

// ==============================
// Tiny “Changes Pending” Badge
// ==============================
function ChangesBadge({ count, isSaving }) {
  if (!count || count <= 0) return null;
  return (
    <div
      title={`${count} changes pending`}
      style={{
        position: 'absolute',
        top: 6,
        right: 6,
        background: '#0e100c',
        border: '1px solid #6a7257',
        borderRadius: 10,
        padding: '4px 10px',
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: '0.06em',
        color: '#cfd3c3',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        boxShadow: '0 0 0 0px rgba(0,0,0,0.35)',
        textTransform: 'uppercase',
        opacity: isSaving ? 0.6 : 1,
        userSelect: 'none'
      }}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 16,
          height: 16,
          borderRadius: 8,
          background: '#f7df0f',
          color: '#0e100c',
          fontSize: 10,
          fontWeight: 900,
          lineHeight: '16px'
        }}
      >
        {count}
      </span>
      Changes Pending
    </div>
  );
}
