// =================== Imports and Dependencies ===================

// =================== FNCRs Data Array (Replace with Actual Data Source) ===================
const fncrs = []; // Example: [{customerLogo, customer, lsd, description}]

// =================== Active FNCRs Card Component ===================
export default function ActiveFncrsCard() {
  // --------- Column Classes for Grid Layout ---------
  const colClasses =
    "grid grid-cols-[52px_180px_220px_1fr] items-center";

  // =================== Render Active FNCRs Card ===================
  return (
    <div
      className="bg-black border-2 border-[#6a7257] rounded-2xl shadow-2xl p-1 px-4 flex flex-col min-h-[60px] my-0 ml-0"
      style={{
        width: '950px',
        maxWidth: '1000px',
        transform: 'scale(1)',
        transformOrigin: 'left top'
      }}
    >
      {/* --------- Card Title Section --------- */}
      <h2 className="text-lg text-[#e6e8df] border-b border-[#6a7257] font-extrabold mb-2 tracking-wide text-center uppercase">
        Active/Recent FNCR&apos;s
      </h2>
      {/* --------- Header Row --------- */}
      <div className={
        colClasses +
        " pb-1 border-b border-[#393c32] mb-1 font-bold text-[#b0b79f] text-xs uppercase tracking-wider"
      }>
        <span className="text-center w-full"></span>
        <span className="text-center underline w-full">Customer</span>
        <span className="text-center underline w-full">LSD</span>
        <span className="text-center underline w-full">Description</span>
      </div>
      {/* --------- FNCRs List Section --------- */}
      <div className="flex flex-col">
        {fncrs.length === 0 ? (
          <div className="text-center text-gray-400 py-1 text-xs">
            No FNCRs found.
          </div>
        ) : (
          fncrs.map((fncr, idx) => (
            <div
              key={fncr.id || idx}
              className={
                colClasses +
                " items-center py-1 group relative transition-all duration-200 rounded-lg " +
                "hover:bg-gradient-to-r hover:from-[#20241a]/90 hover:to-[#34381a]/90 hover:scale-[1.01] cursor-pointer"
              }
              style={{
                minHeight: 32,
                boxShadow: "0 0 0.5px 0 #35392e, 0 8px 24px 0 #23240e33",
              }}
            >
              {/* Logo Column */}
              <div className="flex flex-row items-center justify-center w-full">
                <img
                  src={fncr.customerLogo}
                  alt={fncr.customer + " logo"}
                  className="h-8 w-8 object-contain rounded-full border-2 border-[#6a7257] shadow bg-white"
                  style={{ minWidth: 32, background: "#fff" }}
                  onError={e => { e.target.style.display = "none"; }}
                />
              </div>
              {/* Customer Name Column */}
              <div className="flex flex-col items-center w-full justify-center">
                <span className="font-bold text-white text-xs uppercase tracking-wide text-center">
                  {fncr.customer}
                </span>
              </div>
              {/* LSD Column */}
              <div className="flex flex-col items-center w-full">
                <span className="text-sm text-[#b0b79f] font-mono text-center">
                  {fncr.lsd}
                </span>
              </div>
              {/* Description Column */}
              <div className="flex flex-col items-center w-full">
                <span className="text-sm text-[#a9c27a] font-mono text-center">
                  {fncr.description}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
