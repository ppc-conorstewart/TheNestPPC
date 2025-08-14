import axios from 'axios';
import { useEffect, useMemo, useRef, useState } from 'react';

/* ==============================
   TAB CONSTANTS (UI ↔ Server Map)
============================== */
const UI_TABS = [
  'General Files',
  'Sales / Finance (Permissions Required)',
];

// Map UI labels to server tab keys (keep backend “Equipment” key)
const SERVER_TAB_MAP = {
  'General Files': 'Equipment',
  'Sales / Finance (Permissions Required)': 'Sales / Finance (Permissions Required)',
};

const serverKeyFor = (uiTab) => SERVER_TAB_MAP[uiTab] || uiTab;

/* ==============================
   FILE TYPE HELPERS
============================== */
const isImageFile = (filename) => /\.(jpe?g|png|gif|bmp|webp|svg)$/i.test(filename);
const isPDFFile = (filename) => /\.pdf$/i.test(filename);
const isDocFile = (filename) => /\.(doc|docx)$/i.test(filename);
const isSheetFile = (filename) => /\.(xls|xlsx|csv)$/i.test(filename);
const isTextFile = (filename) => /\.(txt|md|json|log)$/i.test(filename);

const typeOfFile = (filename) => {
  if (isImageFile(filename)) return 'image';
  if (isPDFFile(filename)) return 'pdf';
  if (isDocFile(filename)) return 'doc';
  if (isSheetFile(filename)) return 'sheet';
  if (isTextFile(filename)) return 'text';
  return 'other';
};

const FileTypeBadge = ({ filename }) => {
  const t = typeOfFile(filename);
  const map = {
    image: { label: 'IMG', bg: '#3f7f5d' },
    pdf:   { label: 'PDF', bg: '#6a7257' },
    doc:   { label: 'DOC', bg: '#2978d9' },
    sheet: { label: 'XLS', bg: '#20bb7a' },
    text:  { label: 'TXT', bg: '#888' },
    other: { label: 'FILE', bg: '#444' }
  };
  const { label, bg } = map[t];
  return (
    <div style={{position:'absolute', top:8, left:8, background:bg, color:'#000', fontWeight:'800', fontSize:12, borderRadius:6, padding:'2px 6px'}}>
      {label}
    </div>
  );
};

/* ==============================
   COMPONENT
============================== */
export default function DocumentHubModal({ isOpen, onClose, job, notify }) {
  const [activeTab, setActiveTab] = useState('General Files');
  const [filesByTab, setFilesByTab] = useState({
    'General Files': [],
    'Sales / Finance (Permissions Required)': [],
  });
  const fileInputRef = useRef();

  const [viewingFile, setViewingFile] = useState(null);
  const [viewUrl, setViewUrl] = useState(null);
  const [viewContent, setViewContent] = useState('');

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [salesAccess, setSalesAccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');

  const [previewCache, setPreviewCache] = useState({});

  useEffect(() => {
    if (!isOpen || !job) return;
    fetchFilesForAllTabs();
  }, [isOpen, job]);

  const fetchFilesForAllTabs = async () => {
    if (!job) return;
    let updated = {};
    for (let tab of UI_TABS) {
      try {
        const res = await axios.get(`/api/jobs/${job.id}/files`, { params: { tab: serverKeyFor(tab) } });
        updated[tab] = res.data || [];
      } catch {
        updated[tab] = [];
      }
    }
    setFilesByTab(updated);
  };

  const handleTabClick = (tab) => {
    if (tab === 'Sales / Finance (Permissions Required)' && !salesAccess) {
      setShowPasswordModal(true);
      setPasswordInput('');
      setPasswordError(false);
      return;
    }
    setActiveTab(tab);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === 'PalomaSales') {
      setSalesAccess(true);
      setShowPasswordModal(false);
      setActiveTab('Sales / Finance (Permissions Required)');
    } else {
      setPasswordError(true);
    }
  };

  const handleDrop = (e, tab) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files, tab);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFiles = async (files, tab) => {
    if (!job) return;
    let uploaded = 0;
    let failed = 0;
    for (let file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tab', serverKeyFor(tab));
      try {
        await axios.post(`/api/jobs/${job.id}/files`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploaded++;
      } catch {
        failed++;
      }
    }
    fetchFilesForAllTabs();
    if (notify && typeof notify === 'function') {
      if (uploaded > 0) notify({ message: uploaded > 1 ? `Uploaded ${uploaded} files` : `File uploaded successfully`, detail: `To "${tab}" for ${job.customer} (${job.surface_lsd})`, type: "success" });
      if (failed > 0) notify({ message: failed > 1 ? `Failed to upload ${failed} files` : `File upload failed`, detail: "Please try again or check your connection.", type: "error" });
    }
  };

  const handleDropBoxClick = () => {
    if (!isRestrictedTab && fileInputRef.current) {
      fileInputRef.current.value = null;
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files), activeTab);
    }
  };

  const handleDownload = async (file) => {
    if (!job) return;
    try {
      const res = await axios.get(`/api/jobs/${job.id}/files/${file.id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.filename);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      link.remove();
    } catch {}
  };

  const openViewer = async (file) => {
    setViewingFile(file);
    setViewUrl('');
    setViewContent('');
    try {
      const res = await axios.get(`/api/jobs/${job.id}/files/${file.id}`, { responseType: 'blob' });
      if (isImageFile(file.filename) || isPDFFile(file.filename)) {
        setViewUrl(window.URL.createObjectURL(res.data));
      } else if (isTextFile(file.filename)) {
        const reader = new FileReader();
        reader.onload = (e) => setViewContent(e.target.result);
        reader.readAsText(res.data);
      } else {
        setViewContent('No preview available for this file type.');
      }
    } catch {
      setViewContent('Unable to load preview.');
    }
  };

  const closeViewer = () => {
    setViewingFile(null);
    setViewUrl('');
    setViewContent('');
  };

  const visibleFiles = filesByTab[activeTab] || [];

  useEffect(() => {
    let cancelled = false;
    const loadThumbs = async () => {
      const tasks = visibleFiles.map(async (f) => {
        if (previewCache[f.id]) return;
        try {
          const res = await axios.get(`/api/jobs/${job.id}/files/${f.id}`, { responseType: 'blob' });
          if (isImageFile(f.filename) || isPDFFile(f.filename)) {
            if (!cancelled) setPreviewCache(prev => ({ ...prev, [f.id]: URL.createObjectURL(res.data) }));
          } else if (isTextFile(f.filename)) {
            const reader = new FileReader();
            reader.onload = (e) => {
              if (!cancelled) setPreviewCache(prev => ({ ...prev, [f.id]: `text:${e.target.result.slice(0, 400)}` }));
            };
            reader.readAsText(res.data);
          } else {
            if (!cancelled) setPreviewCache(prev => ({ ...prev, [f.id]: 'none' }));
          }
        } catch {
          if (!cancelled) setPreviewCache(prev => ({ ...prev, [f.id]: 'none' }));
        }
      });
      await Promise.allSettled(tasks);
    };
    if (isOpen && job) loadThumbs();
    return () => { cancelled = true; };
  }, [isOpen, job, activeTab, visibleFiles.length]);

  const filteredFiles = useMemo(() => {
    return visibleFiles.filter(f => {
      if (typeFilter !== 'all' && typeOfFile(f.filename) !== typeFilter) return false;
      if (search && !f.filename.toLowerCase().includes(search.toLowerCase())) return false;
      if (dateFrom) {
        const d = new Date(f.uploaded_at || f.created_at || f.updated_at || 0);
        if (d < new Date(dateFrom)) return false;
      }
      if (dateTo) {
        const d = new Date(f.uploaded_at || f.created_at || f.updated_at || 0);
        const end = new Date(dateTo); end.setHours(23,59,59,999);
        if (d > end) return false;
      }
      return true;
    });
  }, [visibleFiles, typeFilter, dateFrom, dateTo, search]);

  const handleDelete = async (tab, idx) => {
    if (!job) return;
    const fileToDelete = filteredFiles[idx];
    if (!fileToDelete) return;
    let ok = false;
    try {
      await axios.delete(`/api/jobs/${job.id}/files/${fileToDelete.id}`);
      ok = true;
      setPreviewCache(prev => {
        const copy = { ...prev };
        delete copy[fileToDelete.id];
        return copy;
      });
    } catch {}
    fetchFilesForAllTabs();
    if (notify && typeof notify === 'function') {
      if (ok) notify({ message: "File deleted", detail: fileToDelete.filename, type: "success" });
      else notify({ message: "Error deleting file", detail: "Please try again.", type: "error" });
    }
  };

  if (!isOpen || !job) return null;
  const isRestrictedTab = activeTab === 'Sales / Finance (Permissions Required)';
  const customerLogoPath = job.customer ? `/assets/logos/${job.customer.toLowerCase().replace(/[^a-z0-9]/g, '')}.png` : null;
  const wellsCount =
    job.num_wells != null ? parseInt(job.num_wells, 10)
    : job.wells != null ? parseInt(job.wells, 10)
    : '-';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="relative bg-black border-4 border-[#6a7257] shadow-2xl rounded-2xl p-6 w-full max-w-7xl flex flex-col" style={{ minHeight: '750px', maxHeight: '98vh' }}>
        <button onClick={onClose} className="absolute top-5 right-6 text-3xl text-[#6a7257] hover:text-red-600 font-bold focus:outline-none" aria-label="Close">×</button>

        <div className="flex flex-row items-center justify-center bg-black gap-4 w-full mb-2">
          {customerLogoPath && (
            <img src={customerLogoPath} alt={`${job.customer} logo`} className="h-10 w-auto object-contain rounded" style={{ maxWidth: 'px', background: 'white' }} onError={e => (e.currentTarget.style.display = 'none')} />
          )}
          <span className="text-white font-bold text-[1.1rem] tracking-wide">{job.customer}</span>
          <span className="text-white font-bold text-[1.02rem] mx-1">|</span>
          <span className="text-white font-bold text-[1.02rem]">{job.surface_lsd}</span>
          <span className="text-white font-bold text-[1.02rem] mx-1">|</span>
          <span className="text-white font-bold text-[1.02rem]">Wells: <span className="font-bold">{wellsCount}</span></span>
        </div>

        <h2 className="text-lg font-erbaum uppercase mb-3 text-center text-white tracking-wide font-bold">Field Documentation</h2>

        <div className="bg-[#141717] rounded-xl border border-[#6a7257] shadow-inner flex-1 overflow-hidden flex flex-col">
          <div className="flex gap-0 mb-2 px-4 pt-4">
            {UI_TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`${activeTab === tab ? 'text-white border-b-2 border-b-[#6a7257]' : 'text-white/80 hover:text-white'} px-4 py-1.5 font-bold text-[0.97rem]`}
                style={{ borderRadius: i === 0 ? '0.75rem 0 0 0' : i === UI_TABS.length - 1 ? '0.75rem 0 0 0' : '0' }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="px-4 pb-4 pt-2 flex flex-col gap-3 overflow-hidden" style={{ flex: 1 }}>
            {filteredFiles.length === 0 ? (
              <div className="italic text-xs text-gray-400 mt-2">No files match your filters. Drag and drop files below, or click to select.</div>
            ) : (
              <div className="grid gap-4 overflow-y-auto pr-2" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))' }}>
                {filteredFiles.map((file, idx) => {
                  const prev = previewCache[file.id];
                  const uploadedAt = file.uploaded_at ? new Date(file.uploaded_at).toLocaleString() : 'unknown';
                  return (
  <div
    key={file.id}
    className="relative bg-[#0e120c] border border-[#2a2f24] hover:border-[#6a7257] rounded-lg p-2 flex flex-col items-center shadow-sm"
  >
    {/* Uploader above preview */}
    {file.uploaded_by && (
      <div className="text-[#6a7257] uppercase italic text-[8px] leading-tight mb-1 text-center w-full truncate">
        👤{file.uploaded_by}
      </div>
    )}

    {/* Preview Box */}
    <div
      className="w-full h-[180px] bg-[#111511] rounded-md overflow-hidden flex items-center justify-center relative cursor-pointer"
      onClick={() => openViewer(file)}
      title="Open preview"
    >
      <FileTypeBadge filename={file.filename} />
      {prev && prev.startsWith("text:") && (
        <pre className="text-white text-[10px] whitespace-pre-wrap px-2 py-2 w-full h-full overflow-auto">
          {prev.slice(5)}
        </pre>
      )}
      {prev && prev !== "none" && !prev.startsWith("text:") && isImageFile(file.filename) && (
        <img src={prev} alt={file.filename} className="max-w-full max-h-full object-contain" />
      )}
      {prev && prev !== "none" && !prev.startsWith("text:") && isPDFFile(file.filename) && (
        <embed src={prev} type="application/pdf" className="w-full h-full" />
      )}
      {!prev && <div className="text-white/60 text-xs">Loading preview…</div>}
      {prev === "none" && <div className="text-white/60 text-xs">No preview</div>}
    </div>

    {/* Filename + Timestamp */}
    <div className="mt-2 w-full text-center">
      <div className="text-white text-[12px] font-semibold leading-tight truncate" title={file.filename}>
        {file.filename}
      </div>
      <div className="text-white/50 text-[10px] leading-tight">{uploadedAt}</div>
    </div>

    {/* Action Buttons */}
    <div className="mt-2 w-full flex items-center justify-center gap-2">
      <button
        className="px-1 py-0  text-blue-400  rounded hover:bg-blue-600 text-[6px]"
        onClick={() => handleDownload(file)}
      >
        Download
      </button>
      <button
        className="px-1 py-0  text-green-400  rounded hover:bg-green-600 text-[6px]"
        onClick={() => openViewer(file)}
      >
        View
      </button>
      <button
        className="px-1 py-0 text-red-400 rounded hover:bg-red-600 text-[6px]"
        onClick={() => handleDelete(activeTab, idx)}
        disabled={isRestrictedTab}
      >
        Delete
      </button>
    </div>
  </div>
);

                })}
              </div>
            )}

            <div
              className="flex flex-col items-center justify-center bg-black border-2 border-dashed border-[#6a7257] rounded-xl min-h:[140px] min-h-[140px] cursor-pointer transition hover:border-white w-full"
              onClick={handleDropBoxClick}
              onDrop={e => !isRestrictedTab && handleDrop(e, activeTab)}
              onDragOver={handleDragOver}
              tabIndex={0}
              title={isRestrictedTab ? "Permissions required" : `Drop files here to upload to ${activeTab}`}
            >
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileInputChange} disabled={isRestrictedTab} />
              <div className="flex flex-col items-center justify-center">
                <svg width="42" height="42" viewBox="0 0 48 48" fill="none" className="mb-1">
                  <rect x="4" y="4" width="40" height="40" rx="8" fill="#23291c" stroke="#6a7257" strokeWidth="2" />
                  <path d="M24 14v16m0 0l-6-6m6 6l6-6" stroke="#6a7257" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="block text-white text-[1rem] font-bold mb-0 text-center">Drag & Drop or Click to Find File</span>
                <span className="block text-gray-400 text-[0.8rem] text-center leading-tight">
                  {isRestrictedTab ? "You do not have permission to upload files" : `Upload ${activeTab}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {viewingFile && (
          <div className="fixed inset-0 z-[60] bg-black bg-opacity-90 flex items-center justify-center">
            <div className="relative bg-[#141717] rounded-2xl border-2 border-[#6a7257] p-8 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
              <button className="absolute top-2 right-4 text-2xl text-white hover:text-red-400 font-bold" onClick={closeViewer}>×</button>
              <div className="text-white font-bold mb-4">{viewingFile.filename}</div>
              <div className="flex-1 overflow-auto w-full flex items-center justify-center" style={{minHeight:200}}>
                {isImageFile(viewingFile.filename) && viewUrl && <img src={viewUrl} alt="View" className="max-h-[70vh] rounded" />}
                {isPDFFile(viewingFile.filename) && viewUrl && <embed src={viewUrl} type="application/pdf" width="100%" height="520px" />}
                {isTextFile(viewingFile.filename) && viewContent && <pre className="text-white text-xs whitespace-pre-wrap max-h:[60vh] max-h-[60vh] w-full">{viewContent}</pre>}
                {!isImageFile(viewingFile.filename) && !isPDFFile(viewingFile.filename) && !isTextFile(viewingFile.filename) && <div className="text-gray-400 text-xs">No preview available for this file type.</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
