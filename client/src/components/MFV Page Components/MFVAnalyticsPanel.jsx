// ==============================
// MFVAnalyticsPanel.jsx — Presentational analytics snapshot fed by MFVPage
// ==============================
import { useMemo } from "react";

const pct = (n, d) => (d > 0 ? (n / d) * 100 : 0);

const normalizeText = (value) =>
  String(value ?? "")
    .toUpperCase()
    .replace(/[“”]/g, '"')
    .replace(/[‐–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

const classifyValveSize = (value) => {
  const text = normalizeText(value);
  if (!text) return "OTHER";
  if (/(5\s*[-\/]?\s*1\/8)/.test(text)) return "5-1/8";
  if (/(7\s*[-\/]?\s*1\/16)/.test(text)) return "7-1/16";
  return "OTHER";
};

const isMfvQualified = (value) => normalizeText(value).includes("MFV");

// ==============================
// RingGauge — 2-line title, subtle glow
// ==============================
function RingGauge({ value = 0, label = "", sublabel = "", size = 94, stroke = 12 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const dash = (clamped / 100) * circumference;
  const percentFontPx = Math.max(10, Math.round(size * 0.12));

  return (
    <div className="flex flex-col items-center justify-start" style={{ width: size + 10 }}>
      <div
        className="text-[9px] font-semibold uppercase tracking-[0.22em] text-center"
        style={{
          color: "#9dff57",
          minHeight: 28,
          lineHeight: 1.2,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden"
        }}
        title={label}
      >
        {label}
      </div>

      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <filter id="mfv-ring-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2.4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="mfv-ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#687257" />
              <stop offset="100%" stopColor="#96a879" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1a1c17"
            strokeWidth={stroke}
            opacity="0.45"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#mfv-ring-grad)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference - dash}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            filter="url(#mfv-ring-glow)"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center" style={{ top: "36%" }}>
          <div
            className="font-extrabold tracking-[0.18em]"
            style={{ color: "#dce7c4", fontSize: `${percentFontPx}px`, lineHeight: 1 }}
          >
            {Math.round(clamped)}%
          </div>
          {sublabel ? (
            <div className="mt-1 text-[9px] tracking-[0.18em] uppercase" style={{ color: "#8fa17b" }}>
              {sublabel}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value, context }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-md border px-3 py-4"
      style={{
        borderColor: "#2e3327",
        background: "linear-gradient(180deg, #10130f 0%, #0b0d0a 100%)",
        boxShadow: "0 0 14px rgba(24, 32, 23, 0.45)"
      }}
    >
      <div className="text-[9px] uppercase tracking-[0.22em] text-[#8fa17b] text-center" style={{ lineHeight: 1.3 }}>
        {label}
      </div>
      <div className="text-3xl font-extrabold text-[#e0e8ce] tracking-[0.06em] mt-2">
        {value}
      </div>
      {context ? (
        <div className="text-[9px] uppercase tracking-[0.22em] text-[#6f785d] mt-2">
          {context}
        </div>
      ) : null}
    </div>
  );
}

// ==============================
// Presentational Component — expects MFVPage to supply data
// ==============================
export default function MFVAnalyticsPanel({
  headers = [],
  rows = [],
  tabLabel = "",
  qualificationStats,
  metrics
}) {
  const derivedMetrics = useMemo(() => {
    if (metrics) return metrics;

    const headerList = Array.isArray(headers) ? headers : [];
    const rowList = Array.isArray(rows) ? rows : [];
    if (!headerList.length || !rowList.length) {
      return {
        share518: 0,
        share716: 0,
        denom518: 0,
        denom716: 0,
        mfv518: 0,
        mfv716: 0
      };
    }

    const findIdx = (predicate) => headerList.findIndex(h => predicate(normalizeText(h)));
    const idxSize = findIdx(text => text.includes("VALVE SIZE"));
    const idxQual = findIdx(text => text.includes("VALVE IS QUALIFIED"));

    if (idxSize === -1 || idxQual === -1) {
      return {
        share518: 0,
        share716: 0,
        denom518: 0,
        denom716: 0,
        mfv518: 0,
        mfv716: 0
      };
    }

    const canonicalKeys = (raw, fallback) => {
      const base = String(raw ?? "").replace(/\s+/g, " ").trim();
      const list = [base];
      if (base.endsWith(":")) list.push(base.slice(0, -1));
      if (fallback) list.push(fallback);
      return list.filter(Boolean);
    };

    const sizeKeys = canonicalKeys(headerList[idxSize], "VALVE SIZE");
    const qualKeys = canonicalKeys(headerList[idxQual], "VALVE IS QUALIFIED AS AN");

    const readCell = (row, index, keys) => {
      if (Array.isArray(row)) return row[index];
      if (row && typeof row === "object") {
        for (const key of keys) {
          if (Object.prototype.hasOwnProperty.call(row, key)) return row[key];
        }
      }
      return undefined;
    };

    let denom518 = 0;
    let denom716 = 0;
    let mfv518 = 0;
    let mfv716 = 0;

    for (const row of rowList) {
      const sizeRaw = readCell(row, idxSize, sizeKeys);
      const qualRaw = readCell(row, idxQual, qualKeys);

      const sizeKey = classifyValveSize(sizeRaw);
      const mfv = isMfvQualified(qualRaw);

      if (sizeKey === "5-1/8") {
        denom518 += 1;
        if (mfv) mfv518 += 1;
      } else if (sizeKey === "7-1/16") {
        denom716 += 1;
        if (mfv) mfv716 += 1;
      }
    }

    return {
      share518: pct(mfv518, denom518),
      share716: pct(mfv716, denom716),
      denom518,
      denom716,
      mfv518,
      mfv716
    };
  }, [headers, rows, metrics]);

  const {
    share518 = 0,
    share716 = 0,
    denom518 = 0,
    denom716 = 0,
    mfv518 = 0,
    mfv716 = 0
  } = derivedMetrics || {};

  const title = tabLabel ? `${tabLabel} Analytics` : "MFV Analytics Snapshot";
  const sampleSize = denom518 + denom716;

  return (
    <div
      className="flex flex-col w-full h-full rounded-md border p-3 gap-3 overflow-hidden"
      style={{
        borderColor: "#444a39",
        background: "linear-gradient(180deg,#0b0c09 0%,#0a0b08 100%)",
        boxShadow: "inset 0 0 0 1px rgba(106,114,87,0.12)"
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.28em] text-[#8fa17b] font-semibold">
          {title}
        </span>
        <span className="text-[9px] uppercase tracking-[0.28em] text-[#5f6850]">
          {sampleSize > 0 ? `Sample Size ${sampleSize}` : "Awaiting Data"}
        </span>
      </div>

      {sampleSize > 0 ? (
        <div className="grid grid-cols-4 gap-3 w-full" style={{ alignItems: "stretch" }}>
          <RingGauge
            value={share518}
            label="5-1/8 MFV Share"
            sublabel={`${mfv518}/${denom518}`}
          />
          <RingGauge
            value={share716}
            label="7-1/16 MFV Share"
            sublabel={`${mfv716}/${denom716}`}
          />
          <StatTile label="Total MFVs 5-1/8" value={mfv518} context={`Out of ${denom518}`} />
          <StatTile label="Total MFVs 7-1/16" value={mfv716} context={`Out of ${denom716}`} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <span className="text-[10px] text-[#b0b79f] tracking-widest uppercase">No analytics available</span>
        </div>
      )}
    </div>
  );
}
