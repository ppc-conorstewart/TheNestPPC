// =================== Imports and Dependencies ===================
// src/pages/JobPlannerComponents/JobPlannerRightPanel.jsx

import { ChevronDown, ChevronUp, Plus, Users } from "lucide-react";
import { useState } from "react";

// =================== JobPlannerRightPanel Component ===================
export default function JobPlannerRightPanel({ onAddJob, children }) {
  // --------- Local State ---------
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showRfpTable, setShowRfpTable] = useState(false);

  // --------- Data Arrays ---------
  const customers = ["Baytex", "Whitecap", "Ovintiv", "Crescent Point"];
  const rfpData = [
    {
      customer: "Baytex",
      totalWells: 12,
      dateSubmitted: "2025-03-15",
      dateResubmitted: "2025-06-01",
    },
    {
      customer: "Whitecap",
      totalWells: 8,
      dateSubmitted: "2025-04-02",
      dateResubmitted: "2025-07-12",
    },
    {
      customer: "Ovintiv",
      totalWells: 20,
      dateSubmitted: "2025-02-22",
      dateResubmitted: "2025-06-10",
    },
  ];

  // --------- Handlers ---------
  const handleFullYearClick = (customer) => {
    alert(`${customer} full year program clicked.`);
  };

  // =================== Render JobPlannerRightPanel ===================
  return (
    <div
      className="right-side-panel flex flex-col px-2 pt-4"
      style={{
        minWidth: 280,
        maxWidth: 360,
        background: "#000",
        boxShadow: "0 0 32px #000d",
        borderTopRightRadius: "1rem",
        borderBottomRightRadius: "1rem",
        display: "flex",
      }}
    >
      {/* --------- Add New Job Button --------- */}
      <button
        className="mb-4 flex items-center justify-center gap-2 px-4 py-2 bg-black text-white font-semibold rounded shadow hover:bg-[#1a1a1a] transition-all text-sm w-full"
        onClick={onAddJob}
      >
        <Plus className="w-4 h-4" />
        Add New Job
      </button>

  

     

      {/* --------- Customer List Dropdown --------- */}
      <div className="w-full mb-4">
        <button
          className="flex items-center justify-between px-4 py-2 bg-black text-white font-semibold rounded shadow hover:bg-[#1a1a1a] transition-all text-sm w-full"
          onClick={() => setShowCustomerDropdown((prev) => !prev)}
        >
          <span className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Customer List
          </span>
          {showCustomerDropdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showCustomerDropdown && (
          <div className="mt-2 ml-4 text-white space-y-2">
            {customers.map((customer, index) => (
              <div key={index} className="pl-4 border-l-4 border-[#6a7257]">
                <p className="text-sm font-semibold">{customer}</p>
                <button
                  className="text-xs text-blue-400 underline ml-2 hover:text-blue-200 transition"
                  onClick={() => handleFullYearClick(customer)}
                >
                  Full Year Program
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --------- Slot for Any Widgets Passed as Children --------- */}
      <div className="w-full mt-2">{children}</div>
    </div>
  );
}
