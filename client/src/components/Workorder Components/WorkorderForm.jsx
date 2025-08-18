// src/components/WorkorderForm.jsx

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:3001';
import useAssets from '../../hooks/useAssets';
import WorkorderModal from './WorkorderModal';
import PageRenderer from './PageRenderer';
import AlertsModal from './AlertsModal';
import { sections as sectionConfigs } from '../../constants/workorderConfig';
import { useWorkorderSection } from '../../hooks/useWorkorderSection';
import { useUser } from '../../hooks/useUser';
import useAssemblyModel from '../../hooks/useAssemblyModel';
import assetSpecs from '../../data/AssetSpecifications.json';
import torqueSpecs from '../../data/TorqueSpecs.js';

// Helper to ensure all props passed down are arrays
const asArray = x => Array.isArray(x) ? x : x ? [x] : [];

// Helper: convert fractions to decimals, e.g. 5-1/8 → 5.125
function fractionToDecimal(str) {
  const match = str.match(/^(\d+)-(\d+)\/(\d+)$/);
  if (match) {
    const [ , whole, num, den ] = match;
    return (parseInt(whole, 10) + parseInt(num, 10)/parseInt(den, 10)).toFixed(3);
  }
  return str;
}

// Universal normalization: remove quotes, collapse spaces, convert fractions to decimals, lowercase
function normalizeUniversal(name) {
  if (!name) return '';
  return name
    .replace(/"/g, '')      // Remove double quotes
    .replace(/'/g, '')      // Remove single quotes
    .replace(/\s*\|\s*/g, '|') // Collapse spaces around pipe
    .replace(/(\d+-\d+\/\d+)/g, (m) => fractionToDecimal(m)) // Convert fractions
    .replace(/\s+/g, ' ')   // Collapse spaces
    .toLowerCase()
    .trim();
}

// Extract possible size/pressure keys for TorqueSpecs.js lookup
function extractSizePressure(name) {
  // Try to extract things like 5-1/8 15K or 5.125 15K or just 5.125K
  // Returns e.g. ["5-1/8 15K", "5.125 15K"]
  const frac = name.match(/(\d+-\d+\/\d+)\s*"?\s*(\d{2,})K/i);
  if (frac) {
    const decimal = fractionToDecimal(frac[1]);
    return [ `${frac[1]} ${frac[2]}K`, `${decimal} ${frac[2]}K` ];
  }
  const dec = name.match(/(\d+\.\d+)\s*"?\s*(\d{2,})K/i);
  if (dec) {
    return [ `${dec[1]} ${dec[2]}K` ];
  }
  return [];
}

// Compute panel specs for a tab (selected assets, assets list)
function computeSpecs(selectedAssets, assets, assetSpecs) {
  let totalWeight = 0;
  let totalVolume = 0;
  let totalOAL = 0;
  let torqueSpecsArr = [];

  selectedAssets.forEach(name => {
    let spec = assetSpecs[name];
    if (!spec) {
      const normalizedRaw = normalizeUniversal(name);
      const matchKey = Object.keys(assetSpecs).find(
        k => normalizeUniversal(k) === normalizedRaw
      );
      spec = matchKey && assetSpecs[matchKey];
    }
    if (spec) {
      totalWeight += Number(spec.weight) || 0;
      totalVolume += Number(spec.fillVolume) || 0;
      totalOAL += Number(spec.OAL) || 0;
      if (Array.isArray(spec.torqueSpecs)) {
        torqueSpecsArr = torqueSpecsArr.concat(spec.torqueSpecs);
      }
    }

    // TorqueSpecs.js mapping logic
    const possibleKeys = extractSizePressure(name);
    possibleKeys.forEach(szp => {
      if (szp && torqueSpecs[szp]) {
        const t = torqueSpecs[szp];
        torqueSpecsArr.push({
          connection: szp,
          torque: t.maxFtLbs,
          ringGasket: t.ringGasket,
          numBolts: t.numBolts,
          stud: t.stud,
          wrench: t.wrench,
        });
      }
    });
  });

  // --- Deduplicate torque specs by connection+torque ---
  const seen = new Set();
  const uniqueTorqueSpecs = [];
  torqueSpecsArr.forEach(t => {
    const key = t.connection + '_' + t.torque;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueTorqueSpecs.push(t);
    }
  });

  return {
    totalWeight: totalWeight * 2.20462,
    totalVolume,
    totalOAL,
    torqueSpecsArr: uniqueTorqueSpecs,
  };
}

export default function WorkorderForm({ initialData, onClose }) {
  // --- Corrected pages array: ---
  // Site Measurements is now page/dot 2 (index 1)
  const pages = [
    { title: "Customer Info" },        // 0
    { title: "Site Measurements" },    // 1 (page 2 in UI)
    { title: "Bill of Materials" },    // 2 (page 3 in UI)
    { title: "DFIT Assembly" },        // 3
    { title: "Upper Master Assembly" },// 4
    { title: "Flow Cross Assembly" },  // 5
    { title: "Swab Valve Assembly" },  // 6
    { title: "Dogbones Assembly" },    // 7
    { title: "Zippers Assembly" },     // 8
    { title: "PPL Assembly" },         // 9
  ];

  const {
    logoUrl,
    customer,
    surfaceLSD,
    numberOfWells,
    rigInDate,
    wellBankType,
    workbookRevision,
    buildingBase,
    notes,
    specWeight = 0,
    specFillVolume = 0,
    specAssemblyOAL = 0,
  } = initialData;

  const { assets } = useAssets();
  const storageKey = `workorder_${customer.replace(/\s+/g, '-')}_${surfaceLSD}`;
  const { user } = useUser();
  const userId = user?.id || 'GUEST';
  // Get id from any possible location, fallback to null
  const [localWorkorderId, setLocalWorkorderId] = useState(
    initialData.id || initialData.ID || initialData.jobId || null
  );
  const workorderId = localWorkorderId;

  if (!workorderId) {
    console.warn('WorkorderForm: No valid workorderId found in initialData:', initialData);
  }

  const [metadata, setMetadata] = useState({
    customer,
    surfaceLSD,
    numberOfWells,
    rigInDate,
    wellBankType,
    workbookRevision,
    buildingBase: buildingBase || '',
    notes: notes || '',
  });

  // --- Section hooks ---
  const [dfitCfg, umaCfg, fcaCfg, svaCfg, dogbonesCfg, zippersCfg, pplCfg] = sectionConfigs;
  const dfit = useWorkorderSection(dfitCfg);
  const uma = useWorkorderSection(umaCfg);
  const fca = useWorkorderSection(fcaCfg);
  const sva = useWorkorderSection(svaCfg);
  const dogbones = useWorkorderSection(dogbonesCfg);
  const zippers = useWorkorderSection(zippersCfg);
  const ppl = useWorkorderSection(pplCfg);

  // ---- Model/Image State per Assembly/Tab ----
  const tabCount = cfg => Array.isArray(cfg.tabs) ? cfg.tabs.length : 2;
  const dfitModels = Array.from({ length: tabCount(dfitCfg) }, (_, i) => useAssemblyModel());
  const umaModels = Array.from({ length: tabCount(umaCfg) }, (_, i) => useAssemblyModel());
  const fcaModels = Array.from({ length: tabCount(fcaCfg) }, (_, i) => useAssemblyModel());
  const svaModels = Array.from({ length: tabCount(svaCfg) }, (_, i) => useAssemblyModel());
  const dogbonesModels = Array.from({ length: tabCount(dogbonesCfg) }, (_, i) => useAssemblyModel());
  const zippersModels = Array.from({ length: tabCount(zippersCfg) }, (_, i) => useAssemblyModel());
  const pplModels = Array.from({ length: tabCount(pplCfg) }, (_, i) => useAssemblyModel());

  // All model arrays for easy mapping
  const assemblies = [
    { key: 'dfit', section: dfit, models: dfitModels },
    { key: 'uma', section: uma, models: umaModels },
    { key: 'fca', section: fca, models: fcaModels },
    { key: 'sva', section: sva, models: svaModels },
    { key: 'dogbones', section: dogbones, models: dogbonesModels },
    { key: 'zippers', section: zippers, models: zippersModels },
    { key: 'ppl', section: ppl, models: pplModels },
  ];

  // --- WOInfoPage SimpleViewer (pad layout) state ---
  const [woInfoModelUrl, setWoInfoModelUrl] = useState(null);
  const [woInfoModelLocked, setWoInfoModelLocked] = useState(false);
  const [woInfoModelLabels, setWoInfoModelLabels] = useState([]);

  const [bomItems, setBomItems] = useState([]);
  const [consumables, setConsumables] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [showAlerts, setShowAlerts] = useState(false);

  // --- Panel Specs per assembly/tab for AssemblyPage ---
  const dfitPanelSpecs = useMemo(
    () =>
      asArray(dfit.selections).map(selObj => {
        const assetNames = Object.values(selObj).filter(Boolean);
        return computeSpecs(assetNames, assets, assetSpecs);
      }),
    [dfit.selections, assets]
  );
  const umaPanelSpecs = useMemo(
    () =>
      asArray(uma.selections).map(selObj => {
        const assetNames = Object.values(selObj).filter(Boolean);
        return computeSpecs(assetNames, assets, assetSpecs);
      }),
    [uma.selections, assets]
  );
  const fcaPanelSpecs = useMemo(
    () =>
      asArray(fca.selections).map(selObj => {
        const assetNames = Object.values(selObj).filter(Boolean);
        return computeSpecs(assetNames, assets, assetSpecs);
      }),
    [fca.selections, assets]
  );
  const svaPanelSpecs = useMemo(
    () =>
      asArray(sva.selections).map(selObj => {
        const assetNames = Object.values(selObj).filter(Boolean);
        return computeSpecs(assetNames, assets, assetSpecs);
      }),
    [sva.selections, assets]
  );
  const dogbonesPanelSpecs = useMemo(
    () =>
      asArray(dogbones.selections).map(selObj => {
        const assetNames = Object.values(selObj).filter(Boolean);
        return computeSpecs(assetNames, assets, assetSpecs);
      }),
    [dogbones.selections, assets]
  );
  const zippersPanelSpecs = useMemo(
    () =>
      asArray(zippers.selections).map(selObj => {
        const assetNames = Object.values(selObj).filter(Boolean);
        return computeSpecs(assetNames, assets, assetSpecs);
      }),
    [zippers.selections, assets]
  );
  const pplPanelSpecs = useMemo(
    () =>
      asArray(ppl.selections).map(selObj => {
        const assetNames = Object.values(selObj).filter(Boolean);
        return computeSpecs(assetNames, assets, assetSpecs);
      }),
    [ppl.selections, assets]
  );

  // ---- Draft Loader: Now loads/saves models per assembly/tab ----
  useEffect(() => {
    async function loadDraft() {
      try {
        const res = await axios.get('/api/drafts', { params: { user_id: userId, page_key: storageKey } });
        const saved = res.data.payload;
        setMetadata(saved.metadata || metadata);
        setPageIndex(saved.pageIndex ?? pageIndex);

        // Section values
        saved.sections && Object.entries(saved.sections).forEach(([key, s]) => {
          const lookup = { dfit, uma, fca, sva, dogbones, zippers, ppl };
          const sec = lookup[key];
          if (!sec) return;
          s.buildQtys && sec.setBuildQtys(s.buildQtys);
          s.activeTab != null && sec.setActiveTab(s.activeTab);
          s.tabConsumables && sec.setTabConsumables(s.tabConsumables);
          s.selections && sec.setSelections(s.selections);
        });

        // Per assembly/tab model state
        if (saved.assemblyModels) {
          assemblies.forEach(({ key, models }) => {
            const arr = saved.assemblyModels[key] || [];
            models.forEach((m, idx) => {
              const mObj = arr[idx] || {};
              m.setModelUrl(mObj.modelUrl || null);
              m.setLocked(mObj.locked || false);
              m.setLabels(mObj.labels || []);
            });
          });
        }

        // --- Load WOInfoPage SimpleViewer state ---
        setWoInfoModelUrl(saved.woInfoModelUrl || null);
        setWoInfoModelLocked(saved.woInfoModelLocked || false);
        setWoInfoModelLabels(saved.woInfoModelLabels || []);

        setConsumables(saved.consumables || consumables);
      } catch {
        // ignore
      }
    }
    loadDraft();
    // eslint-disable-next-line
  }, [storageKey]);

  // ---- Update BOM Items ----
  useEffect(() => {
    const items = [];
    const collect = (sels, bqs) => {
      asArray(sels).forEach((sel, ti) => {
        const mult = asArray(bqs)[ti] || 1;
        Object.values(sel)
          .filter(v => v)
          .forEach(desc => {
            const found = items.find(i => i.description === desc);
            if (found) found.quantity += mult;
            else items.push({ description: desc, quantity: mult });
          });
      });
    };
    [dfit, uma, fca, sva, dogbones, zippers, ppl].forEach(sec =>
      collect(sec.selections, sec.buildQtys)
    );
    setBomItems(items);
  }, [
    dfit.selections, dfit.buildQtys,
    uma.selections, uma.buildQtys,
    fca.selections, fca.buildQtys,
    sva.selections, sva.buildQtys,
    dogbones.selections, dogbones.buildQtys,
    zippers.selections, zippers.buildQtys,
    ppl.selections, ppl.buildQtys,
  ]);

  // ---- NEW: Aggregate Pad Specs for BOMPage ----
  const [padSpecs, setPadSpecs] = useState({
    totalFillVolume: 0,
    fullPadOAL: 0,
    spoolingOAL: 0,
    fullTruckingWeight: 0,
  });

  useEffect(() => {
    const num = x => Number(x) || 0;
    let totalFillVolume = 0;
    let fullPadOAL = 0;
    let spoolingOAL = 0;
    let fullTruckingWeight = 0;

    const sections = [
      { sec: dfit,      buildQtys: asArray(dfit.buildQtys) },
      { sec: uma,       buildQtys: asArray(uma.buildQtys) },
      { sec: fca,       buildQtys: asArray(fca.buildQtys) },
      { sec: sva,       buildQtys: asArray(sva.buildQtys) },
      { sec: dogbones,  buildQtys: asArray(dogbones.buildQtys) },
      { sec: zippers,   buildQtys: asArray(zippers.buildQtys) },
      { sec: ppl,       buildQtys: asArray(ppl.buildQtys) },
    ];

    for (const { sec, buildQtys } of sections) {
      // Section specs may be sec.specs or sec.panelSpecs; support both for future-proofing
      const specsArr = asArray(sec.specs || sec.panelSpecs || []);
      asArray(sec.selections).forEach((sel, tabIdx) => {
        const bq = num(buildQtys[tabIdx]) || 0;
        const specs = specsArr[tabIdx] || {};
        totalFillVolume    += num(specs.totalFillVolume || specs.fillVolume || specs.volume) * bq;
        fullPadOAL         += num(specs.fullPadOAL || specs.OAL || specs.assemblyOAL) * bq;
        spoolingOAL        += num(specs.spoolingOAL || 0) * bq;
        fullTruckingWeight += num(specs.fullTruckingWeight || specs.weight) * bq;
      });
    }
    setPadSpecs({
      totalFillVolume:    totalFillVolume    ? totalFillVolume.toFixed(2)    : '',
      fullPadOAL:         fullPadOAL         ? fullPadOAL.toFixed(2)         : '',
      spoolingOAL:        spoolingOAL        ? spoolingOAL.toFixed(2)        : '',
      fullTruckingWeight: fullTruckingWeight ? fullTruckingWeight.toFixed(2) : '',
    });
  }, [
    dfit.selections, dfit.buildQtys, dfit.specs,
    uma.selections, uma.buildQtys, uma.specs,
    fca.selections, fca.buildQtys, fca.specs,
    sva.selections, sva.buildQtys, sva.specs,
    dogbones.selections, dogbones.buildQtys, dogbones.specs,
    zippers.selections, zippers.buildQtys, zippers.specs,
    ppl.selections, ppl.buildQtys, ppl.specs
  ]);

  const handleMetaChange = (field, value) => setMetadata(m => ({ ...m, [field]: value }));
  const makeSectionChange = sec => (loc, val) => sec.onChange(loc, val);
  const handleDFITChange = makeSectionChange(dfit);
  const handleUMAChange = makeSectionChange(uma);
  const handleFCAChange = makeSectionChange(fca);
  const handleSVAChange = makeSectionChange(sva);
  const handleDogbonesChange = makeSectionChange(dogbones);
  const handleZippersChange = makeSectionChange(zippers);
  const handlePplChange = makeSectionChange(ppl);
  const addConsumable = (name, qty, page, tab) =>
    setConsumables(prev => [
      ...prev.filter(c => !(c.name === name && c.page === page && c.tab === tab)),
      { name, qty, page, tab }
    ]);

  // ---- Save Draft (create new job if missing id, else patch/update) ----
  const handleSave = async () => {
    const payloadSections = Object.fromEntries(
      ['dfit', 'uma', 'fca', 'sva', 'dogbones', 'zippers', 'ppl'].map(key => {
        const sec = { dfit, uma, fca, sva, dogbones, zippers, ppl }[key];
        return [key, {
          selections: sec.selections,
          buildQtys: sec.buildQtys,
          activeTab: sec.activeTab,
          tabConsumables: sec.tabConsumables,
        }];
      })
    );

    // Save all model states
    const assemblyModels = {};
    assemblies.forEach(({ key, models }) => {
      assemblyModels[key] = models.map(m => ({
        modelUrl: m.modelUrl,
        locked: m.locked,
        labels: m.labels,
      }));
    });

    let safeModelUrl = dfitModels[0].modelUrl;
    if (safeModelUrl && safeModelUrl.startsWith('data:')) {
      safeModelUrl = null;
    }

    const draftBody = {
      metadata,
      pageIndex,
      dfitModelUrl: safeModelUrl,
      dfitLocked: dfitModels[0].locked,
      dfitLabels: dfitModels[0].labels,
      woInfoModelUrl,
      woInfoModelLocked,
      woInfoModelLabels,
      consumables,
      sections: payloadSections,
      assemblyModels,
    };

    try {
      let savedJobId = workorderId;
      let jobRes = null;

      if (!savedJobId) {
        // Create new job in DB!
        const jobCreatePayload = {
          customer,
          surface_lsd: surfaceLSD,
          num_wells: numberOfWells,
          rig_in_date: rigInDate,
          well_bank_type: wellBankType,
          workbook_revision: workbookRevision,
          notes: notes || "",
        };
        jobRes = await axios.post('/api/jobs', jobCreatePayload);
        savedJobId = jobRes.data?.id || jobRes.data?.jobId || jobRes.data?.ID;
        if (!savedJobId) throw new Error("Server did not return a job id!");
        alert('New Job created! Saving full workorder...');
      } else {
        // Existing job—update fields as needed
        await axios.patch(`/api/jobs/${savedJobId}`, {
          customer,
          surface_lsd: surfaceLSD,
          num_wells: numberOfWells,
          rig_in_date: rigInDate,
          well_bank_type: wellBankType,
          workbook_revision: workbookRevision,
          notes: notes || "",
        });
      }

      // Always save draft to /api/drafts (linked to job id)
      await axios.post('/api/drafts', {
        user_id: userId,
        workorder_id: savedJobId,
        page_key: storageKey,
        payload: draftBody
      });

      // PATCH: Update local workorderId for the next publish!
      if (!workorderId && savedJobId) {
        setLocalWorkorderId(savedJobId);
        initialData.id = savedJobId;
      }

      alert('Progress saved to server!');
    } catch (err) {
      console.error('Unable to save job/draft', err);
      alert('Error saving progress. Try again?');
    }
  };

  // ---- PUBLISH (Publish Revision Button) ----
  const handlePublish = async () => {
    try {
      // 1. Gather BOMPage props (same as BOMPage expects)
      const bomPayload = {
        dfitSelections: asArray(dfit.selections),
        dfitBuildQtys: asArray(dfit.buildQtys),
        umaSelections: asArray(uma.selections),
        umaBuildQtys: asArray(uma.buildQtys),
        fcaSelections: asArray(fca.selections),
        fcaBuildQtys: asArray(fca.buildQtys),
        svaSelections: asArray(sva.selections),
        svaBuildQtys: asArray(sva.buildQtys),
        dogbonesSelections: asArray(dogbones.selections),
        dogbonesBuildQtys: asArray(dogbones.buildQtys),
        zippersSelections: asArray(zippers.selections),
        zippersBuildQtys: asArray(zippers.buildQtys),
        pplSelections: asArray(ppl.selections),
        pplBuildQtys: asArray(ppl.buildQtys),
        consumables,
        padSpecs
      };

      // For this first version, always use "A" as the revision (upgradeable)
      const revision = "A";

      // Build the new work_orders object
      const workOrdersData = {
        revision,
        bom: bomPayload
      };
      console.log('workorderId in handlePublish:', workorderId, typeof workorderId, initialData);

      // Send to backend using PUT (update job by ID)
      await axios.put(`/api/jobs/${workorderId}`, {
        work_orders: JSON.stringify(workOrdersData)
      });

      alert(`Published revision REV-${revision} for this job!`);
    } catch (err) {
      console.error('Unable to publish BOM revision', err);
      alert('Error publishing BOM. Try again?');
    }
  };

  const alerts = useMemo(() => {
    const out = [];
    const base = metadata.buildingBase;
    if (!base) return out;
    const onHand = name =>
      assets.filter(a => a.name === name && a.location === base && a.status === 'Available').length;

    const mapping = [
      ['DFIT', dfit],
      ['UMA', uma],
      ['FCA', fca],
      ['SVA', sva],
      ['Dogbones', dogbones],
      ['Zippers', zippers],
      ['PPLDropdown', ppl],
    ];
    mapping.forEach(([label, sec]) => {
      asArray(sec.selections).forEach((selObj, ti) => {
        const need = asArray(sec.buildQtys)[ti] || 0;
        Object.entries(selObj).forEach(([lk, name]) => {
          if (!name) return;
          const have = onHand(name);
          if (need > have) {
            out.push(
              `Insufficient "${name}" in ${base} for ${label} tab #${ti + 1}, location ${lk}: need ${need}, have ${have}.`
            );
          }
        });
      });
    });
    return out;
  }, [
    metadata.buildingBase,
    assets,
    dfit.selections, dfit.buildQtys,
    uma.selections, uma.buildQtys,
    fca.selections, fca.buildQtys,
    sva.selections, sva.buildQtys,
    dogbones.selections, dogbones.buildQtys,
    zippers.selections, zippers.buildQtys,
    ppl.selections, ppl.buildQtys,
  ]);

  let woNumber = '';
  const code = pages[pageIndex]?.code;
  const tabIdx = [dfit.activeTab, uma.activeTab, fca.activeTab, sva.activeTab, dogbones.activeTab, zippers.activeTab, ppl.activeTab];
  if (pageIndex >= 3 && pageIndex <= 9) {
    const idx = pageIndex - 3;
    const suffix = tabIdx[idx] > 0 ? String.fromCharCode(65 + tabIdx[idx]) : '';
    woNumber = `WO #${code}${suffix}`;
  }
  const prevLabel = pages[pageIndex - 1]?.title || '';
  const nextLabel = pages[pageIndex + 1]?.title || '';
  const canNext = pageIndex < pages.length - 1;
  const logoSrc = logoUrl || `/assets/logos/${customer.replace(/\s+/g, '-').toLowerCase()}.png`;

  // ---- Pass down all model states and specs to PageRenderer for each assembly/tab
  return (
    <>
      <WorkorderModal
        pages={pages}
        currentPageIndex={pageIndex}
        onChangePage={setPageIndex}
        prevLabel={prevLabel}
        nextLabel={nextLabel}
        onPrev={() => pageIndex > 0 && setPageIndex(i => i - 1)}
        onNext={() => canNext && setPageIndex(i => i + 1)}
        onSave={handleSave}
        onGenerate={handlePublish}
        canNext={canNext}
        onClose={onClose}
        metadata={metadata}
        woNumber={woNumber}
        alerts={alerts}
        onToggleAlerts={() => setShowAlerts(v => !v)}
        dfitSelections={asArray(dfit.selections)}
        dfitActiveTab={dfit.activeTab}
      >
        <PageRenderer
          index={pageIndex}
          pages={pages}
          metadata={metadata}
          logoSrc={logoSrc}
          handleMetaChange={handleMetaChange}
          bomItemsState={bomItems}
          consumables={consumables}
          padSpecs={padSpecs}

          dfitBuildQtys={asArray(dfit.buildQtys)}
          dfitSelections={asArray(dfit.selections)}
          dfitActiveTab={dfit.activeTab}
          setDfitBuildQtys={dfit.setBuildQtys}
          setDfitActiveTab={dfit.setActiveTab}
          handleDFITChange={handleDFITChange}
          dfitTabConsumables={dfit.tabConsumables}
          setDfitTabConsumables={dfit.setTabConsumables}
          dfitModelStates={dfitModels}
          dfitPanelSpecs={dfitPanelSpecs}

          umaTabs={umaCfg.tabs}
          umaSelections={asArray(uma.selections)}
          umaBuildQtys={asArray(uma.buildQtys)}
          umaActiveTab={uma.activeTab}
          setUmaBuildQtys={uma.setBuildQtys}
          setUmaActiveTab={uma.setActiveTab}
          handleUMAChange={handleUMAChange}
          umaTabConsumables={uma.tabConsumables}
          setUmaTabConsumables={uma.setTabConsumables}
          umaModelStates={umaModels}
          umaPanelSpecs={umaPanelSpecs}

          fcaSelections={asArray(fca.selections)}
          fcaBuildQtys={asArray(fca.buildQtys)}
          fcaActiveTab={fca.activeTab}
          setFcaBuildQtys={fca.setBuildQtys}
          setFcaActiveTab={fca.setActiveTab}
          handleFCAChange={handleFCAChange}
          fcaTabConsumables={fca.tabConsumables}
          setFcaTabConsumables={fca.setTabConsumables}
          fcaModelStates={fcaModels}
          fcaPanelSpecs={fcaPanelSpecs}

          svaSelections={asArray(sva.selections)}
          svaBuildQtys={asArray(sva.buildQtys)}
          svaActiveTab={sva.activeTab}
          setSvaBuildQtys={sva.setBuildQtys}
          setSvaActiveTab={sva.setActiveTab}
          handleSVAChange={handleSVAChange}
          svaTabConsumables={sva.tabConsumables}
          setSvaTabConsumables={sva.setTabConsumables}
          svaModelStates={svaModels}
          svaPanelSpecs={svaPanelSpecs}

          dogbonesSelections={asArray(dogbones.selections)}
          dogbonesBuildQtys={asArray(dogbones.buildQtys)}
          dogbonesActiveTab={dogbones.activeTab}
          setDogbonesBuildQtys={dogbones.setBuildQtys}
          setDogbonesActiveTab={dogbones.setActiveTab}
          handleDogbonesChange={handleDogbonesChange}
          dogbonesTabConsumables={dogbones.tabConsumables}
          setDogbonesTabConsumables={dogbones.setTabConsumables}
          dogbonesModelStates={dogbonesModels}
          dogbonesPanelSpecs={dogbonesPanelSpecs}

          zippersSelections={asArray(zippers.selections)}
          zippersBuildQtys={asArray(zippers.buildQtys)}
          zippersActiveTab={zippers.activeTab}
          setZippersBuildQtys={zippers.setBuildQtys}
          setZippersActiveTab={zippers.setActiveTab}
          handleZippersChange={handleZippersChange}
          zippersTabConsumables={zippers.tabConsumables}
          setZippersTabConsumables={zippers.setTabConsumables}
          zippersModelStates={zippersModels}
          zippersPanelSpecs={zippersPanelSpecs}

          pplSelections={asArray(ppl.selections)}
          pplBuildQtys={asArray(ppl.buildQtys)}
          pplActiveTab={ppl.activeTab}
          setPplBuildQtys={ppl.setBuildQtys}
          setPplActiveTab={ppl.setActiveTab}
          handlePplChange={handlePplChange}
          pplTabConsumables={ppl.tabConsumables}
          setPplTabConsumables={ppl.setTabConsumables}
          pplModelStates={pplModels}
          pplPanelSpecs={pplPanelSpecs}

          // --- WOInfoPage SimpleViewer model state ---
          woInfoModelUrl={woInfoModelUrl}
          setWoInfoModelUrl={setWoInfoModelUrl}
          woInfoModelLocked={woInfoModelLocked}
          setWoInfoModelLocked={setWoInfoModelLocked}
          woInfoModelLabels={woInfoModelLabels}
          setWoInfoModelLabels={setWoInfoModelLabels}

          assets={assets}
          baseColors={{ 'Red Deer': 'text-white', 'Grand Prairie': 'text-white', Nisku: 'text-white' }}
          addConsumable={addConsumable}
          specWeight={specWeight}
          specFillVolume={specFillVolume}
          specAssemblyOAL={specAssemblyOAL}
        />
      </WorkorderModal>

      {showAlerts && <AlertsModal alerts={alerts} onClose={() => setShowAlerts(false)} />}
    </>
  );
}
