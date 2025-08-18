// ===============================
// MFVAnalyticsPanel.jsx — Stats + Dashboard (User Analytics Added)
// ===============================
import { useMemo, useState } from "react";
import ValveStatsChart from "../components/MFV Page Components/ValveStatsChart";

// Case/whitespace-insensitive header index lookup
function headerIndex(headers, search) {
  if (!headers || !search) return -1;
  return headers.findIndex(
    h => h && h.trim().toLowerCase() === search.trim().toLowerCase()
  );
}

function normalizeValveId(valveId) {
  if (!valveId) return "";
  return valveId
    .replace(/^PPC\s*:*/i, "")
    .replace(/^0+/, "")
    .replace(/\s+/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
}

function normalizeSize(size) {
  if (!size) return "";
  return size.replace(/[^0-9kKhyMFv-]/g, "").toUpperCase();
}

// Compute stats from MFV CSV and asset db
function computeAnalytics({ mfvRows, mfvHeaders, assets }) {
  // Force headers to always be an array
  const fixedHeaders = Array.isArray(mfvHeaders)
    ? mfvHeaders
    : (typeof mfvHeaders === "string" ? mfvHeaders.split(",") : []);

  // Robust header mapping
  const idxValveId =
    headerIndex(fixedHeaders, "PPC#:") !== -1
      ? headerIndex(fixedHeaders, "PPC#:")
      : headerIndex(fixedHeaders, "PPC#");
  const idxValveName = headerIndex(fixedHeaders, "VALVE NAME");
  const idxValveSize =
    headerIndex(fixedHeaders, "VALVE SIZE:") !== -1
      ? headerIndex(fixedHeaders, "VALVE SIZE:")
      : headerIndex(fixedHeaders, "VALVE SIZE");

  // CRITICAL FIX: Try ALL likely names for "qualified as" column
  const qualifiedColNames = [
    "VALVE IS QUALIFIED AS AN:",
    "Valve is qualified as an:",
    "QUALIFIED AS"
  ];
  const idxQualified = qualifiedColNames
    .map(name => headerIndex(fixedHeaders, name))
    .find(idx => idx !== -1);

  // --- USERNAME INDEX ---
  const idxUsername =
    headerIndex(fixedHeaders, "USERNAME") !== -1
      ? headerIndex(fixedHeaders, "USERNAME")
      : headerIndex(fixedHeaders, "USER NAME");

  // Totals by size/state
  const totals = {
    "7-15K": { MFV: 0, OEM: 0 },
    "5-15K": { MFV: 0, OEM: 0 },
    allSizes: {},
    allValveMap: {},
    userCounts: {}
  };

  mfvRows.forEach(row => {
    // Username count logic
    if (idxUsername !== -1 && row[idxUsername]) {
      const uname = String(row[idxUsername]).trim();
      if (!totals.userCounts[uname]) totals.userCounts[uname] = 0;
      totals.userCounts[uname]++;
    }

    const valveId =
      (idxValveId !== -1 && row[idxValveId]) ||
      (idxValveName !== -1 && row[idxValveName]) ||
      "";
    const normValveId = normalizeValveId(valveId);

    const sizeRaw = idxValveSize !== -1 ? row[idxValveSize] : "";
    const stateRaw = idxQualified !== undefined && idxQualified !== -1 ? row[idxQualified] : "";
    const state = (stateRaw || "").toUpperCase();

    const size = normalizeSize(sizeRaw);

    // Map size for keying
    let sizeKey = "";
    if (size.includes("7") && size.includes("15K")) sizeKey = "7-15K";
    else if (size.includes("5") && size.includes("15K")) sizeKey = "5-15K";
    else sizeKey = size;

    if (!totals.allSizes[sizeKey]) totals.allSizes[sizeKey] = { MFV: 0, OEM: 0 };
    if (!totals.allValveMap[normValveId])
      totals.allValveMap[normValveId] = { count: 0, states: { MFV: 0, OEM: 0 } };

    if (["MFV", "OEM"].includes(state)) {
      totals.allSizes[sizeKey][state]++;
      if (sizeKey === "7-15K") totals["7-15K"][state]++;
      if (sizeKey === "5-15K") totals["5-15K"][state]++;
      totals.allValveMap[normValveId].count++;
      totals.allValveMap[normValveId].states[state]++;
    }
  });

  // Top 5 tested valves
  const top5Valves = Object.entries(totals.allValveMap)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([valveId, v]) => ({
      valveId,
      count: v.count,
      mfv: v.states.MFV,
      oem: v.states.OEM,
    }));

  // Top 5 users by reports
  const top5Users = Object.entries(totals.userCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([username, count]) => ({ username, count }));

  // Flatten for charting
  const chartData = Object.entries(totals.allSizes).map(([size, v]) => ({
    size,
    MFV: v.MFV,
    OEM: v.OEM,
  }));

  return { totals, top5Valves, chartData, top5Users };
}

export default function MFVAnalyticsPanel({ mfvHeaders, mfvRows, assets }) {
  // Force headers to always be an array for all usage
  const fixedHeaders = Array.isArray(mfvHeaders)
    ? mfvHeaders
    : (typeof mfvHeaders === "string" ? mfvHeaders.split(",") : []);

  const [chartType, setChartType] = useState("bar");
  const analytics = useMemo(
    () => computeAnalytics({ mfvRows, mfvHeaders: fixedHeaders, assets }),
    [mfvRows, fixedHeaders, assets]
  );
  const { totals, top5Valves, chartData, top5Users } = analytics;

  function StatCard({ title, mval, oval }) {
    return (
      <div className="flex flex-col rounded-lg shadow bg-[#191e15] px-5 py-2 border-2 border-[#6a7257] min-w-[152px] max-w-[185px] mr-2 mb-2">
        <span className="text-xs text-[#a2a891] mb-0 uppercase font-bold tracking-wider">
          {title}
        </span>
        <div className="flex flex-row items-end gap-2">
          <span className="text-3xl font-bold text-[#6a7257]">{mval}</span>
          <span className="text-lg font-bold text-[#c2c1b3]">/</span>
          <span className="text-3xl font-bold text-[#a2a891]">{oval}</span>
        </div>
        <div className="text-xs text-[#7a7e6d] mt-1">
          <span className="font-bold text-[#6a7257]">MFV</span> /{" "}
          <span className="font-bold text-[#a2a891]">OEM</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-row flex-wrap gap-2 justify-start mb-2">
        <StatCard
          title="7-15K HYD MFV Valves"
          mval={totals["7-15K"].MFV}
          oval={totals["7-15K"].OEM}
        />
        <StatCard
          title="5-15K HYD MFV Valves"
          mval={totals["5-15K"].MFV}
          oval={totals["5-15K"].OEM}
        />
      </div>
      <div className="flex flex-row items-center gap-3">
        <div className="flex flex-row gap-2">
          <button
            className={`px-3 py-1 rounded font-bold border-2 border-[#6a7257] transition-all text-xs
              ${chartType === "bar"
                ? "bg-[#23281c] text-white shadow"
                : "bg-black text-[#b0b79f] hover:bg-[#23281c]"}
            `}
            onClick={() => setChartType("bar")}
          >
            Bar Chart
          </button>
          <button
            className={`px-3 py-1 rounded font-bold border-2 border-[#6a7257] transition-all text-xs
              ${chartType === "donut"
                ? "bg-[#23281c] text-white shadow"
                : "bg-black text-[#b0b79f] hover:bg-[#23281c]"}
            `}
            onClick={() => setChartType("donut")}
          >
            Donut Chart
          </button>
        </div>
      </div>
      <div className="w-full flex flex-row items-center mt-2">
        <ValveStatsChart chartType={chartType} chartData={chartData} />
      </div>
      <div className="mt-3">
        <span className="text-xs font-bold text-[#a2a891] uppercase">
          Top 5 Most Tested Valves
        </span>
        <table className="w-full text-xs mt-1">
          <thead>
            <tr className="text-[#6a7257] font-bold">
              <th className="pr-2">Valve ID</th>
              <th className="px-1">Total Tests</th>
              <th className="px-1">MFV</th>
              <th className="px-1">OEM</th>
            </tr>
          </thead>
          <tbody>
            {top5Valves.map((v, i) => (
              <tr key={i} className="text-[#d0d2b0]">
                <td className="pr-2">{v.valveId}</td>
                <td className="px-1 text-[#6a7257] font-bold">{v.count}</td>
                <td className="px-1">{v.mfv}</td>
                <td className="px-1">{v.oem}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <span className="text-xs font-bold text-[#a2a891] uppercase">
          Top 5 Users By Total Reports
        </span>
        <table className="w-full text-xs mt-1">
          <thead>
            <tr className="text-[#6a7257] font-bold">
              <th className="pr-2">Username</th>
              <th className="px-1">Total Reports</th>
            </tr>
          </thead>
          <tbody>
            {top5Users.map((u, i) => (
              <tr key={i} className="text-[#d0d2b0]">
                <td className="pr-2">{u.username}</td>
                <td className="px-1 text-[#6a7257] font-bold">{u.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
