// ==============================
// src/components/Master Assembly Components/MissilePanel.jsx
// ==============================
import { useEffect, useMemo, useRef, useState } from 'react';
import imgPod2 from '../../assets/Master Assemblies/PNG/double barrel2.png';
import imgCheckValve from '../../assets/Master Assemblies/PNG/double barrelcv.png';
import imgPod1 from '../../assets/Master Assemblies/PNG/doublebarrel1.png';
import imgBleedOff from '../../assets/Master Assemblies/PNG/doublebarrelut.png';
import AssetSelector from './AssetSelector';
import ClearAssetStatusModal from './ClearAssetStatusModal';
import { getStoredDiscordName } from '../../utils/currentUser';

// ---- Constants
import {
  BLEED_OFF_LABELS,
  CHECK_VALVE_LABELS,
  POD1_LABELS,
  POD2_LABELS,
  TABS,
  goldAccent,
  palomaGreen,
} from './Support Files/maConsts';

// ---- Shared API & UI
import {
  Paloma3DButton,
  apiDeleteAssignment,
  apiFetchAssignments,
  apiUpdateAssetStatus,
  apiUpsertAssignment,
} from './Support Files/maShared';

// ---- Helpers & Styles
import {
  colorForLabel,
  computeCountsMissile,
  styles,
} from './Support Files/maKit';

export default function MissilePanel({
  selectedAssembly,
  selectedChild,
  assetOptions,
  assetState,
  setAssetState,
  getAssetStateSetterFields,
  handleClearSlot,
  onAssetsUpdated,
  updateStatus = 'idle',
}) {
  const [assets, setAssets] = getAssetStateSetterFields ? getAssetStateSetterFields() : [assetState, setAssetState];
  const isDoubleBarrel = /missile-*\s*1\s*\(.*double\s*barrel.*\)/i.test(String(selectedChild || ''));

  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [clearTarget, setClearTarget] = useState({ assetId: '', assetName: '', slotKey: '', slotLabel: '' });
  const currentUserName = useMemo(() => getStoredDiscordName(), []);
  const [savedState, setSavedState] = useState({});
  const rowRefs = useRef({});
  const [highlightLabel, setHighlightLabel] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const tabImages = useMemo(
    () => ({ pod1: imgPod1, pod2: imgPod2, check: imgCheckValve, bleed: imgBleedOff }),
    []
  );
  const tabs = useMemo(() => {
    const withImgs = TABS.map((t) => ({ ...t, img: tabImages[t.imgKey] || null }));
    return isDoubleBarrel ? withImgs : withImgs.map((t) => ({ ...t, img: null }));
  }, [isDoubleBarrel, tabImages]);

  const [active, setActive] = useState(tabs[0]);
  useEffect(() => setActive((prev) => tabs.find((t) => t.id === prev?.id) || tabs[0]), [tabs, selectedChild]);

  useEffect(() => {
    if (!isDoubleBarrel) return;
    let alive = true;
    (async () => {
      if (!selectedAssembly?.title || !selectedChild) return;
      try {
        const rows = await apiFetchAssignments(selectedAssembly.title, selectedChild);
        if (!alive) return;
        const next = {};
        for (const r of rows) {
          const slot = (r.slot || '').trim();
          if (!slot) continue;
          next[`${selectedChild}-${slot}`] = r.asset_id || '';
        }
        setAssets((prev) => ({ ...prev, ...next }));
        setSavedState(next);
      } catch (e) {
        console.error('MissilePanel: failed to load assignments', e);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDoubleBarrel, selectedAssembly?.title, selectedChild]);

  const namedLabels = useMemo(() => {
    if (!isDoubleBarrel) return [];
    switch (active.title) {
      case 'Pod #1': return POD1_LABELS;
      case 'Pod #2': return POD2_LABELS;
      case 'Check Valve Assembly': return CHECK_VALVE_LABELS;
      case 'Bleed Off Skid': return BLEED_OFF_LABELS;
      default: return [];
    }
  }, [isDoubleBarrel, active.title]);

  const all24Labels = useMemo(() => {
    const labels = [...namedLabels];
    for (let i = labels.length + 1; i <= 24; i++) labels.push(`Unassigned Position ${i - namedLabels.length}`);
    return labels;
  }, [namedLabels]);

  const slotKey = (label) => `${selectedChild}-${active.title} - ${label}`;
  const slotLabel = (label) => `${active.title} - ${label}`;

  const updateLabel = useMemo(() => `Update ${selectedChild} — ${active.title}`, [selectedChild, active.title]);

  const handleUpdate = async () => {
    try {
      setIsSaving(true);
      for (const label of all24Labels) {
        const key = slotKey(label);
        const assetId = assets[key] || null;
        await apiUpsertAssignment({
          assembly: selectedAssembly?.title,
          child: selectedChild,
          slot: slotLabel(label),
          asset_id: assetId,
        });
      }
      if (onAssetsUpdated) {
        const entries = all24Labels
          .map((label) => {
            const key = slotKey(label);
            const assetId = assets[key];
            return assetId
              ? {
                  time: new Date(),
                  action: 'Added to Master Assembly',
                  slot: `${selectedChild}-${slotLabel(label)}`,
                  assetId,
                  assetName: '',
                  user: currentUserName,
                }
              : null;
          })
          .filter(Boolean);
        await onAssetsUpdated(entries);
      }
      const snap = {};
      for (const label of all24Labels) {
        const key = slotKey(label);
        snap[key] = assets[key] || '';
      }
      setSavedState((prev) => ({ ...prev, ...snap }));
    } catch (e) {
      console.error('MissilePanel: update failed', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmClear = async ({ status, notes }) => {
    const { assetId, slotKey: sKey, slotLabel: sLabel } = clearTarget;
    try {
      await apiUpdateAssetStatus(assetId, status);
      handleClearSlot(assetId, sKey, setAssets);
      setAssetState((prev) => {
        const n = { ...prev };
        delete n[sKey];
        return n;
      });
      await apiDeleteAssignment({
        assembly: selectedAssembly ? selectedAssembly.title : null,
        child: selectedChild,
        slot: sLabel,
        new_status: status,
        notes,
      });
      if (onAssetsUpdated) {
        await onAssetsUpdated([
          {
            time: new Date(),
            action: 'Removed from Master Assembly',
            slot: sKey,
            assetId,
            assetName: clearTarget.assetName || '',
            user: currentUserName,
          },
        ]);
      }
    } catch (e) {
      console.error('MissilePanel: clear failed', e);
    } finally {
      setClearModalOpen(false);
      setClearTarget({ assetId: '', assetName: '', slotKey: '', slotLabel: '' });
    }
  };

  function jumpTo(label) {
    const el = rowRefs.current[label];
    if (el?.scrollIntoView) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightLabel(label);
      setTimeout(() => setHighlightLabel(null), 1200);
    }
  }

  const { assignedCount, changeCount, totalCount } = useMemo(
    () => computeCountsMissile(all24Labels, selectedChild, active.title, assets, savedState),
    [all24Labels, assets, savedState, active.title, selectedChild]
  );

  const heroBox = { width: 'clamp(520px, 48vw, 860px)', height: 'clamp(180px, 24vh, 320px)' };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: 8, width: '100%', padding: '4px 4px 4px 4px', boxSizing: 'border-box' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t)}
            style={styles.missileTab(t.id === active.id)}
          >
            {t.title}
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: active.img ? `${heroBox.width} 1fr` : '1fr',
          alignItems: 'stretch',
          width: '100%',
          padding: '8px 4px 8px',
          boxSizing: 'border-box',
          gap: 16,
          background: 'linear-gradient(180deg, rgba(20,22,18,.98) 0%, rgba(20,22,18,.98) 60%, rgba(20,22,18,.98) 100%)',
        }}
      >
        {active.img && (
          <div style={styles.heroBox(heroBox)}>
            <img
              src={active.img}
              alt={active.title}
              style={styles.heroImg}
            />
          </div>
        )}

        <div style={{ minHeight: heroBox.height, display: 'grid', gridTemplateRows: 'auto 1fr', gap: 12 }}>
          <div style={styles.headerRow}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={styles.title(goldAccent)}>
                {selectedChild} — {active.title}
              </div>
              <div style={styles.subTitle(palomaGreen)}>
                STATUS:<span style={{ color: '#fff', fontWeight: 900, textShadow: '0 2px 8px #101', marginLeft: 3 }}>ACTIVE</span>
              </div>
              <div style={styles.idLine}>ID: {selectedChild}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {updateStatus !== 'idle' && (
                <div style={styles.statusIcon(updateStatus)} aria-hidden>
                  {updateStatus === 'success' ? '✓' : '✗'}
                </div>
              )}
              <Paloma3DButton label={isSaving ? 'Saving…' : updateLabel} onClick={handleUpdate} />
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))',
              gap: 4,
              alignContent: 'start',
              background: 'linear-gradient(180deg,#141612,#10120f)',
              border: '1px solid #23261F',
              boxShadow: 'inset 0 0 24px rgba(0,0,0,.25)',
              padding: 0,
            }}
          >
            {namedLabels.map((lbl) => {
              const key = slotKey(lbl);
              const assigned = !!assets[key];
              const accent = colorForLabel(lbl);
              return (
                <button key={lbl} onClick={() => jumpTo(lbl)} title={`Jump to ${lbl}`} style={styles.legendBtn(assigned)}>
                  <div style={styles.legendBadge(accent)}>{lbl}</div>
                  <div style={{ fontWeight: 800, letterSpacing: '.04em', fontSize: 12, color: assigned ? '#e8eadf' : '#b3b9a0' }}>
                    Position {lbl}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div
        style={{
          width: '100%',
          background: 'rgba(14,15,14,0.95)',
          borderTop: '1.5px solid #23261F',
          borderBottom: '1.5px solid #23261F',
          padding: '4px 4px 4px 4px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '4px 4px' }}>
          {all24Labels.map((label) => {
            const key = slotKey(label);
            const value = assets[key] || '';
            const isUnassigned = !isDoubleBarrel || /^Unassigned/i.test(label);
            const accent = isUnassigned ? '#8e9481' : colorForLabel(label);

            return (
              <div
                key={key}
                ref={(el) => { rowRefs.current[label] = el; }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: highlightLabel === label ? '2px' : 0,
                  background: highlightLabel === label ? 'linear-gradient(90deg,#26301d,#1a1f16)' : 'transparent',
                  outline: highlightLabel === label ? '2px solid #6a7257' : 'none',
                  transition: 'all 220ms ease',
                }}
              >
                <span style={{ minWidth: 36, textAlign: 'right', fontWeight: 900, letterSpacing: '.04em', color: accent, fontSize: 20 }}>
                  {isUnassigned ? '—' : label}
                </span>

                <div style={{ flex: 1 }}>
                  <AssetSelector
                    label=""
                    asset={value}
                    assetOptions={assetOptions}
                    onChange={(val) => setAssets((a) => ({ ...a, [key]: val }))}
                    accentColor={accent}
                  />
                </div>

                <button
                  onClick={() => {
                    if (!value) return;
                    let name = '';
                    try {
                      if (Array.isArray(assetOptions)) {
                        const hit = assetOptions.find((o) => o?.id === value || o?.value === value);
                        name = hit?.name || hit?.label || '';
                      }
                    } catch {}
                    setClearTarget({ assetId: value, assetName: name, slotKey: key, slotLabel: slotLabel(label) });
                    setClearModalOpen(true);
                  }}
                  disabled={!value}
                  style={styles.clearBtn(!!value)}
                >
                  Clear
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {changeCount > 0 && (
        <div style={styles.saveBar}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ fontWeight: 900, letterSpacing: '.14em', color: '#dfe3d1', textTransform: 'uppercase' }}>Unsaved Changes</div>
            <div style={{ fontWeight: 800, color: '#b7bea5' }}>{assignedCount}/{totalCount} assigned</div>
            <div style={{ fontWeight: 800, color: '#a6ac96' }}>{changeCount} modified on {active.title}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Paloma3DButton label={isSaving ? 'Saving…' : updateLabel} onClick={handleUpdate} />
          </div>
        </div>
      )}

      <ClearAssetStatusModal
        open={clearModalOpen}
        assetId={clearTarget.assetId}
        assetName={clearTarget.assetName}
        onClose={() => setClearModalOpen(false)}
        onConfirm={handleConfirmClear}
      />
    </div>
  );
}
