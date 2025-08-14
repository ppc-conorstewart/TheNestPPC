// ==============================
// src/components/Master Assembly Components/MasterAssetVisualPanel.jsx
// Visual panel — passes status to HeroPanel for ambient glow
// ==============================

import { useEffect, useMemo, useRef, useState } from 'react';
import ClearAssetStatusModal from './ClearAssetStatusModal';
import MissilePanel from './MissilePanel';

import AssemblySelectors from './Master Assemblies Hub Components/AssemblySelectors';
import HeroPanel from './Master Assemblies Hub Components/HeroPanel';
import HistoryPane from './Master Assemblies Hub Components/HistoryPane';
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

import { makeGroupings } from './Support Files/maDerived';

const gasketLabels = [
  '1. Rotator X Tee',
  '2. Tee x Spool',
  '3. Adapter X Tee',
  '4. Spool X Tee',
  '5. Blind x Tee',
  '6. Tee X Rotator',
];

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
  const rowRefs = useRef({});
  const [isSaving, setIsSaving] = useState(false);
  const [gasketState, setGasketState] = useState({});
  const [hoverLabel, setHoverLabel] = useState(null);
  const [hoverGasket, setHoverGasket] = useState(null);

  // Load assignments
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
          fromDB[`${selectedChild}-${clean}`] = r.asset_id || '';
        }
        setAssets((prev) => ({ ...prev, ...fromDB }));
        setAssetState((prev) => ({ ...prev, ...fromDB }));
        setSavedState(fromDB);
      } catch (e) {
        console.error('load assignments failed', e);
      }
    })();
  }, [selectedAssembly, selectedChild, isMissiles, noChild]);

  // Load meta
  useEffect(() => {
    if (isMissiles || noChild) return;
    if (!selectedAssembly) return;
    (async () => {
      try {
        const meta = await apiFetchMeta(selectedAssembly.title, selectedChild);
        setStatus(meta.status || 'Inactive');
        setCreationDate(normDate(meta.creation_date));
        setRecertDate(normDate(meta.recert_date));
      } catch (e) {
        console.error('load meta failed', e);
      }
    })();
  }, [selectedAssembly, selectedChild, isMissiles, noChild]);

  // Load gaskets
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
      } catch (e) {
        console.error('load gaskets failed', e);
      }
    })();
  }, [selectedAssembly, selectedChild, isDogBones, noChild]);

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

  const handleUpdate = async () => {
    if (noChild) return;
    setIsSaving(true);
    try {
      const assignments = resolvedFields.map(label => ({
        slot: label,
        asset_id: assetState[`${selectedChild}-${label}`] || null
      }));

      let gaskets = [];
      if (isDogBones) {
        gaskets = Object.keys(gasketState)
          .filter(k => !k.endsWith('__date'))
          .map(slot => ({
            gasket_slot: slot,
            gasket_id: gasketState[slot] || '',
            gasket_date: gasketState[`${slot}__date`] || null
          }));
        for (const slot of gasketLabels) {
          if (!gaskets.find(i => i.gasket_slot === slot)) {
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
          status,
          creation_date: creationDate || null,
          recert_date: recertDate || null,
          assignments,
          gaskets,
          updated_by: 'Current User'
        })
      });

      const snap = {};
      for (const label of resolvedFields) snap[`${selectedChild}-${label}`] = assetState[`${selectedChild}-${label}`] || '';
      setSavedState(snap);

      if (onAssetsUpdated) {
        const entries = assignments
          .filter(a => a.asset_id)
          .map(a => ({
            time: new Date(),
            action: 'Added to Master Assembly',
            slot: `${selectedChild}-${a.slot}`,
            assetId: a.asset_id,
            assetName: '',
            user: 'Current User'
          }));
        if (entries.length) await onAssetsUpdated(entries);
      }
    } catch (e) {
      console.error('update failed', e);
    } finally {
      setIsSaving(false);
    }
  };

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
      setAssetState(prev => {
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

  const showHero = (isDogBones || isZippers) && !noChild;

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
            <div style={{ display: 'grid', gridTemplateColumns: (showHero ? `${heroBoxFor(isDogBones ? 'dogbone' : 'zipper').width} 1fr` : '1fr'), gap: 16, padding: 12 }}>
              {showHero && (
                <div style={{ height: heroBox.height }}>
                  <HeroPanel
                    isDogBones={isDogBones}
                    isZippers={isZippers}
                    status={status}                 // ← pass status for ambient glow
                    hoverLabel={hoverLabel}
                    setHoverLabel={setHoverLabel}
                    hoverGasket={hoverGasket}
                    setHoverGasket={setHoverGasket}
                  />
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', gap: 12 }}>
                <MetaHeader
                  selectedChild={selectedChild}
                  status={status}
                  setStatus={setStatus}
                  updateStatus={updateStatus}
                  onUpdate={handleUpdate}
                  isSaving={isSaving}
                />
                <MetaDatesCard
                  creationDate={creationDate}
                  setCreationDate={setCreationDate}
                  recertDate={recertDate}
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
