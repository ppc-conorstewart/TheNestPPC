import React, { useState } from "react";
import { FaEye, FaCheckCircle, FaTimesCircle, FaListAlt, FaLink } from "react-icons/fa";

const initialChecklist = [
  { label: "BEV system design reviewed", done: false },
  { label: "All sensors and cameras assigned", done: false },
  { label: "Data link & power supply verified", done: false },
  { label: "Field install schedule confirmed", done: false }
];

const initialParts = [
  { name: "Thermal Imaging Camera", status: "Pending" },
  { name: "PTZ Dome Camera", status: "In Transit" },
  { name: "Data Uplink Module", status: "Pending" },
  { name: "Mounting Kit", status: "Delivered" }
];

const initialSteps = [
  "Finalize site network plan",
  "Run installation test on site A",
  "Activate remote dashboard for client"
];

const initialLog = [
  { date: "2025-07-10", entry: "System BOM approved by client." },
  { date: "2025-07-13", entry: "Thermal camera ordered." }
];

const PalomaBEVCard = () => {
  const [checklist, setChecklist] = useState(initialChecklist);
  const [parts, setParts] = useState(initialParts);
  const [nextSteps, setNextSteps] = useState(initialSteps);
  const [showLog, setShowLog] = useState(false);

  // Progress bar calculation
  const total = checklist.length;
  const complete = checklist.filter((item) => item.done).length;
  const percent = total === 0 ? 0 : Math.round((complete / total) * 100);

  // Handlers
  const handleCheck = (idx) => {
    setChecklist((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, done: !item.done } : item))
    );
  };

  const handleStatusChange = (idx, newStatus) => {
    setParts((prev) =>
      prev.map((part, i) =>
        i === idx ? { ...part, status: newStatus } : part
      )
    );
  };

  return (
    <div className="bg-[#262920] rounded-xl shadow-lg border border-[#494f3c] flex flex-col px-5 py-4 min-h-[540px]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <FaEye className="text-green-400 text-2xl" />
        <h2 className="text-lg font-bold tracking-wider text-[#FAF5E6] uppercase">
          Paloma Birds Eye View System
        </h2>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-[#cfd3c3] font-semibold uppercase">
            Progress
          </span>
          <span className="text-xs text-[#cfd3c3]">{percent}%</span>
        </div>
        <div className="w-full h-3 bg-[#3c4133] rounded-md overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-green-300 transition-all duration-300"
            style={{ width: `${percent}%` }}
          ></div>
        </div>
      </div>

      {/* Pre-Deployment Checklist */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <FaListAlt className="text-[#b0b79f]" />
          <span className="text-sm text-[#cfddb3] font-semibold">
            Pre-Deployment Checklist
          </span>
        </div>
        <ul className="space-y-1 pl-1">
          {checklist.map((item, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => handleCheck(idx)}
                className="accent-green-400 w-4 h-4"
              />
              <span
                className={`text-xs ${
                  item.done ? "line-through text-[#949c7f]" : "text-[#faf5e6]"
                }`}
              >
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Incoming Parts */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <FaCheckCircle className="text-[#b0b79f]" />
          <span className="text-sm text-[#cfddb3] font-semibold">
            Incoming Parts
          </span>
        </div>
        <table className="w-full text-xs text-[#e6e8df]">
          <tbody>
            {parts.map((part, idx) => (
              <tr key={idx} className="border-b border-[#35392e]">
                <td className="py-1">{part.name}</td>
                <td className="py-1">
                  <select
                    value={part.status}
                    onChange={(e) => handleStatusChange(idx, e.target.value)}
                    className="bg-[#3c4133] rounded px-1 py-0.5 text-xs border border-[#949c7f]"
                  >
                    <option>Pending</option>
                    <option>In Transit</option>
                    <option>Delivered</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Next Steps */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <FaTimesCircle className="text-[#b0b79f]" />
          <span className="text-sm text-[#cfddb3] font-semibold">
            Next Steps
          </span>
        </div>
        <ul className="list-disc ml-6 text-xs text-[#faf5e6]">
          {nextSteps.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ul>
      </div>

      {/* Activity Log / Quick Links (Collapsible) */}
      <div>
        <button
          onClick={() => setShowLog((s) => !s)}
          className="flex items-center text-[#b0b79f] text-xs mt-2 hover:underline"
        >
          <FaLink className="mr-1" />
          {showLog ? "Hide Log & Links" : "Show Activity Log & Quick Links"}
        </button>
        {showLog && (
          <div className="mt-2">
            <div className="text-[11px] text-[#e6e8df] font-semibold mb-1">
              Activity Log
            </div>
            <ul className="text-[11px] text-[#f3f4f1] mb-2">
              {initialLog.map((log, idx) => (
                <li key={idx}>
                  <span className="text-[#949c7f] mr-1">{log.date}:</span>
                  {log.entry}
                </li>
              ))}
            </ul>
            <div className="text-[11px] text-[#e6e8df] font-semibold mb-1">
              Quick Links
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href="#"
                className="underline text-blue-300 text-[11px] hover:text-blue-200"
              >
                System Diagram
              </a>
              <a
                href="#"
                className="underline text-blue-300 text-[11px] hover:text-blue-200"
              >
                Camera Specs
              </a>
              <a
                href="#"
                className="underline text-blue-300 text-[11px] hover:text-blue-200"
              >
                Live Demo Dashboard
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PalomaBEVCard;
