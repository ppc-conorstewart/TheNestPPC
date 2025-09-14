// ===================
// FILE: src/pages/JobPlannerComponents/TableView.jsx
// ===================

// =================== Imports • Constants • Icons ===================
import { Player } from '@lottiefiles/react-lottie-player';
import React, { useEffect, useRef, useState } from 'react';
import AddIcon from '../../assets/Fly-HQ Icons/AddIcon.json';
import JobPlannerDocumentHubIcon from '../../assets/Fly-HQ Icons/JobPlannerDocumentHubIcon.json';
import AuditChecklistModal from '../../components/AuditChecklistModal';
import DiscordIDModal from '../../components/JobPlannerComponents/DiscordIDModal';

// =================== Row Status Styles (Unified Text Size) ===================
const BASE_TEXT = 'text-[0.65rem]';
const STATUS_STYLES = {
  'in-progress': {
    row: 'bg-green-950 hover:bg-green-900',
    border: 'border-l-4 border-green-500',
    text: `${BASE_TEXT} text-white`
  },
  'completed': {
    row: 'bg-red-950 hover:bg-red-900',
    border: 'border-l-4 border-red-500',
    text: `${BASE_TEXT} text-white`
  },
  'not-locked': {
    row: 'bg-yellow-900 hover:bg-yellow-800',
    border: 'border-l-4 border-yellow-400',
    text: `${BASE_TEXT} text-black`
  },
  default: {
    row: 'bg-[#171718] hover:bg-[#232429]',
    border: 'border-l-8 border-transparent',
    text: `${BASE_TEXT} text-white`
  }
};

// =================== Discord Icon ===================
const DiscordIcon = ({ channelId }) => (
  <div className='flex items-center justify-center gap-1'>
    <a
      href={`https://discord.com/channels/@me/${channelId}`}
      target='_blank'
      rel='noopener noreferrer'
      title='Open Discord Channel'
      className='flex items-center justify-center'
      style={{ minHeight: 0, minWidth: 0 }}
    >
      <img
        src='/assets/discord.png'
        alt='Discord'
        style={{
          width: 24,
          height: 20,
          filter:
            'brightness(0) saturate(80%) invert(55%) sepia(64%) saturate(645%) hue-rotate(78deg) brightness(101%) contrast(95%)'
        }}
      />
    </a>
  </div>
);

// =================== Pad Checklist Helpers ===================
const CHECKLIST_STORAGE_KEY = 'jobPlanner_padChecklist';
const defaultChecklistFor = (jobId) => ({
  siteVisit: false,
  fieldAudit: false,
  _v: 1,
  jobId
});

const loadChecklistMap = () => {
  try {
    const raw = localStorage.getItem(CHECKLIST_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const saveChecklistMap = (map) => {
  try {
    localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
};

const getProgressPct = (state) => {
  if (!state) return 0;
  const total = 2; // Site Visit + Field Audit
  const done = (state.siteVisit ? 1 : 0) + (state.fieldAudit ? 1 : 0);
  return Math.round((done / total) * 100);
};

// =================== Component ===================
export default function TableView({
  monthGroups,
  isVisible,
  rowStatus,
  unlockedMonths,
  unlockMonth,
  lockMonth,
  handleEdit,
  handleDelete,
  handleSubmitSourcing,
  handleStatusChange,
  handleDeleteAudit,
  formatValue,
  scrollRef,
  showAuditModal,
  setShowAuditModal,
  selectedAuditJob,
  setSelectedAuditJob,
  onShowBOM,
  handleOpenDocHub,
  onDiscordIdUpdated,
  onAddJob // <-- opens JobModal from parent
}) {
  const lottieRefs = useRef({});
  const [showDiscordModal, setShowDiscordModal] = useState(false);
  const [discordModalJob, setDiscordModalJob] = useState(null);
  const [jobsState, setJobsState] = useState({});
  const [collapsed, setCollapsed] = useState({});
  const [activeTabs, setActiveTabs] = useState({}); // { [monthKey]: 'FRAC' | 'MISSILES' }

  // ---- Pad Checklist state ----
  const [checklistMap, setChecklistMap] = useState(() => loadChecklistMap());
  const [openChecklistFor, setOpenChecklistFor] = useState(null); // jobId of popover

  useEffect(() => {
    saveChecklistMap(checklistMap);
  }, [checklistMap]);

  const ensureChecklist = (jobId) => {
    setChecklistMap((prev) => {
      if (prev[jobId]) return prev;
      const next = { ...prev, [jobId]: defaultChecklistFor(jobId) };
      return next;
    });
  };

  const updateChecklist = (jobId, patch) => {
    setChecklistMap((prev) => {
      const base = prev[jobId] || defaultChecklistFor(jobId);
      const next = { ...prev, [jobId]: { ...base, ...patch } };
      return next;
    });
  };

  const toggleMonth = (key) => setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSaveDiscordChannel = async (channelId) => {
    if (!discordModalJob) return;
    const jobId = discordModalJob.id;
    try {
      const res = await fetch(`/api/jobs/${jobId}/discord-channel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discord_channel_id: channelId }),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to update Discord Channel ID');
      setJobsState((prev) => ({ ...prev, [jobId]: { ...discordModalJob, discord_channel_id: channelId } }));
      setShowDiscordModal(false);
      setDiscordModalJob(null);
      if (onDiscordIdUpdated) onDiscordIdUpdated();
    } catch {
      alert('Failed to assign Discord Channel ID. Please try again.');
    }
  };

  return (
    <div
      className='w-full rounded-xl shadow-2xl overflow-x-auto'
      style={{ background: '#000', width: '100%', padding: 0, margin: 0 }}
    >
      <div className='overflow-x-auto' style={{ padding: 0, margin: 0, width: '100%' }}>
        <table className='table-auto w-full' style={{ tableLayout: 'auto', width: '100%', margin: 0, padding: 0 }}>
          <tbody>
            {[...monthGroups.entries()].map(([monthKey, monthJobs], idx) => {
              // ----- Per-month tab (FRAC | MISSILES) -----
              const activeTab = activeTabs[monthKey] || 'FRAC';
              const filteredByTab = monthJobs.filter((job) => {
                const prod = String(job.products || '').toUpperCase();
                return activeTab === 'FRAC' ? prod.includes('FRAC') : prod.includes('MISSILE');
              });

              const visibleJobs = filteredByTab.filter(isVisible);
              if (visibleJobs.length === 0) {
                const otherTab = activeTab === 'FRAC' ? 'MISSILES' : 'FRAC';
                const fallback = monthJobs
                  .filter((job) => {
                    const prod = String(job.products || '').toUpperCase();
                    return otherTab === 'FRAC' ? prod.includes('FRAC') : prod.includes('MISSILE');
                  })
                  .filter(isVisible);
                if (fallback.length === 0) return null;
              }

              const totals = visibleJobs.reduce(
                (acc, job) => {
                  acc.num_wells += Number(job.num_wells) || 0;
                  acc.valve_7_1_16 += Number(job.valve_7_1_16) || 0;
                  acc.valve_5_1_8 += Number(job.valve_5_1_8) || 0;
                  acc.valve_hyd += Number(job.valve_hyd) || 0;
                  acc.valve_man += Number(job.valve_man) || 0;
                  acc.gateway_pods += Number(job.gateway_pods) || 0;
                  acc.awc_pods += Number(job.awc_pods) || 0;
                  acc.grease_unit += Number(job.grease_unit) || 0;
                  acc.coil_trees += Number(job.coil_trees) || 0;
                  acc.accumulator += Number(job.accumulator) || 0;
                  acc.techs += Number(job.techs) || 0;
                  return acc;
                },
                {
                  num_wells: 0,
                  valve_7_1_16: 0,
                  valve_5_1_8: 0,
                  valve_hyd: 0,
                  valve_man: 0,
                  gateway_pods: 0,
                  awc_pods: 0,
                  grease_unit: 0,
                  coil_trees: 0,
                  accumulator: 0,
                  techs: 0
                }
              );

              const isEarliest = idx === 0;

              return (
                <React.Fragment key={monthKey}>
                  {/* =================== Month Header Row =================== */}
                  <tr ref={isEarliest ? scrollRef : null}>
                    <td colSpan='23' className='p-0'>
                      <div
                        className='relative w-1/6 bg-gradient-to-r from-[#232429] font-Varien via-[#18181b] to-[#232429] shadow-xl mt-1 mb-0 py-0 px-2 flex items-center border-2 border-b-2 border-white/70'
                        style={{ borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}
                      >
                        <button
                          type='button'
                          onClick={() => toggleMonth(monthKey)}
                          className='flex items-center gap-3 focus:outline-none'
                          title={collapsed[monthKey] ? 'Expand Month' : 'Collapse Month'}
                        >
                          <span
                            className={`text-[#6a7257] text-xl font-Varien uppercase drop-shadow transition-transform ${
                              collapsed[monthKey] ? '' : 'rotate-90'
                            }`}
                            style={{ letterSpacing: '0.6em' }}
                          >
                            ▸
                          </span>
                          <span
                            className='text-left text-xl tracking-widest font-Varien ml-0 font-extrabold uppercase text-[#6a7257] drop-shadow'
                            style={{ letterSpacing: '0.1em' }}
                          >
                            {monthKey}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* =================== Product Tabs + Add Button Row =================== */}
                  {!collapsed[monthKey] && (
                    <tr>
                      <td colSpan='23' className='p-0'>
                        <div className='w-full bg-black border-y-2 border-white/70 py-1'>
                          <div className='flex items-center justify-start gap-3 px-0'>
                            {/* LEFT: Tabs — styled like the Add New Job button */}
                            <div className='flex items-center gap-2'>
                              {['FRAC', 'MISSILES'].map((tab) => {
                                const selected = activeTab === tab;
                                return (
                                  <button
                                    key={tab}
                                    onClick={() => setActiveTabs((prev) => ({ ...prev, [monthKey]: tab }))}
                                    title={tab === 'FRAC' ? 'Frac Stack' : 'Missiles'}
                                    className={[
                                      'flex items-center justify-center',
                                      'uppercase font-erbaum font-extrabold tracking-[0.22em]',
                                      'px-2 py-1.5 rounded',
                                      'border border-[#6a7257]',
                                      'transition',
                                      selected ? 'bg-[#6a7257] text-black' : 'bg-black text-white hover:bg-zinc-900'
                                    ].join(' ')}
                                    style={{ fontSize: '.8rem', lineHeight: 1 }}
                                  >
                                    {tab === 'FRAC' ? 'FRAC STACK' : 'MISSILES'}
                                  </button>
                                );
                              })}
                            </div>

                            {/* RIGHT: Add New Job (per month) — FlyHQ style, opens JobModal via onAddJob */}
                            <button
                              onClick={() => onAddJob && onAddJob()}
                              aria-label='Add New Job'
                              title='Add New Job'
                              className='bg-black text-white uppercase border border-[#6a7257] rounded hover:bg-zinc-900 transition flex items-center justify-center gap-2 px-2 py-1'
                              style={{ lineHeight: 1, fontSize: '.8rem', fontWeight: 700 }}
                            >
                              <Player autoplay={false} loop src={AddIcon} style={{ height: 20, width: 20 }} />
                              + Add New Job
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* =================== Column Headers =================== */}
                  {!collapsed[monthKey] && (
                    <tr className='bg-[#232429] border-b-2 border-white/70 text-white'>
                      {[
                        'Customer',
                        'LSD',
                        'Product(s)',
                        'Rig-In',
                        'Start',
                        'End',
                        '# Wells',
                        `7-1/16" Valves`,
                        `5-1/8" Valves`,
                        `3-1/16" HYD`,
                        `3-1/16" MAN`,
                        'Gateway Pods',
                        'AWC',
                        'Grease',
                        'Coil Trees',
                        'Accum',
                        'Techs',
                        'Work Orders',
                        'Document Hub',
                        'Discord ID:'
                      ].map((header) => (
                        <th
                          key={header}
                          className={`px-2 py-1 border border-white/70 text-center uppercase tracking-wide ${BASE_TEXT}`}
                        >
                          {header}
                        </th>
                      ))}
                      <th className={`px-2 py-1 border border-white/70 text-center uppercase tracking-wide ${BASE_TEXT}`}>
                        Checklist
                      </th>
                      <th className={`px-2 py-1 border border-white/70 text-center uppercase tracking-wide ${BASE_TEXT}`}>
                        Actions
                      </th>
                    </tr>
                  )}

                  {/* =================== Job Rows =================== */}
                  {!collapsed[monthKey] &&
                    visibleJobs.map((job, idx2) => {
                      const localStatus = rowStatus?.[job.id];
                      const serverStatus = job.status || '';
                      const baseStatus = localStatus ?? serverStatus;
                      let effectiveStatus = baseStatus || 'default';

                      if ((localStatus === undefined || localStatus === null) && serverStatus === 'not-locked') {
                        effectiveStatus = 'default';
                      }

                      const styleObj = STATUS_STYLES[effectiveStatus] || STATUS_STYLES.default;
                      const rowClass = `${styleObj.row} ${styleObj.border} group`;
                      const textClass = styleObj.text || STATUS_STYLES.default.text;

                      let revLabel = null;
                      let hasBOM = false;
                      let bomObj = null;
                      if (job.work_orders) {
                        try {
                          bomObj = typeof job.work_orders === 'object' ? job.work_orders : JSON.parse(job.work_orders);
                          revLabel = bomObj.revision ? `REV-${bomObj.revision}` : null;
                          hasBOM = !!bomObj.bom;
                        } catch {
                          revLabel = null;
                          hasBOM = false;
                        }
                      }

                      const lottieKey = job.id || `${monthKey}_${idx2}`;
                      if (!lottieRefs.current[lottieKey]) {
                        lottieRefs.current[lottieKey] = React.createRef();
                      }

                      const jobRow = jobsState[job.id] ? { ...job, ...jobsState[job.id] } : job;

                      // Ensure checklist object exists for this row (lazy-init)
                      const checklist = checklistMap[job.id] || defaultChecklistFor(job.id);
                      const pct = getProgressPct(checklist);
                      const radius = 22;
                      const stroke = 5;
                      const normalizedRadius = radius - stroke / 2;
                      const circumference = normalizedRadius * 2 * Math.PI;
                      const strokeDashoffset = circumference - (pct / 100) * circumference;

                      return (
                        <tr key={job.id} className={rowClass}>
                          <td className={`px-1 py-0 border border-[#6a7257] rounded font-bold text-grey bg-white ${BASE_TEXT}`}>
                            <div className='flex flex-col items-center'>
                              <img
                                src={`/assets/logos/${job.customer.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`}
                                alt={`${job.customer} logo`}
                                className='h-10 w-28 object-contain drop-shadow-xl rounded-md hover:scale-110 transition-transform duration-300'
                                style={{ background: '#fff', padding: 0, borderRadius: 8 }}
                                onError={(e) => (e.currentTarget.style.display = 'none')}
                              />
                            </div>
                          </td>
                          <td className={`px-2 py-0 border border-[#232429] text-center font-medium ${textClass}`}>
                            {job.surface_lsd || '-'}
                          </td>
                          <td className={`px-2 py-0 border border-[#232429] text-center font-medium ${textClass}`}>
                            {job.products || '-'}
                          </td>
                          <td className={`px-2 py-0 border border-[#232429] text-center font-medium ${textClass}`}>
                            {job.rig_in_date || '-'}
                          </td>
                          <td className={`px-2 py-0 border border-[#232429] text-center font-medium ${textClass}`}>
                            {job.start_date || '-'}
                          </td>
                          <td className={`px-2 py-0 border border-[#232429] text-center font-medium ${textClass}`}>
                            {job.end_date || '-'}
                          </td>
                          <td className={`px-2 py-0 border border-[#232429] text-center font-medium ${textClass}`}>
                            {formatValue(job.num_wells)}
                          </td>
                          <td className={`px-2 py-0 border border-[#232429] text-center font-medium ${textClass}`}>
                            {formatValue(job.valve_7_1_16)}
                          </td>
                          <td className={`px-2 py-0 border border-[#232429] text-center font-medium ${textClass}`}>
                            {formatValue(job.valve_5_1_8)}
                          </td>
                          <td className={`px-2 py-0 border border-[#232429] text-center font-medium ${textClass}`}>
                            {formatValue(job.valve_hyd)}
                          </td>
                          <td className={`px-2 py-0 border border-[#232429] text-center font-medium ${textClass}`}>
                            {formatValue(job.valve_man)}
                          </td>
                          <td className={`px-2 py-0 border border-[#232429] text-center font-medium ${textClass}`}>
                            {formatValue(job.gateway_pods)}
                          </td>
                          <td className={`px-2 py-0 border border-[#232429] text-center font-medium ${textClass}`}>
                            {formatValue(job.awc_pods)}
                          </td>
                          <td className={`px-2 py-0 border border-[#232429] text-center font-medium ${textClass}`}>
                            {formatValue(job.grease_unit)}
                          </td>
                          <td className={`px-2 py-0 border border-[#232429] text-center font-medium ${textClass}`}>
                            {formatValue(job.coil_trees)}
                          </td>
                          <td className={`px-2 py-0 border border-[#232429] text-center font-medium ${textClass}`}>
                            {formatValue(job.accumulator)}
                          </td>
                          <td className={`px-2 py-0 border border-[#232429] text-center font-medium ${textClass}`}>
                            {formatValue(job.techs)}
                          </td>
                          <td className='px-2 py-0 border border-[#232429] text-center'>
                            {(() => {
                              let label = null;
                              let has = false;
                              let obj = null;
                              if (job.work_orders) {
                                try {
                                  obj = typeof job.work_orders === 'object' ? job.work_orders : JSON.parse(job.work_orders);
                                  label = obj.revision ? `REV-${obj.revision}` : null;
                                  has = !!obj.bom;
                                } catch { /* ignore */ }
                              }
                              return has && label ? (
                                <button
                                  className={`px-2 py-0 rounded bg-[#363a44] text-white font-bold uppercase hover:bg-[#42444a] shadow ${BASE_TEXT}`}
                                  onClick={() => onShowBOM(job, obj)}
                                >
                                  {label}
                                </button>
                              ) : (
                                <span className={`${BASE_TEXT} text-gray-600`}>—</span>
                              );
                            })()}
                          </td>
                          <td className='border border-[#232429] text-center align-middle p-0'>
                            <button
                              title='Open Document Hub'
                              onClick={() => handleOpenDocHub(job)}
                              className='w-full h-full flex items-center justify-center focus:outline-none hover:bg-[#363a44]/40 transition'
                              style={{ minHeight: 0, minWidth: 0 }}
                              onMouseEnter={() => {
                                const ref = lottieRefs.current[lottieKey];
                                if (ref && ref.current) ref.current.play();
                              }}
                              onMouseLeave={() => {
                                const ref = lottieRefs.current[lottieKey];
                                if (ref && ref.current) {
                                  ref.current.stop();
                                  ref.current.setSeeker(0);
                                }
                              }}
                            >
                              <Player
                                ref={lottieRefs.current[lottieKey]}
                                src={JobPlannerDocumentHubIcon}
                                style={{ width: 36, height: 36 }}
                                loop
                                autoplay={false}
                              />
                            </button>
                          </td>
                          <td className='border border-[#232429] text-center align-middle p-0'>
                            {jobRow.discord_channel_id ? (
                              <DiscordIcon channelId={jobRow.discord_channel_id} />
                            ) : (
                              <button
                                title='Assign Discord Channel'
                                className='w-full h-full flex items-center justify-center text-white hover:text-green-500 text-2xl font-bold'
                                style={{ minHeight: 0, minWidth: 0, lineHeight: 1 }}
                                onClick={() => {
                                  setDiscordModalJob(job);
                                  setShowDiscordModal(true);
                                }}
                              >
                                +
                              </button>
                            )}
                          </td>

                          {/* =================== Pad Checklist (Circular Progress + Popover) =================== */}
                          <td className='px-2 py-1 border border-[#232429] text-center relative'>
                            <div
                              className='mx-auto w-12 h-12 cursor-pointer select-none'
                              title='Pad Checklist Progress'
                              onClick={() => {
                                ensureChecklist(job.id);
                                setOpenChecklistFor((prev) => (prev === job.id ? null : job.id));
                              }}
                            >
                              <svg height='48' width='48'>
                                <circle
                                  stroke='#2a2d33'
                                  fill='transparent'
                                  strokeWidth={stroke}
                                  r={normalizedRadius}
                                  cx='24'
                                  cy='24'
                                />
                                <circle
                                  stroke='#00ff00ff'
                                  fill='transparent'
                                  strokeWidth={stroke}
                                  strokeLinecap='round'
                                  r={normalizedRadius}
                                  cx='24'
                                  cy='24'
                                  style={{
                                    transform: 'rotate(-90deg)',
                                    transformOrigin: '50% 50%',
                                    strokeDasharray: `${circumference} ${circumference}`,
                                    strokeDashoffset
                                  }}
                                />
                                <text
  x='50%'
  y='50%'
  dominantBaseline='middle'
  textAnchor='middle'
  fontSize='10'
  fontFamily='Erbaum, sans-serif'
  fontWeight='700'
  fill='#ffffff'
  style={{ paintOrder: 'stroke', stroke: '#000', strokeWidth: 1 }}
>
  {pct}%
</text>

                              </svg>
                            </div>

                            {openChecklistFor === job.id && (
                              <div
                                className='absolute z-20 bg-black border border-[#6a7257] rounded shadow-xl p-2 text-left'
                                style={{ width: 200, top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 6 }}
                              >
                                <div className='flex items-center justify-between mb-1'>
                                  <span className='uppercase font-erbaum text-xs text-[#6a7257]'>Pad Checklist</span>
                                  <button
                                    className='text-xs text-white hover:text-red-500'
                                    onClick={() => setOpenChecklistFor(null)}
                                  >
                                    ✕
                                  </button>
                                </div>
                                <label className='flex items-center gap-2 text-white text-xs py-1'>
                                  <input
                                    type='checkbox'
                                    checked={!!(checklist.siteVisit)}
                                    onChange={(e) => updateChecklist(job.id, { siteVisit: e.target.checked })}
                                  />
                                  <span>Site Visit</span>
                                </label>
                                <label className='flex items-center gap-2 text-white text-xs py-1'>
                                  <input
                                    type='checkbox'
                                    checked={!!(checklist.fieldAudit)}
                                    onChange={(e) => updateChecklist(job.id, { fieldAudit: e.target.checked })}
                                  />
                                  <span>Field Audit</span>
                                </label>
                                <div className='mt-2 text-right'>
                                  <button
                                    className='text-[0.6rem] px-2 py-0.5 border border-[#6a7257] rounded text-[#6a7257] uppercase font-erbaum'
                                    onClick={() => setOpenChecklistFor(null)}
                                  >
                                    Close
                                  </button>
                                </div>
                              </div>
                            )}
                          </td>

                          {/* =================== Actions =================== */}
                          <td className='px-2 py-1 border border-[#232429] text-center'>
                            <select
                              defaultValue=''
                              onChange={(e) => {
                                const action = e.target.value;
                                e.target.value = '';
                                if (action === 'edit') handleEdit(job);
                                else if (action === 'delete') handleDelete(job.id);
                                else if (action === 'submitSourcing') handleSubmitSourcing(job);
                                else handleStatusChange(job.id, action);
                              }}
                              className='w-full h-[36px] bg-black border border-[#353a3f] text-white font-bold font-erbaum uppercase rounded text-center whitespace-normal leading-tight flex items-center justify-center text-[0.55rem]'
                            >
                              <option value=''>Action</option>
                              <option value='edit'>Edit</option>
                              <option value='delete'>Delete</option>
                              <option value='submitSourcing'>Submit Sourcing Ticket</option>
                              <option value='in-progress'>In Progress</option>
                              <option value='not-locked'>Not Yet Locked</option>
                              <option value='completed'>Completed</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}

                  {/* =================== Monthly Totals =================== */}
                  {!collapsed[monthKey] && (
                    <tr className='bg-[#1a1b1f] border-t-2 border-b-2 border-[#232429] text-white font-erbaum font-bold shadow-lg'>
                      <td className={`px-0 py-0 ${BASE_TEXT}`}>Monthly Totals</td>
                      <td colSpan='5' />
                      <td className={`px-2 py-1 text-center ${BASE_TEXT}`}>{totals.num_wells.toFixed(0)}</td>
                      <td className={`px-2 py-1 text-center ${BASE_TEXT}`}>{totals.valve_7_1_16.toFixed(0)}</td>
                      <td className={`px-2 py-1 text-center ${BASE_TEXT}`}>{totals.valve_5_1_8.toFixed(0)}</td>
                      <td className={`px-2 py-1 text-center ${BASE_TEXT}`}>{totals.valve_hyd.toFixed(0)}</td>
                      <td className={`px-2 py-1 text-center ${BASE_TEXT}`}>{totals.valve_man.toFixed(0)}</td>
                      <td className={`px-2 py-1 text-center ${BASE_TEXT}`}>{totals.gateway_pods.toFixed(0)}</td>
                      <td className={`px-2 py-1 text-center ${BASE_TEXT}`}>{totals.awc_pods.toFixed(0)}</td>
                      <td className={`px-2 py-1 text-center ${BASE_TEXT}`}>{totals.grease_unit.toFixed(0)}</td>
                      <td className={`px-2 py-1 text-center ${BASE_TEXT}`}>{totals.coil_trees.toFixed(0)}</td>
                      <td className={`px-2 py-1 text-center ${BASE_TEXT}`}>{totals.accumulator.toFixed(0)}</td>
                      <td className={`px-2 py-1 text-center ${BASE_TEXT}`}>{totals.techs.toFixed(0)}</td>
                      <td colSpan='6' />
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* =================== Modals =================== */}
      {showAuditModal && selectedAuditJob && (
        <AuditChecklistModal
          isOpen={showAuditModal}
          onClose={() => setShowAuditModal(false)}
          jobId={selectedAuditJob.id}
        />
      )}
      {showDiscordModal && discordModalJob && (
        <DiscordIDModal
          isOpen={showDiscordModal}
          onClose={() => setShowDiscordModal(false)}
          onSave={handleSaveDiscordChannel}
        />
      )}
    </div>
  );
}
