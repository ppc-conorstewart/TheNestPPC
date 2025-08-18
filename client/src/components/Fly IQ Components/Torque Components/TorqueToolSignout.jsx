// ==============================
// TorqueToolSignout.jsx — Erbaum, Table Borders, Compact, Aligned
// ==============================

export default function TorqueToolSignout({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-80"
      style={{ fontFamily: "Erbaum, sans-serif" }}
    >
      <div
        className="relative w-[92vw] max-w-[1380px] h-[78vh] bg-black border-[2.5px] border-[#949C7F]  shadow-lg flex flex-col"
        style={{
          boxShadow: "0 8px 38px #1d292a90, 0 2px 12px #090e0e60",
        }}
      >
        {/* Modal Header */}
        <div
          className="flex items-center justify-between rounded-2xl px-7 py-2 border-b-[3px] border-[#949C7F] bg-black"
          style={{
            minHeight: 48,
          }}
        >
          <img
            src="/assets/whitelogo.png"
            alt="Paloma Logo"
            className="h-8"
            style={{ marginRight: 8 }}
          />
          <h1
            className="text-white font-bold uppercase"
            style={{
              fontSize: "2.0rem",
              fontFamily: "Erbaum, sans-serif",
              
              paddingBottom: 2,
              margin: 0,
              textAlign: "center",
              flex: 1,
              letterSpacing: 1.5,
              fontWeight: 800,
            }}
          >
            Torque Tool Sign-out
          </h1>
          <button
            onClick={onClose}
            className="text-white text-2xl px-4 hover:text-[#b7c495] focus:outline-none"
            style={{ marginLeft: 8, fontFamily: "Erbaum, sans-serif" }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Main Panel Layout */}
        <div className="flex flex-1 w-full h-full divide-x divide-[#949C7F] bg-black">
          {/* SIGN-OUT/RETURN PANEL */}
          <div className="flex flex-col min-w-[260px] max-w-[370px] w-full bg-black px-5 py-4">
            <div
              className="text-white font-bold text-center mb-2"
              style={{
                fontFamily: "Erbaum, sans-serif",
                textShadow: "0 1px 4px #000",
                fontSize: "1.3rem",
                letterSpacing: 0.5,
                fontWeight: 800,
              }}
            >
              Sign-Out/Return
            </div>
            <div
              className="uppercase font-bold text-[1rem] text-white tracking-wide mb-1"
              style={{ fontFamily: "Erbaum, sans-serif" }}
            >
              Return or Signout:
            </div>
            <select
              className="w-full bg-black border border-[#949C7F] text-white px-2 py-1 mb-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b7c495]"
              style={{
                fontFamily: "Erbaum, sans-serif",
                fontSize: "0.98rem",
              }}
            >
              <option value="">Select...</option>
              <option value="signout">Sign Out</option>
              <option value="return">Return</option>
            </select>
            {/* Inputs are now right of labels, always in a row */}
            {[
              ["NAME:", ""],
              ["BASE:", ""],
              ["JOB:", ""],
              ["PUMPS +", ""],
              ["DRIVES +", ""],
              ["LINKS +", ""],
            ].map(([label, val], i) => (
              <div
                key={label}
                className="flex items-center mb-2"
                style={{
                  fontFamily: "Erbaum, sans-serif",
                  fontSize: "1rem",
                }}
              >
                <label
                  className="text-white font-bold"
                  style={{
                    minWidth: 74,
                    textAlign: "right",
                    letterSpacing: 0.5,
                  }}
                >
                  {label}
                </label>
                <input
                  className="bg-black border border-[#949C7F] text-white px-2 py-1 ml-3 rounded-md flex-1"
                  style={{
                    fontFamily: "Erbaum, sans-serif",
                    fontSize: "0.97rem",
                  }}
                  value={val}
                  readOnly // For demo; replace with real input logic as needed
                />
              </div>
            ))}
            <div
              className="text-white font-bold rounded-xl text-[1rem] mb-1 mt-2"
              style={{
                fontFamily: "Erbaum, sans-serif",
                letterSpacing: 0.4,
              }}
            >
              ATTACH IMAGES <span className="ml-1 text-[#b7c495] text-lg font-bold">+</span>
            </div>
            <input
              type="file"
              multiple
              className="mb-3 block text-white"
              style={{
                background: "none",
                border: "none",
                fontFamily: "Erbaum, sans-serif",
                fontSize: "0.97rem",
              }}
            />
            <button
              className="w-full bg-[#b7c495] text-black font-bold rounded-lg py-2 mt-3 tracking-wide"
              style={{
                fontFamily: "Erbaum, sans-serif",
                fontSize: "1.2rem",
                letterSpacing: 1.2,
                boxShadow: "0 2px 12px #00000040",
              }}
            >
              SUBMIT
            </button>
          </div>

          {/* CURRENTLY OUT PANEL */}
          <div className="flex-1 flex flex-col bg-black px-2 py-2">
            <div
              className="text-white font-bold text-center mb-1"
              style={{
                fontFamily: "Erbaum, sans-serif",
                fontSize: "1.13rem",
                letterSpacing: 0.6,
                fontWeight: 800,
              }}
            >
              Currently out:
            </div>
            <TorqueTableSection label="PUMPS" />
            <TorqueTableSection label="DRIVES" />
            <TorqueTableSection label="LINKS" />
          </div>

          {/* INVENTORY/STATUS PANEL */}
          <div className="flex-1 flex flex-col bg-black px-2 py-2">
            <div
              className="text-white font-bold text-center mb-1"
              style={{
                fontFamily: "Erbaum, sans-serif",
                fontSize: "1.13rem",
                letterSpacing: 0.6,
                fontWeight: 800,
              }}
            >
              Inventory/Status
            </div>
            <TorqueTableSection label="PUMPS" />
            <TorqueTableSection label="DRIVES" />
            <TorqueTableSection label="LINKS" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Table Section
function TorqueTableSection({ label }) {
  return (
    <div className="mb-2">
      <div
        className="text-white font-bold rounded-xl text-center mt-2 mb-1"
        style={{
          fontFamily: "Erbaum, sans-serif",
          fontSize: "1.1rem",
          letterSpacing: 1,
          fontWeight: 800,
        }}
      >
        {label}
      </div>
      <table
        className="w-full rounded border-collapse text-left"
        style={{
          fontFamily: "Erbaum, sans-serif",
          fontSize: "0.97rem",
          border: "2px solid #949C7F",
        }}
      >
        <thead>
          <tr>
            <th
              className="text-[#b7c495] font-bold px-2 py-1 border border-[#949C7F] bg-black"
              style={{ fontFamily: "Erbaum, sans-serif" }}
            >
              Serial Number
            </th>
            <th
              className="text-[#b7c495] font-bold px-2 py-1 border border-[#949C7F] bg-black"
              style={{ fontFamily: "Erbaum, sans-serif" }}
            >
              Location
            </th>
            <th
              className="text-[#b7c495] font-bold px-2 py-1 border border-[#949C7F] bg-black"
              style={{ fontFamily: "Erbaum, sans-serif" }}
            >
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, i) => (
            <tr key={i}>
              <td className="h-[1.45rem] border border-[#949C7F] rounded-xl text-white px-2"></td>
              <td className="h-[1.45rem] border border-[#949C7F] rounded-xltext-white px-2"></td>
              <td className="h-[1.45rem] border border-[#949C7F] rounded-xl text-white px-2"></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
