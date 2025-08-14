// ==============================
// MFVAnalyticsPanel.jsx — Top Submitters Left Half, Placeholder Right
// ==============================
import { useMemo } from "react";

function headerIndex(headers) {
  if (!headers) return -1;
  const candidates = headers.map((h, idx) => {
    if (!h) return -1;
    const norm = h.replace(/[^a-z]/gi, "").toLowerCase();
    return norm === "username" ? idx : -1;
  });
  return candidates.find(idx => idx !== -1) ?? -1;
}

function getUserCounts(headers, rows) {
  const counts = {};
  const idx = headerIndex(headers);
  if (idx === -1 || !Array.isArray(rows)) return counts;
  rows.forEach(row => {
    const uname = (row[idx] || "").trim();
    if (!uname) return;
    if (!counts[uname]) counts[uname] = 0;
    counts[uname]++;
  });
  return counts;
}

export default function MFVAnalyticsPanel({ headers, rows, tabLabel }) {
  const userCounts = useMemo(() => getUserCounts(headers, rows), [headers, rows]);
  const sortedUsers = Object.entries(userCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div className="flex flex-row items-stretch w-full h-full">
      {/* Left: Top Submitters */}
      <div className="flex flex-col items-center w-1/2 h-full justify-start">
        <span className="text-xs font-bold text-[#a2a891] uppercase mb-1">
          Top Submitters {tabLabel ? `(${tabLabel})` : ""}
        </span>
        {sortedUsers.length === 0 ? (
          <span className="text-xs text-[#b0b79f] mt-2">No submission data found.</span>
        ) : (
          <table className="w-full text-xs mt-1">
            <thead>
              <tr className="text-[#6a7257] font-bold">
                <th className="pr-2 text-left">Username</th>
                <th className="px-1 text-left">Total Submissions</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map(([uname, count], i) => (
                <tr key={i} className="text-[#d0d2b0]">
                  <td className="pr-2">{uname}</td>
                  <td className="px-1 text-[#6a7257] font-bold">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Right: Placeholder for Future Analytics */}
      <div className="w-1/2 h-full flex items-center justify-center">
        {/* -- Reserved for future analytics/widget -- */}
      </div>
    </div>
  );
}
