// ==============================
// MFVPage.jsx — Ultra-Sticky Pad Selection, Universal Analytics Panel Hookup + Live Polling
// ==============================
import Papa from 'papaparse';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import MFVAnalyticsPanel from '../components/MFV Page Components/MFVAnalyticsPanel';
import MFVBodyPressureChart from '../components/MFV Page Components/MFVBodyPressureChart';
import MFVBodyPressureTable from '../components/MFV Page Components/MFVBodyPressureTable';
import MFVPadControls from '../components/MFV Page Components/MFVPadControls';
import MFVTableView from '../components/MFV Page Components/MFVTableView';

// --- ADD: PDF Report Generation ---
import generateMfvReport from '../utils/generateMfvReport';
import { API_BASE_URL } from '../api';
import useMediaQuery from '../hooks/useMediaQuery';

const API_BASE = API_BASE_URL || '';

import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// ==============================
// Section: CSV Table Headers
// ==============================
const BUILD_TABLE_HEADERS = [
  'TIMESTAMP',
  'USER ID',
  'USERNAME',
  'PPC#:',
  'SHOP ORIGIN:',
  'VALVE SIZE:',
  'BODY STYLE:',
  'SEAL CONFIGURATION:',
  'GATE GUIDES INSTALLED:',
  'STEP SIZE:',
  'SEAT POCKET TO SEAT POCKET:',
  'A-SIDE SEAT THICKNESS:',
  'B-SIDE SEAT THICKNESS:',
  'GATE THICKNESS:'
];

const SUMMARY_TABLE_HEADERS = [
  'TIMESTAMP',
  'USER ID',
  'USERNAME',
  'PPC#:',
  'VALVE SIZE:',
  'SHOP ORIGIN:',
  'BODY STYLE:',
  'IS THIS VALVE A RE-TEST?',
  'SHELL TEST:',
  'BORE TEST:',
  'GATE (A) SIDE:',
  'GATE (B) SIDE:',
  'BODY PRESSURE (A) SIDE:',
  'BODY PRESSURE (B) SIDE:',
  'VALVE IS QUALIFIED AS AN:'
];

const tablesConfig = [
  { key: 'build', label: 'Build & Tolerance Reports', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTtTEOWnW6i4BOpwiY7vZ_LmVymZGwXBapgyZ_fRtqD6NcWUpI_r-1wrn5bWDrX0ANOzCDpbwqMUG0R/pub?gid=0&single=true&output=csv' },
  { key: 'summary', label: 'MFV Test Reports', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTVHS7FlbKTZtslOKoa6x8GsTW02jqRttmMgArSkJ2AzLr3jyxF9lR0YXb4zMoJZ-yl6__OLVuAFYW3/pub?gid=0&single=true&output=csv' },
  { key: 'field', label: 'OEM Reports', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRFbz1FlLmX9w-sJMhtsnyRQ5DaLXuiWaw9nEJ7nRfV1CZUIBxEKk9UTurxIhaLq7491cAXWYoEfyS1/pub?gid=0&single=true&output=csv' },
];

// ==============================
// Section: Pagination Defaults
// ==============================
const ROWS_PER_PAGE = 20;

const ROWS_PER_PAGE_BY_TAB = {
  build: 20,
  summary: 20,
  field: 19
};

// ==============================
// Section: API Helpers
// ==============================
async function fetchPads() {
  const res = await fetch(`${API_BASE}/api/mfv/pads`);
  return res.json();
}
async function fetchPadRows(pad_key) {
  const res = await fetch(`${API_BASE}/api/mfv/pads/${pad_key}/rows`);
  return res.json();
}
async function addPadApi({ pad_key, label, url }) {
  const res = await fetch(`${API_BASE}/api/mfv/pads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pad_key, label, url })
  });
  return res.json();
}
async function archivePadApi(id, archived) {
  const res = await fetch(`${API_BASE}/api/mfv/pads/${id}/archive`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ archived })
  });
  return res.json();
}
async function importPadCsv(pad_key, headers, rows) {
  const res = await fetch(`${API_BASE}/api/mfv/pads/${pad_key}/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ headers, rows })
  });
  return res.json();
}
async function fetchCustomers() {
  const res = await fetch(`${API_BASE}/api/customers`);
  return res.json();
}
async function fetchAssetsAll() {
  const res = await fetch(`${API_BASE}/api/assets`);
  return res.json();
}

// ==============================
// Section: PPC Normalization Helper
// ==============================
function normalizePpcId(input) {
  const cleaned = String(input || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!cleaned) return '';
  const m = cleaned.match(/^PPC(\d+)([A-Z]*)$/);
  if (m) {
    const digits = String(parseInt(m[1], 10));
    const suffix = m[2] || '';
    return `PPC${digits}${suffix}`;
  }
  if (cleaned.startsWith('PPC')) return cleaned;
  const d = cleaned.match(/(\d+)/);
  if (d) return `PPC${parseInt(d[1], 10)}`;
  return cleaned;
}

// ==============================
// Section: Component
// ==============================
export default function MFVPageWrapper() {
  const navigate = useNavigate();

  const isTablet = useMediaQuery('(max-width: 1280px)');
  const isMobile = useMediaQuery('(max-width: 960px)');
  const isPhone = useMediaQuery('(max-width: 640px)');

  const [allSheets, setAllSheets] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('build');
  const [pads, setPads] = useState([]);
  const [archived, setArchived] = useState([]);
  const [selectedPad, setSelectedPad] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("chart");
  const [customers, setCustomers] = useState([]);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // NEW: assets + qualification stats state
  const [assets, setAssets] = useState([]);
  const [qualificationStats, setQualificationStats] = useState(null);

  const chartRef = useRef();

  const IMG_BASE = API_BASE;

  // ==============================
  // Section: Local Storage Pad
  // ==============================
  useEffect(() => {
    const storedPad = window.localStorage.getItem('MFV_SELECTED_PAD');
    if (storedPad) setSelectedPad(storedPad);
  }, []);

  useEffect(() => {
    if (selectedPad) {
      window.localStorage.setItem('MFV_SELECTED_PAD', selectedPad);
    }
  }, [selectedPad]);

  // ==============================
  // Section: Load Pads / Customers / Assets
  // ==============================
  const reloadPads = async () => {
    setLoading(true);
    try {
      const all = await fetchPads();
      const filteredPads = all.filter(p => !p.archived).map(pad => ({
        ...pad,
        key: pad.pad_key
      }));
      setPads(filteredPads);
      setArchived(all.filter(p => p.archived).map(pad => ({
        ...pad,
        key: pad.pad_key
      })));
      const matchIdx = filteredPads.findIndex(
        p => (p.key || '').toLowerCase() === (selectedPad || '').toLowerCase()
      );
      if ((selectedPad === '' || matchIdx === -1) && filteredPads.length > 0) {
        setSelectedPad(filteredPads[0].key);
      }
    } finally {
      setLoading(false);
    }
  };

  const reloadCustomers = async () => {
    try {
      const data = await fetchCustomers();
      setCustomers(Array.isArray(data)
        ? data.map(c => ({
            ...c,
            logo_url: c.logo_url
              ? (c.logo_url.startsWith('http')
                ? c.logo_url
                : IMG_BASE + c.logo_url)
              : null
          }))
        : []);
    } catch (e) {
      setCustomers([]);
    }
  };

  const reloadAssets = async () => {
    try {
      const data = await fetchAssetsAll();
      setAssets(Array.isArray(data) ? data : []);
    } catch {
      setAssets([]);
    }
  };

  useEffect(() => {
    reloadPads();
    reloadCustomers();
    reloadAssets();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      reloadPads();
      reloadAssets();
    }, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, []);

  // ==============================
  // Section: Load CSVs + Pad Data
  // ==============================
  useEffect(() => {
    const sources = tablesConfig.map(t => ({ ...t }));
    Promise.all([
      ...sources.map(t =>
        fetch(t.url)
          .then(res => res.text())
          .then(text => {
            const parsed = Papa.parse(text, { skipEmptyLines: true });
            const rows = parsed.data;
            const headers = rows[0] || [];
            const dataRows = rows.slice(1).filter(r => r.length === headers.length);
            return { key: t.key, headers, rows: dataRows };
          })
          .catch(() => ({ key: t.key, headers: [], rows: [] }))
      ),
      ...pads.map(async pad => {
        const result = await fetchPadRows(pad.key);
        if (result?.headers && result?.rows) {
          return { key: pad.key, headers: result.headers, rows: result.rows };
        }
        const first = Array.isArray(result) ? result[0] : null;
        if (Array.isArray(first)) {
          const headers = first;
          const rows = result.slice(1);
          return { key: pad.key, headers, rows };
        }
        if (result && Array.isArray(result) && typeof result[0] === 'object') {
          const headers = Object.keys(result[0] || {});
          const rows = result.map(r => headers.map(h => r[h]));
          return { key: pad.key, headers, rows };
        }
        return { key: pad.key, headers: [], rows: [] };
      })
    ])
      .then(results => {
        const flat = results.flat();
        const map = {};
        flat.forEach(r => {
          let headers = Array.isArray(r.headers) ? r.headers : [];
          let rows = Array.isArray(r.rows) ? r.rows : [];
          if (rows.length && !Array.isArray(rows[0]) && typeof rows[0] === 'object') {
            const h = headers.length ? headers : Object.keys(rows[0]);
            rows = rows.map(obj => h.map(k => obj[k]));
            headers = h;
          }
          map[r.key] = { headers, rows };
        });
        setAllSheets(map);
      })
      .catch(err => setError(err.message));
    // eslint-disable-next-line
  }, [pads, selectedPad]);

  // ==============================
  // Section: Pagination / Filtering
  // ==============================
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, selectedPad]);

  let displayHeaders = activeTab === 'body'
    ? allSheets[selectedPad]?.headers || []
    : activeTab === 'build'
      ? BUILD_TABLE_HEADERS
      : activeTab === 'summary'
        ? SUMMARY_TABLE_HEADERS
        : allSheets[activeTab]?.headers || [];

  let displayRows = activeTab === 'body'
    ? allSheets[selectedPad]?.rows || []
    : allSheets[activeTab]?.rows || [];

  if (activeTab === 'summary') {
    displayRows = displayRows.map(row => row.slice(0, SUMMARY_TABLE_HEADERS.length));
  }

  const term = (searchTerm || '').toLowerCase();
  const rowMatchesTerm = (row) => {
    if (!term) return true;
    if (Array.isArray(row)) return row.some(cell => String(cell).toLowerCase().includes(term));
    if (row && typeof row === 'object') return Object.values(row).some(cell => String(cell).toLowerCase().includes(term));
    return false;
  };
  displayRows = displayRows.filter(rowMatchesTerm);

  if (activeTab !== 'body') {
    displayRows = [...displayRows].reverse();
  }

  const rowsPerPage = ROWS_PER_PAGE_BY_TAB[activeTab] || ROWS_PER_PAGE;

  const totalPages = Math.max(1, Math.ceil(displayRows.length / rowsPerPage));
  const paginatedRows = displayRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // ==============================
  // Section: Add/Archive Pads
  // ==============================
  const handleAddPad = async () => {
    if (!newLabel.trim() || !newUrl.trim()) return;
    const pad_key = newLabel.toLowerCase().replace(/\W+/g, '-');
    const pad = await addPadApi({ pad_key, label: newLabel, url: newUrl });
    try {
      const res = await fetch(newUrl);
      const text = await res.text();
      const parsed = Papa.parse(text, { skipEmptyLines: true });
      const headers = parsed.data[0] || [];
      const rows = parsed.data.slice(1).filter(r => r.length === headers.length);
      await importPadCsv(pad_key, headers, rows);
    } catch {}
    setShowAdd(false);
    setNewLabel('');
    setNewUrl('');
    setSelectedPad(pad_key);
    reloadPads();
  };

  const handleArchive = async () => {
    const pad = pads.find(p => p.key.toLowerCase() === selectedPad.toLowerCase());
    if (!pad) return;
    await archivePadApi(pad.id, true);
    setSelectedPad(pads.find(p => p.key.toLowerCase() !== selectedPad.toLowerCase())?.key || "");
    reloadPads();
  };

  const handleRestore = async (key) => {
    const pad = archived.find(a => a.key.toLowerCase() === key.toLowerCase());
    if (!pad) return;
    await archivePadApi(pad.id, false);
    setSelectedPad(key);
    reloadPads();
  };

  const handlePrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));
  const handlePageClick = (pageNum) => setCurrentPage(pageNum);

  const selectedPadLabel = pads.find(p => (p.key || '').toLowerCase() === (selectedPad || '').toLowerCase())?.label || selectedPad;

  // ==============================
  // Section: PDF Report
  // ==============================
  const handleGenerateReport = async () => {
    if (!selectedPad || !allSheets[selectedPad]) return;
    setGeneratingPdf(true);
    try {
      const padMeta = pads.find(p => (p.key || '').toLowerCase() === (selectedPad || '').toLowerCase()) || {};
      const customer = padMeta.customer || (padMeta.label ? padMeta.label.split(' ')[0] : "");
      const lsd = padMeta.label ? padMeta.label.split(' ').slice(1).join(' ') : "";
      const chartBase64 =
        chartRef.current && typeof chartRef.current.toBase64Image === "function"
          ? chartRef.current.toBase64Image()
          : undefined;

      await generateMfvReport({
        headers: allSheets[selectedPad].headers,
        rows: allSheets[selectedPad].rows,
        padLabel: selectedPadLabel,
        customer,
        lsd,
        chartBase64
      });
    } catch (err) {
      alert("Failed to generate PDF report: " + err.message);
    }
    setGeneratingPdf(false);
  };

  // ==============================
  // Section: Summary-level MFV Analytics (fed into panel)
  // ==============================
  const summaryMfvMetrics = useMemo(() => {
    const summarySheetData = allSheets.summary || {};
    const headers = Array.isArray(summarySheetData.headers) ? summarySheetData.headers : [];
    const rows = Array.isArray(summarySheetData.rows) ? summarySheetData.rows : [];
    if (!headers.length || !rows.length) return null;

    const normalize = (value) => String(value ?? '').toUpperCase().replace(/[‐–—]/g, '-');
    const findIdx = (matcher) => headers.findIndex(h => matcher(normalize(h)));

    const idxSize = findIdx(text => text.includes('VALVE SIZE'));
    const idxQual = findIdx(text => text.includes('VALVE IS QUALIFIED'));

    if (idxSize === -1 || idxQual === -1) return null;

    const keyVariants = (value, fallback) => {
      const base = String(value ?? '').replace(/\s+/g, ' ').trim();
      const list = [base];
      if (base.endsWith(':')) list.push(base.slice(0, -1));
      if (fallback) list.push(fallback);
      return list.filter(Boolean);
    };

    const sizeKeys = keyVariants(headers[idxSize], 'VALVE SIZE');
    const qualKeys = keyVariants(headers[idxQual], 'VALVE IS QUALIFIED AS AN');

    const readCell = (row, index, keys) => {
      if (Array.isArray(row)) return row[index];
      if (row && typeof row === 'object') {
        for (const key of keys) {
          if (Object.prototype.hasOwnProperty.call(row, key)) return row[key];
        }
      }
      return undefined;
    };

    const classifySize = (value) => {
      const text = normalize(value);
      if (!text) return 'OTHER';
      if (/(5\s*[-\/]?\s*1\/8)/.test(text)) return '5-1/8';
      if (/(7\s*[-\/]?\s*1\/16)/.test(text)) return '7-1/16';
      return 'OTHER';
    };

    let denom518 = 0;
    let denom716 = 0;
    let mfv518 = 0;
    let mfv716 = 0;

    rows.forEach((row) => {
      const sizeRaw = readCell(row, idxSize, sizeKeys);
      const qualRaw = readCell(row, idxQual, qualKeys);

      const sizeKey = classifySize(sizeRaw);
      const isMfv = normalize(qualRaw).includes('MFV');

      if (sizeKey === '5-1/8') {
        denom518 += 1;
        if (isMfv) mfv518 += 1;
      } else if (sizeKey === '7-1/16') {
        denom716 += 1;
        if (isMfv) mfv716 += 1;
      }
    });

    const share518 = denom518 > 0 ? (mfv518 / denom518) * 100 : 0;
    const share716 = denom716 > 0 ? (mfv716 / denom716) * 100 : 0;

    return { share518, share716, denom518, denom716, mfv518, mfv716 };
  }, [allSheets.summary]);

  // ==============================
  // Section: Analytics Panel Props (Top Submitters passthrough unchanged)
  // ==============================
  function getTop5Submitters(headers, rows) {
    if (!headers || !rows || rows.length === 0) return { headers, rows };
    const userIdx = headers.findIndex(h => h.toLowerCase().includes('username'));
    if (userIdx === -1) return { headers, rows };

    const counts = {};
    rows.forEach(r => {
      const user = (Array.isArray(r) ? r[userIdx] : r?.[userIdx]) ?? '';
      const norm = String(user).toLowerCase();
      if (norm) counts[norm] = (counts[norm] || 0) + 1;
    });

    const top5 = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(e => e[0]);

    const filteredRows = rows.filter(r => top5.includes(String(Array.isArray(r) ? r[userIdx] : r?.[userIdx]).toLowerCase()));
    return { headers, rows: filteredRows };
  }

  const analyticsPanelProps = (() => {
    if (!displayHeaders || !displayRows) return { headers: displayHeaders, rows: displayRows, tabLabel: '' };
    const tabLabel = tablesConfig.find(t => t.key === activeTab)?.label || (activeTab === 'body' ? 'Body Pressures' : '');
    if (
      tabLabel.toLowerCase().includes('tolerance report') ||
      tabLabel.toLowerCase().includes('test report') ||
      tabLabel.toLowerCase().includes('build')
    ) {
      return {
        headers: displayHeaders,
        rows: getTop5Submitters(displayHeaders, displayRows).rows,
        tabLabel
      };
    }
    return { headers: displayHeaders, rows: displayRows, tabLabel };
  })();

  // ==============================
  // Section: Cross-Tab Search Results
  // ==============================
  const buildSheet = allSheets['build'] || { headers: BUILD_TABLE_HEADERS, rows: [] };
  const summarySheet = allSheets['summary'] || { headers: SUMMARY_TABLE_HEADERS, rows: [] };
  const fieldSheet = allSheets['field'] || { headers: allSheets['field']?.headers || [], rows: [] };

  const filterRows = (rows) => rows.filter(rowMatchesTerm);
  const limit = 10;

  const buildMatches = useMemo(() => {
    const rows = filterRows(buildSheet.rows);
    return rows.slice(0, limit);
  }, [buildSheet.rows, term]);

  const summaryMatches = useMemo(() => {
    const rows = filterRows(summarySheet.rows);
    return rows.slice(0, limit);
  }, [summarySheet.rows, term]);

  const fieldMatches = useMemo(() => {
    const rows = filterRows(fieldSheet.rows);
    return rows.slice(0, limit);
  }, [fieldSheet.rows, term]);

  // ==============================
  // Section: Latest Qualification Join (Assets × MFV Summary)
// ==============================
  useEffect(() => {
    const H = summarySheet.headers || [];
    const R = summarySheet.rows || [];
    if (!Array.isArray(assets) || assets.length === 0 || !Array.isArray(R) || R.length === 0) {
      setQualificationStats(null);
      return;
    }

    const idxTimestamp = H.findIndex(h => String(h).toUpperCase().startsWith('TIMESTAMP'));
    const idxPpc = H.findIndex(h => String(h).toUpperCase().startsWith('PPC'));
    const idxQual = H.findIndex(h => String(h).toUpperCase().includes('QUALIFIED'));

    if (idxPpc === -1 || idxQual === -1 || idxTimestamp === -1) {
      setQualificationStats(null);
      return;
    }

    const assetPpcs = new Set(
      assets
        .map(a => normalizePpcId(a?.id))
        .filter(Boolean)
    );

    const latestByPpc = {};
    for (const row of R) {
      const rawPpc = row[idxPpc];
      const norm = normalizePpcId(rawPpc);
      if (!assetPpcs.has(norm)) continue;

      const ts = new Date(row[idxTimestamp] || '').getTime() || 0;
      const qual = String(row[idxQual] || '').trim().toUpperCase();

      if (!latestByPpc[norm] || ts > latestByPpc[norm].ts) {
        latestByPpc[norm] = { ts, qual };
      }
    }

    const counts = { MFV: 0, HFV: 0, EMU: 0, UNKNOWN: 0 };
    const allPpcs = Array.from(assetPpcs);
    const seen = new Set();
    for (const p of allPpcs) {
      const rec = latestByPpc[p];
      if (!rec) {
        counts.UNKNOWN += 1;
        continue;
      }
      const q = rec.qual.includes('MFV') ? 'MFV'
              : rec.qual.includes('HFV') ? 'HFV'
              : rec.qual.includes('EMU') ? 'EMU'
              : 'UNKNOWN';
      counts[q] += 1;
      seen.add(p);
    }

    const totalPpc = allPpcs.length;
    setQualificationStats({ totalPpc, counts });
  }, [assets, allSheets.summary]);

  // ==============================
  // Section: Mini Tables + Page
  // ==============================
  const MiniTable = ({ title, headers, rows }) => (
    <div className="w-full bg-black/70 border border-[#6a7257] rounded-lg p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[#cfd3c3] font-bold uppercase tracking-wide text-[12px] leading-tight">{title}</h3>
        <span className="text-[10px] text-[#949C7F]">Matches: {rows.length}</span>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="bg-black text-[#6a7257]">
              {headers.map((h, idx) => (
                <th
                  key={idx}
                  className="border border-[#6a7257] px-2 py-1 whitespace-normal break-words leading-tight align-top text-[10px] font-semibold"
                  style={{ minWidth: 90, wordBreak: 'break-word' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="text-center text-gray-400 px-2 py-2" colSpan={headers.length}>No matches</td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={i} className="odd:bg-[#1a1a1a] even:bg-[#111] text-white">
                  {(Array.isArray(r) ? r : Object.values(r)).map((c, j) => (
                    <td
                      key={j}
                      className="border border-[#6a7257] px-2 py-1 whitespace-normal break-words leading-tight align-top"
                      style={{ minWidth: 90, wordBreak: 'break-word' }}
                    >
                      {String(c)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const containerWidth = isTablet ? '100%' : '80vw';

  return (
    <div
      className='min-h-8xl min-w-full flex items-center justify-center bg-cover bg-no-repeat p-0 m-0'
      style={{
        backgroundImage: 'url("/assets/dark-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: isMobile ? 'scroll' : 'fixed'
      }}
    >
      <div
        className='w-full h-full mx-auto flex flex-col justify-start items-center shadow-2xl border-2 border-[#6a7257] bg-[#181b17e8] backdrop-blur-lg mt-0'
        style={{
          minHeight: isMobile ? 'auto' : '90vh',
          minWidth: containerWidth,
          maxWidth: containerWidth,
          width: '100%',
          padding: isMobile ? '16px 12px 32px' : '0 0 0px 0',
          margin: '0 auto',
          boxShadow: '0 10px 60px 6px #23281c99'
        }}
      >
        <div
          className={`w-full flex ${isMobile ? 'flex-col gap-6' : 'flex-row'} items-stretch pt-2 pb-2`}
          style={{ borderBottom: '2px solid #6a7257', background: 'rgba(0, 0, 0, 1)', borderTopLeftRadius: '0px', borderTopRightRadius: '0px', paddingLeft: isMobile ? 12 : 0, paddingRight: isMobile ? 12 : 0 }}
        >
          <div
            className={`flex flex-col ${isMobile ? 'items-start' : 'items-center'} gap-3 pl-3 pr-3`}
            style={{
              width: '100%',
              maxWidth: isMobile ? '100%' : 1100,
              flex: isMobile ? '1 1 auto' : '0 0 60%'
            }}
          >
            <div className="flex flex-row items-center mb-0 gap-0">
              <img
                src="/assets/mfv-icon.png"
                alt="MFV Icon"
                className="w-12 h-8"
                style={{ minWidth: 40, borderRadius: '16%' }}
              />
              <h1 className="text-4xl font-varien uppercase tracking-wide text-gray-200 drop-shadow-xl ml-2" style={{ letterSpacing: '0.10em' }}>
                MFV Information Hub
              </h1>
            </div>
            <p className='mt-4 text-sm font-medium text-white font-erbaum tracking-wide uppercase text-center md:text-left w-full'>
              Valve Test Results, Build Reports, & OEM Data
            </p>
            <div className='w-full flex justify-center md:justify-center mt-1 mb-2'>
              <input
                type="text"
                placeholder=" Search by PPC# or Valve Name"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full max-w-3xl px-4 py-2 rounded-lg uppercase border-2 border-white shadow-lg font-erbaum text-sm text-center text-white placeholder-white bg-black focus:border-[#949C7F] focus:ring-2 focus:ring-[#6a7257] transition-all duration-200"
                style={{
                  outline: 'none',
                  boxShadow: '0 3px 12px 0 #23281c80',
                  fontWeight: 400,
                  letterSpacing: '0.05em',
                  minWidth: isMobile ? '100%' : 700,
                  width: '100%'
                }}
              />
            </div>
            <div className="flex flex-row flex-wrap gap-1 items-center justify-start mx-0 mb-0">
              {tablesConfig.concat({ key: 'body', label: 'Body Pressures' }).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => { setSearchTerm(''); setActiveTab(tab.key); }}
                  className={`px-3 py-1 font-bold rounded-lg border-2 text-sm transition-all
                  ${activeTab === tab.key
                    ? 'border-[#6a7257] bg-[#23281c] text-white shadow'
                    : 'border-[#35392E] bg-black text-[#b0b79f] hover:bg-[#23281c] hover:text-white'}`}
                  style={{ minWidth: isPhone ? 84 : isMobile ? 92 : 100, letterSpacing: '0.05em' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div
            className='flex-1 flex items-center justify-center pl-0 pr-6'
            style={{
              paddingLeft: isMobile ? 0 : undefined,
              paddingRight: isMobile ? 0 : 24,
              marginTop: isMobile ? 16 : 0
            }}
          >
            <div
              className='rounded-lg bg-black border border-[#6a7257] h-full w-full shadow-xl flex justify-center p-1'
              style={{ minHeight: isMobile ? 'auto' : 160, padding: isMobile ? 12 : 4 }}
            >
              <MFVAnalyticsPanel
                headers={analyticsPanelProps.headers}
                rows={analyticsPanelProps.rows}
                tabLabel={analyticsPanelProps.tabLabel}
                qualificationStats={qualificationStats}
                metrics={summaryMfvMetrics}
              />
            </div>
          </div>
        </div>

        {searchTerm.trim() !== '' && (
          <div className="w-full px-4 pt-3">
            <div className="bg-black/60 border-2 border-[#6a7257] rounded-md p-3">
              <h2 className="text-xl text-white font-varien uppercase tracking-wider mb-2">Search Results</h2>
              <p className="text-sm text-[#cfd3c3] mb-3">Query: <span className="font-bold">{searchTerm}</span></p>

              <MiniTable title="Build & Tolerance Results" headers={BUILD_TABLE_HEADERS} rows={buildMatches} />
              <MiniTable title="Testing Results" headers={SUMMARY_TABLE_HEADERS} rows={summaryMatches} />
              <MiniTable title="OEM Results" headers={fieldSheet.headers || []} rows={fieldMatches} />
            </div>
          </div>
        )}

        {searchTerm.trim() === '' && (
          <div
            className='w-full flex-1 flex flex-col justify-start items-center py-0 px-0'
            style={{
              minHeight: isMobile ? 'auto' : 850,
              minWidth: '100%',
              overflowY: isMobile ? 'visible' : 'auto',
              overflowX: 'hidden',
              padding: isMobile ? '0 12px 12px' : '0'
            }}
          >
            {activeTab === 'body' ? (
              <div
                className={`w-full flex ${isMobile ? 'flex-col gap-6' : 'justify-center items-stretch'}`}
                style={{
                  minHeight: isMobile ? 'auto' : '100%',
                  height: isMobile ? 'auto' : '100%',
                  alignItems: 'stretch'
                }}
              >
                <div
                  className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-6 w-full max-w-full bg-black rounded-lg border-2 border-[#6a7257] shadow-lg py-3 px-3`}
                  style={{
                    height: isMobile ? 'auto' : '100%',
                    minHeight: isMobile ? 'auto' : 850,
                    alignItems: 'stretch'
                  }}
                >
                  <div
                    className="bg-[#111211] border border-[#b0b79f] rounded-xl flex flex-col justify-start"
                    style={{
                      flex: isMobile ? '1 1 auto' : '0 0 280px',
                      minWidth: isMobile ? '100%' : 370,
                      maxWidth: isMobile ? '100%' : 370,
                      width: isMobile ? '100%' : '30vw',
                      height: isMobile ? 'auto' : 800,
                      boxShadow: '0 2px 16px 4px #23281c'
                    }}
                  >
                    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                      <MFVPadControls
                        pads={pads}
                        setPads={setPads}
                        archived={archived}
                        setArchived={setArchived}
                        selectedPad={selectedPad}
                        setSelectedPad={setSelectedPad}
                        showAdd={showAdd}
                        setShowAdd={setShowAdd}
                        newLabel={newLabel}
                        setNewLabel={setNewLabel}
                        newUrl={newUrl}
                        setNewUrl={setNewUrl}
                        handleAddPad={handleAddPad}
                        handleArchive={handleArchive}
                        handleRestore={handleRestore}
                        viewMode={viewMode}
                        onToggleViewMode={setViewMode}
                        hideDisplayMode={true}
                        customers={customers}
                      />
                    </div>
                  </div>
                  <div
                    className="bg-black border border-[#b0b79f] rounded-xl flex flex-col justify-start"
                    style={{
                      flex: '1 1 0% ',
                      minWidth: 0,
                      width: isMobile ? '100%' : '58vw',
                      height: '100%',
                      boxShadow: '0 2px 24px 4px #23281c',
                      padding: isMobile ? '12px' : '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      minHeight: isMobile ? 'auto' : 800,
                      maxHeight: '100%',
                      overflow: 'hidden'
                    }}
                  >
                    <div className={`flex ${isMobile ? 'flex-col gap-3 items-start' : 'flex-row items-center justify-between'} mb-4`}>
                      <h2 className="text-base font-semibold tracking-wide font-erbaum text-white drop-shadow-lg">
                        Daily Body Pressure{selectedPadLabel ? ` – ${selectedPadLabel}` : ""}
                      </h2>
                      <div className={`flex gap-2 items-center ${isMobile ? 'flex-wrap' : ''}`}>
                        <button
                          className={`px-3 py-1 rounded-l font-bold border border-[#b0b79f] transition-all
                          ${viewMode === "chart"
                            ? "bg-black text-[#e6e8df] shadow"
                            : "bg-[#23281c70] text-[#b0b79f] hover:bg-[#23281c]"}`}
                          style={{
                            borderRight: "none",
                            outline: viewMode === "chart" ? "2px solid #b0b79f" : "none",
                            fontSize: 13
                          }}
                          onClick={() => setViewMode("chart")}
                        >
                          &#128200; Chart
                        </button>
                        <button
                          className={`px-3 py-1 rounded-r font-bold border border-[#b0b79f] transition-all
                          ${viewMode === "table"
                            ? "bg-black text-[#e6e8df] shadow"
                            : "bg-[#23281c70] text-[#b0b79f] hover:bg-[#23281c]"}`}
                          style={{
                            borderLeft: "none",
                            outline: viewMode === "table" ? "2px solid #b0b79f" : "none",
                            fontSize: 13
                          }}
                          onClick={() => setViewMode("table")}
                        >
                          &#128202; Table
                        </button>
                        <button
                          className="ml-3 px-4 py-1 rounded font-bold border border-[#6a7257] bg-[#24281a] text-[#ffdf66] hover:bg-[#32391e] hover:text-yellow-200 shadow transition-all"
                          style={{
                            fontSize: 13,
                            minWidth: isPhone ? 140 : 170,
                            marginLeft: isMobile ? 0 : 12,
                            letterSpacing: '0.04em',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          onClick={handleGenerateReport}
                          disabled={generatingPdf}
                        >
                          {generatingPdf ? (
                            <span className="flex items-center">
                              <svg className="animate-spin mr-2" width="16" height="16" fill="none" viewBox="0 0 16 16">
                                <circle cx="8" cy="8" r="7" stroke="#ffdf66" strokeWidth="2" strokeDasharray="22" />
                              </svg>
                              Generating...
                            </span>
                          ) : (
                            <>
                              <svg className="mr-2" width="16" height="16" fill="none" viewBox="0 0 16 16">
                                <path d="M3 13v-2h10v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm10-3V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v5h10ZM8 1v7" stroke="#ffdf66" strokeWidth="1.6" strokeLinecap="round"/>
                                <circle cx="8" cy="10.5" r="1" fill="#ffdf66"/>
                              </svg>
                              Generate Post-Job Report
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                      <div
                        id="mfv-body-pressure-chart"
                        style={{
                          display: viewMode === "chart" ? "block" : "none",
                          width: '100%',
                          height: isMobile ? 420 : 700,
                          position: "relative"
                        }}
                      >
                        <MFVBodyPressureChart
                          ref={chartRef}
                          displayHeaders={displayHeaders}
                          displayRows={displayRows}
                          pads={pads}
                          selectedPad={selectedPad}
                          hideTitle={true}
                        />
                      </div>
                      <div
                        id="mfv-body-pressure-table"
                        style={{
                          display: viewMode === "table" ? "block" : "none",
                          width: '100%',
                          height: isMobile ? 460 : 800,
                          position: "relative"
                        }}
                      >
                        <MFVBodyPressureTable
                          displayHeaders={displayHeaders}
                          paginatedRows={activeTab === 'body' ? displayRows : paginatedRows}
                          COLUMN_MIN_WIDTHS={[]}
                          currentPage={currentPage}
                          totalPages={totalPages}
                          handlePrevPage={handlePrevPage}
                          handleNextPage={handleNextPage}
                          handlePageClick={handlePageClick}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="w-full h-full flex flex-col items-center bg-black justify-center px-2 py-2"
                style={{ minHeight: isMobile ? 'auto' : '24rem', padding: isMobile ? '12px' : '0.5rem 0.5rem' }}
              >
                <MFVTableView
                  displayHeaders={displayHeaders}
                  paginatedRows={paginatedRows}
                  COLUMN_MIN_WIDTHS={[]}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  handlePrevPage={handlePrevPage}
                  handleNextPage={handleNextPage}
                  handlePageClick={handlePageClick}
                  rowsPerPage={rowsPerPage}
                  padToFullHeight={activeTab !== 'field'}
                />
              </div>
            )}
          </div>
        )}

        
      </div>
    </div>
  );
}
