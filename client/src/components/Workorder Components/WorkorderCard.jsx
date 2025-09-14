// ==============================
// FILE: src/components/Workorder Components/WorkorderCard.jsx
// ==============================

import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { API } from '../../api';

export default function WorkorderCard({
  job,
  onStart,
  onEdit = () => {},
  onSubmit = () => {},
  onRemove = () => {},
  asTableRow = false
}) {
  const customer = (job.customer || job.Customer || job.client || '').trim();
  const surfaceLSD = (job.surface_lsd || job.surfaceLSD || job.lsd || '').trim();

  const slug = (s = '') => s.trim().replace(/\s+/g, '-');
  const logoFilename = customer.toLowerCase().replace(/[^a-z0-9]/g, '');
  const logoSrc = `/assets/logos/${logoFilename}.png`;

  const wellsRaw = job.num_wells ?? job.numberOfWells;
  const wells = wellsRaw != null && !isNaN(Number(wellsRaw)) ? Math.round(Number(wellsRaw)) : 'N/A';

  const date = job.rig_in_date || job.rigInDate || 'N/A';
  const monthText = isNaN(Date.parse(date)) ? 'N/A' : new Date(date).toLocaleString('default', { month: 'long', year: 'numeric' });

  const progressKey = `workorderProgress_${slug(customer)}_${surfaceLSD}`;
  const lastUpdatedKey = `workorderLastUpdated_${slug(customer)}_${surfaceLSD}`;

  const [inProgress, setInProgress] = useState(!!localStorage.getItem(progressKey));
  const [serverHasWO, setServerHasWO] = useState(false);
  const [serverLatestUpdatedAt, setServerLatestUpdatedAt] = useState('');

  useEffect(() => {
    setInProgress(!!localStorage.getItem(progressKey));
  }, [progressKey]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        if (!job?.id) return;
        const { data } = await axios.get(`${API}/api/workorders`, { params: { job_id: job.id } });
        const list = Array.isArray(data) ? data : [];
        if (cancelled) return;
        if (list.length > 0) {
          setServerHasWO(true);
          setServerLatestUpdatedAt(list[0]?.updated_at || list[0]?.updatedAt || '');
        } else {
          setServerHasWO(false);
          setServerLatestUpdatedAt('');
        }
      } catch { /* ignore */ }
    };
    load();
    return () => { cancelled = true; };
  }, [job?.id]);

  const revisionLabel = inProgress || serverHasWO ? 'REV - A' : 'N/A';

  const lastUpdated = useMemo(() => {
    const server = serverLatestUpdatedAt || job.updated_at || job.updatedAt || job.modified_at || job.modifiedAt;
    if (server) return server;
    return localStorage.getItem(lastUpdatedKey) || '';
  }, [serverLatestUpdatedAt, job, lastUpdatedKey]);

  const formatDT = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso); if (isNaN(d)) return '—';
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const stampUpdate = () => {
    const now = new Date().toISOString();
    localStorage.setItem(lastUpdatedKey, now);
  };

  const handleStartClick = () => {
    localStorage.setItem(progressKey, 'in-progress');
    setInProgress(true);
    stampUpdate();
    onStart(job);
  };
  const handleEditClick = () => { stampUpdate(); onEdit(job); };
  const handleRemoveClick = () => {
    localStorage.removeItem(progressKey);
    localStorage.removeItem(lastUpdatedKey);
    setInProgress(false);
    onRemove(job);
  };
  const handleSubmitClick = () => { stampUpdate(); onSubmit(job); };

  if (asTableRow) {
    return (
      <tr className='odd:bg-[#1a1a1a] even:bg-[#111] text-white hover:bg-[#1f1f1f] transition'>
        <td className='border border-[#6a7257] px-3 py-2 text-center bg-white'>
          {customer && (
            <img src={logoSrc} alt={`${customer} logo`} className='h-9 mx-auto object-contain' onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          )}
        </td>
        <td className='border border-[#6a7257] px-3 py-2 font-bold uppercase'>{customer || 'Unknown'}</td>
        <td className='border border-[#6a7257] px-3 py-2 text-center'>{wells}</td>
        <td className='border border-[#6a7257] px-3 py-2 text-center'>{surfaceLSD || 'N/A'}</td>
        <td className='border border-[#6a7257] px-3 py-2 text-center'>{date}</td>
        <td className='border border-[#6a7257] px-3 py-2 text-center'>{monthText}</td>
        <td className='border border-[#6a7257] px-3 py-2 text-center'>
          <span className={revisionLabel === 'REV - A' ? 'text-yellow-400 font-bold' : ''}>{revisionLabel}</span>
        </td>
        <td className='border border-[#6a7257] px-3 py-2 text-center'>{formatDT(lastUpdated)}</td>
        <td className='border border-[#6a7257] px-3 py-2'>
          <div className='grid grid-cols-2 gap-2'>
            <button
              onClick={inProgress || serverHasWO ? handleEditClick : handleStartClick}
              className={`${inProgress || serverHasWO ? 'bg-green-600 text-black hover:bg-green-700' : 'bg-[#6a7257] text.black hover:bg-[#5c634a]'} uppercase font-bold px-2 py-1 rounded-md transition text-xs`}
              title={inProgress || serverHasWO ? 'Edit current workorder' : 'Create preliminary workorder'}
            >
              {inProgress || serverHasWO ? 'Edit' : 'Create'}
            </button>
            <button
              onClick={handleRemoveClick}
              disabled={!inProgress && !serverHasWO}
              className={`${inProgress || serverHasWO ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-[#333] text-white opacity-50 cursor-not-allowed'} uppercase font-bold px-2 py-1 rounded-md transition text-xs`}
              title='Remove current workorder'
            >
              Remove
            </button>
            <button
              onClick={handleSubmitClick}
              disabled={!inProgress && !serverHasWO}
              className={`${inProgress || serverHasWO ? 'bg-[#333] text-white hover:bg-[#444]' : 'bg-[#333] text-white opacity-50 cursor-not-allowed'} uppercase font-bold px-2 py-1 rounded-md transition text-xs`}
              title='Submit to SHOP'
            >
              Submit (Shop)
            </button>
            <div className={`uppercase font-bold px-2 py-1 rounded-md text-xs text-center ${inProgress || serverHasWO ? 'bg-blue-400 text-black' : 'bg-[#333] text-white opacity-50'}`} title={inProgress || serverHasWO ? 'In-progress' : 'No workorder started'}>
              {inProgress || serverHasWO ? 'In-Progress' : 'Idle'}
            </div>
          </div>
        </td>
      </tr>
    );
  }
  return null;
}
