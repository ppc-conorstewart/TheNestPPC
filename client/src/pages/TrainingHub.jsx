// ==============================
// TrainingHub.jsx — Left Panel = Employees Only; Right Panel = Tabbed Content
// ==============================

import { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import CompetencyChecklist from "../components/Training Hub Components/CompetencyChecklist";
import competencies from "../components/Training Hub Components/CompetencyMatrix.js";
import CompetencyTabs from "../components/Training Hub Components/CompetencyTabs";
import DocumentHub from "../components/Training Hub Components/DocumentHub";
import EmployeeList, { LEVELS } from "../components/Training Hub Components/EmployeeList";
import VisitsTable from "../components/Training Hub Components/VisitsTable";
import useFieldEmployees from "../hooks/useFieldEmployees";
import { resolveApiUrl } from "../api";

// ==============================
// Helpers — Competency scaffolding
// ==============================
const TODAY = () => new Date().toISOString().slice(0, 10);

function deepClone(value) {
  try {
    return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
  } catch (err) {
    return JSON.parse(JSON.stringify(value));
  }
}

function buildChecklistTemplate(presetLevel = 0) {
  const template = {};
  const preset = Number.isFinite(presetLevel) ? presetLevel : 0;
  const today = TODAY();

  LEVELS.forEach((_, lvl) => {
    template[lvl] = {};
    const levelCompetencies = competencies?.[lvl];
    const groups = Array.isArray(levelCompetencies?.groups) ? levelCompetencies.groups : [];
    groups.forEach((group, gIdx) => {
      template[lvl][gIdx] = {};
      const items = Array.isArray(group?.items) ? group.items : [];
      items.forEach((_, iIdx) => {
        const isPreset = lvl < preset;
        template[lvl][gIdx][iIdx] = {
          checked: isPreset,
          date: isPreset ? today : "",
          assessor: ""
        };
      });
    });
  });

  return template;
}

function normalizeChecklist(source, presetLevel = 0) {
  const base = buildChecklistTemplate(presetLevel);
  if (!source || typeof source !== "object") return base;

  const result = deepClone(base);
  Object.keys(result).forEach((levelKey) => {
    const levelIndex = Number(levelKey);
    const levelData = Array.isArray(source)
      ? source[levelIndex]
      : source[levelKey] ?? source[levelIndex];
    if (!levelData) return;

    Object.keys(result[levelKey] || {}).forEach((groupKey) => {
      const groupIndex = Number(groupKey);
      const groupData = Array.isArray(levelData)
        ? levelData[groupIndex]
        : levelData[groupKey] ?? levelData[groupIndex];
      if (!groupData) return;

      Object.keys(result[levelKey][groupKey] || {}).forEach((itemKey) => {
        const itemIndex = Number(itemKey);
        const itemData = Array.isArray(groupData)
          ? groupData[itemIndex]
          : groupData[itemKey] ?? groupData[itemIndex];
        if (!itemData) return;

        result[levelKey][groupKey][itemKey] = {
          checked: Boolean(itemData.checked),
          date: itemData.date || "",
          assessor: itemData.assessor || ""
        };
      });
    });
  });

  return result;
}

function formatDocuments(docs = []) {
  return docs.map((doc) => ({
    id: doc?.id,
    name: doc?.name || doc?.original_filename || "Document",
    uploaded: doc?.uploaded_at ? new Date(doc.uploaded_at).toLocaleString() : "",
    downloadUrl: doc?.downloadUrl || doc?.download_url || null
  }));
}

function getLevelProgress(employeeChecklist, level) {
  if (!employeeChecklist || employeeChecklist[level] == null) return { checked: 0, total: 0, percent: 0 };
  let checked = 0;
  let total = 0;
  Object.values(employeeChecklist[level]).forEach((group) =>
    Object.values(group).forEach((item) => {
      total++;
      if (item.checked) checked++;
    })
  );
  return { checked, total, percent: total ? Math.round((checked / total) * 100) : 0 };
}

function getPresetOrProgressLevel(employeeChecklist, presetLevel = 0) {
  const preset = Number.isFinite(presetLevel) ? presetLevel : 0;
  let progress = 0;
  for (let lvl = 0; lvl < LEVELS.length; lvl++) {
    const { percent } = getLevelProgress(employeeChecklist, lvl);
    if (percent < 100) {
      progress = lvl;
      break;
    }
    if (lvl === LEVELS.length - 1) progress = lvl;
  }
  return Math.max(preset, progress);
}

// ==============================
// SECTION: Right Panel Tabs
// ==============================
const RIGHT_TABS = [
  { key: "VISITS", label: "Field Visits" },
  { key: "DOCUMENTS", label: "Document Hub" },
  { key: "NOTES", label: "Employee Notes" },
  { key: "COMPETENCIES", label: "Competencies" }
];

// ==============================
// SECTION: Notes Panel
// ==============================
function NotesPanel({ value, onChange, onSave, saving }) {
  return (
    <div className="flex flex-col gap-2 px-3 py-3" style={{ height: "100%" }}>
      <div className="flex items-center justify-between">
        <h3 className="text-white font-erbaum font-bold uppercase tracking-wide" style={{ fontSize: ".9rem" }}>
          Employee Notes
        </h3>
        <button
          onClick={onSave}
          disabled={saving}
          className={`px-3 py-1 rounded font-erbaum font-bold text-xs transition ${
            saving
              ? "bg-[#3a3f2e] text-gray-500 cursor-not-allowed"
              : "bg-[#6a7257] text-black hover:bg-[#7fa173]"
          }`}
          style={{ boxShadow: "0 1px 5px #0003" }}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
      <textarea
        className="w-full flex-1 bg-black border border-[#6a7257] text-white rounded px-2 py-2 text-xs font-erbaum resize-none"
        style={{ minHeight: 120 }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Add employee-specific notes here..."
      />
    </div>
  );
}

// ==============================
// SECTION: Main Component
// ==============================
export default function TrainingHub() {
  const {
    employees,
    loading,
    createEmployee,
    saveNotes,
    saveCompetencies,
    uploadDocuments,
    deleteDocument,
    deleteEmployee
  } = useFieldEmployees();

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [employeeChecklists, setEmployeeChecklists] = useState({});
  const [employeeDocuments, setEmployeeDocuments] = useState({});
  const [employeeNotes, setEmployeeNotes] = useState({});
  const [tabLevel, setTabLevel] = useState(0);
  const [rightTab, setRightTab] = useState(RIGHT_TABS[0].key);
  const [savingNotes, setSavingNotes] = useState(false);

  const [visits, setVisits] = useState([
    {
      date: "2025-08-01",
      customer: "Teine",
      lsd: "13-27-086-04W6",
      employees: "Brandon Mendocilla, Logan Mckellar",
      training: "Wellhead Refresher",
      trainer: "Ryan Beebe",
      objectives: "Proper valve greasing, pad safety"
    }
  ]);
  const handleAddVisit = (newVisit) => setVisits((prev) => [...prev, newVisit]);

  // Ensure selected employee stays valid as list changes
  useEffect(() => {
    if (!employees.length) {
      setSelectedEmployeeId(null);
      return;
    }
    setSelectedEmployeeId((prev) => {
      if (prev && employees.some((emp) => emp.id === prev)) return prev;
      return employees[0]?.id ?? null;
    });
  }, [employees]);

  // Sync notes state with server payload
  useEffect(() => {
    setEmployeeNotes((prev) => {
      const next = {};
      employees.forEach((emp) => {
        next[emp.id] = Object.prototype.hasOwnProperty.call(prev, emp.id)
          ? prev[emp.id]
          : emp.notes || "";
      });
      return next;
    });
  }, [employees]);

  // Sync competency checklists
  useEffect(() => {
    setEmployeeChecklists((prev) => {
      const next = {};
      employees.forEach((emp) => {
        const preset = Number.isFinite(emp?.level) ? emp.level : 0;
        const base = Object.prototype.hasOwnProperty.call(prev, emp.id)
          ? prev[emp.id]
          : emp.competencies;
        next[emp.id] = normalizeChecklist(base, preset);
      });
      return next;
    });
  }, [employees]);

  // Sync documents state
  useEffect(() => {
    setEmployeeDocuments(() => {
      const next = {};
      employees.forEach((emp) => {
        next[emp.id] = formatDocuments(emp.documents || []);
      });
      return next;
    });
  }, [employees]);

  const selectedEmployee = employees.find((emp) => emp.id === selectedEmployeeId) || null;
  const currentChecklist = selectedEmployee ? employeeChecklists[selectedEmployee.id] : null;
  const currentDocuments = selectedEmployee ? employeeDocuments[selectedEmployee.id] || [] : [];
  const currentNotes = selectedEmployee ? employeeNotes[selectedEmployee.id] || "" : "";
  const presetLevel = Number.isFinite(selectedEmployee?.level) ? selectedEmployee.level : 0;
  const unlockedLevel = getPresetOrProgressLevel(currentChecklist, presetLevel);

  useEffect(() => {
    if (!selectedEmployee) return;
    const safeLevel = Math.min(unlockedLevel, LEVELS.length - 1);
    setTabLevel((prev) => {
      if (Number.isFinite(prev) && prev <= LEVELS.length - 1) {
        return prev > safeLevel ? safeLevel : prev;
      }
      return safeLevel;
    });
  }, [selectedEmployee, unlockedLevel]);

  const progress = getLevelProgress(currentChecklist, tabLevel);
  const progressByLevel = useMemo(() => {
    const result = {};
    LEVELS.forEach((_, lvl) => {
      result[lvl] = getLevelProgress(currentChecklist, lvl);
    });
    return result;
  }, [currentChecklist]);

  const handleSelectEmployee = useCallback((empId) => {
    setSelectedEmployeeId(empId);
  }, []);

  const handleAddEmployee = useCallback(async (form) => {
    const first = (form.firstName || "").trim();
    const last = (form.lastName || "").trim();
    const base = (form.base || "").trim();
    const assessedLevel = typeof form.assessedAs === "number" ? form.assessedAs : null;

    if (!first || !last) throw new Error("First and last name are required.");
    if (!base) throw new Error("Base location is required.");
    if (!Number.isInteger(assessedLevel) || assessedLevel < 0 || assessedLevel >= LEVELS.length) {
      throw new Error("Please select a valid assessed level.");
    }

    const fullName = `${first} ${last}`.replace(/\s+/g, " ").trim();
    const derivedLevel = assessedLevel;

    const created = await createEmployee({
      full_name: fullName,
      base_location: base,
      rank: derivedLevel,
      level: derivedLevel
    });

    const checklist = normalizeChecklist(created.competencies, created.level);
    setEmployeeNotes((prev) => ({ ...prev, [created.id]: created.notes || "" }));
    setEmployeeChecklists((prev) => ({ ...prev, [created.id]: checklist }));
    setEmployeeDocuments((prev) => ({ ...prev, [created.id]: formatDocuments(created.documents) }));
    setSelectedEmployeeId(created.id);
    const safeLevel = Math.min(getPresetOrProgressLevel(checklist, created.level), LEVELS.length - 1);
    setTabLevel(safeLevel);
  }, [createEmployee]);

  const handleChecklistChange = useCallback(
    (level, groupIdx, itemIdx, employeeKey, updateObj) => {
      if (!employeeKey) return;
      const employee = employees.find((emp) => emp.id === employeeKey);
      if (!employee) return;

      setEmployeeChecklists((prev) => {
        const current = prev[employeeKey]
          ? deepClone(prev[employeeKey])
          : normalizeChecklist(employee.competencies, employee.level);
        const targetGroup = current?.[level]?.[groupIdx];
        if (!targetGroup || !targetGroup[itemIdx]) return prev;

        const item = targetGroup[itemIdx];
        if (updateObj && Object.prototype.hasOwnProperty.call(updateObj, "assessor")) {
          item.assessor = updateObj.assessor;
        } else {
          item.checked = !item.checked;
          item.date = item.checked ? TODAY() : "";
          if (!item.checked) item.assessor = "";
        }

        const next = { ...prev, [employeeKey]: current };
        saveCompetencies(employeeKey, current).catch(() => {});
        return next;
      });
    },
    [employees, saveCompetencies]
  );

  const handleAddDocuments = useCallback(async (files) => {
    if (!selectedEmployee || !files?.length) return;
    try {
      const docs = await uploadDocuments(selectedEmployee.id, files);
      setEmployeeDocuments((prev) => ({
        ...prev,
        [selectedEmployee.id]: formatDocuments(docs)
      }));
    } catch {
      // silent
    }
  }, [selectedEmployee, uploadDocuments]);

  const handleDeleteDocument = useCallback(async (docId) => {
    if (!selectedEmployee || !docId) return;
    try {
      await deleteDocument(selectedEmployee.id, docId);
      setEmployeeDocuments((prev) => ({
        ...prev,
        [selectedEmployee.id]: (prev[selectedEmployee.id] || []).filter((doc) => doc.id !== docId)
      }));
    } catch {
      // silent
    }
  }, [selectedEmployee, deleteDocument]);

  const handleDownloadDocument = useCallback((doc) => {
    if (!doc?.downloadUrl) return;
    const url = resolveApiUrl(doc.downloadUrl);
    window.open(url, "_blank", "noopener");
  }, []);

  const handleChangeNotes = useCallback((value) => {
    if (!selectedEmployee) return;
    setEmployeeNotes((prev) => ({ ...prev, [selectedEmployee.id]: value }));
  }, [selectedEmployee]);

  const handleSaveNotes = useCallback(async () => {
    if (!selectedEmployee) return;
    setSavingNotes(true);
    try {
      await saveNotes(selectedEmployee.id, employeeNotes[selectedEmployee.id] || "");
    } finally {
      setSavingNotes(false);
    }
  }, [selectedEmployee, employeeNotes, saveNotes]);

  const handleDeleteEmployee = useCallback(async (id) => {
    try {
      await deleteEmployee(id);
    } finally {
      setEmployeeNotes(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setEmployeeChecklists(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setEmployeeDocuments(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      if (selectedEmployeeId === id) {
        const remaining = employees.filter(e => e.id !== id);
        setSelectedEmployeeId(remaining[0]?.id ?? null);
      }
    }
  }, [deleteEmployee, employees, selectedEmployeeId]);

  if (!Array.isArray(competencies) || !competencies[tabLevel]) {
    return (
      <div className="w-full h-full flex items-center justify-center text-red-500 font-bold text-lg">
        Error: Competency matrix data not loaded. Please check your CompetencyMatrix.js file and import path.
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-full ml-12 pr-12 flex relative">
      <Sidebar />

      {/* ============================== */}
      {/* SECTION: Page Header */}
      {/* ============================== */}
      <div className="absolute top-0 left-0 right-0 text-center py-0 camo-header" style={{ zIndex: 5 }}>
        <h1 style={{ fontFamily: "Punoer, sans-serif" }} className="text-white uppercase text-5xl">Paloma Training Hub</h1>
      </div>

      {/* ============================== */}
      {/* SECTION: Content Columns */}
      {/* ============================== */}
      <div className="flex flex-1 h-[88vh] min-h-[640px] max-w-full mx-auto flex-row" style={{ marginTop: 70 }}>
        {/* LEFT: Employees ONLY */}
        <div
          className="flex-none flex flex-col"
          style={{
            width: "28%",
            minWidth: 270,
            borderRight: "4px solid #6a7257",
            borderBottom: "4px solid #6a7257",
            borderLeft: "4px solid #6a7257",
            borderTop: "4px solid #6a7257",
            background: "black",
            position: "relative",
            height: "100%"
          }}
        >
          <EmployeeList
            employees={employees}
            selectedEmployeeId={selectedEmployeeId}
            employeeChecklists={employeeChecklists}
            onSelectEmployee={handleSelectEmployee}
            onAddEmployee={handleAddEmployee}
            onDeleteEmployee={handleDeleteEmployee}
          />
          {loading && (
            <div className="absolute bottom-2 left-0 right-0 text-center text-[0.6rem] uppercase tracking-wide text-[#9da48a] font-erbaum">
              Loading field employees...
            </div>
          )}
        </div>

        {/* RIGHT: Tabbed Area */}
        <div className="flex flex-col flex-1 h-full" style={{ minWidth: 0 }}>
          {/* Tabs for right panel */}
          <div
            className="flex items-center gap-2 px-3 py-2"
            style={{
              borderTop: "4px solid #6a7257",
              borderRight: "4px solid #6a7257",
              background: "#000"
            }}
          >
            {RIGHT_TABS.map((t) => {
              const active = rightTab === t.key;
              return (
                <button
                  key={t.key}
                  className="font-erbaum px-3 py-1 rounded text-xs uppercase tracking-wide font-bold"
                  style={{
                    letterSpacing: "0.03em",
                    color: active ? "#FFD943" : "#bbb",
                    background: active ? "#23282b" : "#181c15",
                    border: active ? "2px solid #FFD943" : "2px solid transparent",
                    transition: "all .12s"
                  }}
                  onClick={() => setRightTab(t.key)}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {rightTab === "VISITS" && (
            <div className="flex-none">
              <VisitsTable visits={visits} onAddVisit={handleAddVisit} />
            </div>
          )}

          {rightTab === "DOCUMENTS" && (
            <div
              className="flex-1"
              style={{
                borderRight: "4px solid #6a7257",
                borderBottom: "4px solid #6a7257",
                background: "#000",
                overflow: "hidden"
              }}
            >
              <DocumentHub
                documents={currentDocuments}
                onAddDocuments={handleAddDocuments}
                onDeleteDocument={handleDeleteDocument}
                onDownloadDocument={handleDownloadDocument}
                employeeName={selectedEmployee?.full_name || ""}
              />
            </div>
          )}

          {rightTab === "NOTES" && (
            <div
              className="flex-1"
              style={{
                borderRight: "4px solid #6a7257",
                borderBottom: "4px solid #6a7257",
                background: "#000",
                overflow: "hidden"
              }}
            >
              <NotesPanel value={currentNotes} onChange={handleChangeNotes} onSave={handleSaveNotes} saving={savingNotes} />
            </div>
          )}

          {rightTab === "COMPETENCIES" && (
            <div
              className="flex-1 flex flex-col items-stretch justify-start px-3 py-3"
              style={{
                borderRight: "4px solid #6a7257",
                borderBottom: "4px solid #6a7257",
                background: "#000",
                minHeight: "70%",
                overflowY: "auto"
              }}
            >
              <CompetencyTabs
                levels={LEVELS}
                tabLevel={tabLevel}
                unlockedLevel={unlockedLevel}
                onTabChange={setTabLevel}
                progressByLevel={progressByLevel}
              />
              <CompetencyChecklist
                competencies={competencies}
                tabLevel={tabLevel}
                currentChecklist={currentChecklist}
                unlockedLevel={unlockedLevel}
                progress={progress}
                selectedEmployee={selectedEmployee?.full_name || ""}
                selectedEmployeeId={selectedEmployee?.id}
                onChecklistChange={handleChecklistChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
