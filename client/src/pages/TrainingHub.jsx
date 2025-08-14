// ==============================
// TrainingHub.jsx — With Add Visit Wiring
// ==============================

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import CompetencyChecklist from "../components/Training Hub Components/CompetencyChecklist";
import competencies from "../components/Training Hub Components/CompetencyMatrix.js";
import CompetencyTabs from "../components/Training Hub Components/CompetencyTabs";
import DocumentHub from "../components/Training Hub Components/DocumentHub";
import EmployeeList, { LEVELS } from "../components/Training Hub Components/EmployeeList";
import VisitsTable from "../components/Training Hub Components/VisitsTable";

// FIELD EMPLOYEES
const fieldEmployees = [
  "Daniel Swartz", "Jeff Bennett", "Mitch Martin", "Dillan Campbell", "Ryker Kelly",
  "Abe Nazari", "John Wells", "Jeremy Dutchak", "Dawson Howell", "Colton Peters",
  "Greg Hultin", "Dustin Luke", "Ryan Gray", "Cam Pannenbecker", "Todd Cuza",
  "Keegan Fiveland", "Jameel Emery", "Mike Brushett", "Matthew Gray", "Jesse Bird",
  "Patrick Bennett", "Chace Levis", "Landen Brown", "Austyn Jordan", "Trevor Mervyn",
  "Drew Twells", "Matthew McCausland", "Efraim Ebo", "Ernesto Rea Jr.", "Ruslan Karandashov",
  "Marco Patton", "Connor Krebs"
];

// MAP EMPLOYEE NAME TO RANK LEVEL (0=I, 1=II, ... 4=V)
const fieldEmployeeRanks = {
  "Daniel Swartz": 4,
  "Jeff Bennett": 3,
  "Mitch Martin": 3,
  "Dillan Campbell": 3,
  "Ryker Kelly": 3,
  "Abe Nazari": 3,
  "John Wells": 3,
  "Jeremy Dutchak": 3,
  "Dawson Howell": 3,
  "Colton Peters": 3,
  "Greg Hultin": 3,
  "Dustin Luke": 3,
  "Ryan Gray": 3,
  "Cam Pannenbecker": 2,
  "Todd Cuza": 2,
  "Keegan Fiveland": 2,
  "Jameel Emery": 2,
  "Mike Brushett": 2,
  "Matthew Gray": 2,
  "Jesse Bird": 2,
  "Patrick Bennett": 1,
  "Chace Levis": 1,
  "Landen Brown": 1,
  "Austyn Jordan": 1,
  "Trevor Mervyn": 1,
  "Drew Twells": 1,
  "Matthew McCausland": 1,
  "Efraim Ebo": 1,
  "Ernesto Rea Jr.": 1,
  "Ruslan Karandashov": 0,
  "Marco Patton": 0,
  "Connor Krebs": 0
};

// UTILS
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
  fieldEmployees.forEach(emp => {
    obj[emp] = getInitialChecklist(emp);
  });
  return obj;
}

function getAllInitialDocuments() {
  const obj = {};
  fieldEmployees.forEach(emp => {
    obj[emp] = [];
  });
  return obj;
}

function getAllInitialNotes() {
  const obj = {};
  fieldEmployees.forEach(emp => {
    obj[emp] = "";
  });
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
    if (percent < 100) {
      progress = lvl;
      break;
    }
    if (lvl === LEVELS.length - 1) progress = lvl;
  }
  return Math.max(preset, progress);
}

export default function TrainingHub() {
  const [selectedEmployee, setSelectedEmployee] = useState(fieldEmployees[0]);
  const [employeeChecklists, setEmployeeChecklists] = useState(getAllInitialChecklists());
  const [employeeDocuments, setEmployeeDocuments] = useState(getAllInitialDocuments());
  const [employeeNotes, setEmployeeNotes] = useState(getAllInitialNotes());
  const [tabLevel, setTabLevel] = useState(fieldEmployeeRanks[fieldEmployees[0]] ?? 0);

  // ---- NEW: visits state, mutable ----
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
  const handleAddVisit = (newVisit) => {
    setVisits(prev => [...prev, newVisit]);
  };
  // ---- END NEW ----

  function handleSelectEmployee(emp) {
    setSelectedEmployee(emp);
    setTabLevel(fieldEmployeeRanks[emp] ?? 0);
  }

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

  function handleAddDocuments(files) {
    setEmployeeDocuments(prev => {
      const empDocs = prev[selectedEmployee] || [];
      const newDocs = files.map((file) => ({
        id: Math.random().toString(36).slice(2),
        name: file.name,
        uploaded: new Date().toLocaleString(),
        file
      }));
      return {
        ...prev,
        [selectedEmployee]: [...empDocs, ...newDocs]
      };
    });
  }

  function handleDeleteDocument(id) {
    setEmployeeDocuments(prev => {
      const empDocs = prev[selectedEmployee] || [];
      return {
        ...prev,
        [selectedEmployee]: empDocs.filter((d) => d.id !== id)
      };
    });
  }

  function handleDownloadDocument(doc) {
    const url = URL.createObjectURL(doc.file);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.name;
    a.click();
    URL.revokeObjectURL(url);
  }

  const currentNotes = employeeNotes[selectedEmployee] || "";
  function handleChangeNotes(text) {
    setEmployeeNotes(prev => ({
      ...prev,
      [selectedEmployee]: text
    }));
  }

  function handleSaveNotes() {}

  const currentChecklist = employeeChecklists[selectedEmployee];
  const currentDocuments = employeeDocuments[selectedEmployee] || [];
  const unlockedLevel = getPresetOrProgressLevel(currentChecklist, selectedEmployee);
  const progress = getLevelProgress(currentChecklist, tabLevel);

  const progressByLevel = {};
  LEVELS.forEach((_, lvl) => {
    progressByLevel[lvl] = getLevelProgress(currentChecklist, lvl);
  });

  if (!Array.isArray(competencies) || !competencies[tabLevel]) {
    return (
      <div className="w-full h-full flex items-center justify-center text-red-500 font-bold text-lg">
        Error: Competency matrix data not loaded. Please check your CompetencyMatrix.js file and import path.<br />
        (Current path: <code>../components/Training Hub Components/CompetencyMatrix.js</code>)
      </div>
    );
  }

  return (
    <div
      className="w-full h-full min-h-full ml-12 pr-12 flex relative"
      style={{
        background: `radial-gradient(circle at 20% 20%, #000000ff 2%, transparent 2%),
                     radial-gradient(circle at 70% 60%, #494f3c 2%, transparent 2%),
                     radial-gradient(circle at 30% 80%, #35392e 2%, transparent 2%)`,
        backgroundColor: "#1b1d16",
        backgroundSize: "100px 100px"
      }}
    >
      <Sidebar />
      <div
        className="flex flex-1 h-[88vh] min-h-[640px] max-w-full mx-auto flex-col"
        style={{
          marginLeft: 4,
          marginTop: 0,
          marginBottom: 0,
          boxSizing: "border-box"
        }}
      >
        {/* CAMO HEADER */}
        <div
          className="w-full text-center py-0"
          style={{
            background: `
              url('data:image/svg+xml;utf8,<svg width="600" height="70" xmlns="http://www.w3.org/2000/svg"><g>
              <ellipse fill="%236a7257" fill-opacity="0.28" cx="100" cy="30" rx="70" ry="28"/>
              <ellipse fill="%23494f3c" fill-opacity="0.33" cx="340" cy="50" rx="100" ry="30"/>
              <ellipse fill="%233c4133" fill-opacity="0.4" cx="500" cy="30" rx="80" ry="20"/>
              <ellipse fill="%23949c7f" fill-opacity="0.13" cx="230" cy="22" rx="72" ry="19"/>
              <ellipse fill="%235d654b" fill-opacity="0.21" cx="380" cy="18" rx="48" ry="15"/>
              <ellipse fill="%236a7257" fill-opacity="0.13" cx="520" cy="60" rx="60" ry="16"/>
              <ellipse fill="%231b1d16" fill-opacity="0.22" cx="50" cy="55" rx="50" ry="17"/>
              </g></svg>')
              repeat-x,
              linear-gradient(to bottom, #000000ff 94%, #000000ff 100%)
            `,
            backgroundSize: "600px 70px, 100% 100%",
            borderBottom: "0px solid #6a7257",
            borderTop: "0px solid #35392e",
            zIndex: 5
          }}
        >
          <h1 style={{ fontFamily: "Varien, sans-serif" }} className="text-white text-4xl">Paloma Training Hub</h1>
        </div>
        {/* END CAMO HEADER */}

        <div className="flex flex-1 w-full h-full">
          <div
            className="flex-none flex flex-col justify-between"
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
            <DocumentHub
              documents={currentDocuments}
              onAddDocuments={handleAddDocuments}
              onDeleteDocument={handleDeleteDocument}
              onDownloadDocument={handleDownloadDocument}
              employeeName={selectedEmployee}
              notes={currentNotes}
              onChangeNotes={handleChangeNotes}
              onSaveNotes={handleSaveNotes}
            />
          </div>
          <div className="flex flex-col flex-1 h-full" style={{ minWidth: 0 }}>
            <VisitsTable visits={visits} onAddVisit={handleAddVisit} />
            <div
              className="flex-1 flex flex-col items-stretch justify-start px-3 py-3"
              style={{
                borderRight: "4px solid #6a7257",
                borderBottom: "4px solid #6a7257",
                background: "#000",
                minHeight: "70%",
                maxHeight: "64%",
                height: "64%",
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
          </div>
        </div>
      </div>
    </div>
  );
}
