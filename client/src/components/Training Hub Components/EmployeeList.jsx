// ==============================
// EmployeeList.jsx — Full-Height Employee Panel
// ==============================

import { useMemo, useState } from "react";

// LEVELS array is needed for rank label
export const LEVELS = [
  { key: 0, label: "Project Technician I" },
  { key: 1, label: "Project Technician II" },
  { key: 2, label: "Project Technician III" },
  { key: 3, label: "Project Technician IV" },
  { key: 4, label: "Site Supervisor V" }
];

// Color codes for each rank
const LEVEL_COLORS = [
  "#C7FA38", "#2CCDD3", "#FFD943", "#E8842E", "#F14D4D"
];

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
  return LEVELS.length - 1;
}

// ==============================
// AddEmployeeModal
// ==============================
function AddEmployeeModal({ open, onClose, onSubmit, form, setForm, submitting, errorMessage }) {
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
        <h2 className="text-xl mb-2 text-[#b3b99a] tracking-wider font-varien">
           Add New Employee
        </h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSubmit();
          }}
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
            <select
              className="flex-1 px-3 py-1 rounded bg-[#18181b] border border-[#949C7F] text-[#f3f4f1] font-semibold focus:ring-2 focus:ring-[#6a7257] outline-none transition"
              value={form.assessedAs ?? ""}
              onChange={e => setForm(f => ({ ...f, assessedAs: Number(e.target.value) }))}
              required
            >
              <option value="" disabled>Select level</option>
              {LEVELS.map((lvl, idx) => (
                <option key={lvl.key} value={idx}>{lvl.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-row justify-center mt-4">
            <button
              type="submit"
            className={`px-10 py-0 rounded text-black text-base shadow-md transition tracking-widest font-erbaum ${
                submitting ? 'bg-[#5f6453] cursor-not-allowed text-gray-300' : 'bg-[#949C7F] hover:bg-[#b3b99a]'
              }`}
              disabled={
                submitting ||
                !form.firstName ||
                !form.lastName ||
                !form.base ||
                form.assessedAs === null ||
                Number.isNaN(form.assessedAs)
              }
            >
             {submitting ? 'Adding...' : 'Submit New Employee'}
            </button>
          </div>
          {errorMessage ? (
            <p className="text-red-400 text-xs text-center font-semibold tracking-wide">
              {errorMessage}
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}

// ==============================
// DeleteEmployeeModal
// ==============================
function DeleteEmployeeModal({ open, onClose, onConfirm, employeeName, submitting, errorMessage }) {
  const [confirmText, setConfirmText] = useState("");

  if (!open) return null;
  const canDelete = confirmText === "DELETE";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
      <div className="bg-[#232429] border-2 border-[#F14D4D] rounded-2xl px-8 py-4 min-w-[360px] max-w-[95vw] shadow-2xl relative">
        <button
          className="absolute top-2 right-3 text-xl text-red-400 hover:text-red-600 font-bold focus:outline-none transition"
          onClick={onClose}
          aria-label="Close"
          style={{ lineHeight: 1 }}
        >✕</button>

        <h2 className="text-lg mb-3 text-[#ffb3b3] tracking-wider font-erbaum uppercase">
          Delete Field Employee
        </h2>

        <p className="text-sm text-[#f3f4f1] mb-3">
          You are about to permanently remove{' '}
          <span className="font-bold text-[#FFD943]">{employeeName || 'this employee'}</span>{' '}
          and all associated training records and documents. This action cannot be undone.
        </p>

        <label className="block text-xs text-[#b3b99a] mb-1 font-bold">
          Type <span className="text-red-400">DELETE</span> to confirm:
        </label>
        <input
          type="text"
          value={confirmText}
          onChange={e => setConfirmText(e.target.value)}
          className="w-full px-3 py-2 rounded bg-[#18181b] border border-[#949C7F] text-[#f3f4f1] font-semibold focus:ring-2 focus:ring-[#6a7257] outline-none transition"
          placeholder="DELETE"
          autoFocus
        />

        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-1 rounded text-xs font-erbaum font-bold bg-[#3a3f2e] text-gray-300 hover:bg-[#474d39] transition"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-1 rounded text-xs font-erbaum font-bold transition ${
              canDelete && !submitting
                ? 'bg-[#F14D4D] text-black hover:bg-[#ff6a6a]'
                : 'bg-[#6a2d2d] text-[#b08787] cursor-not-allowed'
            }`}
            onClick={() => canDelete && !submitting ? onConfirm() : null}
            disabled={!canDelete || submitting}
          >
            {submitting ? 'Deleting...' : 'Confirm Delete'}
          </button>
        </div>

        {errorMessage ? (
          <p className="mt-2 text-red-400 text-xs font-semibold tracking-wide">{errorMessage}</p>
        ) : null}
      </div>
    </div>
  );
}

// ==============================
// EmployeeList Sidebar (main component)
// ==============================
export default function EmployeeList({
  employees = [],
  selectedEmployeeId,
  employeeChecklists,
  onSelectEmployee,
  onAddEmployee,
  onDeleteEmployee
}) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    base: "",
    assessedAs: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  function getDisplayLevel(emp) {
    const presetLevel = Number.isFinite(emp?.level) ? emp.level : 0;
    const checklistLevel = getCurrentLevel(employeeChecklists?.[emp?.id]);
    return Math.max(presetLevel, checklistLevel);
  }

  const selectedEmployee = useMemo(
    () => employees.find(e => e.id === selectedEmployeeId) || null,
    [employees, selectedEmployeeId]
  );

  const handleOpenModal = () => {
    setSubmitError("");
    setForm({ firstName: "", lastName: "", base: "", assessedAs: null });
    setShowModal(true);
  };

  async function handleSubmitNewEmployee() {
    if (!onAddEmployee) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      await onAddEmployee(form);
      setShowModal(false);
      setForm({ firstName: "", lastName: "", base: "", assessedAs: null });
    } catch (err) {
      setSubmitError(err?.message || "Failed to add employee.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleOpenDelete() {
    setDeleteError("");
    setDeleteOpen(true);
  }

  async function handleConfirmDelete() {
    if (!onDeleteEmployee || !selectedEmployee) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await onDeleteEmployee(selectedEmployee.id);
      setDeleteOpen(false);
    } catch (err) {
      setDeleteError(err?.message || "Failed to delete employee.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div style={{ height: "100%", minHeight: 260, overflowY: "auto" }}>
      <div
        className="px-4 py-2 border-b-2 border-[#6a7257] font-erbaum uppercase text-white text-xs bg-black tracking-wide font-bold flex items-center justify-between gap-2"
        style={{ fontSize: ".85rem", letterSpacing: "0.02em" }}
      >
        <span>Field Employees</span>
        <div className="flex items-center gap-2">
          <button
            className="ml-2 px-1 py-0 rounded bg-[#949C7F] text-black text-xs font-bold shadow hover:bg-[#b3b99a] transition"
            onClick={handleOpenModal}
            style={{ minWidth: 30 }}
          >
            +New Employee
          </button>
          <button
            className={`px-2 py-0 rounded text-xs font-bold shadow transition ${
              selectedEmployee ? 'bg-[#F14D4D] text-black hover:bg-[#ff6a6a]' : 'bg-[#6a2d2d] text-[#b08787] cursor-not-allowed'
            }`}
            onClick={() => selectedEmployee ? handleOpenDelete() : null}
            disabled={!selectedEmployee}
            title={selectedEmployee ? `Delete ${selectedEmployee.full_name}` : "Select an employee to delete"}
          >
            Delete
          </button>
        </div>
      </div>

      <ul className="divide-y divide-[#23282b] py-1">
        {employees.length === 0 ? (
          <li className="px-5 py-4 text-[#949C7F] text-xs uppercase font-erbaum tracking-wide text-center">
            No field employees found.
          </li>
        ) : (
          employees.map((emp) => {
            const empLevel = getDisplayLevel(emp);
            const location = emp?.base_location || "";
            return (
              <li
                key={emp.id}
                className={`px-5 py-2 flex items-center justify-between uppercase text-white text-[0.66rem] font-semibold font-erbaum hover:bg-[#24261f] cursor-pointer transition-all ${
                  selectedEmployeeId === emp.id ? "bg-[#24261f]" : ""
                }`}
                style={{ letterSpacing: "0.01em", userSelect: "none" }}
                tabIndex={0}
                role="button"
                onClick={() => onSelectEmployee(emp.id)}
              >
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
                  <span>{emp.full_name}</span>
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
          })
        )}
      </ul>

      {/* ============================== */}
      {/* Modal: Add Employee */}
      {/* ============================== */}
      <AddEmployeeModal
        open={showModal}
        onClose={() => setShowModal(false)}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmitNewEmployee}
        submitting={submitting}
        errorMessage={submitError}
      />

      {/* ============================== */}
      {/* Modal: Delete Employee */}
      {/* ============================== */}
      <DeleteEmployeeModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        employeeName={selectedEmployee?.full_name}
        submitting={deleting}
        errorMessage={deleteError}
      />
    </div>
  );
}
