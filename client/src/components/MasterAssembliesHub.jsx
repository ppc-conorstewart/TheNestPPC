// ==========================================================
// src/pages/MasterAssembliesHub.jsx
// Master Assemblies Hub — URL-Driven Selection (No Twitch)
// ==========================================================
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API } from '../api';
import AssembliesNav from '../components/Master Assembly Components/AssembliesNav';
import MasterAssetVisualPanel from '../components/Master Assembly Components/MasterAssetVisualPanel';
import { showPalomaToast } from '../utils/toastUtils';
import { getStoredDiscordName } from '../utils/currentUser';

// =================== Assemblies Catalog ===================
const ASSEMBLIES = [
  { id: 'dog-bones',   title: 'Dog Bones',    children: ['Dogbone-A','Dogbone-B','Dogbone-C','Dogbone-D','Dogbone-E','Dogbone-F'] },
  { id: 'zippers',     title: 'Zippers',      children: ['Zipper - A','Zipper - B','Zipper - C','Zipper - D','Zipper - E','Zipper - F'] },
  { id: 'flowcrosses', title: 'Flow Crosses', children: ['Flowcross-A','Flowcross-B','Flowcross-C','Flowcross-D','Flowcross-E','Flowcross-F'] },
  { id: 'coil-trees',  title: 'Coil Trees',   children: ['CoilTree-A','CoilTree-B','CoilTree-C','CoilTree-D','CoilTree-E','CoilTree-F'] },
  { id: 'missiles',    title: 'Missiles',     children: ['Missile-1 (Double Barrel)','Missile-2','Missile-3','Missile-4'] },
];

// =================== Helpers ===================
const buildKeysForFamily = (family) => {
  const base =
    family === 'dog-bones' ? 'Dogbone' :
    family === 'zippers' ? 'Zipper' :
    family === 'flowcrosses' ? 'Flowcross' :
    family === 'coil-trees' ? 'CoilTree' : '';
  const out = [];
  'ABCDEF'.split('').forEach((ch) => out.push(base + '-' + ch));
  const max = family === 'coil-trees' ? 20 : 40;
  for (let i = 1; i <= max; i++) out.push(base + '-' + i);
  return out;
};
function nextLetter(children = []) {
  const letters = children.map(function (c) { const m = /-\s*([A-Z])\b/i.exec(c); return m ? m[1].toUpperCase() : null; }).filter(Boolean);
  if (!letters.length) return 'A';
  const max = letters.reduce(function (m, ch) { return Math.max(m, ch.charCodeAt(0)); }, 'A'.charCodeAt(0));
  return String.fromCharCode(max + 1);
}
function nextMissileNumber(children = []) {
  const nums = children.map(function (c) { const m = /^Missile-(\d+)/i.exec(String(c).trim()); return m ? parseInt(m[1], 10) : null; }).filter(function (n) { return Number.isFinite(n); });
  const max = nums.length ? Math.max.apply(null, nums) : 0;
  return max + 1;
}
const numericLabelMap = {
  'Dog Bones':   function (i) { return 'Dogbone-' + i; },
  'Zippers':     function (i) { return 'Zipper-' + i; },
  'Flow Crosses':function (i) { return 'Flowcross-' + i; },
  'Coil Trees':  function (i) { return 'CoilTree-' + i; },
};

// =================== Component ===================
export default function MasterAssembliesHub({ historyOpen = false, setHistoryOpen = () => {} }) {
  // ----- URL is the single source of truth -----
  const [searchParams, setSearchParams] = useSearchParams();

  // ----- App data/state (not selection) -----
  const [assemblies, setAssemblies] = useState(ASSEMBLIES);
  const [openDropdowns, setOpenDropdowns] = useState({ 'dog-bones': true, 'zippers': true });
  const [showOnlyAssigned, setShowOnlyAssigned] = useState(false);

  const [historyLog, setHistoryLog] = useState([]);
  const [assets, setAssets] = useState({});
  const [assetOptions, setAssetOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [preAssignedByAssembly, setPreAssignedByAssembly] = useState({});
  const [updateStatus, setUpdateStatus] = useState('idle');
  const currentUserName = useMemo(() => getStoredDiscordName(), []);

  // =================== Derived: selection from URL ===================
  const assemblyParam = searchParams.get('assembly') || 'Dog Bones';
  const childParam = searchParams.get('child') || null;

  const selectedAssembly = useMemo(
    function () { return assemblies.find(function (a) { return a.title === assemblyParam; }) || assemblies[0]; },
    [assemblies, assemblyParam]
  );
  const selectedChild = childParam;

  // =================== Data Loads ===================
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingOptions(true);
      try {
        const res = await fetch(API + '/api/assets', { credentials: 'include' });
        const data = res.ok ? await res.json() : [];
        if (!alive) return;
        const opts = (Array.isArray(data) ? data : []).map(function (a) {
          const id = a && (a.ppc || a.ppc_no || a.ppc_number || a.PPC || a.asset_id || a.id || '');
          const name = a && (a.name || a.asset_name || a.description || a.display_name || id || 'Unnamed');
          return { id: String(id).trim(), name: String(name).trim() };
        }).filter(function (o) { return o.id; });
        setAssetOptions(opts);
      } catch {} finally { if (alive) setLoadingOptions(false); }
    })();
    return function () { alive = false; };
  }, []);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(API + '/api/master/history', { credentials: 'include' });
        if (!res.ok) return;
        setHistoryLog(await res.json());
      } catch {}
    })();
  }, []);
  const fetchPreAssigned = useCallback(async (assemblyTitle) => {
    try {
      const res = await fetch(API + '/api/master/summary/' + encodeURIComponent(assemblyTitle), { credentials: 'include' });
      if (!res.ok) return;
      const rows = await res.json();
      const set = new Set(
        (rows || [])
          .filter(function (r) {
            const isActive = typeof r.active === 'boolean' ? r.active : (String(r.status || '').toLowerCase() === 'active');
            return isActive && Number(r.assigned_count) > 0;
          })
          .map(function (r) { return String(r.child); })
      );
      setPreAssignedByAssembly(function (prev) { return Object.assign({}, prev, (function(){ const o={}; o[assemblyTitle]=set; return o; })()); });
    } catch {}
  }, []);
  useEffect(() => { ['Dog Bones','Zippers','Flow Crosses','Coil Trees'].forEach(function (t) { fetchPreAssigned(t); }); }, [fetchPreAssigned]);

  // =================== URL Writers ===================
  const writeUrl = useCallback((assemblyTitle, child) => {
    const next = new URLSearchParams(searchParams);
    let changed = false;
    if ((next.get('tab') || '').toLowerCase() !== 'assemblies') { next.set('tab', 'assemblies'); changed = true; }
    if (assemblyTitle && next.get('assembly') !== assemblyTitle) { next.set('assembly', assemblyTitle); changed = true; }
    if (child === null) { if (next.has('child')) { next.delete('child'); changed = true; } }
    else if (child && next.get('child') !== child) { next.set('child', child); changed = true; }
    if (changed) setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleSelectAssembly = useCallback((asm) => {
    const title = (asm && asm.title) || 'Dog Bones';
    writeUrl(title, null);
  }, [writeUrl]);

  const handleSelectChild = useCallback((asm, child) => {
    const title = (asm && asm.title) || 'Dog Bones';
    writeUrl(title, child);
  }, [writeUrl]);

  const addAssemblyChild = (groupId) => {
    const group = assemblies.find(function (a) { return a.id === groupId; });
    if (!group) return;
    const prefix =
      groupId === 'dog-bones' ? 'Dogbone-' :
      groupId === 'zippers' ? 'Zipper - ' :
      groupId === 'flowcrosses' ? 'Flowcross-' :
      groupId === 'coil-trees' ? 'CoilTree-' : '';
    const letter = nextLetter(group.children);
    const newChild = prefix + letter;
    setAssemblies(function (prev) { return prev.map(function (a) { return a.id === groupId ? Object.assign({}, a, { children: a.children.concat([newChild]) }) : a; }); });
    setOpenDropdowns(function (prev) { const n = Object.assign({}, prev); n[groupId] = true; return n; });
    writeUrl(group.title, newChild);
  };
  const addMissile = () => {
    const groupId = 'missiles';
    const group = assemblies.find(function (a) { return a.id === groupId; });
    if (!group) return;
    const n = nextMissileNumber(group.children);
    const newChild = 'Missile-' + n;
    setAssemblies(function (prev) { return prev.map(function (a) { return a.id === groupId ? Object.assign({}, a, { children: a.children.concat([newChild]) }) : a; }); });
    setOpenDropdowns(function (prev) { const n = Object.assign({}, prev); n[groupId] = true; return n; });
    writeUrl(group.title, newChild);
  };

  // =================== Assigned Map ===================
  const assignedMap = useMemo(() => {
    const map = {};
    const keys = Object.keys(assets || {});
    const families = ['dog-bones', 'zippers', 'flowcrosses', 'coil-trees'];
    families.forEach(function (fam) {
      buildKeysForFamily(fam).forEach(function (child) {
        const prefix = child + '-';
        const locallyAssigned = keys.some(function (k) { return k.startsWith(prefix) && assets[k]; });
        const assemblyTitle =
          fam === 'dog-bones' ? 'Dog Bones' :
          fam === 'zippers' ? 'Zippers' :
          fam === 'flowcrosses' ? 'Flow Crosses' :
          'Coil Trees';
        const preSet = preAssignedByAssembly[assemblyTitle] || new Set();
        map[child] = locallyAssigned || preSet.has(child);
      });
    });
    return map;
  }, [assets, preAssignedByAssembly]);

  // =================== Activity & Updates ===================
  const addHistoryEntry = useCallback(async (entry) => {
    try {
      await fetch(API + '/api/master/history', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...entry, user: entry?.user || currentUserName }),
      });
    } catch {}
  }, [currentUserName]);
  const fetchMasterHistory = useCallback(async () => {
    try {
      const res = await fetch(API + '/api/master/history', { credentials: 'include' });
      if (res.ok) setHistoryLog(await res.json());
    } catch {}
  }, []);
  const handleAssetsUpdated = async (entries = []) => {
    if (!Array.isArray(entries) || entries.length === 0) return;
    const added = []; const cleared = [];
    try {
      for (const entry of entries) {
        const display = (entry && (entry.assetName || entry.assetId)) || 'Unknown';
        const action = (entry && entry.action ? String(entry.action) : '').toLowerCase();
        if (action.indexOf('add') > -1) added.push(display);
        if (action.indexOf('remove') > -1 || action.indexOf('clear') > -1) cleared.push(display);
        await addHistoryEntry({
          time: (entry && entry.time) || new Date(),
          action: entry.action,
          slot: entry.slot,
          asset_id: entry.assetId,
          asset_name: entry.assetName,
          user: entry.user || currentUserName,
        });
      }
      await fetchMasterHistory();
      const masterLabel = selectedChild || 'Master Assembly';
      if (added.length) showPalomaToast({ type: 'success', message: 'Successfully added', detail: added.join(', ') + ' to Master (' + masterLabel + ')' });
      if (cleared.length) showPalomaToast({ type: 'success', message: 'Successfully cleared', detail: cleared.join(', ') + ' from Master (' + masterLabel + ')' });
      setUpdateStatus('success'); setTimeout(function () { setUpdateStatus('idle'); }, 2000);
      if (selectedAssembly && selectedAssembly.title) await fetchPreAssigned(selectedAssembly.title);
    } catch {
      showPalomaToast({ type: 'error', message: 'Update failed', detail: 'Please try again.' });
      setUpdateStatus('error'); setTimeout(function () { setUpdateStatus('idle'); }, 2000);
    }
  };

  // =================== Header ===================
  const headerSubtitle = useMemo(() => {
    if (!selectedChild) return (selectedAssembly && selectedAssembly.title ? selectedAssembly.title : '') + ' › Select a Master Assembly';
    return (selectedAssembly && selectedAssembly.title ? selectedAssembly.title : '') + ' › ' + (selectedChild || '');
  }, [selectedAssembly, selectedChild]);

  // =================== Layout ===================
  return (
    <div
      className="w-full h-full"
      style={{
        display: 'grid',
        gridTemplateColumns: '580px minmax(0,1fr)',
        height: '100%',
        background: '#0d0e0c'
      }}
    >
      <div
        style={{
          background: '#000',
          width: 580,
          borderRight: '2px solid #23251d',
          padding: 8,
          overflowY: 'auto'
        }}
      >
        <div
          style={{
            fontFamily: 'Rajdhani, Bank Gothic, Arial Black, sans-serif',
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: '.12em',
            color: '#1aff0084',
            textAlign: 'center',
            textTransform: 'uppercase',
            marginBottom: 6
          }}
        >
          {headerSubtitle}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginBottom: 8 }}>
          <label style={{ color: '#b0b79f', fontSize: 12, fontWeight: 800, letterSpacing: '.06em' }}>
            <input
              type="checkbox"
              checked={showOnlyAssigned}
              onChange={(e) => setShowOnlyAssigned(e.target.checked)}
              style={{ marginRight: 6 }}
            />
            Show only assigned
          </label>
        </div>

        <AssembliesNav
          assemblies={assemblies}
          selectedAssembly={selectedAssembly}
          selectedChild={selectedChild}
          openDropdowns={openDropdowns}
          toggleDropdown={(id) => setOpenDropdowns(function (prev) { const n = Object.assign({}, prev); n[id] = !prev[id]; return n; })}
          handleSelectAssembly={handleSelectAssembly}
          handleSelectChild={handleSelectChild}
          onAddAssemblyChild={addAssemblyChild}
          onAddMissile={addMissile}
          assignedMap={assignedMap}
          showOnlyAssigned={showOnlyAssigned}
          fadeTooltip="No assets assigned yet."
          preAssignedSetByAssembly={preAssignedByAssembly}
        />
      </div>

      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <MasterAssetVisualPanel
            selectedAssembly={selectedAssembly}
            selectedChild={selectedChild}
            fullId={(selectedAssembly && selectedAssembly.title ? selectedAssembly.title : '') + '-' + (selectedChild || '')}
            historyLog={historyLog}
            setHistoryLog={setHistoryLog}
            onAssetsUpdated={handleAssetsUpdated}
            assetOptions={assetOptions}
            assetState={assets}
            setAssetState={setAssets}
            getAssetStateSetterFields={() => [assets, setAssets]}
            handleClearSlot={function (_id, slotKey, setAssetsFromPanel) {
              setAssetsFromPanel(function (prev) { const n = Object.assign({}, prev); delete n[slotKey]; return n; });
            }}
            qrModalOpen={false}
            setQrModalOpen={() => {}}
            qrAsset={null}
            assetFields={[]}
            updateStatus={updateStatus}
            historyOpen={historyOpen}
            setHistoryOpen={setHistoryOpen}
          />
        </div>
      </div>
    </div>
  );
}
