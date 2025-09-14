// ==============================
// FILE: client/src/pages/InteractiveTraining.jsx
// ==============================

import '@google/model-viewer';
import { useEffect, useMemo, useRef, useState } from 'react';
import TrainingViewer from '../components/Interactive Trainer Components/TrainingViewer.jsx';
import GlbLibraryModal from '../components/Workorder Components/GlbLibraryModal.jsx';

// ==============================
// ======== TRAINING STEPS ======
// ==============================
const STEPS = [
  { id: 1, title: 'Unscrew Bonnet Nuts', instruction: 'Hover for grab cursor. Hold left-click on a top-bonnet nut to lock the view; it spins on Z and lifts off. Release to pause. Remove all 8 nuts.', hint: '' },
  { id: 2, title: 'Lift Bonnet', instruction: 'Lift the bonnet after nuts are removed.', hint: '' },
  { id: 3, title: 'Extract Plug/Stem', instruction: 'Remove the plug/stem.', hint: '' },
  { id: 4, title: 'Seat Inspection', instruction: 'Inspect seat surface.', hint: '' },
  { id: 5, title: 'Reassemble Plug/Stem', instruction: 'Place plug/stem back.', hint: '' },
  { id: 6, title: 'Reinstall Bonnet', instruction: 'Place bonnet back.', hint: '' },
  { id: 7, title: 'Torque Bonnet Bolts', instruction: 'Tighten to target torque.', hint: '' }
];

// ==============================
// ======== PAGE ================
// ==============================
export default function InteractiveTraining() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [modelUrl, setModelUrl] = useState(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [forceLock, setForceLock] = useState(false);
  const startTsRef = useRef(Date.now());

  const [nuts, setNuts] = useState({ total: 0, removed: 0, remaining: [] });

  const progress = useMemo(() => Math.round((completedIds.size / STEPS.length) * 100), [completedIds.size]);

  useEffect(() => {
    if (activeIndex === 0 && nuts.total > 0 && nuts.removed === nuts.total) {
      setCompletedIds(prev => new Set(prev).add(1));
    }
  }, [activeIndex, nuts]);

  const stepUnlocked = (idx) => {
    const id = STEPS[idx].id;
    if (id === 1) return true;
    if (id === 2) return completedIds.has(1);
    return true;
  };

  const resetModule = () => {
    setCompletedIds(new Set());
    setActiveIndex(0);
    setNuts({ total: 0, removed: 0, remaining: [] });
    startTsRef.current = Date.now();
    setForceLock(false);
  };

  const onFinish = () => {
    const timeSeconds = Math.max(1, Math.round((Date.now() - startTsRef.current) / 1000));
    alert(`Module complete.\nTime: ${timeSeconds}s`);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', background: '#000' }}>
      {/* ===== Viewer ===== */}
      <div style={{ position: 'absolute', inset: 0, right: 380, borderRight: '2px solid #6a7257' }}>
        <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 10, display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowLibrary(true)}
            style={{ padding: '6px 10px', background: '#6a7257', color: 'black', borderRadius: 4, border: '1px solid #6a7257', fontWeight: 800, cursor: 'pointer' }}
          >
            Add From Library
          </button>
          <button
            onClick={() => setForceLock(v => !v)}
            style={{ padding: '6px 10px', background: 'black', color: 'white', borderRadius: 4, border: '1px solid #555', cursor: 'pointer' }}
          >
            {forceLock ? 'Unlock View' : 'Lock View'}
          </button>
        </div>

        <TrainingViewer
          style={{ height: '100%' }}
          modelUrl={modelUrl}
          stepActive={activeIndex === 0}
          forceLock={forceLock}
          rotAxis="z"
          liftAxis="y"
          allowedNames={[
            'Heavy Hex Nuts 2H-33',
            'Heavy Hex Nuts 2H-34',
            'Heavy Hex Nuts 2H-35',
            'Heavy Hex Nuts 2H-36',
            'Heavy Hex Nuts 2H-37',
            'Heavy Hex Nuts 2H-38',
            'Heavy Hex Nuts 2H-39',
            'Heavy Hex Nuts 2H-40'
          ]}
          onReady={({ targetNodes }) => {
            const names = targetNodes.map(o => o.name);
            setNuts({ total: names.length, removed: 0, remaining: names });
          }}
          onProgress={({ removedName }) => {
            setNuts(s => {
              if (!s.remaining.includes(removedName)) return s;
              const remaining = s.remaining.filter(n => n !== removedName);
              return { total: s.total, removed: s.total - remaining.length, remaining };
            });
          }}
        />
      </div>

      {/* ===== HUD ===== */}
      <aside style={{ position: 'absolute', top: 0, right: 0, width: 380, height: '100%', background: 'linear-gradient(180deg, rgba(19,19,19,0.95), rgba(0,0,0,0.95))', color: '#fff', borderLeft: '2px solid #6a7257', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 14, borderBottom: '1px solid rgba(106,114,87,0.5)' }}>
          <div style={{ fontFamily: 'erbaum, sans-serif', textTransform: 'uppercase', fontWeight: 800, fontSize: 18 }}>Interactive Training</div>
          <div style={{ opacity: 0.8, fontSize: 12 }}>Model: {modelUrl ? modelUrl.split('/').pop() : 'No model selected'}</div>
          <div style={{ marginTop: 10 }}>
            <div style={{ height: 10, background: '#1a1a1a', border: '1px solid #444', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: '#6a7257', transition: 'width 240ms ease' }} />
            </div>
            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.9 }}>{progress}% Complete</div>
          </div>
        </div>

        <div style={{ padding: 12, borderBottom: '1px solid rgba(106,114,87,0.35)', display: 'grid', gap: 6, maxHeight: 230, overflowY: 'auto' }}>
          {STEPS.map((s, idx) => {
            const isActive = idx === activeIndex;
            const isDone = completedIds.has(s.id);
            const unlocked = stepUnlocked(idx);
            return (
              <button
                key={s.id}
                onClick={() => unlocked && setActiveIndex(idx)}
                disabled={!unlocked}
                style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 8, border: '1px solid #2c2c2c', background: isActive ? 'rgba(106,114,87,0.15)' : 'rgba(255,255,255,0.04)', outline: isActive ? '1px solid #6a7257' : 'none', cursor: unlocked ? 'pointer' : 'not-allowed', opacity: unlocked ? 1 : 0.45 }}
              >
                <div style={{ fontSize: 12, opacity: 0.75 }}>Step {idx + 1}</div>
                <div style={{ fontWeight: 800, textTransform: 'uppercase' }}>{s.title}</div>
                <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>{isDone ? 'Completed' : unlocked ? 'Pending' : 'Locked'}</div>
              </button>
            );
          })}
        </div>

        <div style={{ padding: 14, flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: 12, opacity: 0.75 }}>Current Step</div>
          <div style={{ fontSize: 18, fontWeight: 800, textTransform: 'uppercase' }}>{STEPS[activeIndex]?.title}</div>
          <div style={{ marginTop: 8, lineHeight: 1.4, fontSize: 14 }}>{STEPS[activeIndex]?.instruction}</div>

          {STEPS[activeIndex]?.id === 1 && (
            <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 8, background: 'rgba(106,114,87,0.08)', border: '1px solid rgba(106,114,87,0.35)', fontSize: 12 }}>
              <div style={{ fontWeight: 800, marginBottom: 8, textTransform: 'uppercase' }}>Nuts Removed: {nuts.removed}/{nuts.total}</div>
              <div style={{ display: 'grid', gap: 6, maxHeight: 120, overflowY: 'auto' }}>
                {nuts.remaining.map(n => (<div key={n} style={{ opacity: 0.85 }}>{n}</div>))}
                {nuts.remaining.length === 0 && <div style={{ opacity: 0.85 }}>All nuts removed.</div>}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: 12, borderTop: '1px solid rgba(106,114,87,0.35)', display: 'flex', gap: 8 }}>
          <button onClick={resetModule} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #444', background: 'black', color: 'white', cursor: 'pointer' }}>Reset</button>
          <button onClick={onFinish} disabled={completedIds.size !== STEPS.length} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #6a7257', background: completedIds.size === STEPS.length ? '#6a7257' : 'rgba(106,114,87,0.3)', color: 'black', fontWeight: 800, cursor: completedIds.size === STEPS.length ? 'pointer' : 'not-allowed' }}>Finish</button>
        </div>
      </aside>

      <GlbLibraryModal
        open={showLibrary}
        onClose={() => setShowLibrary(false)}
        onSelect={(item) => {
          const newUrl = item?.storage_url || '';
          if (!newUrl) return;
          setShowLibrary(false);
          setModelUrl(newUrl);
          setNuts({ total: 0, removed: 0, remaining: [] });
          setCompletedIds(new Set());
          setActiveIndex(0);
          setForceLock(false);
        }}
      />
    </div>
  );
}
