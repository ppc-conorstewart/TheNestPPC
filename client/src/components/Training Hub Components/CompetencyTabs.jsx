import React from "react";

/**
 * CompetencyTabs component (tabs above checklist)
 * @param {Object} props
 * @param {Array} props.levels
 * @param {number} props.tabLevel         // Currently active tab (index)
 * @param {number} props.unlockedLevel    // Highest unlocked tab (index)
 * @param {Function} props.onTabChange    // Function to set active tab
 * @param {Object} props.progressByLevel  // { [levelIndex]: { checked, total, percent } }
 */
export default function CompetencyTabs({
  levels,
  tabLevel,
  unlockedLevel,
  onTabChange,
  progressByLevel = {}
}) {
  if (!Array.isArray(levels) || levels.length === 0) {
    return (
      <div className="text-red-400 font-bold p-6 text-center">
        Error: Competency tab data not loaded.<br />
        Please check your LEVELS array and imports.
      </div>
    );
  }

  // Logic: always unlock next tab if previous is complete
  function isLevelComplete(idx) {
    const levelProg = progressByLevel[idx];
    return levelProg && levelProg.total > 0 && levelProg.percent === 100;
  }

  // Site Supervisor V (last tab) is unlocked if user is at least Project Technician IV
  const lastTab = levels.length - 1;
  let extraUnlocked = unlockedLevel;
  if (unlockedLevel === lastTab - 1) {
    // If they're Project Tech IV, unlock Site Supervisor V tab so they can work on it
    extraUnlocked = lastTab;
  }

  return (
    <div className="mb-1 flex items-center gap-2">
      {levels.map((lvl, i) => {
        const isLocked = i > extraUnlocked;
        const complete = isLevelComplete(i);

        // --- Style logic
        let color = "#bbb";
        let bg = "#181c15";
        let border = "2px solid transparent";
        if (complete) {
          color = "#1ED760";
          border = "2px solid #1ED760";
          bg = "#181c15";
        } else if (tabLevel === i) {
          color = "#FFD943";
          border = "2px solid #FFD943";
          bg = "#23282b";
        }
        if (isLocked) {
          color = "#666";
          bg = "#101010";
          border = "2px solid transparent";
        }

        return (
          <button
            key={lvl.label}
            disabled={isLocked}
            className="font-erbaum px-3 py-1 rounded-t-lg text-xs uppercase tracking-wide font-bold"
            style={{
              letterSpacing: "0.03em",
              minWidth: 120,
              transition: "all 0.12s",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color,
              background: bg,
              borderBottom: border,
              opacity: isLocked ? 0.5 : 1,
              cursor: isLocked ? "not-allowed" : "pointer"
            }}
            onClick={() => onTabChange(i)}
          >
            <span>
              {lvl.label}
              {complete && (
                <span
                  style={{
                    marginLeft: 8,
                    color: "#1ED760",
                    fontSize: "1.15em",
                    verticalAlign: "middle",
                    fontWeight: 900,
                    textShadow: "0 0 6px #111"
                  }}
                >
                  ✓
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
