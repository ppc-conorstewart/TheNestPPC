// ==============================
// FILE: src/components/Workorder Components/WorkorderForm.jsx
// ==============================

import axios from 'axios';
import html2canvas from 'html2canvas';
import { useEffect, useMemo, useRef, useState } from 'react';
import { sections as sectionConfigs } from '../../constants/workorderConfig';
import assetSpecs from '../../data/AssetSpecifications.json';
import torqueSpecs from '../../data/TorqueSpecs.js';
import useAssemblyModel from '../../hooks/useAssemblyModel';
import useAssets from '../../hooks/useAssets';
import { useUser } from '../../hooks/useUser';
import { useWorkorderSection } from '../../hooks/useWorkorderSection';
import AlertsModal from './AlertsModal';
import PageRenderer from './PageRenderer';
import WorkorderModal from './WorkorderModal';
import { API_BASE_URL, resolveApiUrl } from '../../api';

const API_BASE = API_BASE_URL || '';

axios.defaults.baseURL = API_BASE;

const asArray = x => Array.isArray(x) ? x : x ? [x] : [];

function fractionToDecimal(str) {
  const match = str.match(/^(\d+)-(\d+)\/(\d+)$/);
  if (match) {
    const [ , whole, num, den ] = match;
    return (parseInt(whole, 10) + parseInt(num, 10)/parseInt(den, 10)).toFixed(3);
  }
  return str;
}
function normalizeUniversal(name) {
  if (!name) return '';
  return name
    .replace(/"/g, '')
    .replace(/'/g, '')
    .replace(/\s*\|\s*/g, '|')
    .replace(/(\d+-\d+\/\d+)/g, (m) => fractionToDecimal(m))
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
}
function extractSizePressure(name) {
  const frac = name.match(/(\d+-\d+\/\d+)\s*"?\s*(\d{2,})K/i);
  if (frac) {
    const decimal = fractionToDecimal(frac[1]);
    return [ `${frac[1]} ${frac[2]}K`, `${decimal} ${frac[2]}K` ];
  }
  const dec = name.match(/(\d+\.\d+)\s*"?\s*(\d{2,})K/i);
  if (dec) return [ `${dec[1]} ${dec[2]}K` ];
  return [];
}

function computeSpecs(selectedAssets, resolveSpec) {
  let totalWeight = 0, totalVolume = 0, totalOAL = 0, torqueSpecsArr = [];
  selectedAssets.forEach(name => {
    const spec = resolveSpec(name);
    if (spec) {
      totalWeight += Number(spec.weight) || 0;
      totalVolume += Number(spec.fillVolume) || 0;
      totalOAL += Number(spec.OAL) || 0;
      if (Array.isArray(spec.torqueSpecs)) torqueSpecsArr = torqueSpecsArr.concat(spec.torqueSpecs);
    }
    const possibleKeys = extractSizePressure(name);
    possibleKeys.forEach(szp => {
      if (szp && torqueSpecs[szp]) {
        const t = torqueSpecs[szp];
        torqueSpecsArr.push({ connection: szp, torque: t.maxFtLbs, ringGasket: t.ringGasket, numBolts: t.numBolts, stud: t.stud, wrench: t.wrench });
      }
    });
  });

  const seen = new Set();
  const uniqueTorqueSpecs = [];
  torqueSpecsArr.forEach(t => {
    const key = t.connection + '_' + t.torque;
    if (!seen.has(key)) { seen.add(key); uniqueTorqueSpecs.push(t); }
  });

  return { totalWeight: totalWeight * 2.20462, totalVolume, totalOAL, torqueSpecsArr: uniqueTorqueSpecs };
}

export default function WorkorderForm({ initialData, onClose, getCustomerLogo }) {
  const pages = [
    { title: 'Customer Info' },
    { title: 'Site Measurements' },
    { title: 'Bill of Materials' },
    { title: 'DFIT Assembly' },
    { title: 'Upper Master Assembly' },
    { title: 'Flow Cross Assembly' },
    { title: 'Swab Valve Assembly' },
    { title: 'Dogbones Assembly' },
    { title: 'Zippers Assembly' },
    { title: 'PPL Assembly' },
  ];

  const {
    logoUrl, customer, surfaceLSD, numberOfWells, rigInDate, wellBankType, workbookRevision, buildingBase, notes,
    specWeight = 0, specFillVolume = 0, specAssemblyOAL = 0,
  } = initialData;

  const { assets } = useAssets();
  const resolveAssetSpec = useMemo(() => {
    const normalizedMap = new Map();
    Object.keys(assetSpecs).forEach(key => {
      normalizedMap.set(normalizeUniversal(key), assetSpecs[key]);
    });
    const cache = new Map();
    return (rawName) => {
      if (!rawName) return null;
      if (cache.has(rawName)) return cache.get(rawName);
      let spec = assetSpecs[rawName];
      if (!spec) {
        const normalizedRaw = normalizeUniversal(rawName);
        spec = normalizedMap.get(normalizedRaw) || null;
      }
      if (!spec) {
        const decimalName = rawName.replace(/(\d+-\d+\/\d+)/g, m => fractionToDecimal(m));
        spec = assetSpecs[decimalName] || normalizedMap.get(normalizeUniversal(decimalName)) || null;
      }
      cache.set(rawName, spec);
      return spec;
    };
  }, [assets]);
  const storageKey = `workorder_${customer.replace(/\s+/g, '-')}_${surfaceLSD}`;
  const { user } = useUser();
  const userId = user?.id || 'GUEST';

  const [localWorkorderId, setLocalWorkorderId] = useState(initialData.id || initialData.ID || initialData.jobId || null);
  const workorderId = localWorkorderId;

  const [metadata, setMetadata] = useState({
    customer, surfaceLSD, numberOfWells, rigInDate, wellBankType, workbookRevision, buildingBase: buildingBase || '', notes: notes || '',
  });

  const [dfitCfg, umaCfg, fcaCfg, svaCfg, dogbonesCfg, zippersCfg, pplCfg] = sectionConfigs;
  const dfit = useWorkorderSection(dfitCfg);
  const uma = useWorkorderSection(umaCfg);
  const fca = useWorkorderSection(fcaCfg);
  const sva = useWorkorderSection(svaCfg);
  const dogbones = useWorkorderSection(dogbonesCfg);
  const zippers = useWorkorderSection(zippersCfg);
  const ppl = useWorkorderSection(pplCfg);

  const tabCount = cfg => Array.isArray(cfg.tabs) ? cfg.tabs.length : 2;
  const dfitModels = Array.from({ length: tabCount(dfitCfg) }, () => useAssemblyModel());
  const umaModels  = Array.from({ length: tabCount(umaCfg) }, () => useAssemblyModel());
  const fcaModels  = Array.from({ length: tabCount(fcaCfg) }, () => useAssemblyModel());
  const svaModels  = Array.from({ length: tabCount(svaCfg) }, () => useAssemblyModel());
  const dogbonesModels = Array.from({ length: tabCount(dogbonesCfg) }, () => useAssemblyModel());
  const zippersModels  = Array.from({ length: tabCount(zippersCfg) }, () => useAssemblyModel());
  const pplModels      = Array.from({ length: tabCount(pplCfg) }, () => useAssemblyModel());

  const assemblies = [
    { key: 'dfit', section: dfit, models: dfitModels },
    { key: 'uma', section: uma, models: umaModels },
    { key: 'fca', section: fca, models: fcaModels },
    { key: 'sva', section: sva, models: svaModels },
    { key: 'dogbones', section: dogbones, models: dogbonesModels },
    { key: 'zippers', section: zippers, models: zippersModels },
    { key: 'ppl', section: ppl, models: pplModels },
  ];

  const [woInfoModelUrl, setWoInfoModelUrl] = useState(null);
  const [woInfoModelLocked, setWoInfoModelLocked] = useState(false);
  const [woInfoModelLabels, setWoInfoModelLabels] = useState([]);

  const [bomItems, setBomItems] = useState([]);
  const [consumables, setConsumables] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [showAlerts, setShowAlerts] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const pageContentRef = useRef(null);

  const extractJobId = data => data?.id ?? data?.jobId ?? data?.ID ?? data?.job_id ?? null;
  const toNumberOrNull = value => {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  };

  const fetchLatestWorkorder = async jobId => {
    const numericJobId = toNumberOrNull(jobId);
    if (!numericJobId) return null;
    try {
      const res = await axios.get(resolveApiUrl(`/api/workorders/by-job/${numericJobId}/latest`));
      return res?.data || null;
    } catch (err) {
      if (err?.response?.status === 404) return null;
      console.error('Failed to fetch latest workorder', err);
      return null;
    }
  };

  const dfitPanelSpecs = useMemo(() => asArray(dfit.selections).map(selObj => {
    const assetNames = Object.entries(selObj)
      .filter(([k, v]) => k.startsWith('location') && typeof v === 'string' && v)
      .map(([, v]) => v);
    return computeSpecs(assetNames, resolveAssetSpec);
  }), [dfit.selections, resolveAssetSpec]);
  const umaPanelSpecs = useMemo(() => asArray(uma.selections).map(selObj => {
    const assetNames = Object.entries(selObj)
      .filter(([k, v]) => k.startsWith('location') && typeof v === 'string' && v)
      .map(([, v]) => v);
    return computeSpecs(assetNames, resolveAssetSpec);
  }), [uma.selections, resolveAssetSpec]);
  const fcaPanelSpecs = useMemo(() => asArray(fca.selections).map(selObj => {
    const assetNames = Object.entries(selObj)
      .filter(([k, v]) => k.startsWith('location') && typeof v === 'string' && v)
      .map(([, v]) => v);
    return computeSpecs(assetNames, resolveAssetSpec);
  }), [fca.selections, resolveAssetSpec]);
  const svaPanelSpecs = useMemo(() => asArray(sva.selections).map(selObj => {
    const assetNames = Object.entries(selObj)
      .filter(([k, v]) => k.startsWith('location') && typeof v === 'string' && v)
      .map(([, v]) => v);
    return computeSpecs(assetNames, resolveAssetSpec);
  }), [sva.selections, resolveAssetSpec]);
  const dogbonesPanelSpecs = useMemo(() => asArray(dogbones.selections).map(selObj => {
    const assetNames = Object.entries(selObj)
      .filter(([k, v]) => k.startsWith('location') && typeof v === 'string' && v)
      .map(([, v]) => v);
    return computeSpecs(assetNames, resolveAssetSpec);
  }), [dogbones.selections, resolveAssetSpec]);
  const zippersPanelSpecs = useMemo(() => asArray(zippers.selections).map(selObj => {
    const assetNames = Object.entries(selObj)
      .filter(([k, v]) => k.startsWith('location') && typeof v === 'string' && v)
      .map(([, v]) => v);
    return computeSpecs(assetNames, resolveAssetSpec);
  }), [zippers.selections, resolveAssetSpec]);
  const pplPanelSpecs = useMemo(() => asArray(ppl.selections).map(selObj => {
    const assetNames = Object.entries(selObj)
      .filter(([k, v]) => k.startsWith('location') && typeof v === 'string' && v)
      .map(([, v]) => v);
    return computeSpecs(assetNames, resolveAssetSpec);
  }), [ppl.selections, resolveAssetSpec]);

  useEffect(() => {
    async function loadDraft() {
      try {
        const res = await axios.get(resolveApiUrl('/api/drafts'), { params: { user_id: userId, page_key: storageKey } });
        const saved = res.data.payload;
        setMetadata(saved.metadata || metadata);
        setPageIndex(saved.pageIndex ?? pageIndex);

        const pairs = { dfit, uma, fca, sva, dogbones, zippers, ppl };
        saved.sections && Object.entries(saved.sections).forEach(([key, s]) => {
          const sec = pairs[key]; if (!sec) return;
          s.buildQtys && sec.setBuildQtys(s.buildQtys);
          s.activeTab != null && sec.setActiveTab(s.activeTab);
          s.tabConsumables && sec.setTabConsumables(s.tabConsumables);
          s.selections && sec.setSelections(s.selections);
        });

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

        setWoInfoModelUrl(saved.woInfoModelUrl || null);
        setWoInfoModelLocked(saved.woInfoModelLocked || false);
        setWoInfoModelLabels(saved.woInfoModelLabels || []);
        setConsumables(saved.consumables || consumables);
      } catch { /* ignore */ }
    }
    loadDraft();
    // eslint-disable-next-line
  }, [storageKey]);

  useEffect(() => {
    (async () => {
      if (!workorderId) return;
      const latest = await fetchLatestWorkorder(workorderId);
      if (latest?.id) {
        setWorkorderRecordId(latest.id);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workorderId]);

  useEffect(() => {
    const items = [];
    const collect = (sels, bqs) => {
      const selsArr = asArray(sels);
      selsArr.forEach((sel, ti) => {
        const buildMult = Number(asArray(bqs)[ti]) || 0;
        if (!buildMult) return;

        // Sum per asset slot quantity * buildMult
        for (let i = 1; i <= 10; i++) {
          const desc = sel['location' + i];
          if (!desc) continue;
          const perAssetQty = Math.max(1, Math.floor(Number(sel['qty' + i] || 1)));
          const addQty = perAssetQty * buildMult;

          const found = items.find(r => r.description === desc);
          if (found) found.quantity += addQty;
          else items.push({ description: desc, quantity: addQty });
        }
      });
    };
    [dfit, uma, fca, sva, dogbones, zippers, ppl].forEach(sec => collect(sec.selections, sec.buildQtys));
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

  const [padSpecs, setPadSpecs] = useState({ totalFillVolume: 0, fullPadOAL: 0, spoolingOAL: 0, fullTruckingWeight: 0 });
  useEffect(() => {
    const num = x => Number(x) || 0;
    let totalFillVolume = 0, fullPadOAL = 0, spoolingOAL = 0, fullTruckingWeight = 0;

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
  const handleUMAChange  = makeSectionChange(uma);
  const handleFCAChange  = makeSectionChange(fca);
  const handleSVAChange  = makeSectionChange(sva);
  const handleDogbonesChange = makeSectionChange(dogbones);
  const handleZippersChange  = makeSectionChange(zippers);
  const handlePplChange      = makeSectionChange(ppl);
  const addConsumable = (name, qty, page, tab) =>
    setConsumables(prev => [
      ...prev.filter(c => !(c.name === name && c.page === page && c.tab === tab)),
      { name, qty, page, tab }
    ]);

  const [workorderRecordId, setWorkorderRecordId] = useState(null);

  const handleSave = async () => {
    const jobPayload = {
      customer: metadata.customer || customer,
      surface_lsd: metadata.surfaceLSD || surfaceLSD,
      num_wells: metadata.numberOfWells ?? numberOfWells,
      rig_in_date: metadata.rigInDate || rigInDate,
      well_bank_type: metadata.wellBankType,
      workbook_revision: metadata.workbookRevision,
      notes: (metadata.notes ?? notes) || '',
    };

    const payloadSections = Object.fromEntries(
      ['dfit', 'uma', 'fca', 'sva', 'dogbones', 'zippers', 'ppl'].map(key => {
        const sec = { dfit, uma, fca, sva, dogbones, zippers, ppl }[key];
        return [key, { selections: sec.selections, buildQtys: sec.buildQtys, activeTab: sec.activeTab, tabConsumables: sec.tabConsumables }];
      })
    );

    const assemblyModels = {};
    assemblies.forEach(({ key, models }) => {
      assemblyModels[key] = models.map(m => ({ modelUrl: m.modelUrl, locked: m.locked, labels: m.labels }));
    });

    let safeModelUrl = dfitModels[0].modelUrl;
    if (safeModelUrl && safeModelUrl.startsWith('data:')) safeModelUrl = null;

    const draftBody = {
      metadata, pageIndex,
      dfitModelUrl: safeModelUrl, dfitLocked: dfitModels[0].locked, dfitLabels: dfitModels[0].labels,
      woInfoModelUrl, woInfoModelLocked, woInfoModelLabels,
      consumables,
      sections: payloadSections,
      assemblyModels,
      padSpecs
    };

    try {
      let savedJobId = workorderId;
      if (!savedJobId) {
        const jobRes = await axios.post(resolveApiUrl('/api/jobs'), jobPayload);
        savedJobId = extractJobId(jobRes?.data);
        if (!savedJobId) {
          const jobsRes = await axios.get(resolveApiUrl('/api/jobs'));
          const normalizedCustomer = (jobPayload.customer || '').trim().toUpperCase();
          const normalizedSurface = (jobPayload.surface_lsd || '').trim().toLowerCase();
          const normalizedRig = (jobPayload.rig_in_date || '').slice(0, 10);
          const matchedJob = asArray(jobsRes.data).find(job => {
            const jobCustomer = (job.customer || '').trim().toUpperCase();
            const jobSurface = (job.surface_lsd || '').trim().toLowerCase();
            const jobRig = (job.rig_in_date || '').slice(0, 10);
            return jobCustomer === normalizedCustomer && jobSurface === normalizedSurface && (!normalizedRig || jobRig === normalizedRig);
          });
          savedJobId = extractJobId(matchedJob);
        }
        if (!savedJobId) throw new Error('Server did not return a job id!');
        alert('New Job created! Saving full workorder...');
      } else {
        await axios.patch(resolveApiUrl(`/api/jobs/${savedJobId}`), jobPayload);
      }

      const numericJobId = toNumberOrNull(savedJobId);
      if (!numericJobId) throw new Error('Invalid job id received from server');

      await axios.post(resolveApiUrl('/api/drafts'), { user_id: userId, workorder_id: numericJobId, page_key: storageKey, payload: draftBody });

      const revision = 'A';
      const workorderPayload = { revision, payload: draftBody };
      let recordId = workorderRecordId;
      try {
        if (recordId) {
          await axios.put(resolveApiUrl(`/api/workorders/${recordId}`), workorderPayload);
        } else {
          const woRes = await axios.post(resolveApiUrl('/api/workorders'), { job_id: numericJobId, revision, payload: draftBody });
          recordId = woRes?.data?.id || null;
          if (recordId) setWorkorderRecordId(recordId);
        }
      } catch (woErr) {
        const latest = await fetchLatestWorkorder(numericJobId);
        if (latest?.id) {
          recordId = latest.id;
          setWorkorderRecordId(recordId);
          await axios.put(resolveApiUrl(`/api/workorders/${recordId}`), workorderPayload);
        } else {
          throw woErr;
        }
      }

      if (!workorderId && numericJobId) { setLocalWorkorderId(numericJobId); initialData.id = numericJobId; }

      alert('Progress saved to server!');
    } catch (err) {
      console.error('Unable to save job/draft', err);
      alert('Error saving progress. Try again?');
    }
  };

  const handlePublish = async () => {
    if (!workorderId) {
      alert('Please save the workorder before publishing a revision.');
      return;
    }

    try {
      const numericJobId = toNumberOrNull(workorderId);
      if (!numericJobId) throw new Error('Invalid job id');
      if (!workorderRecordId) {
        const latest = await fetchLatestWorkorder(numericJobId);
        if (latest?.id) {
          setWorkorderRecordId(latest.id);
        } else {
          throw new Error('No workorder record found to publish. Please save first.');
        }
      }

      const bomPayload = {
        dfitSelections: asArray(dfit.selections), dfitBuildQtys: asArray(dfit.buildQtys),
        umaSelections:  asArray(uma.selections),  umaBuildQtys:  asArray(uma.buildQtys),
        fcaSelections:  asArray(fca.selections),  fcaBuildQtys:  asArray(fca.buildQtys),
        svaSelections:  asArray(sva.selections),  svaBuildQtys:  asArray(sva.buildQtys),
        dogbonesSelections: asArray(dogbones.selections), dogbonesBuildQtys: asArray(dogbones.buildQtys),
        zippersSelections:  asArray(zippers.selections),  zippersBuildQtys:  asArray(zippers.buildQtys),
        pplSelections:      asArray(ppl.selections),      pplBuildQtys:      asArray(ppl.buildQtys),
        consumables, padSpecs
      };

      const revision = 'A';
      const workOrdersData = { revision, bom: bomPayload };

      if (workorderRecordId) {
        await axios.put(resolveApiUrl(`/api/workorders/${workorderRecordId}`), { revision, payload: workOrdersData });
      } else {
        const createPayload = { job_id: numericJobId, revision, payload: workOrdersData };
        const woRes = await axios.post(resolveApiUrl('/api/workorders'), createPayload);
        if (woRes?.data?.id) setWorkorderRecordId(woRes.data.id);
      }

      await axios.patch(resolveApiUrl(`/api/jobs/${numericJobId}`), { work_orders: JSON.stringify(workOrdersData) });

      alert(`Published revision REV-${revision} for this job!`);
    } catch (err) {
      console.error('Unable to publish BOM revision', err);
      alert('Error publishing BOM. Try again?');
    }
  };

  const handleExportPdf = async () => {
    if (isExportingPdf) return;

    const containerEl = pageContentRef.current;
    if (!containerEl) {
      alert('Unable to access the workorder view for PDF export.');
      return;
    }

    const waitForLayout = () => new Promise(resolve => {
      const raf = (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function')
        ? window.requestAnimationFrame.bind(window)
        : (cb) => setTimeout(cb, 0);
      raf(() => setTimeout(resolve, 100));
    });

    const previousIndex = pageIndex;
    setIsExportingPdf(true);

    try {
      const { jsPDF } = await import('jspdf');
      const capturedPages = [];

      for (let i = 0; i < pages.length; i += 1) {
        if (pageIndex !== i) {
          setPageIndex(i);
          await waitForLayout();
        } else {
          await waitForLayout();
        }

        const scrollableSection = containerEl.querySelector('section.flex-grow');
        let previousOverflow;
        if (scrollableSection) {
          previousOverflow = scrollableSection.style.overflow;
          scrollableSection.scrollTop = 0;
          scrollableSection.style.overflow = 'visible';
        }

        let canvas;
        try {
          canvas = await html2canvas(containerEl, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
            logging: false,
          });
        } finally {
          if (scrollableSection) {
            scrollableSection.style.overflow = previousOverflow || '';
          }
        }

        if (canvas) {
          capturedPages.push({
            dataUrl: canvas.toDataURL('image/png'),
            width: canvas.width,
            height: canvas.height,
          });
        }
      }

      if (capturedPages.length === 0) {
        throw new Error('no_pages_captured');
      }

      const doc = new jsPDF({ unit: 'pt', format: 'letter', orientation: 'portrait' });
      capturedPages.forEach((page, idx) => {
        if (idx > 0) doc.addPage();
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = doc.internal.pageSize.getHeight();
        const scale = Math.min(pdfWidth / page.width, pdfHeight / page.height);
        const renderWidth = page.width * scale;
        const renderHeight = page.height * scale;
        const offsetX = (pdfWidth - renderWidth) / 2;
        const offsetY = (pdfHeight - renderHeight) / 2;
        doc.addImage(page.dataUrl, 'PNG', offsetX, offsetY, renderWidth, renderHeight);
      });

      const safeCustomer = (metadata.customer || 'Workorder').replace(/[^a-z0-9]+/gi, '_');
      doc.save(`Workorder_${safeCustomer}.pdf`);
    } catch (err) {
      console.error('Failed to generate full workorder PDF', err);
      alert('Failed to generate the full workorder PDF. Please try again.');
    } finally {
      setPageIndex(previousIndex);
      await waitForLayout();
      setIsExportingPdf(false);
    }
  };

  const alerts = useMemo(() => {
    const out = [];
    const base = metadata.buildingBase; if (!base) return out;
    const onHand = name => assets.filter(a => a.name === name && a.location === base && a.status === 'Available').length;

    const mapping = [['DFIT', dfit], ['UMA', uma], ['FCA', fca], ['SVA', sva], ['Dogbones', dogbones], ['Zippers', zippers], ['PPLDropdown', ppl]];
    mapping.forEach(([label, sec]) => {
      asArray(sec.selections).forEach((selObj, ti) => {
        const need = asArray(sec.buildQtys)[ti] || 0;
        Object.entries(selObj).forEach(([lk, name]) => {
          if (!name) return; const have = onHand(name);
          if (need > have) out.push(`Insufficient "${name}" in ${base} for ${label} tab #${ti + 1}, location ${lk}: need ${need}, have ${have}.`);
        });
      });
    });
    return out;
  }, [
    metadata.buildingBase, assets,
    dfit.selections, dfit.buildQtys, uma.selections, uma.buildQtys, fca.selections, fca.buildQtys,
    sva.selections, sva.buildQtys, dogbones.selections, dogbones.buildQtys, zippers.selections, zippers.buildQtys, ppl.selections, ppl.buildQtys
  ]);

  let woNumber = '';
  const code = pages[pageIndex]?.code;
  const tabIdx = [dfit.activeTab, uma.activeTab, fca.activeTab, sva.activeTab, dogbones.activeTab, zippers.activeTab, ppl.activeTab];
  if (pageIndex >= 3 && pageIndex <= 9) {
    const idx = pageIndex - 3; const suffix = tabIdx[idx] > 0 ? String.fromCharCode(65 + tabIdx[idx]) : '';
    woNumber = `WO #${code}${suffix}`;
  }
  const prevLabel = pages[pageIndex - 1]?.title || '';
  const nextLabel = pages[pageIndex + 1]?.title || '';
  const canNext = pageIndex < pages.length - 1;
  const fallbackLogo = customer
    ? `/assets/logos/${customer.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`
    : null;
  const resolvedLogo = getCustomerLogo ? getCustomerLogo(customer) : null;
  const logoSrc = logoUrl || resolvedLogo || fallbackLogo || '';
  const canPublish = Boolean(workorderId);

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
        onExportPdf={handleExportPdf}
        isExportingPdf={isExportingPdf}
        canNext={canNext}
        canPublish={canPublish}
        onClose={onClose}
        metadata={metadata}
        woNumber={woNumber}
        alerts={alerts}
        onToggleAlerts={() => setShowAlerts(v => !v)}
        dfitSelections={asArray(dfit.selections)}
        dfitActiveTab={dfit.activeTab}
        contentRef={pageContentRef}
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
