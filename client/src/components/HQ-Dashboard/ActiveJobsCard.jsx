// =================== Imports and Dependencies ===================
import { useEffect, useState } from "react";
import ScaleToFit from "../ui/ScaleToFit";

// =================== Utility Functions ===================
function dedupeJobs(jobs) {
  const seen = new Set();
  return jobs.filter(job => {
    const key = [
      job.customer?.trim().toUpperCase(),
      (job.surface_lsd || '').trim().toUpperCase(),
      job.end_date || ''
    ].join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function daysLeft(endDate) {
  if (!endDate) return null;
  const ms = new Date(endDate) - new Date();
  return Math.ceil(ms / 86400000);
}
function getZoneKey(job) {
  return [
    job.customer?.trim().toUpperCase(),
    (job.surface_lsd || '').trim().toUpperCase(),
    job.end_date || ''
  ].join('|');
}

// =================== ZoneModal Component ===================
function ZoneModal({ open, onClose, jobKey, zoneProgress, setZoneProgress }) {
  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(0);
  useEffect(() => {
    if (open) {
      setCompleted(zoneProgress?.completed ?? 0);
      setTotal(zoneProgress?.total ?? 0);
    }
  }, [open, zoneProgress]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-[#23241b] rounded-2xl shadow-2xl border-2 border-[#6a7257] p-8 min-w-[350px] max-w-sm w-full relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-[#f00] font-bold text-lg"
          onClick={onClose}
        >×</button>
        <h3 className="text-xl font-bold text-[#e6e8df] mb-6 text-center">
          Update Zone Count
        </h3>
        <form
          onSubmit={e => {
            e.preventDefault();
            const newProgress = { completed: Number(completed), total: Number(total) };
            localStorage.setItem(`zoneProgress:${jobKey}`, JSON.stringify(newProgress));
            setZoneProgress(jk => ({
              ...jk,
              [jobKey]: newProgress,
            }));
            onClose();
          }}
        >
          <div className="mb-4 flex flex-col gap-3">
            <label className="text-sm font-bold text-[#a9c27a]">
              Zones Completed:
              <input
                type="number"
                min="0"
                max={total || undefined}
                value={completed}
                onChange={e => setCompleted(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 rounded bg-black text-white border border-[#393c32] focus:border-[#6a7257] outline-none"
                required
              />
            </label>
            <label className="text-sm font-bold text-[#a9c27a]">
              Total Zones:
              <input
                type="number"
                min="1"
                value={total}
                onChange={e => setTotal(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 rounded bg-black text-white border border-[#393c32] focus:border-[#6a7257] outline-none"
                required
              />
            </label>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-[#222] hover:bg-[#444] px-4 py-2 rounded text-white font-bold mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#6a7257] hover:bg-[#a9c27a] px-4 py-2 rounded text-black font-bold"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =================== ActiveJobsCard Component ===================
export default function ActiveJobsCard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoneProgress, setZoneProgress] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalJobKey, setModalJobKey] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/hq/active-jobs')
      .then((res) => res.json())
      .then((data) => {
        setJobs(dedupeJobs(data || []));
        setLoading(false);
      })
      .catch(() => {
        setJobs([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!jobs.length) return;
    const next = {};
    jobs.forEach(job => {
      const key = getZoneKey(job);
      const item = localStorage.getItem(`zoneProgress:${key}`);
      next[key] = item ? JSON.parse(item) : { completed: 0, total: 0 };
    });
    setZoneProgress(next);
  }, [jobs.length]);

  const colClasses =
    "grid grid-cols-[52px_145px_168px_84px_96px_210px_144px_114px]";

  return (
    <div
      className="border-2 border-[#6a7257] rounded-2xl shadow-2xl px-4 flex flex-col min-h-[60px]"
      style={{
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        background: 'var(--glass-tint)',
        backdropFilter: 'blur(var(--glass-blur))',
        WebkitBackdropFilter: 'blur(var(--glass-blur))',
        boxShadow: 'var(--glass-shadow)',
        borderColor: '#6a7257',
      }}
    >
      <ZoneModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        jobKey={modalJobKey}
        zoneProgress={zoneProgress[modalJobKey]}
        setZoneProgress={setZoneProgress}
      />

      {loading ? (
        <div className="text-center text-gray-400 py-6">Loading...</div>
      ) : jobs.length === 0 ? (
        <div className="text-center text-gray-400 py-6">No active jobs found.</div>
      ) : (
        <div className="w-full flex-1 min-h-0 flex flex-col">
          <ScaleToFit className="w-full flex-1 min-h-0">
            <div className="w-full">
              {/* HEADER ROW */}
              <div
                className={
                  colClasses +
                  " items-center pb-1 border-b border-[#393c32] mb-1 font-bold text-[#b0b79f] text-xs uppercase tracking-wider"
                }
              >
                <span className="text-center w-full"></span>
                <span className="text-center underline w-full">Customer</span>
                <span className="text-center underline w-full">LSD</span>
                <span className="text-center underline w-full"># Wells</span>
                <span className="text-center underline w-full">Zones</span>
                <span className="text-center underline w-full">Progress</span>
                <span className="text-center underline w-full">End Date</span>
                <span className="text-center underline w-full"></span>
              </div>

              {/* ROWS */}
              <div className="flex flex-col">
                {jobs.map((job, idx) => {
                  const jobKey = getZoneKey(job);
                  const zp = zoneProgress[jobKey] || { completed: 0, total: 0 };
                  const percent = zp.total ? Math.min(100, Math.round((zp.completed / zp.total) * 100)) : 0;
                  const endDays = daysLeft(job.end_date);
                  const endIsSoon = endDays !== null && endDays <= 7 && endDays >= 0;

                  return (
                    <div
                      key={jobKey}
                      className={
                        colClasses +
                        " items-center py-1 group relative transition-all duration-200 rounded-lg hover:bg-gradient-to-r hover:from-[#20241a]/90 hover:to-[#34381a]/90 hover:scale-[1.01] cursor-pointer"
                      }
                      style={{
                        minHeight: 32,
                        boxShadow: "0 0 0.5px 0 #35392e, 0 8px 24px 0 #23240e33",
                      }}
                      tabIndex={0}
                      aria-label={`Active job: ${job.customer} ${job.surface_lsd}`}
                    >
                      {/* Logo */}
                      <div className="flex flex-row items-center justify-center w-full">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-400 shadow animate-pulse border border-[#283618] mr-1" title="Active job"></span>
                        <img
                          src={job.customerLogo}
                          alt={job.customer + " logo"}
                          className="h-8 w-8 object-contain rounded-full border-2 border-[#6a7257] shadow bg-white"
                          style={{ minWidth: 32, background: "#fff" }}
                          onError={e => { e.target.style.display = "none"; }}
                        />
                      </div>
                      {/* Customer name */}
                      <div className="flex flex-col items-center w-full justify-center">
                        <span className="font-bold text-white text-xs uppercase tracking-wide text-center">
                          {job.customer}
                        </span>
                      </div>
                      {/* LSD */}
                      <div className="flex flex-col items-center w-full">
                        <span className="text-sm text-[#b0b79f] font-mono text-center">{job.surface_lsd}</span>
                      </div>
                      {/* Wells */}
                      <div className="flex flex-col items-center w/full">
                        <span className="text-sm text-[#a9c27a] font-bold font-mono text-center">
                          {job.num_wells != null && !isNaN(Number(job.num_wells))
                            ? Number(job.num_wells).toFixed(0)
                            : "-"}
                        </span>
                      </div>
                      {/* Zones */}
                      <div className="flex flex-col items-center w/full">
                        <span className="text-sm text-[#a9c27a] font-bold font-mono text-center">
                          {zp.completed} / {zp.total || "-"}
                        </span>
                      </div>
                      {/* Progress Bar */}
                      <div className="flex flex-col items-center w/full">
                        <span className="text-xs font-bold text-gray-300 mb-2">
                          {zp.total > 0
                            ? `PROGRESS: ${percent}%`
                            : "No zones set"}
                        </span>
                        <div className="w-4/5 h-1.5 bg-[#23241b] rounded overflow-hidden mx-auto">
                          <div
                            className={`h-full rounded transition-all duration-500`}
                            style={{
                              width: `${percent}%`,
                              background: percent > 0 ? '#4ade80' : '#393c32'
                            }}
                          ></div>
                        </div>
                      </div>
                      {/* End Date */}
                      <div className="flex flex-col items-center w/full">
                        <span
                          className={
                            "text-sm font-bold font-mono text-center transition-colors " +
                            (endDays == null
                              ? "text-[#4ade80]"
                              : endIsSoon
                              ? "text-[#4ade80] animate-pulse"
                              : "text-[#4ade80]")
                          }
                          title={
                            job.end_date
                              ? `Job ends in ${endDays} day${Math.abs(endDays) === 1 ? '' : 's'} (${new Date(job.end_date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: '2-digit',
                                  year: 'numeric'
                                })})`
                              : ''
                          }
                        >
                          {job.end_date
                            ? new Date(job.end_date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "2-digit",
                                year: "numeric",
                              })
                            : "-"}
                        </span>
                      </div>
                      {/* Actions */}
                      <div className="flex flex-row items-center justify-center w/full gap-2">
                        {/* Update Zone Count */}
                        <button
                          title="Update Zone Count"
                          className="bg-[#23241b] rounded-full shadow border-2 border-[#393c32] flex items-center justify-center transition duration-150 transform group
                            hover:scale-110 hover:border-[#84ff45] hover:shadow-[0_0_8px_2px_#baff70]"
                          style={{ outline: "none", width: 38, height: 38 }}
                          tabIndex={0}
                          onClick={e => {
                            e.stopPropagation();
                            setModalJobKey(jobKey);
                            setModalOpen(true);
                          }}
                        >
                          <svg width={16} height={16} fill="none" viewBox="0 0 24 24"
                            className="transition-colors duration-200 group-hover:stroke-[#84ff45] stroke-[#b0b79f]">
                            <path d="M12 20v-6m0 0V4m0 10H6m6 0h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        {/* Open in Planner */}
                        <button
                          title="Open in Planner"
                          className="bg-[#22261a] rounded-full shadow border-2 border-[#393c32] flex items-center justify-center transition duration-150 transform group
                            hover:scale-110 hover:border-[#84ff45] hover:shadow-[0_0_8px_2px_#baff70]"
                          style={{ outline: "none", width: 38, height: 38 }}
                          tabIndex={0}
                          onClick={e => {
                            e.stopPropagation();
                            window.open(`/job-planner?job=${job.id}`, "_blank");
                          }}
                        >
                          <svg width={16} height={16} fill="none" viewBox="0 0 24 24"
                            className="transition-colors duration-200 group-hover:stroke-[#84ff45] stroke-white">
                            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        {/* View MFV Info */}
                        <div className="relative group">
                          <button
                            title="View MFV Info"
                            className="bg-[#22261a] rounded-full shadow border-2 border-[#393c32] flex items-center justify-center transition-all duration-150 overflow-hidden
                              hover:scale-110 hover:border-[#84ff45] hover:shadow-[0_0_8px_2px_#baff70]"
                            style={{
                              outline: "none",
                              width: 38,
                              height: 38,
                              minWidth: 38,
                              minHeight: 38,
                              position: 'relative'
                            }}
                            tabIndex={0}
                            onClick={e => {
                              e.stopPropagation();
                              window.open(`/mfv-info?job=${job.id || ''}`, "_blank");
                            }}
                          >
                            <img
                              src="/assets/mfv-icon.png"
                              alt="MFV"
                              className="w-5 h-5 object-contain transition-all duration-200"
                            />
                            <span
                              className="absolute left-9 top-1/2 -translate-y-1/2 text-xs text-white font-bold uppercase opacity-0 group-hover:opacity-100 group-hover:left-12 transition-all duration-200 whitespace-nowrap pointer-events-none select-none"
                              style={{ zIndex: 2, whiteSpace: 'nowrap' }}
                            >
                              View MFV Info
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScaleToFit>
        </div>
      )}
    </div>
  );
}
