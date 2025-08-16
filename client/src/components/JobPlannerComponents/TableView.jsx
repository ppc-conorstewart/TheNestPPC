// =================== Imports and Dependencies ===================
// src/pages/JobPlannerComponents/TableView.jsx

import { Player } from '@lottiefiles/react-lottie-player';
import React, { useRef, useState } from 'react';
import JobPlannerDocumentHubIcon from '../../assets/Fly-HQ Icons/JobPlannerDocumentHubIcon.json';
import AuditChecklistModal from '../../components/AuditChecklistModal';
import DiscordIDModal from '../../components/JobPlannerComponents/DiscordIDModal';

// =================== Row Status Styles ===================
const STATUS_STYLES = {
  'in-progress': {
    row: 'bg-green-950 hover:bg-green-900',
    border: 'border-l-4 border-green-500',
  },
  'completed': {
    row: 'bg-red-950 hover:bg-red-900',
    border: 'border-l-4 border-red-500',
  },
  'not-locked': {
    row: 'bg-yellow-900 hover:bg-yellow-800',
    border: 'border-l-4 border-yellow-400',
    text: 'text-gray-900',
  },
  default: {
    row: 'bg-[#171718] hover:bg-[#232429]',
    border: 'border-l-8 border-transparent',
    text: '',
  }
};

// =================== Discord Icon (Green logo + Checkmark) ===================
const DiscordIcon = ({ channelId }) => (
  <div className="flex items-center justify-center gap-1">
    <a
      href={`https://discord.com/channels/@me/${channelId}`}
      target="_blank"
      rel="noopener noreferrer"
      title="Open Discord Channel"
      className="flex items-center justify-center"
      style={{ minHeight: 0, minWidth: 0 }}
    >
      <img
        src="/assets/discord.png"
        alt="Discord"
        style={{
          width: 24,
          height: 20,
          // tint to green without a background circle
          filter:
            'brightness(0) saturate(80%) invert(55%) sepia(64%) saturate(645%) hue-rotate(78deg) brightness(101%) contrast(95%)'
        }}
      />
    </a>
    {/* green checkmark */}
  
  </div>
);

// =================== TableView Component ===================
export default function TableView({
  monthGroups,
  isVisible,
  rowStatus,
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
  onDiscordIdUpdated
}) {
  // --------- Lottie Icon Refs ---------
  const lottieRefs = useRef({});

  // --------- Discord Channel Modal State ---------
  const [showDiscordModal, setShowDiscordModal] = useState(false);
  const [discordModalJob, setDiscordModalJob] = useState(null);

  // --------- Jobs Update State (local only for this component) ---------
  const [jobsState, setJobsState] = useState({}); // job.id: job

  // --------- PATCH Discord Channel ID handler ---------
  const handleSaveDiscordChannel = async (channelId) => {
    if (!discordModalJob) return;
    const jobId = discordModalJob.id;
    try {
      const res = await fetch(`/api/jobs/${jobId}/discord-channel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discord_channel_id: channelId }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to update Discord Channel ID');
      setJobsState(prev => ({
        ...prev,
        [jobId]: { ...discordModalJob, discord_channel_id: channelId }
      }));
      setShowDiscordModal(false);
      setDiscordModalJob(null);
      if (onDiscordIdUpdated) onDiscordIdUpdated();
    } catch (e) {
      alert('Failed to assign Discord Channel ID. Please try again.');
    }
  };

  return (
    <div
      className="w-full rounded-xl shadow-2xl overflow-x-auto"
      style={{
        background: '#000',
        width: '100%',
        padding: 0,
        margin: 0,
      }}
    >
      <div className="overflow-x-auto" style={{ padding: 0, margin: 0, width: '100%' }}>
        <table
          className="table-auto w-full"
          style={{ tableLayout: 'auto', width: '100%', margin: 0, padding: 0 }}
        >
          <tbody>
            {[...monthGroups.entries()].map(([monthKey, monthJobs], idx) => {
              const visibleJobs = monthJobs.filter(isVisible);
              if (visibleJobs.length === 0) return null;

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
                  techs: 0,
                }
              );

              const isEarliest = idx === 0;

              return (
                <React.Fragment key={monthKey}>
                  <tr ref={isEarliest ? scrollRef : null}>
                    <td colSpan="23" className="p-0">
                      <div
                        className="relative w-3/12 bg-gradient-to-r from-[#232429] font-Varien via-[#18181b] to-[#232429] shadow-xl  mt-4 mb-0 py-1 px-2 flex items-center  border-2 border-b-2 border-white/70"
                        style={{
                          borderTopLeftRadius: '1rem',
                          borderTopRightRadius: '1rem',
                        }}
                      >
                        <span
                          className="text-left text-xl tracking-widest  font-Varien ml-6 font-extrabold uppercase text-[#6a7257] drop-shadow"
                          style={{ letterSpacing: '0.6em' }}
                        >
                          {monthKey}
                        </span>
                      </div>
                    </td>
                  </tr>
                  <tr className="bg-[#232429] border-b-2 border-white/70 text-[0.55em] text-white">
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
                      'Discord ID:',
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-2 py-1 border border-white/70 text-center  uppercase text-[0.55rem] tracking-wide"
                      >
                        {header}
                      </th>
                    ))}
                    <th className="px-2 py-1 border border-white/70 text-center uppercase text-[0.55rem] tracking-wide">
                      Audit File
                    </th>
                    <th className="px-2 py-1 border border-white/70 text-center  uppercase text-[0.55rem] tracking-wide">
                      Actions
                    </th>
                  </tr>
                  {visibleJobs.map((job, idx2) => {
                    const status = job.status || rowStatus[job.id] || 'default';
                    const styleObj = STATUS_STYLES[status] || STATUS_STYLES.default;
                    let rowClass = `${styleObj.row} ${styleObj.border} group`;
                    let textColor = styleObj.text || 'text-[0.65rem]';

                    let revLabel = null;
                    let hasBOM = false;
                    let bomObj = null;
                    if (job.work_orders) {
                      try {
                        bomObj =
                          typeof job.work_orders === 'object'
                            ? job.work_orders
                            : JSON.parse(job.work_orders);
                        revLabel = bomObj.revision ? `REV-${bomObj.revision}` : null;
                        hasBOM = !!bomObj.bom;
                      } catch (e) {
                        revLabel = null;
                        hasBOM = false;
                      }
                    }

                    // --------- Lottie key (preserved) ---------
                    const lottieKey = job.id || `${monthKey}_${idx2}`;
                    if (!lottieRefs.current[lottieKey]) {
                      lottieRefs.current[lottieKey] = React.createRef();
                    }

                    const jobRow = jobsState[job.id] ? { ...job, ...jobsState[job.id] } : job;

                    return (
                      <tr key={job.id} className={rowClass}>
                        <td className="px-1 py-0 border border-[#6a7257] rounded text-[0.65rem] font-bold text-grey bg-white">
                          <div className="flex flex-col items-center">
                            <img
                              src={`/assets/logos/${job.customer
                                .toLowerCase()
                                .replace(/[^a-z0-9]/g, '')}.png`}
                              alt={`${job.customer} logo`}
                              className="h-10 w-28 object-contain drop-shadow-xl rounded-md hover:scale-110 transition-transform duration-300"
                              style={{ background: '#fff', padding: 0, borderRadius: 8 }}
                              onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                          </div>
                        </td>
                        <td className={`px-2 py-0 border border-[#232429] text-center font-medium ${textColor}`}>
                          {job.surface_lsd || '-'}
                        </td>
                        <td className={`px-2 py-0 border border-[#232429] text-center font-medium ${textColor}`}>
                          {job.products || '-'}
                        </td>
                        <td className={`px-2 py-0 border border-[#232429] text-center font-medium ${textColor}`}>
                          {job.rig_in_date || '-'}
                        </td>
                        <td className={`px-2 py-0 border border-[#232429] text-center font-medium ${textColor}`}>
                          {job.start_date || '-'}
                        </td>
                        <td className={`px-2 py-0 border border-[#232429] text-center font-medium ${textColor}`}>
                          {job.end_date || '-'}
                        </td>
                        <td className={`px-2 py-0 border border-[#232429] text-center font-medium ${textColor}`}>
                          {formatValue(job.num_wells)}
                        </td>
                        <td className={`px-2 py-0 border border-[#232429] text-center font-medium ${textColor}`}>
                          {formatValue(job.valve_7_1_16)}
                        </td>
                        <td className={`px-2 py-0 border border-[#232429] text-center font-medium ${textColor}`}>
                          {formatValue(job.valve_5_1_8)}
                        </td>
                        <td className={`px-2 py-0 border border-[#232429] text-center font-medium ${textColor}`}>
                          {formatValue(job.valve_hyd)}
                        </td>
                        <td className={`px-2 py-0 border border-[#232429] text-center font-medium ${textColor}`}>
                          {formatValue(job.valve_man)}
                        </td>
                        <td className={`px-2 py-0 border border-[#232429] text-center font-medium ${textColor}`}>
                          {formatValue(job.gateway_pods)}
                        </td>
                        <td className={`px-2 py-0 border border-[#232429] text-center font-medium ${textColor}`}>
                          {formatValue(job.awc_pods)}
                        </td>
                        <td className={`px-2 py-0 border border-[#232429] text-center font-medium ${textColor}`}>
                          {formatValue(job.grease_unit)}
                        </td>
                        <td className={`px-2 py-0 border border-[#232429] text-center font-medium ${textColor}`}>
                          {formatValue(job.coil_trees)}
                        </td>
                        <td className={`px-2 py-0 border border-[#232429] text-center font-medium ${textColor}`}>
                          {formatValue(job.accumulator)}
                        </td>
                        <td className={`px-2 py-0 border border-[#232429] text-center font-medium ${textColor}`}>
                          {formatValue(job.techs)}
                        </td>
                        <td className="px-2 py-0 border border-[#232429] text-center">
                          {hasBOM && revLabel ? (
                            <button
                              className="px-2 py-0 rounded bg-[#363a44] text-white font-bold uppercase hover:bg-[#42444a] shadow text-[0.65rem]"
                              onClick={() => onShowBOM(job, bomObj)}
                            >
                              {revLabel}
                            </button>
                          ) : (
                            <span className="text-gray-600">—</span>
                          )}
                        </td>
                        <td className="border border-[#232429] text-center align-middle p-0">
                          <button
                            title="Open Document Hub"
                            onClick={() => handleOpenDocHub(job)}
                            className="w-full h-full flex items-center justify-center focus:outline-none hover:bg-[#363a44]/40 transition"
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
                        <td className="border border-[#232429] text-center align-middle p-0">
                          {jobRow.discord_channel_id ? (
                            <DiscordIcon channelId={jobRow.discord_channel_id} />
                          ) : (
                            <button
                              title="Assign Discord Channel"
                              className="w-full h-full flex items-center justify-center text-white hover:text-green-500 text-2xl font-bold"
                              style={{ minHeight: 0, minWidth: 0, lineHeight: 1 }}
                             onClick={() => {
  setDiscordModalJob(job); // full job object
  setShowDiscordModal(true);
}}

                            >
                              +
                            </button>
                          )}
                        </td>
                        <td className="px-2 py-1 border border-[#232429] text-center space-x-1">
                          {job.auditChecklistUrl ? (
                            <>
                              <button
                                onClick={() =>
                                  window.open(`http://localhost:3001${job.auditChecklistUrl}`, '_blank')
                                }
                                className="px-2 py-0.5 bg-black border border-fly-blue text-fly-blue rounded text-[0.65rem]"
                              >
                                View Audit
                              </button>
                              <button
                                onClick={() => handleDeleteAudit(job.id)}
                                className="px-2 py-0.5 bg-red-700 text-white rounded text-[0.65rem]"
                              >
                                Delete File
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedAuditJob(job);
                                setShowAuditModal(true);
                              }}
                              className="px-2 py-0.5 bg-black border uppercase font-erbaum border-[#353a3f] text-[#c5c8ce] text-[0.65rem] font-semibold rounded"
                              style={{ lineHeight: '1rem', minHeight: '20px' }}
                            >
                              Upload Audit
                            </button>
                          )}
                        </td>
                        <td className="px-2 py-1 border border-[#232429] text-center">
                          <select
                            defaultValue=""
                            onChange={(e) => {
                              const action = e.target.value;
                              e.target.value = '';
                              if (action === 'edit') handleEdit(job);
                              else if (action === 'delete') handleDelete(job.id);
                              else if (action === 'submitSourcing') handleSubmitSourcing(job);
                              else handleStatusChange(job.id, action);
                            }}
                            className="w-full h-[42px] bg-black border border-[#353a3f] text-white text-[0.55rem] font-bold font-erbaum uppercase rounded text-center whitespace-normal leading-tight flex items-center justify-center"
                          >
                            <option value="">Action</option>
                            <option value="edit">Edit</option>
                            <option value="delete">Delete</option>
                            <option value="submitSourcing">Submit Sourcing Ticket</option>
                            <option value="in-progress">In Progress</option>
                            <option value="not-locked">Not Yet Locked</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-[#1a1b1f] border-t-2 border-b-2 border-[#232429] text-white text-[0.65rem] font-erbaum font-bold shadow-lg">
                    <td className="px-0 py-0">Monthly Totals</td>
                    <td colSpan="5" />
                    <td className="px-2 py-1 text-center">{totals.num_wells.toFixed(0)}</td>
                    <td className="px-2 py-1 text-center">{totals.valve_7_1_16.toFixed(0)}</td>
                    <td className="px-2 py-1 text-center">{totals.valve_5_1_8.toFixed(0)}</td>
                    <td className="px-2 py-1 text-center">{totals.valve_hyd.toFixed(0)}</td>
                    <td className="px-2 py-1 text-center">{totals.valve_man.toFixed(0)}</td>
                    <td className="px-2 py-1 text-center">{totals.gateway_pods.toFixed(0)}</td>
                    <td className="px-2 py-1 text-center">{totals.awc_pods.toFixed(0)}</td>
                    <td className="px-2 py-1 text-center">{totals.grease_unit.toFixed(0)}</td>
                    <td className="px-2 py-1 text-center">{totals.coil_trees.toFixed(0)}</td>
                    <td className="px-2 py-1 text-center">{totals.accumulator.toFixed(0)}</td>
                    <td className="px-2 py-1 text-center">{totals.techs.toFixed(0)}</td>
                    <td />
                    <td />
                    <td />
                    <td />
                    <td />
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <AuditChecklistModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        job={selectedAuditJob}
      />
      <DiscordIDModal
  isOpen={showDiscordModal}
  onClose={() => {
    setShowDiscordModal(false);
    setDiscordModalJob(null);
  }}
  onSave={handleSaveDiscordChannel}
  existingId={discordModalJob?.discord_channel_id || ""}
  job={discordModalJob} // <-- Pass full job object
/>

    </div>
  );
}
