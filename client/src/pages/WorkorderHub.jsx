// src/pages/WorkorderHub.jsx

import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../api';
import WorkorderCard from '../components/Workorder Components/WorkorderCard';
import WorkorderForm from '../components/Workorder Components/WorkorderForm';
import { transformJobToPackage } from '../components/Workorder Components/workorderData';
import { useUser } from '../hooks/useUser';

export default function WorkorderHub() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState(null);
  const [groupedJobs, setGroupedJobs] = useState({});
  const [tabs, setTabs] = useState([]);
  const [selectedTab, setSelectedTab] = useState('');
  const [draft, setDraft] = useState(null);

  // UI enhancements
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | NA | REVA
  const { user } = useUser();

  useEffect(() => {
    fetch(`${API}/api/jobs`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then(data => {
        const filtered = data.filter(job => {
          const name = (job.customer || job.Customer || '').trim().toLowerCase();
          return name !== 'monthly totals';
        });
        const sorted = filtered.slice().sort((a, b) => {
          const aDate = new Date(a.rig_in_date || a.rigInDate || '');
          const bDate = new Date(b.rig_in_date || b.rigInDate || '');
          if (!isNaN(aDate) && !isNaN(bDate)) return aDate - bDate;
          if (!isNaN(aDate)) return -1;
          if (!isNaN(bDate)) return 1;
          return 0;
        });

        // unique by surface_lsd/surfaceLSD
        const unique = [];
        const seen = new Set();
        for (let job of sorted) {
          const lsd = (job.surface_lsd || job.surfaceLSD || '').trim();
          if (lsd && !seen.has(lsd)) {
            seen.add(lsd);
            unique.push(job);
          }
        }
        setJobs(unique);

        // group by YYYY-MM
        const groups = {};
        unique.forEach(job => {
          const d = new Date(job.rig_in_date || job.rigInDate || '');
          if (isNaN(d)) return;
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (!groups[key]) groups[key] = [];
          groups[key].push(job);
        });
        const keys = Object.keys(groups).sort((a, b) => {
          const [ay, am] = a.split('-').map(Number);
          const [by, bm] = b.split('-').map(Number);
          return ay !== by ? ay - by : am - bm;
        });
        setGroupedJobs(groups);
        const nowKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
        setSelectedTab(keys.includes(nowKey) ? nowKey : keys[0] || '');
        setTabs(keys);
      })
      .catch(err => setError(err));
  }, []);

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

  // Filtered list for the selected tab
  const visibleJobs = useMemo(() => {
    const base = groupedJobs[selectedTab] || [];
    const term = search.trim().toLowerCase();
    return base.filter(job => {
      const customer = (job.customer || job.Customer || job.client || '').toLowerCase();
      const lsd = (job.surface_lsd || job.surfaceLSD || job.lsd || '').toLowerCase();
      const matchesSearch = term === '' || customer.includes(term) || lsd.includes(term);

      const rev = getRevisionLabel(job);
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'NA' && rev === 'N/A') ||
        (statusFilter === 'REVA' && rev === 'REV - A');

      return matchesSearch && matchesStatus;
    });
  }, [groupedJobs, selectedTab, search, statusFilter]);

  const handleStartWorkorder = job => {
    const pkg = { ...transformJobToPackage(job), id: job.id };
    setDraft(pkg);
    // mark a local "last updated" time (first touch)
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
      await axios.delete(`${API}/api/drafts`, {
        params: { user_id: userId, page_key: woDraftKey }
      });
      if (job.id) {
        await axios.put(`${API}/api/jobs/${job.id}`, { work_orders: '' });
      }
    } catch (err) {
      console.error('Could not delete server draft or clear work_orders', err);
    }

    const pkg = transformJobToPackage(job);
    if (draft && draft.lsd === pkg.lsd && draft.customer === pkg.customer) {
      setDraft(null);
    }
  };

  if (error) {
    return (
      <div className="relative min-h-screen bg-[#6a7257] p-8 text-red-500">
        <h1 className="text-4xl font-extrabold text-black text-center">WORKORDER HUB</h1>
        <p>Error fetching jobs: {error.message}</p>
      </div>
    );
  }

  if (jobs === null) {
    return (
      <div
        className="relative min-h-screen p-8 pl-12 text-white"
        style={{
          backgroundImage: "url('/assets/dark-bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 px-3 py-1 bg-[#6a7257] text-black font-bold rounded-md"
        >← Back</button>
        <h1 className="text-4xl font-extrabold text-white text-center mb-4">WORKORDER HUB</h1>
        <p>Loading jobs…</p>
      </div>
    );
  }

  return (
    <div
      className="fixed ml-0 min-h-screen min-w-hidden p-8 pl-12 text-white"
      style={{
        backgroundImage: "url('/assets/dark-bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div style={{ zoom: 0.85, transformOrigin: 'top center' }}>
        <div className="border-2 border-[#6a7257] bg-black/60 rounded-md overflow-hidden">
          {/* Header inside container */}
          <div
            className="px-6 py-5 border-b-2 border-[#6a7257] bg-black/80 text-center"
            style={{ fontFamily: 'varien, sans-serif' }}
          >
            <h1 className="uppercase tracking-wide text-white font-extrabold text-6xl">
              Workorder Hub
            </h1>
          </div>

          {/* Tabs + Search/Filter (kept non-sticky to avoid header overlap issues) */}
          <div className="border-b-2 border-[#6a7257] bg-black/70">
            <div className="p-3 flex flex-wrap gap-2 justify-center">
              {tabs.map(key => {
                const [y, m] = key.split('-').map(Number);
                const now = new Date();
                const isPast =
                  y < now.getFullYear() ||
                  (y === now.getFullYear() && m < now.getMonth() + 1);

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedTab(key)}
                    className={`
                      px-4 py-2 border-2 border-[#6a7257] rounded-md font-medium
                      ${key === selectedTab ? 'bg-[#6a7257] text-black' : 'bg-black text-[#6a7257] hover:bg-[#444]'}
                      ${isPast && key !== selectedTab ? 'opacity-50 text-gray-400 hover:opacity-80' : ''}
                      transition
                    `}
                    style={{ fontFamily: 'varien, sans-serif' }}
                  >
                    {getMonthYear(key)}
                  </button>
                );
              })}
            </div>

            <div className="px-4 pb-4 flex flex-wrap items-center justify-between gap-3">
              <input
                type="text"
                placeholder="Search customer or LSD…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full sm:w-[360px] px-3 py-2 rounded-md bg-[#121212] text-white border border-[#6a7257] outline-none focus:ring-2 focus:ring-[#6a7257]"
              />
              <div className="flex items-center gap-2">
                <label className="text-[#cfd3c3]">Status:</label>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-md bg-[#121212] text-white border border-[#6a7257] outline-none"
                >
                  <option value="ALL">All</option>
                  <option value="REVA">REV - A</option>
                  <option value="NA">N/A</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table (header NOT sticky) */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-black text-[#6a7257]">
                  <th className="border border-[#6a7257] px-3 py-2">Logo</th>
                  <th className="border border-[#6a7257] px-3 py-2">Customer</th>
                  <th className="border border-[#6a7257] px-3 py-2">Wells</th>
                  <th className="border border-[#6a7257] px-3 py-2">LSD</th>
                  <th className="border border-[#6a7257] px-3 py-2">Rig-in Date</th>
                  <th className="border border-[#6a7257] px-3 py-2">Month</th>
                  <th className="border border-[#6a7257] px-3 py-2">Current Workorder</th>
                  <th className="border border-[#6a7257] px-3 py-2">Last Updated</th>
                  <th className="border border-[#6a7257] px-3 py-2">Actions</th>
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
      </div>

      {draft && (
        <WorkorderForm
          initialData={{ ...draft, id: draft.id }}
          onClose={() => setDraft(null)}
        />
      )}
    </div>
  );
}
