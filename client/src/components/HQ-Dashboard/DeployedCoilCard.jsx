// =================== Imports and Dependencies ===================
import { useState } from "react";
import ScaleToFit from "../ui/ScaleToFit";

// =================== Icon SVGs ===================
const icons = {
  plus: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="#57b4ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="7" x2="12" y2="17" />
      <line x1="7" y1="12" x2="17" y2="12" />
    </svg>
  ),
  bom: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M9 9h6v6H9z" />
    </svg>
  ),
  tree: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="6" r="4" />
      <path d="M6 20v-2a4 4 0 0 1 8 0v2" />
      <line x1="12" y1="10" x2="12" y2="20" />
    </svg>
  ),
  edit: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" />
    </svg>
  ),
  receive: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="#5bd674" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  partial: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="#ffe066" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L10 17l-5-5" />
    </svg>
  ),
};

// =================== Action Icon Button Component ===================
function ActionIconBtn({ icon, tooltip, color, border, bg, onClick }) {
  const [showTip, setShowTip] = useState(false);

  return (
    <div className="relative flex items-center justify-center">
      <button
        className={`
          rounded-full border-2 flex items-center justify-center
          bg-[#191d18]
          border-[#393c32]
          transition duration-150 transform
          w-[24px] h-[24px] min-w-[24px] min-h-[24px] max-w-[24px] max-h-[24px]
          hover:scale-110
          hover:border-[#57b4ff]
          focus:outline-none
        `}
        style={{
          color: color || "#57b4ff",
          borderColor: border || "#393c32",
          background: bg || "#191d18",
          padding: 0,
          margin: 0,
        }}
        tabIndex={0}
        aria-label={tooltip}
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
        onFocus={() => setShowTip(true)}
        onBlur={() => setShowTip(false)}
        onClick={onClick}
      >
        {icon}
      </button>
      {showTip && (
        <span
          className={`
            absolute z-30 left-1/2 -translate-x-1/2 top-7
            pointer-events-none select-none
            whitespace-nowrap
            bg-black bg-opacity-90 text-[#57b4ff] text-xs px-2 py-1 rounded
            font-bold
            shadow-md border border-[#57b4ff]
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

// =================== Add Job Modal Component ===================
function AddJobModal({ open, onClose, onSubmit }) {
  const [customer, setCustomer] = useState("");
  const [lsd, setLsd] = useState("");
  const [numWells, setNumWells] = useState("");
  const [dateDeployed, setDateDeployed] = useState("");
  const [expectedReturn, setExpectedReturn] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      customer,
      surface_lsd: lsd,
      num_wells: numWells,
      date_deployed: dateDeployed,
      expected_return_date: expectedReturn,
      customerLogo: "",
    });
    onClose();
    setCustomer("");
    setLsd("");
    setNumWells("");
    setDateDeployed("");
    setExpectedReturn("");
  }

  if (!open) return null;

  const fs = (v) => `calc(${v} * 0.75)`;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
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
          width: 610,
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
              color: "#e6ffe6",
              fontWeight: 900,
              fontSize: fs("1.55rem"),
              letterSpacing: ".03em",
              textAlign: "center",
              fontFamily: "Cornero, Erbaum, sans-serif",
              flex: 1,
            }}
          >
            Add Deployed Coil Job
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              fontSize: fs("20px"),
              color: "#ffffffb3",
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

        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 7,
          }}
        >
          <label style={{
            color: "#e6ffe6",
            fontWeight: 700,
            fontSize: fs("0.97rem"),
            marginBottom: 2,
            marginTop: 0
          }}>
            Customer
          </label>
          <input
            style={{
              background: "#191d18",
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
            color: "#e6ffe6",
            fontWeight: 700,
            fontSize: fs("0.97rem"),
            margin: "6px 0 2px"
          }}>
            LSD
          </label>
          <input
            style={{
              background: "#191d18",
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
            color: "#e6ffe6",
            fontWeight: 700,
            fontSize: fs("0.97rem"),
            margin: "6px 0 2px"
          }}>
            # Wells
          </label>
          <input
            style={{
              background: "#191d18",
              border: "2px solid #6a7257",
              borderRadius: 8,
              color: "#fff",
              padding: "7px 11px",
              marginBottom: 0,
              fontWeight: 700,
              fontSize: fs("1rem"),
              fontFamily: "Erbaum, sans-serif",
            }}
            type="number"
            min={1}
            max={20}
            required
            value={numWells}
            onChange={e => setNumWells(e.target.value)}
            placeholder="Number of Wells"
          />

          <label style={{
            color: "#e6ffe6",
            fontWeight: 700,
            fontSize: fs("0.97rem"),
            margin: "6px 0 2px"
          }}>
            Date Deployed
          </label>
          <input
            style={{
              background: "#191d18",
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
            value={dateDeployed}
            onChange={e => setDateDeployed(e.target.value)}
          />

          <label style={{
            color: "#e6ffe6",
            fontWeight: 700,
            fontSize: fs("0.97rem"),
            margin: "6px 0 2px"
          }}>
            Expected Return
          </label>
          <input
            style={{
              background: "#191d18",
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
            value={expectedReturn}
            onChange={e => setExpectedReturn(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 9, marginTop: 17, width: "100%" }}>
          <button
            type="button"
            style={{
              flex: 1,
              background: "#10110e",
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
              color: "#fff",
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

// =================== Deployed Coil Card Component ===================
export default function DeployedCoilCard() {
  const [jobs, setJobs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  // --------- Grid Layout Classes ---------
  const colClasses =
    "grid grid-cols-[56px_170px_140px_80px_140px_170px_120px] w-full";

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
      {/* ===== Header ===== */}
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
            color: "#57b4ff",
            fontWeight: 900,
            fontSize: "1.125rem",
            textAlign: "center",
            letterSpacing: ".07em",
            margin: 0,
            padding: 0,
            flex: 1,
          }}
        >
          DEPLOYED COIL EQUIPMENT
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
            tooltip="Add Job"
            onClick={() => setModalOpen(true)}
          />
        </div>
      </div>

      {/* ===== Scaled Content (Header Row + Rows) ===== */}
      <ScaleToFit className="w-full flex-1 min-h-0">
        <div className="w-full">
          {/* Table/Header Row */}
          <div
            className={
              colClasses +
              " items-center pb-1 pt-2 border-b border-[#393c32] mb-1 font-bold text-[#b0b79f] text-xs uppercase tracking-wider relative"
            }
            style={{ fontSize: "0.75rem" }}
          >
            <span className="text-center w-full"></span>
            <span className="text-center underline w-full">Customer</span>
            <span className="text-center underline w-full">LSD</span>
            <span className="text-center underline w-full"># Wells</span>
            <span className="text-center underline w-full">Date Deployed</span>
            <span className="text-center underline w-full">Expected Return</span>
            <span className="text-center w-full"></span>
          </div>

          {/* Rows */}
          <div className="flex flex-col">
            {jobs.length === 0 ? (
              <div className="text-center py-8 text-[#6a7257] text-sm italic font-bold tracking-wide opacity-70">
                No coil jobs deployed yet.
              </div>
            ) : (
              jobs.map((job, idx) => (
                <div
                  key={idx}
                  className={
                    colClasses +
                    " items-center py-1 group relative transition-all duration-200 rounded-lg " +
                    "hover:bg-gradient-to-r hover:from-[#20241a]/90 hover:to-[#34381a]/90 cursor-pointer"
                  }
                  style={{
                    minHeight: 32,
                    fontSize: "0.75rem",
                    boxShadow: "0 0 0.5px 0 #35392e, 0 8px 24px 0 #23240e33",
                  }}
                  tabIndex={0}
                  aria-label={`Deployed coil job: ${job.customer} ${job.surface_lsd}`}
                >
                  {/* Logo Column */}
                  <div className="flex flex-row items-center justify-center w-full">
                    <span
                      className="inline-block w-2 h-2 rounded-full bg-blue-400 shadow border border-[#162b49] mr-1"
                      title="Deployed"
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
                          color: "#b0d6ff",
                          fontSize: 8,
                          fontWeight: 900,
                        }}
                      >
                        Logo
                      </span>
                    </div>
                  </div>
                  {/* Customer Column */}
                  <div className="flex flex-col items-center w/full justify-center">
                    <span className="font-bold text-white text-xs uppercase tracking-wide text-center" style={{ fontSize: "0.75rem" }}>
                      {job.customer}
                    </span>
                  </div>
                  {/* LSD Column */}
                  <div className="flex flex-col items-center w/full">
                    <span className="text-xs text-[#b0b79f] font-mono text-center" style={{ fontSize: "0.75rem" }}>
                      {job.surface_lsd}
                    </span>
                  </div>
                  {/* Wells Column */}
                  <div className="flex flex-col items-center w/full">
                    <span className="text-xs text-[#ffe066] font-bold font-mono text-center" style={{ fontSize: "0.75rem" }}>
                      {job.num_wells != null && !isNaN(Number(job.num_wells))
                        ? Number(job.num_wells).toFixed(0)
                        : "-"}
                    </span>
                  </div>
                  {/* Date Deployed Column */}
                  <div className="flex flex-col items-center w/full">
                    <span className="text-xs font-bold font-mono text-[#4adeff] text-center" style={{ fontSize: "0.75rem" }}>
                      {job.date_deployed
                        ? new Date(job.date_deployed).toLocaleDateString("en-US", {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                          })
                        : "-"}
                    </span>
                  </div>
                  {/* Expected Return Column */}
                  <div className="flex flex-col items-center w/full">
                    <span className="text-xs font-bold font-mono text-[#ffe066] text-center" style={{ fontSize: "0.75rem" }}>
                      {job.expected_return_date
                        ? new Date(job.expected_return_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                          })
                        : "-"}
                    </span>
                  </div>
                  {/* Actions Column */}
                  <div className="flex flex-row items-center justify-center w/full gap-1">
                    <ActionIconBtn icon={icons.bom} tooltip="Total BOM" />
                    <ActionIconBtn icon={icons.tree} tooltip="Per Tree Build Config" />
                    <ActionIconBtn icon={icons.edit} tooltip="Edit Info" />
                    <ActionIconBtn
                      icon={icons.receive}
                      tooltip="Receive"
                      color="#5bd674"
                      border="#43b35c"
                      bg="#191d18"
                    />
                    <ActionIconBtn
                      icon={icons.partial}
                      tooltip="Partial Receive"
                      color="#ffe066"
                      border="#ffe066"
                      bg="#191d18"
                    />
                  </div>

                  {idx !== jobs.length - 1 && (
                    <div className="absolute left-4 right-4 -bottom-1 h-px bg-gradient-to-r from-transparent via-[#35392e] to-transparent opacity-60 pointer-events-none"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </ScaleToFit>

      <AddJobModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={job => setJobs(j => [...j, job])}
      />
    </div>
  );
}
