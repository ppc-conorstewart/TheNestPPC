// ==============================
// TrainingHub.jsx — Left Panel = Employees Only; Right Panel = Tabbed Content
// ==============================

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import CompetencyChecklist from "../components/Training Hub Components/CompetencyChecklist";
import competencies from "../components/Training Hub Components/CompetencyMatrix.js";
import CompetencyTabs from "../components/Training Hub Components/CompetencyTabs";
import DocumentHub from "../components/Training Hub Components/DocumentHub";
import EmployeeList, { LEVELS } from "../components/Training Hub Components/EmployeeList";
import VisitsTable from "../components/Training Hub Components/VisitsTable";

// ==============================
// SECTION: Field Employees & Ranks
// ==============================
const fieldEmployees = [
  "Daniel Swartz", "Jeff Bennett", "Mitch Martin", "Dillan Campbell", "Ryker Kelly",
  "Abe Nazari", "John Wells", "Jeremy Dutchak", "Dawson Howell", "Colton Peters",
  "Greg Hultin", "Dustin Luke", "Ryan Gray", "Cam Pannenbecker", "Todd Cuza",
  "Keegan Fiveland", "Jameel Emery", "Mike Brushett", "Matthew Gray", "Jesse Bird",
  "Patrick Bennett", "Chace Levis", "Landen Brown", "Austyn Jordan", "Trevor Mervyn",
  "Drew Twells", "Matthew McCausland", "Efraim Ebo", "Ernesto Rea Jr.", "Ruslan Karandashov",
  "Marco Patton", "Connor Krebs"
];

const fieldEmployeeRanks = {
  "Daniel Swartz": 4, "Jeff Bennett": 3, "Mitch Martin": 3, "Dillan Campbell": 3, "Ryker Kelly": 3,
  "Abe Nazari": 3, "John Wells": 3, "Jeremy Dutchak": 3, "Dawson Howell": 3, "Colton Peters": 3,
  "Greg Hultin": 3, "Dustin Luke": 3, "Ryan Gray": 3, "Cam Pannenbecker": 2, "Todd Cuza": 2,
  "Keegan Fiveland": 2, "Jameel Emery": 2, "Mike Brushett": 2, "Matthew Gray": 2, "Jesse Bird": 2,
  "Patrick Bennett": 1, "Chace Levis": 1, "Landen Brown": 1, "Austyn Jordan": 1, "Trevor Mervyn": 1,
  "Drew Twells": 1, "Matthew McCausland": 1, "Efraim Ebo": 1, "Ernesto Rea Jr.": 1, "Ruslan Karandashov": 0,
  "Marco Patton": 0, "Connor Krebs": 0
};

// ==============================
// SECTION: Utils
// ==============================
function getInitialChecklist(empName) {
  const checklist = {};
  if (!Array.isArray(LEVELS) || !Array.isArray(competencies)) return checklist;
  const presetRank = fieldEmployeeRanks[empName] ?? 0;
  const today = new Date().toISOString().slice(0, 10);

  LEVELS.forEach((_, lvl) => {
    checklist[lvl] = {};
    if (competencies[lvl] && Array.isArray(competencies[lvl].groups)) {
      competencies[lvl].groups.forEach((g, gIdx) => {
        checklist[lvl][gIdx] = {};
        if (Array.isArray(g.items)) {
          g.items.forEach((item, iIdx) => {
            if (lvl < presetRank) {
              checklist[lvl][gIdx][iIdx] = { checked: true, date: today, assessor: "" };
            } else {
              checklist[lvl][gIdx][iIdx] = { checked: false, date: "", assessor: "" };
            }
          });
        }
      });
    }
  });
  return checklist;
}

function getAllInitialChecklists() {
  const obj = {};
  fieldEmployees.forEach(emp => { obj[emp] = getInitialChecklist(emp); });
  return obj;
}

function getAllInitialDocuments() {
  const obj = {};
  fieldEmployees.forEach(emp => { obj[emp] = []; });
  return obj;
}

function getAllInitialNotes() {
  const obj = {};
  fieldEmployees.forEach(emp => { obj[emp] = ""; });
  return obj;
}

function getLevelProgress(employeeChecklist, level) {
  if (!employeeChecklist || employeeChecklist[level] == null) return { checked: 0, total: 0, percent: 0 };
  let checked = 0, total = 0;
  Object.values(employeeChecklist[level]).forEach(group =>
    Object.values(group).forEach(item => {
      total++;
      if (item.checked) checked++;
    })
  );
  return { checked, total, percent: total ? Math.round((checked / total) * 100) : 0 };
}

function getPresetOrProgressLevel(employeeChecklist, empName) {
  const preset = fieldEmployeeRanks[empName] ?? 0;
  let progress = 0;
  for (let lvl = 0; lvl < LEVELS.length; lvl++) {
    const { percent } = getLevelProgress(employeeChecklist, lvl);
    if (percent < 100) { progress = lvl; break; }
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
function NotesPanel({ value, onChange, onSave }) {
  return (
    <div className="flex flex-col gap-2 px-3 py-3" style={{ height: "100%" }}>
      <div className="flex items-center justify-between">
        <h3 className="text-white font-erbaum font-bold uppercase tracking-wide" style={{ fontSize: ".9rem" }}>
          Employee Notes
        </h3>
        <button
          onClick={onSave}
          className="px-3 py-1 rounded bg-[#6a7257] text-black font-erbaum font-bold text-xs hover:bg-[#7fa173] transition"
          style={{ boxShadow: "0 1px 5px #0003" }}
        >
          Save
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
  const [selectedEmployee, setSelectedEmployee] = useState(fieldEmployees[0]);
  const [employeeChecklists, setEmployeeChecklists] = useState(getAllInitialChecklists());
  const [employeeDocuments, setEmployeeDocuments] = useState(getAllInitialDocuments());
  const [employeeNotes, setEmployeeNotes] = useState(getAllInitialNotes());
  const [tabLevel, setTabLevel] = useState(fieldEmployeeRanks[fieldEmployees[0]] ?? 0);

  // Visits
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
  const handleAddVisit = (newVisit) => setVisits(prev => [...prev, newVisit]);

  // Employee selector
  function handleSelectEmployee(emp) {
    setSelectedEmployee(emp);
    setTabLevel(fieldEmployeeRanks[emp] ?? 0);
  }

  // Checklist toggles
  function handleChecklistChange(level, groupIdx, itemIdx, emp, updateObj) {
    setEmployeeChecklists((prev) => {
      const current = prev[emp];
      const itemObj = current[level][groupIdx][itemIdx];
      let newChecked = itemObj.checked;
      let newDate = itemObj.date;
      let newAssessor = itemObj.assessor;

      if (updateObj && Object.prototype.hasOwnProperty.call(updateObj, "assessor")) {
        newAssessor = updateObj.assessor;
      } else {
        newChecked = !itemObj.checked;
        newDate = !itemObj.checked ? new Date().toISOString().slice(0, 10) : "";
        if (!newChecked) newAssessor = "";
      }

      return {
        ...prev,
        [emp]: {
          ...current,
          [level]: {
            ...current[level],
            [groupIdx]: {
              ...current[level][groupIdx],
              [itemIdx]: {
                ...itemObj,
                checked: newChecked,
                date: newDate,
                assessor: newAssessor
              }
            }
          }
        }
      };
    });
  }

  // Documents
  function handleAddDocuments(files) {
    setEmployeeDocuments(prev => {
      const empDocs = prev[selectedEmployee] || [];
      const newDocs = files.map((file) => ({
        id: Math.random().toString(36).slice(2),
        name: file.name,
        uploaded: new Date().toLocaleString(),
        file
      }));
      return { ...prev, [selectedEmployee]: [...empDocs, ...newDocs] };
    });
  }
  function handleDeleteDocument(id) {
    setEmployeeDocuments(prev => {
      const empDocs = prev[selectedEmployee] || [];
      return { ...prev, [selectedEmployee]: empDocs.filter((d) => d.id !== id) };
    });
  }
  function handleDownloadDocument(doc) {
    const url = URL.createObjectURL(doc.file);
    const a = document.createElement("a");
    a.href = url; a.download = doc.name; a.click();
    URL.revokeObjectURL(url);
  }

  // Notes
  const currentNotes = employeeNotes[selectedEmployee] || "";
  function handleChangeNotes(text) {
    setEmployeeNotes(prev => ({ ...prev, [selectedEmployee]: text }));
  }
  function handleSaveNotes() {}

  // Progress
  const currentChecklist = employeeChecklists[selectedEmployee];
  const currentDocuments = employeeDocuments[selectedEmployee] || [];
  const unlockedLevel = getPresetOrProgressLevel(currentChecklist, selectedEmployee);
  const progress = getLevelProgress(currentChecklist, tabLevel);
  const progressByLevel = {};
  LEVELS.forEach((_, lvl) => { progressByLevel[lvl] = getLevelProgress(currentChecklist, lvl); });

  // Right content tab
  const [rightTab, setRightTab] = useState(RIGHT_TABS[0].key);

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
            fieldEmployees={fieldEmployees}
            selectedEmployee={selectedEmployee}
            employeeChecklists={employeeChecklists}
            onSelectEmployee={handleSelectEmployee}
          />
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
            {RIGHT_TABS.map(t => {
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

          {/* Panel Bodies */}
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
                employeeName={selectedEmployee}
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
              <NotesPanel value={currentNotes} onChange={handleChangeNotes} onSave={handleSaveNotes} />
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
                selectedEmployee={selectedEmployee}
                onChecklistChange={handleChecklistChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
