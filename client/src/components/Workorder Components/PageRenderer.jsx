// ==============================
// FILE: src/components/PageRenderer.jsx
// ==============================

import AssemblyPage from './AssemblyPage';
import BOMPage from './BOMPage';
import SiteMeasurementsPage from './SiteMeasurementsPage';
import WOInfoPage from './WOInfoPage';

export default function PageRenderer({
  index,
  pages,
  metadata,
  logoSrc,
  handleMetaChange,
  bomItemsState,
  consumables,
  padSpecs,

  // DFIT props
  dfitSelections, dfitBuildQtys, dfitActiveTab,
  setDfitBuildQtys, setDfitActiveTab, handleDFITChange,
  dfitTabConsumables, setDfitTabConsumables,
  dfitModelStates,
  dfitPanelSpecs,

  // UMA props
  umaSelections, umaBuildQtys, umaActiveTab,
  setUmaBuildQtys, setUmaActiveTab, handleUMAChange,
  umaTabConsumables, setUmaTabConsumables,
  umaModelStates,
  umaPanelSpecs,

  // FCA props
  fcaSelections, fcaBuildQtys, fcaActiveTab,
  setFcaBuildQtys, setFcaActiveTab, handleFCAChange,
  fcaTabConsumables, setFcaTabConsumables,
  fcaModelStates,
  fcaPanelSpecs,

  // SVA props
  svaSelections, svaBuildQtys, svaActiveTab,
  setSvaBuildQtys, setSvaActiveTab, handleSVAChange,
  svaTabConsumables, setSvaTabConsumables,
  svaModelStates,
  svaPanelSpecs,

  // Dogbones props
  dogbonesSelections, dogbonesBuildQtys, dogbonesActiveTab,
  setDogbonesBuildQtys, setDogbonesActiveTab, handleDogbonesChange,
  dogbonesTabConsumables, setDogbonesTabConsumables,
  dogbonesModelStates,
  dogbonesPanelSpecs,

  // Zippers props
  zippersSelections, zippersBuildQtys, zippersActiveTab,
  setZippersBuildQtys, setZippersActiveTab, handleZippersChange,
  zippersTabConsumables, setZippersTabConsumables,
  zippersModelStates,
  zippersPanelSpecs,

  // PPL props
  pplSelections, pplBuildQtys, pplActiveTab,
  setPplBuildQtys, setPplActiveTab, handlePplChange,
  pplTabConsumables, setPplTabConsumables,
  pplModelStates,
  pplPanelSpecs,

  // WOInfoPage SimpleViewer props
  woInfoModelUrl, setWoInfoModelUrl,
  woInfoModelLocked, setWoInfoModelLocked,
  woInfoModelLabels, setWoInfoModelLabels,

  assets,
  baseColors,
  addConsumable,
}) {
  const buildingBase = metadata?.buildingBase || '';

  const assemblyConfigs = [
    {
      pageTitle: 'DFIT ASSEMBLY',
      woPrefix: 'WO#01',
      selections: dfitSelections,
      buildQtys: dfitBuildQtys,
      activeTab: dfitActiveTab,
      setBuildQtys: setDfitBuildQtys,
      setActiveTab: setDfitActiveTab,
      handleChange: handleDFITChange,
      tabConsumables: dfitTabConsumables,
      setTabConsumables: setDfitTabConsumables,
      modelStates: dfitModelStates,
      panelSpecs: dfitPanelSpecs,
      addConsumable: (n, q) => addConsumable(n, q, 'DFIT', dfitActiveTab),
      assets, baseColors, buildingBase,
    },
    {
      pageTitle: 'UPPER MASTER ASSEMBLY',
      woPrefix: 'WO#02',
      selections: umaSelections,
      buildQtys: umaBuildQtys,
      activeTab: umaActiveTab,
      setBuildQtys: setUmaBuildQtys,
      setActiveTab: setUmaActiveTab,
      handleChange: handleUMAChange,
      tabConsumables: umaTabConsumables,
      setTabConsumables: setUmaTabConsumables,
      modelStates: umaModelStates,
      panelSpecs: umaPanelSpecs,
      addConsumable: (n, q) => addConsumable(n, q, 'UMA', umaActiveTab),
      assets, baseColors, buildingBase,
    },
    {
      pageTitle: 'FLOW CROSS ASSEMBLY',
      woPrefix: 'WO#03',
      selections: fcaSelections,
      buildQtys: fcaBuildQtys,
      activeTab: fcaActiveTab,
      setBuildQtys: setFcaBuildQtys,
      setActiveTab: setFcaActiveTab,
      handleChange: handleFCAChange,
      tabConsumables: fcaTabConsumables,
      setTabConsumables: setFcaTabConsumables,
      modelStates: fcaModelStates,
      panelSpecs: fcaPanelSpecs,
      addConsumable: (n, q) => addConsumable(n, q, 'FCA', fcaActiveTab),
      assets, baseColors, buildingBase,
    },
    {
      pageTitle: 'SWAB VALVE ASSEMBLY',
      woPrefix: 'WO#04',
      selections: svaSelections,
      buildQtys: svaBuildQtys,
      activeTab: svaActiveTab,
      setBuildQtys: setSvaBuildQtys,
      setActiveTab: setSvaActiveTab,
      handleChange: handleSVAChange,
      tabConsumables: svaTabConsumables,
      setTabConsumables: setSvaTabConsumables,
      modelStates: svaModelStates,
      panelSpecs: svaPanelSpecs,
      addConsumable: (n, q) => addConsumable(n, q, 'SVA', svaActiveTab),
      assets, baseColors, buildingBase,
    },
    {
      pageTitle: 'DOGBONES ASSEMBLY',
      woPrefix: 'WO#05',
      selections: dogbonesSelections,
      buildQtys: dogbonesBuildQtys,
      activeTab: dogbonesActiveTab,
      setBuildQtys: setDogbonesBuildQtys,
      setActiveTab: setDogbonesActiveTab,
      handleChange: handleDogbonesChange,
      tabConsumables: dogbonesTabConsumables,
      setTabConsumables: setDogbonesTabConsumables,
      modelStates: dogbonesModelStates,
      panelSpecs: dogbonesPanelSpecs,
      addConsumable: (n, q) => addConsumable(n, q, 'Dogbones', dogbonesActiveTab),
      assets, baseColors, buildingBase,
    },
    {
      pageTitle: 'ZIPPERS ASSEMBLY',
      woPrefix: 'WO#06',
      selections: zippersSelections,
      buildQtys: zippersBuildQtys,
      activeTab: zippersActiveTab,
      setBuildQtys: setZippersBuildQtys,
      setActiveTab: setZippersActiveTab,
      handleChange: handleZippersChange,
      tabConsumables: zippersTabConsumables,
      setTabConsumables: setZippersTabConsumables,
      modelStates: zippersModelStates,
      panelSpecs: zippersPanelSpecs,
      addConsumable: (n, q) => addConsumable(n, q, 'Zippers', zippersActiveTab),
      assets, baseColors, buildingBase,
    },
    {
      pageTitle: 'PPL ASSEMBLY',
      woPrefix: 'WO#07',
      selections: pplSelections,
      buildQtys: pplBuildQtys,
      activeTab: pplActiveTab,
      setBuildQtys: setPplBuildQtys,
      setActiveTab: setPplActiveTab,
      handleChange: handlePplChange,
      tabConsumables: pplTabConsumables,
      setTabConsumables: setPplTabConsumables,
      modelStates: pplModelStates,
      panelSpecs: pplPanelSpecs,
      addConsumable: (n, q) => addConsumable(n, q, 'PPL', pplActiveTab),
      assets, baseColors, buildingBase,
    },
  ];

  const assemblyStart = 3;
  const isAssembly = index >= assemblyStart && index < assemblyStart + assemblyConfigs.length;

  let PageComponent;
  switch (index) {
    case 0:
      PageComponent = (
        <WOInfoPage
          metadata={metadata}
          editModes={{}}
          toggleEdit={() => {}}
          handleChange={handleMetaChange}
          logoSrc={logoSrc}
          simpleModelUrl={woInfoModelUrl}
          onSimpleModelChange={setWoInfoModelUrl}
          simpleModelLocked={woInfoModelLocked}
          onSimpleModelLockedChange={setWoInfoModelLocked}
          simpleModelLabels={woInfoModelLabels}
          onSimpleModelLabelsChange={setWoInfoModelLabels}
        />
      );
      break;
    case 1:
      PageComponent = (
        <SiteMeasurementsPage
          measurements={metadata.siteMeasurements || {}}
          onChange={(field, value) => handleMetaChange('siteMeasurements', { 
            ...(metadata.siteMeasurements || {}), 
            [field]: value 
          })}
        />
      );
      break;
    case 2:
      PageComponent = (
        <BOMPage
          dfitSelections={dfitSelections}
          dfitBuildQtys={dfitBuildQtys}
          umaSelections={umaSelections}
          umaBuildQtys={umaBuildQtys}
          fcaSelections={fcaSelections}
          fcaBuildQtys={fcaBuildQtys}
          svaSelections={svaSelections}
          svaBuildQtys={svaBuildQtys}
          dogbonesSelections={dogbonesSelections}
          dogbonesBuildQtys={dogbonesBuildQtys}
          zippersSelections={zippersSelections}
          zippersBuildQtys={zippersBuildQtys}
          pplSelections={pplSelections}
          pplBuildQtys={pplBuildQtys}
          consumables={consumables}
          padSpecs={padSpecs}
        />
      );
      break;
    default:
      if (isAssembly) {
        const cfgIndex = index - assemblyStart;
        const config = assemblyConfigs[cfgIndex];
        const priorConfigs = assemblyConfigs.slice(0, cfgIndex);

        const modelState = config.modelStates[config.activeTab] || {};
        const specs = config.panelSpecs[config.activeTab] || {};

        PageComponent = (
          <AssemblyPage
            title={config.pageTitle}
            woNumber={config.woPrefix}
            selections={config.selections[config.activeTab]}
            allSelections={config.selections}
            buildQtys={config.buildQtys}
            setBuildQtys={config.setBuildQtys}
            activeTab={config.activeTab}
            setActiveTab={config.setActiveTab}
            handleChange={config.handleChange}
            baseColors={config.baseColors}
            addConsumable={config.addConsumable}
            savedItems={config.tabConsumables[config.activeTab]}
            setSavedItems={items =>
              config.setTabConsumables(prev =>
                prev.map((arr, i) => (i === config.activeTab ? items : arr))
              )
            }
            assets={config.assets}
            modelUrl={modelState.modelUrl}
            setModelUrl={modelState.setModelUrl}
            locked={modelState.locked}
            setLocked={modelState.setLocked}
            labels={modelState.labels}
            setLabels={modelState.setLabels}
            specs={specs}
            buildingBase={config.buildingBase}
            priorSelectionsList={priorConfigs.map(p => p.selections)}
            priorBuildQtysList={priorConfigs.map(p => p.buildQtys)}
          />
        );
      } else {
        PageComponent = (
          <div className="p-4 text-center text-gray-400">
            No content for "{pages[index]?.title}"
          </div>
        );
      }
      break;
  }

  return (
    <div className="flex h-full">
      <div className="w-full overflow-auto">
        {PageComponent}
      </div>
    </div>
  );
}
