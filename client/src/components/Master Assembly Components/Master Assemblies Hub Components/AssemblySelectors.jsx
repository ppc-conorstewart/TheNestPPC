// ==============================
// src/components/Master Assembly Components/Master Assemblies Hub Components/AssemblySelectors.jsx
// Selector grid + optional gasket panel
// ==============================

import GasketUsagePanel from './GasketUsagePanel';
import SelectorGrid from './SelectorGrid';

export default function AssemblySelectors({
  isDogBones = false,
  selectedChild = '',
  groupings = [],
  getAssetStateSetterFields = null,
  assetOptions = [],
  hoverLabel = null,
  rowRefs = { current: {} },
  setClearTarget = () => {},
  setClearModalOpen = () => {},
  gasketState = {},
  setGasketState = () => {},
  hoverGasket = null
}) {
  if (isDogBones) {
    return (
      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 0.6fr', gap:4, padding:'12px' }}>
        <div>
          <SelectorGrid
            groupings={groupings}
            selectedChild={selectedChild}
            getAssetStateSetterFields={getAssetStateSetterFields}
            assetOptions={assetOptions}
            hoverLabel={hoverLabel}
            rowRefs={rowRefs}
            setClearTarget={setClearTarget}
            setClearModalOpen={setClearModalOpen}
          />
        </div>
        <div>
          <GasketUsagePanel
            gasketState={gasketState}
            setGasketState={setGasketState}
            hoverGasket={hoverGasket}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding:'12px' }}>
      <SelectorGrid
        groupings={groupings}
        selectedChild={selectedChild}
        getAssetStateSetterFields={getAssetStateSetterFields}
        assetOptions={assetOptions}
        hoverLabel={hoverLabel}
        rowRefs={rowRefs}
        setClearTarget={setClearTarget}
        setClearModalOpen={setClearModalOpen}
      />
    </div>
  );
}
