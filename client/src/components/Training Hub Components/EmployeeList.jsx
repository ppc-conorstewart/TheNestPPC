// ==============================
// EmployeeList.jsx — Add New Employee Button + Modal Ready
// ==============================

import { useState } from "react";

// LEVELS array is needed for rank label
export const LEVELS = [
  { key: 0, label: "Project Technician I" },
  { key: 1, label: "Project Technician II" },
  { key: 2, label: "Project Technician III" },
  { key: 3, label: "Project Technician IV" },
  { key: 4, label: "Site Supervisor V" }
];

// Color codes for each rank (customize as needed)
const LEVEL_COLORS = [
  "#C7FA38",    // I - bright lime
  "#2CCDD3",    // II - cyan
  "#FFD943",    // III - gold (was your default)
  "#E8842E",    // IV - orange
  "#F14D4D"     // V - red (Site Supervisor)
];

const EMPLOYEE_LOCATIONS = {
  "Daniel Swartz": "Grande Prairie",
  "Jeff Bennett": "Red Deer",
  "Mitch Martin": "Grande Prairie",
  "Dillan Campbell": "Red Deer",
  "Ryker Kelly": "Red Deer",
  "Abe Nazari": "Red Deer",
  "John Wells": "Red Deer",
  "Jeremy Dutchak": "Red Deer",
  "Dawson Howell": "Grande Prairie",
  "Colton Peters": "Grande Prairie",
  "Greg Hultin": "Red Deer",
  "Dustin Luke": "Grande Prairie",
  "Ryan Gray": "Red Deer",
  "Cam Pannenbecker": "Red Deer",
  "Todd Cuza": "Grande Prairie",
  "Keegan Fiveland": "Red Deer",
  "Jameel Emery": "Red Deer",
  "Mike Brushett": "Red Deer",
  "Matthew Gray": "Grande Prairie",
  "Jesse Bird": "Red Deer",
  "Patrick Bennett": "Red Deer",
  "Chace Levis": "Red Deer",
  "Landen Brown": "Red Deer",
  "Austyn Jordan": "Red Deer",
  "Trevor Mervyn": "Red Deer",
  "Drew Twells": "Red Deer",
  "Matthew McCausland": "Grande Prairie",
  "Efraim Ebo": "Grande Prairie",
  "Ernesto Rea Jr.": "Grande Prairie",
  "Ruslan Karandashov": "Grande Prairie",
  "Marco Patton": "Red Deer",
  "Connor Krebs": "Red Deer",
  "Daniel Roblin": "Grande Prairie"
};

export function getCurrentLevel(employeeChecklist) {
  if (!employeeChecklist) return 0;
  for (let lvl = 0; lvl < LEVELS.length; lvl++) {
    let checked = 0, total = 0;
    Object.values(employeeChecklist?.[lvl] || {}).forEach(group =>
      Object.values(group).forEach(item => {
        total++;
        if (item.checked) checked++;
      })
    );
    if (total === 0 || checked < total) return lvl;
  }
  return LEVELS.length - 1; // All complete, highest rank
}

// ==============================
// AddEmployeeModal (extracted below main component)
// ==============================
function AddEmployeeModal({ open, onClose, onSubmit, form, setForm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-[#232429] border-2 border-[#949C7F] rounded-2xl px-8 py-2 min-w-[340px] max-w-[97vw] shadow-2xl relative flex flex-col items-center">
        <button
          className="absolute top-1 right-2 text-xl text-red-400 hover:text-red-600 font-bold focus:outline-none transition"
          onClick={onClose}
          tabIndex={0}
          aria-label="Close"
          style={{ lineHeight: 1 }}
        >✕</button>
        <h2 className="text-xl  mb-2 text-[#b3b99a] tracking-wider font-varien">
           Add New Employee
        </h2>
        <form
          onSubmit={e => { e.preventDefault(); onSubmit(); }}
          className="w-full flex flex-col gap-4"
          autoComplete="off"
        >
          <div className="flex items-center gap-2">
            <label className="w-32 text-right text-[#b3b99a] text-sm font-bold pr-0">First Name:</label>
            <input
              type="text"
              className="flex-1 px-3 py-0 rounded bg-[#18181b] border border-[#949C7F] text-[#f3f4f1] font-semibold focus:ring-2 focus:ring-[#6a7257] outline-none transition"
              value={form.firstName}
              onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
              required
              autoFocus
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-32 text-right text-[#b3b99a] text-sm font-bold pr-0">Last Name:</label>
            <input
              type="text"
              className="flex-1 px-3 py-1 rounded bg-[#18181b] border border-[#949C7F] text-[#f3f4f1] font-semibold focus:ring-2 focus:ring-[#6a7257] outline-none transition"
              value={form.lastName}
              onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-32 text-right text-[#b3b99a] text-sm font-bold pr-0">Base:</label>
            <input
              type="text"
              className="flex-1 px-3 py-1 rounded bg-[#18181b] border border-[#949C7F] text-[#f3f4f1] font-semibold focus:ring-2 focus:ring-[#6a7257] outline-none transition"
              value={form.base}
              onChange={e => setForm(f => ({ ...f, base: e.target.value }))}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-32 text-right text-[#b3b99a] text-sm font-bold pr-0">Assessed as:</label>
            <input
              type="text"
              className="flex-1 px-3 py-1 rounded bg-[#18181b] border border-[#949C7F] text-[#f3f4f1] font-semibold focus:ring-2 focus:ring-[#6a7257] outline-none transition"
              value={form.assessedAs}
              onChange={e => setForm(f => ({ ...f, assessedAs: e.target.value }))}
              required
            />
          </div>
          <div className="flex flex-row justify-center mt-4">
            <button
              type="submit"
              className="px-10 py-0 rounded bg-[#949C7F] hover:bg-[#b3b99a] text-black  text-base shadow-md transition tracking-widest font-erbaum"
              disabled={
                !form.firstName || !form.lastName || !form.base || !form.assessedAs
              }
            >
             Submit New Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==============================
// EmployeeList Sidebar (main component)
// ==============================
export default function EmployeeList({
  fieldEmployees,
  selectedEmployee,
  employeeChecklists,
  onSelectEmployee,
  onAddEmployee // <-- pass a handler from parent to add new employee
}) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    base: "",
    assessedAs: ""
  });

  function getDisplayLevel(emp) {
    return getCurrentLevel(employeeChecklists[emp]);
  }

  return (
    <div style={{ height: "52%", minHeight: 260, overflowY: "auto" }}>
      <div
        className="px-4 py-2 border-b-2 border-[#6a7257] font-erbaum uppercase text-white text-xs bg-black uppercase tracking-wide font-bold flex items-center justify-between"
        style={{ fontSize: ".85rem", letterSpacing: "0.02em" }}
      >
        <span>Field Employees</span>
        <button
          className="ml-2 px-1 py-0 rounded bg-[#949C7F] text-black text-xs font-bold shadow hover:bg-[#b3b99a] transition"
          onClick={() => setShowModal(true)}
          style={{ minWidth: 30 }}
        >
          +New Employee
        </button>
      </div>
      <ul className="divide-y divide-[#23282b] py-1">
        {fieldEmployees.map((emp, idx) => {
          const empLevel = getDisplayLevel(emp);
          const location = EMPLOYEE_LOCATIONS[emp] || "";
          return (
            <li
              key={emp + idx}
              className={`px-5 py-2 flex items-center justify-between uppercase text-white text-[0.66rem] font-semibold font-erbaum hover:bg-[#24261f] cursor-pointer transition-all ${
                selectedEmployee === emp ? "bg-[#24261f]" : ""
              }`}
              style={{
                letterSpacing: "0.01em",
                userSelect: "none"
              }}
              tabIndex={0}
              role="button"
              onClick={() => onSelectEmployee(emp)}
            >
              {/* Name + Location */}
              <span
                style={{
                  flex: 2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <span>{emp}</span>
                <span style={{
                  marginLeft: 8,
                  color: "#9ED67C",
                  fontWeight: 600,
                  fontSize: ".65em",
                  letterSpacing: ".01em"
                }}>
                  {location ? `[${location}]` : ""}
                </span>
              </span>
              {/* Rank */}
              <span
                className="font-erbaum font-bold text-[0.6rem] ml-2"
                style={{
                  minWidth: 58,
                  textAlign: "right",
                  color: LEVEL_COLORS[empLevel] || "#FFD943",
                  letterSpacing: "0.01em",
                  textShadow: empLevel === 4 ? "0 0 5px #c33" : undefined
                }}
              >
                {LEVELS[empLevel]?.label || ""}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Modal */}
      <AddEmployeeModal
        open={showModal}
        onClose={() => setShowModal(false)}
        form={form}
        setForm={setForm}
        onSubmit={() => {
          if (
            form.firstName &&
            form.lastName &&
            form.base &&
            form.assessedAs
          ) {
            if (onAddEmployee) onAddEmployee(form);
            setShowModal(false);
            setForm({ firstName: "", lastName: "", base: "", assessedAs: "" });
          }
        }}
      />
    </div>
  );
}
