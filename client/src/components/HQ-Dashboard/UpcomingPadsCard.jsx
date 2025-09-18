import { resolveApiUrl } from '../../api'
// =========================== FILE: client/src/components/HQ-Dashboard/UpcomingPadsCard.jsx ===========================

// =================== Imports and Dependencies ===================
import { useEffect, useState } from "react";

// =================== Utility Functions ===================
function dedupeJobs(jobs) {
  const seen = new Set();
  return jobs.filter(job => {
    const key = [
      job.customer?.trim().toUpperCase(),
      (job.surface_lsd || '').trim().toUpperCase(),
      job.rig_in_date || ''
    ].join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function daysLeft(rigInDate) {
  if (!rigInDate) return null;
  const ms = new Date(rigInDate) - new Date();
  return Math.ceil(ms / 86400000);
}
function getZoneKey(job) {
  return [
    job.customer?.trim().toUpperCase(),
    (job.surface_lsd || '').trim().toUpperCase(),
    job.rig_in_date || ''
  ].join('|');
}

// =================== Zone Modal Component ===================
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

// =================== Upcoming Pads Card Component ===================
export default function UpcomingPadsCard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoneProgress, setZoneProgress] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalJobKey, setModalJobKey] = useState(null);

  useEffect(() => {
    fetch(resolveApiUrl('/api/hq/upcoming-jobs'))
      .then((res) => res.json())
      .then((data) => {
        const list = dedupeJobs(data || [])
          .sort((a, b) => {
            const ad = a.rig_in_date ? new Date(a.rig_in_date) : new Date(8640000000000000);
            const bd = b.rig_in_date ? new Date(b.rig_in_date) : new Date(8640000000000000);
            return ad - bd;
          })
          .slice(0, 6);
        setJobs(list);
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
    "grid grid-cols-[52px_145px_168px_84px_96px_210px_144px]";

  return (
    <div
      className="border-2 border-[#6a7257] rounded-2xl shadow-2xl px-4 flex flex-row min-h-[60px] min-h-0"
      style={{
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        background: 'var(--glass-tint)',
        backdropFilter: 'blur(var(--glass-blur))',
        WebkitBackdropFilter: 'blur(var(--glass-blur))',
        boxShadow: 'var(--glass-shadow)',
        borderColor: '#6a7257',
        overflow: 'hidden'
      }}
    >
      <ZoneModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        jobKey={modalJobKey}
        zoneProgress={zoneProgress[modalJobKey]}
        setZoneProgress={setZoneProgress}
      />

      {/* ===== Main Content ===== */}
      <div className="flex-1 min-w-0 min-h-0 flex flex-col">
        {loading ? (
          <div className="text-center text-gray-400 py-6">Loading...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center text-gray-400 py-6">No upcoming jobs found.</div>
        ) : (
          <div className="flex-1 min-h-0">
            <div className="h-full max-h-full overflow-auto pr-1">
              <div className="w-full min-w-[900px]">
              {/* ===== Header Row ===== */}
              <div
                className={
                  colClasses +
                  " items-center pb-1 border-b border-[#393c32] mb-1 mt-2 font-bold text-[#b0b79f] text-xs uppercase tracking-wider"
                }
              >
                <span className="text-center w-full"></span>
                <span className="text-center underline w-full">Customer</span>
                <span className="text-center underline w-full">LSD</span>
                <span className="text-center underline w-full"># Wells</span>
                <span className="text-center underline w-full">WO Rev</span>
                <span className="text-center underline w-full">Progress</span>
                <span className="text-center underline w-full">Rig in Date</span>
              </div>

              {/* ===== Rows ===== */}
              <div className="flex flex-col">
                {jobs.map((job, idx) => {
                  const jobKey = getZoneKey(job);
                  const zp = zoneProgress[jobKey] || { completed: 0, total: 0 };
                  const percent = zp.total ? Math.min(100, Math.round((zp.completed / zp.total) * 100)) : 0;
                  const rigDays = daysLeft(job.rig_in_date);
                  const rigIsSoon = rigDays !== null && rigDays <= 7 && rigDays >= 0;
                  return (
                    <div
                      key={jobKey}
                      className={
                        colClasses +
                        " items-center py-1 group relative transition-all duration-200 rounded-lg " +
                        "hover:bg-gradient-to-r hover:from-[#20241a]/90 hover:to-[#34381a]/90 hover:scale-[1.01] cursor-pointer"
                      }
                      style={{
                        minHeight: 32,
                        boxShadow: "0 0 0.5px 0 #35392e, 0 8px 24px 0 #23240e33",
                      }}
                      tabIndex={0}
                      aria-label={`Upcoming job: ${job.customer} ${job.surface_lsd}`}
                    >
                      {/* Logo */}
                      <div className="flex flex-row items-center justify-center w-full">
                        <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 shadow animate-pulse border border-[#b59b1d] mr-1" title="Upcoming job"></span>
                        <img
                          src={job.customerLogo}
                          alt={job.customer + " logo"}
                          className="h-8 w-8 object-contain rounded-full border-2 border-[#6a7257] shadow bg-white"
                          style={{ minWidth: 32, background: "#fff" }}
                          onError={e => { e.target.style.display = "none"; }}
                        />
                      </div>
                      {/* Customer */}
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
                      <div className="flex flex-col items-center w-full">
                        <span className="text-sm text-[#a9c27a] font-bold font-mono text-center">
                          {job.num_wells != null && !isNaN(Number(job.num_wells))
                            ? Number(job.num_wells).toFixed(0)
                            : "-"}
                        </span>
                      </div>
                      {/* WO Revision */}
                      <div className="flex flex-col items-center w-full">
                        <span className="text-sm text-[#a9c27a] font-bold font-mono text-center">
                          {job.workbook_revision ? job.workbook_revision : "-"}
                        </span>
                      </div>
                      {/* Progress */}
                      <div className="flex flex-col items-center w-full">
                        <span className="text-xs font-bold text-gray-300 mb-2">
                          {zp.total > 0
                            ? `PROGRESS: ${percent}%`
                            : "No Progress Yet"}
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
                      {/* Rig in Date */}
                      <div className="flex flex-col items-center w-full">
                        <span
                          className={
                            "text-sm font-bold font-mono text-center transition-colors " +
                            (rigDays == null
                              ? "text-yellow-300"
                              : rigIsSoon
                              ? "text-yellow-300 animate-pulse"
                              : "text-yellow-300")
                          }
                          title={
                            job.rig_in_date
                              ? `Job rigs in in ${rigDays} day${Math.abs(rigDays) === 1 ? '' : 's'} (${new Date(job.rig_in_date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: '2-digit',
                                  year: 'numeric'
                                })})`
                              : ''
                          }
                        >
                          {job.rig_in_date
                            ? new Date(job.rig_in_date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "2-digit",
                                year: "numeric",
                              })
                            : "-"}
                        </span>
                      </div>

                      {idx !== jobs.length - 1 && (
                        <div className="absolute left-4 right-4 -bottom-1 h-px bg-gradient-to-r from-transparent via-[#35392e] to-transparent opacity-60 pointer-events-none"></div>
                      )}
                    </div>
                  );
                })}
              </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== Right Actions Panel (Empty Placeholder) ===== */}
      <div className="ml-3 pl-3 fhq-action-rail">
        {/* Intentionally empty for future actions */}
      </div>
    </div>
  );
}
