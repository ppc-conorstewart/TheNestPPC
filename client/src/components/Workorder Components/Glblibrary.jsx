// ==============================
// FILE: src/components/Workorder Components/Glblibrary.jsx
// ==============================

import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { API } from '../../api';

// ==============================
// ======= INLINE ICONS =========
// ==============================
const FolderIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M10 4a2 2 0 0 1 1.414.586l1 1A2 2 0 0 0 13.828 6H19a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h5z" />
  </svg>
);

// ==============================
// ======= GLB LIBRARY ==========
// ==============================
export default function Glblibrary() {
  // ==============================
  // ======= JOB-DERIVED DATA =====
  // ==============================
  const [folderList, setFolderList] = useState(['Generic']);
  const [selectedFolder, setSelectedFolder] = useState('Generic');
  const [uniqueCustomers, setUniqueCustomers] = useState([]);
  const [inFolder, setInFolder] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch(`${API}/api/jobs`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then(data => {
        if (!mounted) return;
        const filtered = data.filter(
          job => ((job.customer || job.Customer || '').trim().toLowerCase() !== 'monthly totals')
        );
        const folderSet = new Set();
        const customerSet = new Set();
        for (const j of filtered) {
          const c = (j.customer || j.Customer || j.client || '').trim();
          if (c) {
            folderSet.add(c);
            customerSet.add(c);
          }
        }
        setFolderList(['Generic', ...Array.from(folderSet).sort()]);
        setUniqueCustomers(Array.from(customerSet).sort());
      })
      .catch(() => {
        setFolderList(['Generic']);
        setUniqueCustomers([]);
      });
    return () => { mounted = false; };
  }, []);

  // ==============================
  // ======= GLB LIST STATE =======
  // ==============================
  const [glbList, setGlbList] = useState([]);
  const [glbLoading, setGlbLoading] = useState(false);
  const [glbError, setGlbError] = useState(null);

  const [listQuery, setListQuery] = useState('');
  const [listCategory, setListCategory] = useState('');
  const [listActiveOnly, setListActiveOnly] = useState(true);
  const [listPage, setListPage] = useState(1);
  const [listLimit, setListLimit] = useState(20);
  const [listTotal, setListTotal] = useState(0);

  // ==============================
  // ======= GLB UPLOAD STATE =====
  // ==============================
  const [glbName, setGlbName] = useState('');
  const [glbCategory, setGlbCategory] = useState('');
  const [glbFile, setGlbFile] = useState(null);
  const [destType, setDestType] = useState('GENERIC');
  const [destCustomer, setDestCustomer] = useState('');

  // Collapsible upload
  const [uploadOpen, setUploadOpen] = useState(true);

  useEffect(() => {
    if (!inFolder) return;
    if (selectedFolder === 'Generic') {
      setDestType('GENERIC');
      setDestCustomer('');
    } else {
      setDestType('CUSTOMER');
      setDestCustomer(selectedFolder);
    }
  }, [inFolder, selectedFolder]);

  // ==============================
  // ======= GLB: FETCH LIST ======
  // ==============================
  const fetchGlbList = async () => {
    try {
      setGlbLoading(true);
      setGlbError(null);
      const params = {
        query: listQuery || undefined,
        category: listCategory || undefined,
        active: listActiveOnly ? 'true' : undefined,
        page: listPage,
        limit: listLimit,
        dest_type: selectedFolder === 'Generic' ? 'GENERIC' : 'CUSTOMER',
        dest_customer: selectedFolder === 'Generic' ? undefined : selectedFolder
      };
      const { data } = await axios.get(`${API}/api/glb-assets`, { params });
      setGlbList(Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []);
      setListTotal(Number(data?.total || 0));
    } catch (e) {
      setGlbError(e?.message || 'Failed to load assets');
    } finally {
      setGlbLoading(false);
    }
  };

  useEffect(() => {
    if (!inFolder) return;
    fetchGlbList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inFolder, listQuery, listCategory, listActiveOnly, listPage, listLimit, selectedFolder]);

  // ==============================
  // ======= HELPERS ==============
  // ==============================
  const foldersGrid = useMemo(
    () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {folderList.map((name) => (
          <button
            key={name}
            className={`group flex items-center gap-2 border border-[#6a7257] rounded-md px-3 py-2 text-left text-sm hover:bg-[#1a1f14] transition ${
              name === selectedFolder ? 'bg-[#10140c]' : 'bg-black/40'
            }`}
            onClick={() => setSelectedFolder(name)}
            onDoubleClick={() => {
              setSelectedFolder(name);
              setListPage(1);
              setInFolder(true);
            }}
          >
            <span className="text-[#b7c49a] shrink-0">
              <FolderIcon />
            </span>
            <span className="truncate text-white">{name}</span>
          </button>
        ))}
      </div>
    ),
    [folderList, selectedFolder]
  );

  // ==============================
  // ======= GLB: UPLOAD SUBMIT ===
  // ==============================
  const handleSubmitGlb = async e => {
    e.preventDefault();
    if (!glbFile) {
      alert('Please choose a .glb file.');
      return;
    }
    const form = new FormData();
    form.append('name', glbName || glbFile.name.replace(/\.glb$/i, ''));
    if (glbCategory) form.append('category', glbCategory);
    form.append('model', glbFile);
    form.append('dest_type', destType);
    if (destType === 'CUSTOMER') form.append('dest_customer', destCustomer);

    try {
      await axios.post(`${API}/api/glb-assets`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setGlbName('');
      setGlbCategory('');
      setGlbFile(null);
      if (inFolder) await fetchGlbList();
      alert('GLB asset added.');
    } catch (e) {
      alert(e?.response?.data?.message || 'Upload failed.');
    }
  };

  // ==============================
  // ======= RENDER ===============
  // ==============================
  return (
    <div className='flex-1 bg-black/70 border-t border-[#6a7257] flex flex-col overflow-hidden'>
      {/* ==========================
          ======= CONTROLS (TOP) ===
          ========================== */}
      <div className='px-4 py-2.5 flex flex-wrap gap-3 items-center shrink-0 border-b border-[#6a7257]'>
        <div className='flex-1 min-w-[220px]'>
          <label className='block text-[10px] text-[#cfd3c3] mb-0.5'>Search</label>
          <input
            value={listQuery}
            onChange={e => { setListPage(1); setListQuery(e.target.value); }}
            placeholder='Search name, tag…'
            className='w-full px-3 py-1.5 rounded-md bg-[#121212] text-white border border-[#6a7257] outline-none text-xs'
            disabled={!inFolder}
          />
        </div>
        <div className='min-w-[180px]'>
          <label className='block text-[10px] text-[#cfd3c3] mb-0.5'>Category</label>
          <input
            value={listCategory}
            onChange={e => { setListPage(1); setListCategory(e.target.value); }}
            placeholder='Flowcross, Dogbone…'
            className='w-full px-3 py-1.5 rounded-md bg-[#121212] text-white border border-[#6a7257] outline-none text-xs'
            disabled={!inFolder}
          />
        </div>
        <label className='flex items-center gap-2 text-xs'>
          <input
            id='onlyActive'
            type='checkbox'
            checked={listActiveOnly}
            onChange={e => { setListPage(1); setListActiveOnly(e.target.checked); }}
            disabled={!inFolder}
          />
          <span className='text-[#cfd3c3]'>Active only</span>
        </label>
        <div className='ml-auto flex items-center gap-2'>
          <button
            onClick={fetchGlbList}
            className='px-3 py-1.5 border border-[#6a7257] rounded-md bg-black text-[#6a7257] hover:bg-[#444] text-xs'
            disabled={!inFolder}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* ==========================
          ======= UPLOAD (COLLAPSIBLE)
          ========================== */}
      <div className='px-4 pt-1 pb-2 shrink-0'>
        <div className='border border-white rounded-md bg-[#6a7257]/80'>
          <button
            type='button'
            onClick={() => setUploadOpen(o => !o)}
            className='w-full flex items-center justify-between px-3 py-2 border-b border-[#6a7257] text-left'
          >
            <span className='text-black font-bold uppercase text-sm' style={{ fontFamily: 'Punoer, sans-serif' }}>
              Upload GLB Asset
            </span>
            <span className='text-black text-xs'>{uploadOpen ? 'Hide ▲' : 'Show ▼'}</span>
          </button>

          {uploadOpen && (
            <div className='p-3'>
              <form onSubmit={handleSubmitGlb} className='grid grid-cols-1 md:grid-cols-3 gap-2.5'>
                <div>
                  <label className='block text-[10px] text-black font-bold mb-0.5'>Name</label>
                  <input
                    value={glbName}
                    onChange={e => setGlbName(e.target.value)}
                    className='w-full px-3 py-1.5 rounded-md bg-[#121212] text-black border border-black outline-none text-xs'
                  />
                </div>
                <div>
                  <label className='block text-[14px] text-black uppercase font-bold mb-0.5'>Category</label>
                  <input
                    value={glbCategory}
                    onChange={e => setGlbCategory(e.target.value)}
                    placeholder='Flowcross, Dogbone…'
                    className='w-full px-3 py-1.5 rounded-md bg-[#121212] text-black border border-black outline-none text-xs'
                  />
                </div>
                <div>
                  <label className='block text-[10px] font-bold  uppercase text-black mb-0.5'>.glb File</label>
                  <input
                    type='file'
                    accept='.glb'
                    onChange={e => setGlbFile(e.target.files?.[0] || null)}
                    className='block w-full text-[11px] text-black font-bold file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:opacity-90'
                  />
                </div>

                <div className='md:col-span-3'>
                  <div className='flex flex-wrap items-center gap-3'>
                    {!inFolder ? (
                      <>
                        <label className='flex items-center gap-2 text-xs'>
                          <input
                            id='destGeneric'
                            type='radio'
                            name='destType'
                            checked={destType === 'GENERIC'}
                            onChange={() => setDestType('GENERIC')}
                          />
                          <span className='text-black font-bold uppercase'>Generic Folder</span>
                        </label>
                        <label className='flex items-center gap-2 text-xs'>
                          <input
                            id='destCustomer'
                            type='radio'
                            name='destType'
                            checked={destType === 'CUSTOMER'}
                            onChange={() => setDestType('CUSTOMER')}
                          />
                          <span className='text-black font-bold uppercase'>Customer Folder</span>
                        </label>

                        {destType === 'CUSTOMER' && (
                          <select
                            value={destCustomer}
                            onChange={e => setDestCustomer(e.target.value)}
                            className='px-3 py-1.5 rounded-md bg-[#121212] text-white border border-[#6a7257] outline-none text-xs'
                          >
                            <option value=''>Select customer…</option>
                            {uniqueCustomers.map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        )}
                      </>
                    ) : (
                      <div className='text-[#cfd3c3] text-xs'>
                        Uploading to <span className='text-white font-semibold'>{selectedFolder}</span> ({selectedFolder === 'Generic' ? 'GENERIC' : 'CUSTOMER'})
                      </div>
                    )}

                    <button
                      type='submit'
                      className='ml-auto px-4 py-1.5 border border-[#6a7257] rounded-md bg-[#6a7257] text-black font-bold text-xs'
                    >
                      Add GLB Asset
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* ==========================
          ======= FOLDER HEADER (MOVED BELOW UPLOAD)
          ========================== */}
      <div className='px-4 pb-2 shrink-0'>
        <div className='flex items-center gap-2'>
          {inFolder && (
            <button
              onClick={() => { setInFolder(false); setListPage(1); }}
              className='px-2.5 py-1 border border-[#6a7257] rounded-md bg-black text-[#6a7257] hover:bg-[#444] text-xs'
              style={{ fontFamily: 'Punoer, sans-serif' }}
            >
              ← Back
            </button>
          )}
          <div className='text-white font-extrabold text-sm sm:text-base' style={{ fontFamily: 'Punoer, sans-serif' }}>
            {inFolder ? `Folder: ${selectedFolder}` : 'Select a Folder'}
          </div>
        </div>
      </div>

      {/* ==========================
          ======= CONTENT ==========
          ========================== */}
      <div className='flex-1 overflow-auto px-4 pb-2'>
        {!inFolder ? (
          foldersGrid
        ) : (
          <table className='w-full border-collapse text-sm'>
            <tbody>
              {glbLoading && (
                <tr>
                  <td className='border border-[#6a7257] px-3 py-1.5 text-center text-[#cfd3c3]'>
                    Loading…
                  </td>
                </tr>
              )}
              {glbError && !glbLoading && (
                <tr>
                  <td className='border border-[#6a7257] px-3 py-1.5 text-center text-red-400'>
                    {glbError}
                  </td>
                </tr>
              )}
              {!glbLoading && !glbError && glbList.length === 0 && (
                <tr>
                  <td className='border border-[#6a7257] px-3 py-1.5 text-center text-[#cfd3c3]'>
                    No assets found.
                  </td>
                </tr>
              )}
              {!glbLoading && !glbError &&
                glbList.map(item => (
                  <tr key={item.id}>
                    <td className='border border-[#6a7257] px-3 py-1.5 text-white'>
                      {item.name} — {item.category || '-'} — {item.version_label || '-'} —{' '}
                      {item.file_bytes ? `${(item.file_bytes / 1024 / 1024).toFixed(2)} MB` : '-'} —{' '}
                      {item.updated_at ? new Date(item.updated_at).toLocaleString() : '-'} —{' '}
                      {item.is_active ? 'Active' : 'Inactive'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {/* ==========================
            ======= PAGINATION =======
            ========================== */}
        <div className='flex items-center justify-between mt-2'>
          <div className='text-[#cfd3c3] text-xs'>{inFolder && listTotal ? `Total: ${listTotal}` : ''}</div>
          <div className='flex items-center gap-2'>
            <button
              className='px-2.5 py-1.5 border border-[#6a7257] rounded disabled:opacity-50 text-xs'
              disabled={!inFolder || listPage <= 1}
              onClick={() => setListPage(p => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <span className='text-xs text-[#cfd3c3]'>Page {listPage}</span>
            <button
              className='px-2.5 py-1.5 border border-[#6a7257] rounded disabled:opacity-50 text-xs'
              disabled={!inFolder || glbList.length < listLimit}
              onClick={() => setListPage(p => p + 1)}
            >
              Next
            </button>
            <select
              className='ml-2 px-2.5 py-1.5 border border-[#6a7257] bg-black rounded text-xs'
              value={listLimit}
              onChange={e => { setListPage(1); setListLimit(Number(e.target.value)); }}
              disabled={!inFolder}
            >
              {[10, 20, 50, 100].map(n => (
                <option key={n} value={n}>{n}/page</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
