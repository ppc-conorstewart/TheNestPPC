// src/components/Workorder Components/WorkorderCard.jsx

import { useEffect, useMemo, useState } from 'react';

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

  // Helpers
  const slug = (s='') => s.trim().replace(/\s+/g, '-');

  // Logo
  const logoFilename = customer.toLowerCase().replace(/[^a-z0-9]/g, '');
  const logoSrc = `/assets/logos/${logoFilename}.png`;

  // Wells
  const wellsRaw = job.num_wells ?? job.numberOfWells;
  const wells =
    wellsRaw != null && !isNaN(Number(wellsRaw))
      ? Math.round(Number(wellsRaw))
      : 'N/A';

  // Dates / labels
  const date = job.rig_in_date || job.rigInDate || 'N/A';
  const monthText = isNaN(Date.parse(date))
    ? 'N/A'
    : new Date(date).toLocaleString('default', { month: 'long', year: 'numeric' });

  const storageKey = `workorderProgress_${slug(customer)}_${surfaceLSD}`;
  const [inProgress, setInProgress] = useState(!!localStorage.getItem(storageKey));
  const revisionLabel = inProgress ? 'REV - A' : 'N/A';

  // Last updated: prefer server field; fallback to localStorage
  const lastUpdatedKey = `workorderLastUpdated_${slug(customer)}_${surfaceLSD}`;
  const lastUpdated = useMemo(() => {
    const server = job.updated_at || job.updatedAt || job.modified_at || job.modifiedAt;
    if (server) return server;
    return localStorage.getItem(lastUpdatedKey) || '';
  }, [job, lastUpdatedKey]);

  const formatDT = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d)) return '—';
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  useEffect(() => {
    setInProgress(!!localStorage.getItem(storageKey));
  }, [storageKey]);

  const stampUpdate = () => {
    const now = new Date().toISOString();
    localStorage.setItem(lastUpdatedKey, now);
  };

  const handleStartClick = () => {
    localStorage.setItem(storageKey, 'in-progress');
    setInProgress(true);
    stampUpdate();
    onStart(job);
  };

  const handleEditClick = () => {
    stampUpdate();
    onEdit(job);
  };

  const handleRemoveClick = () => {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(lastUpdatedKey);
    setInProgress(false);
    onRemove(job);
  };

  const handleSubmitClick = () => {
    stampUpdate();
    onSubmit(job);
  };

  if (asTableRow) {
    return (
      <tr className="odd:bg-[#1a1a1a] even:bg-[#111] text-white hover:bg-[#1f1f1f] transition">
        <td className="border border-[#6a7257] px-3 py-2 text-center bg-white">
          {customer && (
            <img
              src={logoSrc}
              alt={`${customer} logo`}
              className="h-9 mx-auto object-contain"
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
          )}
        </td>
        <td className="border border-[#6a7257] px-3 py-2 font-bold uppercase">{customer || 'Unknown'}</td>
        <td className="border border-[#6a7257] px-3 py-2 text-center">{wells}</td>
        <td className="border border-[#6a7257] px-3 py-2 text-center">{surfaceLSD || 'N/A'}</td>
        <td className="border border-[#6a7257] px-3 py-2 text-center">{date}</td>
        <td className="border border-[#6a7257] px-3 py-2 text-center">{monthText}</td>
        <td className="border border-[#6a7257] px-3 py-2 text-center">
          <span className={revisionLabel === 'REV - A' ? 'text-yellow-400 font-bold' : ''}>
            {revisionLabel}
          </span>
        </td>
        <td className="border border-[#6a7257] px-3 py-2 text-center">
          {formatDT(lastUpdated)}
        </td>
        <td className="border border-[#6a7257] px-3 py-2">
          {/* 2x2 compact grid for actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={inProgress ? handleEditClick : handleStartClick}
              className={`${inProgress
                ? 'bg-green-600 text-black hover:bg-green-700'
                : 'bg-[#6a7257] text-black hover:bg-[#5c634a]'
                } uppercase font-bold px-2 py-1 rounded-md transition text-xs`}
              title={inProgress ? 'Edit current workorder' : 'Create preliminary workorder'}
            >
              {inProgress ? 'Edit' : 'Create'}
            </button>

            <button
              onClick={handleRemoveClick}
              disabled={!inProgress}
              className={`${inProgress
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-[#333] text-white opacity-50 cursor-not-allowed'
                } uppercase font-bold px-2 py-1 rounded-md transition text-xs`}
              title="Remove current workorder"
            >
              Remove
            </button>

            <button
              onClick={handleSubmitClick}
              disabled={!inProgress}
              className={`${inProgress
                ? 'bg-[#333] text-white hover:bg-[#444]'
                : 'bg-[#333] text-white opacity-50 cursor-not-allowed'
                } uppercase font-bold px-2 py-1 rounded-md transition text-xs`}
              title="Submit to SHOP"
            >
              Submit (Shop)
            </button>

            <div
              className={`uppercase font-bold px-2 py-1 rounded-md text-xs text-center ${
                inProgress ? 'bg-blue-400 text-black' : 'bg-[#333] text-white opacity-50'
              }`}
              title={inProgress ? 'In-progress' : 'No workorder started'}
            >
              {inProgress ? 'In-Progress' : 'Idle'}
            </div>
          </div>
        </td>
      </tr>
    );
  }

  return null;
}
