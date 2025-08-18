// =================== Imports and Dependencies ===================
import { useState } from "react";

// =================== SVG ICONS ===================
const icons = {
  plus: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="#36c172" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="7" x2="12" y2="17" />
      <line x1="7" y1="12" x2="17" y2="12" />
    </svg>
  ),
  workorder: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="#b0b79f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M9 9h6v6H9z" />
    </svg>
  ),
  assembly: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="#36c172" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9h.01" />
      <path d="M9 9h.01" />
      <path d="M9 15h6" />
    </svg>
  ),
  receive: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="#36c172" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  transfer: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="#e6e8df" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
};

// =================== Action Icon Button Component ===================
function ActionIconBtn({ icon, tooltip, onClick, color, border, bg }) {
  const [showTip, setShowTip] = useState(false);

  return (
    <div className="relative flex rounded-2xl items-center justify-center">
      <button
        className={`
          rounded-full border-2 flex items-center justify-center
          bg-[#191d18]
          border-[#393c32]
          transition duration-150 transform
          w-[24px] h-[24px] min-w-[24px] min-h-[24px] max-w-[24px] max-h-[24px]
          hover:scale-110
          hover:border-[#36c172]
          focus:outline-none
        `}
        style={{
          color: color || "#36c172",
          borderColor: border || "#393c32",
          background: bg || "#191d18"
        }}
        tabIndex={0}
        aria-label={tooltip}
        type="button"
        onClick={onClick}
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
        onFocus={() => setShowTip(true)}
        onBlur={() => setShowTip(false)}
      >
        {icon}
      </button>
      {showTip && (
        <span
          className={`
            absolute z-30 left-1/2 -translate-x-1/2 top-7
            pointer-events-none select-none
            whitespace-nowrap
            bg-black bg-opacity-90 text-[#36c172] text-xs px-2 py-1 rounded
            font-bold
            shadow-md border border-[#36c172]
            animate-fadein
          `}
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.02,
            marginTop: 2,
            boxShadow: "0 2px 12px 1px #171e12aa",
            opacity: 0.98,
            whiteSpace: "nowrap",
          }}
        >
          {tooltip}
        </span>
      )}
    </div>
  );
}

// =================== Grid Layout Classes ===================
const colClasses =
  "grid grid-cols-[56px_170px_140px_120px_170px_120px_120px] w-full";

// =================== Missile Job Row Component ===================
function MissileJobRow({ job, highlight = false }) {
  return (
    <div
      className={
        colClasses +
        " items-center py-1 group relative transition-all duration-200 rounded-lg " +
        (highlight
          ? "bg-gradient-to-r from-[#1e232a]/90 via-[#293233]/90 to-[#191a1b]/90 scale-[1.012]"
          : "hover:bg-gradient-to-r hover:from-[#20241a]/90 hover:to-[#34381a]/90 hover:scale-[1.01] cursor-pointer")
      }
      style={{
        minHeight: 32,
        boxShadow: highlight
          ? "0 0 1px 0 #35392e, 0 6px 18px 0 #22441e23"
          : "0 0 0.5px 0 #35392e, 0 8px 24px 0 #23240e33"
      }}
    >
      {/* Logo */}
      <div className="flex flex-row items-center justify-center w-full">
        <span
          className="inline-block w-2 h-2 rounded-full bg-green-400 shadow border border-[#157d42] mr-1"
          title={job.status === "Active" ? "Active Missile" : "Upcoming"}
        ></span>
        <div
          style={{
            width: 19,
            height: 19,
            borderRadius: "50%",
            background: "#151d17",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid #242b1c",
            overflow: "hidden",
          }}
        >
          <span
            style={{
              color: "#36c172",
              fontSize: 8,
              fontWeight: 900,
            }}
          >
            Logo
          </span>
        </div>
      </div>
      {/* Customer */}
      <div className="flex flex-col items-center w-full justify-center">
        <span className="font-bold text-white text-xs uppercase tracking-wide text-center">
          {job.customer}
        </span>
      </div>
      {/* LSD */}
      <div className="flex flex-col items-center w-full">
        <span className="text-xs text-[#b0b79f] font-mono text-center">
          {job.lsd}
        </span>
      </div>
      {/* Missile */}
      <div className="flex flex-col items-center w-full">
        <span className="text-xs text-[#a9c27a] font-bold font-mono text-center">
          {job.missile}
        </span>
      </div>
      {/* Start Date */}
      <div className="flex flex-col items-center w-full">
        <span className="text-xs font-bold font-mono text-[#e6e8df] text-center">
          {job.start_date}
        </span>
      </div>
      {/* Status */}
      <div className="flex flex-col items-center w-full">
        <span className={`text-xs font-bold font-mono text-center ${job.status === "Active" ? "text-[#36c172]" : "text-yellow-300"}`}>
          {job.status}
        </span>
      </div>
      {/* Actions */}
      <div className="flex flex-row gap-1 items-center justify-center w-full">
        <ActionIconBtn
          icon={icons.workorder}
          tooltip="View Workorder"
          onClick={() => alert(`View Workorder for ${job.customer}`)}
        />
        <ActionIconBtn
          icon={icons.assembly}
          tooltip="View Master Assembly"
          color="#36c172"
          border="#36c172"
          onClick={() => alert(`View Master Assembly for ${job.customer}`)}
        />
        <ActionIconBtn
          icon={icons.receive}
          tooltip="Receive"
          color="#36c172"
          border="#36c172"
          onClick={() => alert(`Receive Missile Job ${job.customer}`)}
        />
        <ActionIconBtn
          icon={icons.transfer}
          tooltip="Pad to Pad Transfer"
          color="#e6e8df"
          border="#e6e8df"
          onClick={() => alert(`Pad to Pad Transfer for ${job.customer}`)}
        />
      </div>
    </div>
  );
}

// =================== Add Missile Job Modal Component ===================
function AddMissileJobModal({ open, onClose, onSubmit }) {
  const [customer, setCustomer] = useState("");
  const [lsd, setLsd] = useState("");
  const [missile, setMissile] = useState("");
  const [startDate, setStartDate] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      customer,
      lsd,
      missile,
      start_date: startDate,
      status: "Active",
    });
    onClose();
    setCustomer("");
    setLsd("");
    setMissile("");
    setStartDate("");
  }

  if (!open) return null;

  const fs = (v) => `calc(${v} * 0.75)`;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        borderRadius: 20,
        width: "100vw",
        height: "100vh",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(14,18,15, 0.72)",
        backdropFilter: "blur(13px) saturate(160%) brightness(1.08)",
        WebkitBackdropFilter: "blur(13px) saturate(160%) brightness(1.08)",
        boxShadow: "0 0 180px 0 #1b1f1c70 inset",
        transition: "background .16s",
      }}
      onClick={onClose}
    >
      <form
        onClick={e => e.stopPropagation()}
        onSubmit={handleSubmit}
        style={{
          position: "relative",
          width: 430,
          maxWidth: "96vw",
          background: "#090a08",
          border: "3px solid #6a7257",
          borderRadius: 22,
          boxShadow: "0 6px 44px #000b",
          padding: "20px 24px 15px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            width: "100%",
            borderBottom: "2px solid #6a7257",
            marginBottom: 16,
            paddingBottom: 5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              color: "#6a7257",
              fontWeight: 900,
              fontSize: fs("1.35rem"),
              letterSpacing: ".03em",
              textAlign: "center",
              fontFamily: "Cornero, Erbaum, sans-serif",
              flex: 1,
            }}
          >
            Add Missile Job
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              fontSize: fs("20px"),
              color: "#e6e8df",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              marginLeft: 10,
              transition: "color .14s",
            }}
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Form Fields */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 7,
          }}
        >
          <label style={{
            color: "#6a7257",
            fontWeight: 700,
            fontSize: fs("0.97rem"),
            marginBottom: 2,
            marginTop: 0
          }}>
            Customer
          </label>
          <input
            style={{
              background: "#000000ff",
              border: "2px solid #6a7257",
              borderRadius: 8,
              color: "#fff",
              padding: "7px 11px",
              marginBottom: 0,
              fontWeight: 700,
              fontSize: fs("1rem"),
              fontFamily: "Erbaum, sans-serif",
            }}
            required
            value={customer}
            onChange={e => setCustomer(e.target.value)}
            placeholder="Customer Name"
            autoFocus
          />

          <label style={{
            color: "#6a7257",
            fontWeight: 700,
            fontSize: fs("0.97rem"),
            margin: "6px 0 2px"
          }}>
            LSD
          </label>
          <input
            style={{
              background: "#000000ff",
              border: "2px solid #6a7257",
              borderRadius: 8,
              color: "#fff",
              padding: "7px 11px",
              marginBottom: 0,
              fontWeight: 700,
              fontSize: fs("1rem"),
              fontFamily: "Erbaum, sans-serif",
            }}
            required
            value={lsd}
            onChange={e => setLsd(e.target.value)}
            placeholder="Location LSD"
          />

          <label style={{
            color: "#6a7257",
            fontWeight: 700,
            fontSize: fs("0.97rem"),
            margin: "6px 0 2px"
          }}>
            Missile
          </label>
          <input
            style={{
              background: "#000000ff",
              border: "2px solid #6a7257",
              borderRadius: 8,
              color: "#fff",
              padding: "7px 11px",
              marginBottom: 0,
              fontWeight: 700,
              fontSize: fs("1rem"),
              fontFamily: "Erbaum, sans-serif",
            }}
            required
            value={missile}
            onChange={e => setMissile(e.target.value)}
            placeholder="Missile"
          />

          <label style={{
            color: "#6a7257",
            fontWeight: 700,
            fontSize: fs("0.97rem"),
            margin: "6px 0 2px"
          }}>
            Start Date
          </label>
          <input
            style={{
              background: "#000000ff",
              border: "2px solid #6a7257",
              borderRadius: 8,
              color: "#fff",
              padding: "7px 11px",
              marginBottom: 0,
              fontWeight: 700,
              fontSize: fs("1rem"),
              fontFamily: "Erbaum, sans-serif",
            }}
            type="date"
            required
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </div>

        {/* Modal Buttons */}
        <div style={{ display: "flex", gap: 9, marginTop: 17, width: "100%" }}>
          <button
            type="button"
            style={{
              flex: 1,
              background: "#191d18",
              border: "2px solid #6a7257",
              color: "#ffe066",
              borderRadius: 8,
              padding: "8px 0",
              fontWeight: 700,
              fontSize: fs("1.12rem"),
              fontFamily: "Erbaum, sans-serif",
              cursor: "pointer",
              transition: "background .13s, color .13s, border .13s"
            }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              flex: 1,
              background: "#6a7257",
              border: "2px solid #e6ffe6",
              color: "#191d18",
              borderRadius: 8,
              padding: "8px 0",
              fontWeight: 700,
              fontSize: fs("1.12rem"),
              fontFamily: "Erbaum, sans-serif",
              cursor: "pointer",
              transition: "background .13s, color .13s, border .13s"
            }}
          >
            Add Job
          </button>
        </div>
      </form>
    </div>
  );
}

// =================== Missile Job Hub Card Component ===================
export default function MissileJobHubCard() {
  const [activeMissileJobs, setActiveMissileJobs] = useState([]);
  const [upcomingMissileJobs, setUpcomingMissileJobs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  function handleAddJob(job) {
    setActiveMissileJobs(jobs => [
      ...jobs,
      { ...job, status: "Active" }
    ]);
  }

  return (
    <div
      className="border-2 border-white rounded-2xl shadow-2xl px-4 flex flex-col min-h-[60px]"
      style={{
        width: '100%',
        /* ===== Glass background only — no layout/sizing changes ===== */
        background: 'var(--glass-tint)',
        backdropFilter: 'blur(var(--glass-blur))',
        WebkitBackdropFilter: 'blur(var(--glass-blur))',
        boxShadow: 'var(--glass-shadow)',
        borderColor: '#6a7257',
      }}
    >
      {/* Header row with plus icon in top right, center-aligned and matching other cards */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #6a7257',
          marginBottom: 1,
          paddingTop: 1,
          paddingBottom: 1,
          position: 'relative',
        }}
      >
        <h2
          className="font-extrabold tracking-wide uppercase"
          style={{
            color: "white",
            fontWeight: 900,
            fontSize: "1.125rem",
            textAlign: "center",
            letterSpacing: ".07em",
            margin: 0,
            padding: 0,
            flex: 1,
          }}
        >
          MISSILE JOBS
        </h2>
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <ActionIconBtn
            icon={icons.plus}
            tooltip="Add Missile Job"
            onClick={() => setModalOpen(true)}
          />
        </div>
      </div>

      {/* --------- ACTIVE MISSILE JOBS --------- */}
      <div className="mb-0">
        <h3 className="text-xs font-extrabold text-[#36c172] uppercase tracking-wider text-center pl-2 pb-1 mt-2">
          Active Missile Jobs
        </h3>
        <div
          className={
            colClasses +
            " items-center pb-1 pt-2 border-b border-[#393c32] mb-1 font-extrabold text-[#b0b79f] text-xs uppercase tracking-wider"
          }
          style={{ fontSize: "0.75rem" }}
        >
          <span className="text-center w-full"></span>
          <span className="text-center underline w-full">Customer</span>
          <span className="text-center underline w-full">LSD</span>
          <span className="text-center underline w-full">Missile</span>
          <span className="text-center underline w-full">Start Date</span>
          <span className="text-center underline w-full">Status</span>
          <span className="text-center underline w-full">Actions</span>
        </div>
        <div className="flex flex-col">
          {activeMissileJobs.length === 0 ? (
            <div className="text-center italic text-sm text-[#6a7257] py-3">No active missile jobs.</div>
          ) : (
            activeMissileJobs.map((job, idx) => (
              <MissileJobRow job={job} key={idx} highlight={true} />
            ))
          )}
        </div>
      </div>

      {/* --------- UPCOMING MISSILE JOBS --------- */}
      <div>
        <h3 className="text-xs font-extrabold rounded-2xl text-yellow-300 uppercase tracking-wider text-center pl-2 pb-1 mt-4">
          Upcoming Missile Jobs
        </h3>
        <div
          className={
            colClasses +
            " items-center pb-1 pt-2 border-b border-[#393c32] mb-1 font-bold text-[#b0b79f] text-xs uppercase tracking-wider"
          }
          style={{ fontSize: "0.75rem" }}
        >
          <span className="text-center w-full"></span>
          <span className="text-center underline w-full">Customer</span>
          <span className="text-center underline w-full">LSD</span>
          <span className="text-center underline w-full">Missile</span>
          <span className="text-center underline w-full">Start Date</span>
          <span className="text-center underline w-full">Status</span>
          <span className="text-center underline w-full">Actions</span>
        </div>
        <div className="flex flex-col">
          {upcomingMissileJobs.length === 0 ? (
            <div className="text-center italic text-sm text-[#6a7257] py-3">No upcoming missile jobs.</div>
          ) : (
            upcomingMissileJobs.map((job, idx) => (
              <MissileJobRow job={job} key={idx} />
            ))
          )}
        </div>
      </div>
      <AddMissileJobModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddJob}
      />
    </div>
  );
}
