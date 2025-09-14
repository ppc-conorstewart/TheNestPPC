// ==============================
// FILE: src/pages/WorkorderHub.jsx
// ==============================

import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../api';
import Glblibrary from '../components/Workorder Components/Glblibrary';
import WorkorderCard from '../components/Workorder Components/WorkorderCard';
import WorkorderForm from '../components/Workorder Components/WorkorderForm';
import { transformJobToPackage } from '../components/Workorder Components/workorderData';
import { useUser } from '../hooks/useUser';

// ==============================
// ======= LOGOS ================
// ==============================
const slugName = (str='') => str.trim().toLowerCase().replace(/\s+/g, '-');
const customerLogoMap = {
  'generic': '/assets/folders/generic.png',
  'aoc': '/assets/customer-logos/aoc.png',
  'baytex': '/assets/customer-logos/baytex.png',
  'chevron': '/assets/customer-logos/chevron.png',
  'conocophillips': '/assets/customer-logos/conocophillips.png',
  'halo-exploration': '/assets/customer-logos/halo-exploration.png',
  'nuvista': '/assets/customer-logos/nuvista.png',
  'pacific-canbriam': '/assets/customer-logos/pacific-canbriam.png',
  'paramount': '/assets/customer-logos/paramount.png',
  'tourmaline': '/assets/customer-logos/tourmaline.png',
  'true-canadian-kec': '/assets/customer-logos/true-canadian-kec.png',
  'veren': '/assets/customer-logos/veren.png',
  'whitecap': '/assets/customer-logos/whitecap.png',
};
const getCustomerLogo = name =>
  customerLogoMap[slugName(name || 'generic')] || `/assets/customer-logos/${slugName(name || 'generic')}.png`;

// ==============================
// ======= WORKORDER HUB =========
// ==============================
export default function WorkorderHub() {
  // ==============================
  // ======= NAV + GLOBALS ========
  // ==============================
  const navigate = useNavigate();
  const [view, setView] = useState('HUB');
  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState(null);
  const [groupedJobs, setGroupedJobs] = useState({});
  const [tabs, setTabs] = useState([]);
  const [selectedTab, setSelectedTab] = useState('');
  const [draft, setDraft] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { user } = useUser();

  // ==============================
  // ======= DATA FETCH: JOBS =====
  // ==============================
  useEffect(() => {
    fetch(`${API}/api/jobs`, { credentials: 'include' })
      .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`); return res.json(); })
      .then(data => {
        const filtered = data.filter(job => ((job.customer || job.Customer || '').trim().toLowerCase() !== 'monthly totals'));
        const sorted = filtered.slice().sort((a, b) => {
          const aDate = new Date(a.rig_in_date || a.rigInDate || '');
          const bDate = new Date(b.rig_in_date || b.rigInDate || '');
          if (!isNaN(aDate) && !isNaN(bDate)) return aDate - bDate;
          if (!isNaN(aDate)) return -1;
          if (!isNaN(bDate)) return 1;
          return 0;
        });

        const unique = [];
        const seen = new Set();
        for (let job of sorted) {
          const lsd = (job.surface_lsd || job.surfaceLSD || '').trim();
          if (lsd && !seen.has(lsd)) { seen.add(lsd); unique.push(job); }
        }
        setJobs(unique);

        const groups = {};
        unique.forEach(job => {
          const d = new Date(job.rig_in_date || job.rigInDate || ''); if (isNaN(d)) return;
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (!groups[key]) groups[key] = [];
          groups[key].push(job);
        });
        const keys = Object.keys(groups).sort((a, b) => {
          const [ay, am] = a.split('-').map(Number); const [by, bm] = b.split('-').map(Number);
          return ay !== by ? ay - by : am - bm;
        });
        setGroupedJobs(groups);
        const nowKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
        setSelectedTab(keys.includes(nowKey) ? nowKey : keys[0] || '');
        setTabs(keys);
      })
      .catch(err => setError(err));
  }, [API]);

  // ==============================
  // ======= HELPERS ==============
  // ==============================
  const getMonthYear = ym => {
    const [y, m] = ym.split('-').map(Number);
    return new Date(y, m - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  };
  const slug = (str='') => str.trim().replace(/\s+/g, '-');
  const getRevisionLabel = (job) => {
    const customer = (job.customer || job.Customer || job.client || '').trim();
    const lsd = (job.surface_lsd || job.surfaceLSD || job.lsd || '').trim();
    const key = `workorderProgress_${slug(customer)}_${lsd}`;
    return localStorage.getItem(key) ? 'REV - A' : 'N/A';
  };

  // ==============================
  // ======= VISIBLE JOBS =========
  // ==============================
  const visibleJobs = useMemo(() => {
    const base = groupedJobs[selectedTab] || [];
    const term = search.trim().toLowerCase();
    return base.filter(job => {
      const customer = (job.customer || job.Customer || job.client || '').toLowerCase();
      const lsd = (job.surface_lsd || job.surfaceLSD || job.lsd || '').toLowerCase();
      const matchesSearch = term === '' || customer.includes(term) || lsd.includes(term);
      const rev = getRevisionLabel(job);
      const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'NA' && rev === 'N/A') || (statusFilter === 'REVA' && rev === 'REV - A');
      return matchesSearch && matchesStatus;
    });
  }, [groupedJobs, selectedTab, search, statusFilter]);

  // ==============================
  // ======= START / REMOVE =======
  // ==============================
  const handleStartWorkorder = job => {
    const pkg = { ...transformJobToPackage(job), id: job.id };
    setDraft(pkg);
    const customer = (job.customer || job.Customer || job.client || '').trim();
    const lsd = (job.surface_lsd || job.surfaceLSD || job.lsd || '').trim();
    localStorage.setItem(`workorderLastUpdated_${slug(customer)}_${lsd}`, new Date().toISOString());
  };

  const handleRemoveWorkorder = async job => {
    const customer = (job.customer || job.Customer || job.client || '').trim();
    const surfaceLSD = (job.surface_lsd || job.surfaceLSD || job.lsd || '').trim();

    const progressKey = `workorderProgress_${slug(customer)}_${surfaceLSD}`;
    const woDraftKey = `workorder_${slug(customer)}_${surfaceLSD}`;
    localStorage.removeItem(progressKey);
    localStorage.removeItem(woDraftKey);
    localStorage.removeItem(`workorderLastUpdated_${slug(customer)}_${surfaceLSD}`);

    try {
      const userId = user?.id || 'GUEST';
      await axios.delete(`${API}/api/drafts`, { params: { user_id: userId, page_key: `${woDraftKey}` } });

      if (job.id) {
        const { data: list } = await axios.get(`${API}/api/workorders`, { params: { job_id: job.id } });
        if (Array.isArray(list) && list.length > 0) {
          const latest = list[0];
          await axios.delete(`${API}/api/workorders/${latest.id}`);
        }
      }
    } catch (err) {
      console.error('Could not delete server draft or remove workorder', err);
    }

    const pkg = transformJobToPackage(job);
    if (draft && draft.lsd === pkg.lsd && draft.customer === pkg.customer) {
      setDraft(null);
    }
  };

  // ==============================
  // ======= DRAFT VIEW ===========
  // ==============================
  if (error) {
    return (
      <div className="relative min-h-screen bg-[#6a7257] p-6 text-red-500">
        <h1 className="text-3xl font-extrabold text-black text-center">WORKORDER HUB</h1>
        <p>Error fetching jobs: {error.message}</p>
      </div>
    );
  }

  if (jobs === null) {
    return (
      <div
        className="relative min-h-screen p-6 pl-10 text-white"
        style={{ backgroundImage: "url('/assets/dark-bg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}
      >
        <button onClick={() => navigate(-1)} className="absolute top-3 left-3 px-2 py-1 bg-[#6a7257] text-black font-bold rounded-md">← Back</button>
        <h1 className="text-3xl font-extrabold text-white text-center mb-3">WORKORDER HUB</h1>
        <p>Loading jobs…</p>
      </div>
    );
  }

  if (draft) {
    return (
      <div className="min-h-screen w-full bg-black">
        <WorkorderForm
          initialData={{ ...draft, id: draft.id }}
          onClose={() => setDraft(null)}
        />
      </div>
    );
  }

  // ==============================
  // ======= MAIN RENDER ==========
  // ==============================
  return (
    <div
      className="relative w-full min-h-screen p-3 text-white"
      style={{ backgroundImage: "url('/assets/dark-bg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}
    >
      <div className="h-full border border-[#6a7257] bg-black/60 rounded-md overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="px-4 py-0 border-b border-[#6a7257] bg-black/80 flex items-center justify-between shrink-0" style={{ fontFamily: 'Punoer, sans-serif' }}>
          <div className="flex items-center gap-0">
            <img
              src="/assets/Paloma_Logo_White_Rounded3.png"
              alt="Paloma"
              className="h-24 w-56 object-contain"
              draggable={false}
            />
            <h1 className="uppercase tracking-wide text-center text-white font-extrabold text-4xl">Workorder Hub</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView('HUB')}
              className={`px-3 py-1.5 border rounded-md text-sm font-bold ${view === 'HUB' ? 'bg-[#6a7257] text-black border-[#6a7257]' : 'bg-black text-[#6a7257] border-[#6a7257]'}`}
              title="Workorders"
            >
              Workorders
            </button>
            <button
              onClick={() => setView('GLB')}
              className={`px-3 py-1.5 border rounded-md text-sm font-bold ${view === 'GLB' ? 'bg-[#6a7257] text-black border-[#6a7257]' : 'bg-black text-[#6a7257] border-[#6a7257]'}`}
              title="GLB Asset Library"
            >
              GLB Asset Library
            </button>
          </div>
        </div>

        {/* HUB VIEW */}
        {view === 'HUB' && (
          <div className="flex-1 overflow-auto">
            <div className="border-b border-[#6a7257] bg-black/70">
              <div className="p-2 flex flex-wrap gap-2 justify-center">
                {tabs.map(key => {
                  const [y, m] = key.split('-').map(Number);
                  const now = new Date();
                  const isPast = y < now.getFullYear() || (y === now.getFullYear() && m < now.getMonth() + 1);
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedTab(key)}
                      className={`
                        px-3 py-1.5 border border-[#6a7257] rounded-md text-sm
                        ${key === selectedTab ? 'bg[#6a7257] text-black' : 'bg-black text-[#6a7257] hover:bg-[#444]'}
                        ${isPast && key !== selectedTab ? 'opacity-50 text-gray-400 hover:opacity-80' : ''}
                        transition
                      `.replace('bg[#6a7257]', 'bg-[#6a7257]')}
                      style={{ fontFamily: 'Punoer, sans-serif' }}
                    >
                      {getMonthYear(key)}
                    </button>
                  );
                })}
              </div>

              <div className="px-3 pb-3 flex flex-wrap items-center justify-between gap-2">
                <input
                  type="text"
                  placeholder="Search customer or LSD…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full sm:w-[320px] px-3 py-1.5 rounded-md bg-[#121212] text-white border border-[#6a7257] outline-none focus:ring-1 focus:ring-[#6a7257] text-sm"
                />
                <div className="flex items-center gap-2">
                  <label className="text-[#cfd3c3] text-sm">Status:</label>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-md bg-[#121212] text-white border border-[#6a7257] outline-none text-sm"
                  >
                    <option value="ALL">All</option>
                    <option value="REVA">REV - A</option>
                    <option value="NA">N/A</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-black text-[#6a7257]">
                    <th className="border border-[#6a7257] px-2.5 py-1.5">Logo</th>
                    <th className="border border-[#6a7257] px-2.5 py-1.5">Customer</th>
                    <th className="border border-[#6a7257] px-2.5 py-1.5">Wells</th>
                    <th className="border border-[#6a7257] px-2.5 py-1.5">LSD</th>
                    <th className="border border-[#6a7257] px-2.5 py-1.5">Rig-in Date</th>
                    <th className="border border-[#6a7257] px-2.5 py-1.5">Month</th>
                    <th className="border border-[#6a7257] px-2.5 py-1.5">Current Workorder</th>
                    <th className="border border-[#6a7257] px-2.5 py-1.5">Last Updated</th>
                    <th className="border border-[#6a7257] px-2.5 py-1.5">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleJobs.map(job => (
                    <WorkorderCard
                      key={job.id || job.surface_lsd}
                      job={job}
                      onStart={handleStartWorkorder}
                      onEdit={handleStartWorkorder}
                      onSubmit={handleStartWorkorder}
                      onRemove={handleRemoveWorkorder}
                      asTableRow
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* GLB LIBRARY VIEW */}
        {view === 'GLB' && (
          <Glblibrary />
        )}
      </div>
    </div>
  );
}
