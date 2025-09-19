import React from "react";

/**
 * CompetencyChecklist component
 * @param {Object} props
 * @param {Array} props.competencies      // The array of level objects [{label, groups: [{group, items: []}]}]
 * @param {number} props.tabLevel         // Active tab index (current level)
 * @param {Object} props.currentChecklist // Checklist data for current employee
 * @param {number} props.unlockedLevel    // Highest unlocked level
 * @param {Object} props.progress         // { checked, total, percent }
 * @param {string} props.selectedEmployee
 * @param {Function} props.onChecklistChange
 */
const ASSESSORS = [
  "Scott Luscombe",
  "Alex Ruest",
  "Ryan Beebe"
];

// Helper: returns true if all levels are 100%
function allLevelsComplete(competencies, checklist) {
  return competencies.every((_, lvl) => {
    const groups = checklist[lvl];
    if (!groups) return false;
    for (const groupIdx in groups) {
      for (const itemIdx in groups[groupIdx]) {
        if (!groups[groupIdx][itemIdx].checked) return false;
      }
    }
    return true;
  });
}

export default function CompetencyChecklist({
  competencies,
  tabLevel,
  currentChecklist,
  unlockedLevel,
  progress,
  selectedEmployee,
  selectedEmployeeId,
  onChecklistChange
}) {
  if (
    !Array.isArray(competencies) ||
    !competencies[tabLevel] ||
    !Array.isArray(competencies[tabLevel].groups)
  ) {
    return (
      <div className="text-red-400 font-bold p-6 text-center">
        Error: Competency data not loaded or misconfigured.<br />
        Please check CompetencyMatrix.js and your imports.
      </div>
    );
  }

  // ---- Logic for Site Supervisor (last level) ----
  const isSiteSupervisor = unlockedLevel >= competencies.length - 1;
  const isFinalLevel = tabLevel === competencies.length - 1;

  const levelLabel = competencies[tabLevel]?.label || "";

  return (
    <>
      {/* Employee Title + Progress Bar */}
      <div className="mb-1 flex items-center justify-between" style={{ minHeight: "2.1rem" }}>
        <h2
          className="text-white font-erbaum tracking-wide uppercase font-bold"
          style={{
            fontSize: "1rem",
            letterSpacing: ".03em",
            marginBottom: 0,
            lineHeight: "1.25"
          }}
        >
          {selectedEmployee || "Select an employee to view training progress"}
        </h2>
        {/* Progress Bar */}
        <div
          className="flex items-center"
          style={{ minWidth: 135, marginLeft: 18, gap: 9 }}
        >
          <div
            style={{
              height: "1.2rem",
              width: 360,
              borderRadius: 9,
              border: "1px solid #11c01999",
              background: "#23282b",
              overflow: "hidden",
              position: "relative"
            }}
          >
            <div
              style={{
                height: "100%",
                width: (isSiteSupervisor || isFinalLevel) ? "100%" : `${progress.percent}%`,
                background: "#11c01999",
                transition: "width 0.5s cubic-bezier(.4,1.4,.6,1)"
              }}
            />
          </div>
          <span
            className="font-erbaum font-bold text-[#04f61099]"
            style={{ fontSize: ".79rem", minWidth: 28, textAlign: "right" }}
          >
            {(isSiteSupervisor || isFinalLevel) ? "100%" : `${progress.percent}%`}
          </span>
        </div>
      </div>
      {/* Checklist Table */}
      <div className="mt-2 w-full overflow-x-auto">
        <table className="min-w-full text-xs border-separate" style={{ borderSpacing: 0, tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "18%" }} /> {/* Category */}
            <col style={{ width: "36%" }} /> {/* Competency - REDUCED */}
            <col style={{ width: "15%" }} /> {/* Complete */}
            <col style={{ width: "15%" }} /> {/* Date */}
            <col style={{ width: "16%" }} /> {/* Assessor */}
          </colgroup>
          <thead>
            <tr className="bg-[#6a7257]">
              <th className="py-0 px-0 font-erbaum text-left font-bold border-b border-[#35392E] uppercase"
                  style={{ fontSize: ".5rem", padding: "0.1rem 0.18rem" }}>
                Category
              </th>
              <th className="py-0 px-0 font-erbaum text-left text-black font-bold border-b border-[#35392E] uppercase"
                  style={{ fontSize: ".5rem", padding: "0.1rem 0.18rem" }}>
                Competency
              </th>
              <th className="py-0 px-0 font-erbaum text-center text-black font-bold border-b border-[#35392E] uppercase"
                  style={{ fontSize: ".5rem", padding: "0.1rem 0.18rem" }}>
                Complete
              </th>
              <th className="py-0 px-0 font-erbaum text-center text-black font-bold border-b border-[#35392E] uppercase"
                  style={{ fontSize: ".5rem", padding: "0.1rem 0.18rem" }}>
                Date Completed
              </th>
              <th className="py-0 px-0 font-erbaum text-center text-black font-bold border-b border-[#35392E] uppercase"
                  style={{ fontSize: ".5rem", padding: "0.1rem 0.18rem" }}>
                Assessor
              </th>
            </tr>
          </thead>
          <tbody>
            {competencies[tabLevel].groups.map((group, gIdx) =>
              group.items.map((item, iIdx) => {
                const firstOfGroup = iIdx === 0;
                // --- If Site Supervisor, show all as checked/locked ---
                const isChecked =
                  isSiteSupervisor ? true :
                  currentChecklist[tabLevel]?.[gIdx]?.[iIdx]?.checked || false;
                const completedDate =
                  isSiteSupervisor
                    ? new Date().toISOString().slice(0, 10)
                    : currentChecklist[tabLevel]?.[gIdx]?.[iIdx]?.date || "";
                const assessor =
                  isSiteSupervisor
                    ? "—"
                    : currentChecklist[tabLevel]?.[gIdx]?.[iIdx]?.assessor || "";
                // Only editable if not Site Supervisor and not above unlocked level
                const isEditable = !isSiteSupervisor && tabLevel <= unlockedLevel;

                const employeeKey = selectedEmployeeId ?? selectedEmployee;

                function handleCheckBox() {
                  if (isEditable) onChecklistChange(tabLevel, gIdx, iIdx, employeeKey);
                }

                function handleAssessorChange(e) {
                  if (isEditable)
                    onChecklistChange(tabLevel, gIdx, iIdx, employeeKey, { assessor: e.target.value });
                }

                return (
                  <tr key={group.group + "-" + iIdx} className="border-b border-[#23282b] transition">
                    {firstOfGroup ? (
                      <td
                        className="py-1 px-1 text-white font-erbaum font-bold align-top"
                        style={{
                          fontSize: ".7rem",
                          padding: "0.22rem 0.18rem",
                          verticalAlign: "top"
                        }}
                        rowSpan={group.items.length}
                      >
                        {group.group}
                      </td>
                    ) : null}
                    <td
                      className="py-1 px-1 text-white font-erbaum"
                      style={{
                        fontSize: ".8rem",
                        padding: "0.13rem 0.11rem",
                        overflowWrap: "break-word",
                        wordBreak: "break-word",
                        whiteSpace: "normal",
                        display: "flex",
                        alignItems: "flex-start"
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          color: "#FFD943",
                          fontSize: "1.1em",
                          marginRight: 8,
                          lineHeight: "1.1"
                        }}
                      >
                        •
                      </span>
                      <span>{item}</span>
                    </td>
                    <td className="py-1 px-1 text-center"
                        style={{
                          padding: "0.13rem 0.11rem"
                        }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={!isEditable}
                        onChange={handleCheckBox}
                        style={{
                          width: "1rem",
                          height: "1rem",
                          accentColor: "#6a7257",
                          cursor: isEditable ? "pointer" : "not-allowed"
                        }}
                      />
                    </td>
                    <td
                      className="py-1 px-1 text-center text-[#FFD943] font-erbaum"
                      style={{
                        fontSize: ".65rem",
                        padding: "0.13rem 0.11rem"
                      }}
                    >
                      {completedDate}
                    </td>
                    <td
                      className="py-1 px-1 text-center font-erbaum"
                      style={{
                        fontSize: ".72rem",
                        padding: "0.13rem 0.11rem"
                      }}
                    >
                      {isChecked ? (
                        isSiteSupervisor ? (
                          <span style={{ color: "#aaa" }}>—</span>
                        ) : (
                          <select
                            disabled={!isEditable}
                            value={assessor}
                            onChange={handleAssessorChange}
                            style={{
                              width: 200,
                              background: "#24261f",
                              color: assessor ? "#FFD943" : "#888",
                              border: `2px solid ${
                                !assessor ? "#FF3B3B" : "#1ED760"
                              }`,
                              borderRadius: 5,
                              padding: "2px 5px",
                              transition: "border-color 0.2s"
                            }}
                          >
                            <option value="">Select Assessor</option>
                            {ASSESSORS.map((a) => (
                              <option key={a} value={a}>{a}</option>
                            ))}
                          </select>
                        )
                      ) : null}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {(progress.percent === 100 || isSiteSupervisor) && (
        <div className="mt-4 text-center font-erbaum text-lg font-bold uppercase tracking-wide" style={{ color: "#1ED760" }}>
          Competencies Complete for {levelLabel}
        </div>
      )}
    </>
  );
}
