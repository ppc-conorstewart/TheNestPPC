// ==============================
// VisitsTable.jsx — Add New Visit Modal
// ==============================

import { useState } from "react";

function AddVisitModal({ open, onClose, onSubmit, form, setForm, customerList = [] }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[#232429] border-2 border-[#949C7F] rounded-xl px-8 py-0 flex flex-col items-center min-w-[420px] max-w-[98vw] shadow-2xl relative">
        <button
          className="absolute top-1 right-2 text-xl text-[#949C7F] hover:text-red-600  focus:outline-none transition"
          onClick={onClose}
          tabIndex={0}
          aria-label="Close"
          style={{ lineHeight: 1 }}
        >✕</button>
        <h2 className="text-2xl  mb-4 text-[#b3b99a] tracking-wider font-varien">
          Add New Field Visit
        </h2>
        <form
          onSubmit={e => { e.preventDefault(); onSubmit(); }}
          className="w-full flex flex-col gap-4"
          autoComplete="off"
        >
          <div className="flex items-center gap-2">
            <label className="w-44 text-right text-[#b3b99a] text-xs font-bold pr-2">Date of Visit</label>
            <input
              type="date"
              className="flex-1 px-3 py-1 rounded uppercase text-xs bg-[#18181b] border border-[#949C7F] text-[#f3f4f1]  focus:ring-2 focus:ring-[#6a7257] outline-none transition"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-44 text-right text-[#b3b99a] text-xs font-bold pr-2">Customer</label>
            <input
              type="text"
              className="flex-1 px-3 py-1 rounded text-xs bg-[#18181b] border border-[#949C7F] text-[#f3f4f1] font-semibold focus:ring-2 focus:ring-[#6a7257] outline-none transition"
              value={form.customer}
              onChange={e => setForm(f => ({ ...f, customer: e.target.value }))}
              required
              
            />
            {/* Or use a dropdown for customers:
            <select
              className="flex-1 px-3 py-1 rounded bg-[#18181b] border border-[#949C7F] text-[#f3f4f1] font-semibold"
              value={form.customer}
              onChange={e => setForm(f => ({ ...f, customer: e.target.value }))}
              required
            >
              <option value="">Select Customer</option>
              {customerList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            */}
          </div>
          <div className="flex items-center gap-2">
            <label className="w-44 text-right text-[#b3b99a] text-xs font-bold pr-2">LSD</label>
            <input
              type="text"
              className="flex-1 px-3 py-1 rounded text-xs bg-[#18181b] border border-[#949C7F] text-[#f3f4f1] font-semibold focus:ring-2 focus:ring-[#6a7257] outline-none transition"
              value={form.lsd}
              onChange={e => setForm(f => ({ ...f, lsd: e.target.value }))}
              required
              
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-44 text-right text-[#b3b99a] text-xs font-bold pr-2">Employees Targeted</label>
            <input
              type="text"
              className="flex-1 px-3 py-1 rounded text-xs bg-[#18181b] border border-[#949C7F] text-[#f3f4f1] font-semibold focus:ring-2 focus:ring-[#6a7257] outline-none transition"
              value={form.employees}
              onChange={e => setForm(f => ({ ...f, employees: e.target.value }))}
              required
              
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-44 text-right text-[#b3b99a] text-xs font-bold pr-2">Training Selected</label>
            <input
              type="text"
              className="flex-1 px-3 py-1 rounded text-xs  bg-[#18181b] border border-[#949C7F] text-[#f3f4f1] font-semibold focus:ring-2 focus:ring-[#6a7257] outline-none transition"
              value={form.training}
              onChange={e => setForm(f => ({ ...f, training: e.target.value }))}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-44 text-right text-[#b3b99a] text-xs font-bold pr-2">Trainer</label>
            <input
              type="text"
              className="flex-1 px-3 py-1 rounded text-xs bg-[#18181b] border border-[#949C7F] text-[#f3f4f1] font-semibold focus:ring-2 focus:ring-[#6a7257] outline-none transition"
              value={form.trainer}
              onChange={e => setForm(f => ({ ...f, trainer: e.target.value }))}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-44 text-right text-[#b3b99a] text-xs font-bold pr-2">Training Objectives</label>
            <input
              type="text"
              className="flex-1 px-3 py-1 rounded bg-[#18181b] text-xs  border border-[#949C7F] text-[#f3f4f1] font-semibold focus:ring-2 focus:ring-[#6a7257] outline-none transition"
              value={form.objectives}
              onChange={e => setForm(f => ({ ...f, objectives: e.target.value }))}
              required
              
            />
          </div>
          <div className="flex flex-row justify-end mt-4">
            <button
              type="submit"
              className="px-2 py-0 rounded bg-[#949C7F] hover:bg-[#b3b99a] text-black mb-2 text-sm shadow-md transition tracking-widest font-erbaum font-bold "
              disabled={
                !form.date || !form.customer || !form.lsd || !form.employees || !form.training || !form.trainer || !form.objectives
              }
            >
              Add Visit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VisitsTable({ visits = [], onAddVisit, customerList }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    date: "",
    customer: "",
    lsd: "",
    employees: "",
    training: "",
    trainer: "",
    objectives: ""
  });

  return (
    <div
      className="flex-none flex flex-col items-stretch justify-start py-3 px-3"
      style={{
        borderTop: "4px solid #6a7257",
        borderRight: "4px solid #6a7257",
        borderBottom: "2px solid #6a7257",
        background: "#000",
        minHeight: "30%",
        maxHeight: "18%",
        height: "18%",
        overflow: "auto"
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-white text-lg font-erbaum font-bold tracking-wide uppercase" style={{ letterSpacing: "0.03em", fontSize: "0.98rem" }}>
          Field Visits Scheduled
        </h2>
        <button
          className="flex items-center gap-1 bg-[#6a7257] text-black px-2 py-1 rounded font-bold font-erbaum text-xs hover:bg-[#7fa173] transition focus:outline-none"
          style={{
            boxShadow: "0 1px 5px #0003",
            fontSize: ".7rem"
          }}
          onClick={() => setShowModal(true)}
        >
          <svg width="12" height="12" fill="none" stroke="black" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add New Visit
        </button>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="min-w-full text-xs border-separate" style={{ borderSpacing: 0 }}>
          <thead>
            <tr className="bg-[#161916]">
              <th className="py-1.5 px-1.5 font-erbaum text-left text-[#6a7257] font-bold border-b border-[#35392E] uppercase" style={{ fontSize: ".67rem", padding: "0.32rem 0.25rem" }}>Date of Visit</th>
              <th className="py-1.5 px-1.5 font-erbaum text-left text-[#6a7257] font-bold border-b border-[#35392E] uppercase" style={{ fontSize: ".67rem", padding: "0.32rem 0.25rem" }}>Customer</th>
              <th className="py-1.5 px-1.5 font-erbaum text-left text-[#6a7257] font-bold border-b border-[#35392E] uppercase" style={{ fontSize: ".67rem", padding: "0.32rem 0.25rem" }}>LSD</th>
              <th className="py-1.5 px-1.5 font-erbaum text-left text-[#6a7257] font-bold border-b border-[#35392E] uppercase" style={{ fontSize: ".67rem", padding: "0.32rem 0.25rem" }}>Employees Targeted</th>
              <th className="py-1.5 px-1.5 font-erbaum text-left text-[#6a7257] font-bold border-b border-[#35392E] uppercase" style={{ fontSize: ".67rem", padding: "0.32rem 0.25rem" }}>Training Selected</th>
              <th className="py-1.5 px-1.5 font-erbaum text-left text-[#6a7257] font-bold border-b border-[#35392E] uppercase" style={{ fontSize: ".67rem", padding: "0.32rem 0.25rem" }}>Trainer</th>
              <th className="py-1.5 px-1.5 font-erbaum text-left text-[#6a7257] font-bold border-b border-[#35392E] uppercase" style={{ fontSize: ".67rem", padding: "0.32rem 0.25rem" }}>Training Objectives</th>
            </tr>
          </thead>
          <tbody>
            {visits.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-3 text-center text-gray-400 font-erbaum italic text-xs">
                  No field visits scheduled yet.
                </td>
              </tr>
            ) : (
              visits.map((visit, idx) => (
                <tr key={idx} className="hover:bg-[#1d2216] border-b border-[#23282b] transition">
                  <td className="py-1 px-1.5 text-white font-erbaum" style={{ fontSize: ".72rem", padding: "0.32rem 0.25rem" }}>{visit.date}</td>
                  <td className="py-1 px-1.5 text-white font-erbaum" style={{ fontSize: ".72rem", padding: "0.32rem 0.25rem" }}>{visit.customer}</td>
                  <td className="py-1 px-1.5 text-white font-erbaum" style={{ fontSize: ".72rem", padding: "0.32rem 0.25rem" }}>{visit.lsd}</td>
                  <td className="py-1 px-1.5 text-white font-erbaum" style={{ fontSize: ".72rem", padding: "0.32rem 0.25rem" }}>{visit.employees}</td>
                  <td className="py-1 px-1.5 text-white font-erbaum" style={{ fontSize: ".72rem", padding: "0.32rem 0.25rem" }}>{visit.training}</td>
                  <td className="py-1 px-1.5 text-white font-erbaum" style={{ fontSize: ".72rem", padding: "0.32rem 0.25rem" }}>{visit.trainer}</td>
                  <td className="py-1 px-1.5 text-white font-erbaum" style={{ fontSize: ".72rem", padding: "0.32rem 0.25rem" }}>{visit.objectives}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <AddVisitModal
        open={showModal}
        onClose={() => setShowModal(false)}
        form={form}
        setForm={setForm}
        onSubmit={() => {
          if (
            form.date && form.customer && form.lsd &&
            form.employees && form.training && form.trainer && form.objectives
          ) {
            if (onAddVisit) onAddVisit(form);
            setShowModal(false);
            setForm({
              date: "",
              customer: "",
              lsd: "",
              employees: "",
              training: "",
              trainer: "",
              objectives: ""
            });
          }
        }}
        customerList={customerList}
      />
    </div>
  );
}
