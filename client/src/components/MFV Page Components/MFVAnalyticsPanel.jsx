// ==============================
// MFVAnalyticsPanel.jsx — MFV Test Reports only • Latest per PPC • MFV vs OEM
// Focus: Only the two valve rings compute live stats; the right four rings are stubbed at 0.
// Shows denominator as MFV/Total under each valve gauge.
// ==============================
import { useEffect, useMemo, useState } from "react";

// ==============================
// CSV Source (MFV Test Reports ONLY)
// ==============================
const MFV_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTVHS7FlbKTZtslOKoa6x8GsTW02jqRttmMgArSkJ2AzLr3jyxF9lR0YXb4zMoJZ-yl6__OLVuAFYW3/pub?gid=0&single=true&output=csv";

// ==============================
// Minimal CSV Parser (handles quoted commas)
// ==============================
function csvToRows(text) {
  const lines = text.split(/\r?\n/).filter(l => l !== "");
  if (!lines.length) return { headers: [], rows: [] };

  const parseLine = (line) => {
    const out = [];
    let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (ch === "," && !inQ) { out.push(cur); cur = ""; }
      else cur += ch;
    }
    out.push(cur);
    return out.map(s => s.trim());
  };

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);
  return { headers, rows };
}

// ==============================
// Normalization + helpers
// ==============================
const normTxt = (v) =>
  String(v || "")
    .toUpperCase()
    .replace(/[“”]/g, '"')
    .replace(/[‐–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

const pct = (n, d) => (d > 0 ? (n / d) * 100 : 0);

// Assets: "PPC 000127" -> "127"
function normalizeAssetPpcNumber(input) {
  const digits = String(input || "").replace(/[^0-9]/g, "");
  return digits ? String(parseInt(digits, 10)) : "";
}

// CSV: "734", "34277", "PPC123" -> "734"/"34277"/"123"
function normalizeCsvPpcNumber(input) {
  const digits = String(input || "").replace(/[^0-9]/g, "");
  return digits ? String(parseInt(digits, 10)) : "";
}

// Returns "5-1/8 15K", "7-1/16 15K", or "OTHER"
function classifySize({ summarySize, assetName }) {
  const s = normTxt(summarySize);
  const a = normTxt(assetName);

  const s_is5 = s.includes("5-1/8 15K") || /\b5\s*-\s*15K\b/.test(s) || /\b5-15K\b/.test(s);
  const s_is7 = s.includes("7-1/16 15K") || /\b7\s*-\s*15K\b/.test(s) || /\b7-15K\b/.test(s);

  const a_is5 = /VALVE\s*\|\s*5-1\/8\s*15K/.test(a);
  const a_is7 = /VALVE\s*\|\s*7-1\/16\s*15K/.test(a);

  if (s_is5 || a_is5) return "5-1/8 15K";
  if (s_is7 || a_is7) return "7-1/16 15K";
  return "OTHER";
}

// ==============================
// RingGauge — fixed title height and dimensions (rings nudged down)
// ==============================
function RingGauge({ value = 0, label = "", sublabel = "", size = 92, stroke = 10 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const v = Math.max(0, Math.min(100, value));
  const dash = (v / 100) * circumference;
  const percentFontPx = Math.max(9, Math.round(size * 0.1));
  const ringTopOffsetPx = 8;

  return (
    <div className="flex flex-col items-center justify-start" style={{ width: size + 6, height: size + 44 }}>
      <div
        className="text-[8px] font-bold uppercase tracking-wider text-center"
        style={{
          color: "#9dff57",
          lineHeight: "1.1",
          height: 22,
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          whiteSpace: "normal",
          paddingBottom: 2
        }}
        title={label}
      >
        {label}
      </div>

      <div className="relative flex items-center justify-center" style={{ width: size, height: size, marginTop: ringTopOffsetPx }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#687257" />
              <stop offset="100%" stopColor="#687257" />
            </linearGradient>
          </defs>
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#1a1c17" strokeWidth={stroke} opacity="0.5" />
          <circle
            cx={size/2} cy={size/2} r={radius} fill="none"
            stroke="url(#ringGrad)" strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference - dash}`}
            transform={`rotate(-90 ${size/2} ${size/2})`} filter="url(#glow)"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center" style={{ top: "34%" }}>
          <div className="font-extrabold tracking-widest" style={{ color: "#d6e0b5", fontSize: `${percentFontPx}px`, lineHeight: 1 }}>
            {Math.round(v)}%
          </div>
          {sublabel ? (
            <div className="mt-0.5 text-[8px] tracking-[0.15em] uppercase" style={{ color: "#8fa17b" }}>
              {sublabel}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ==============================
// Main Component — MFV Test Reports ONLY • Latest per PPC • Two valve gauges live, others stubbed
// ==============================
export default function MFVAnalyticsPanel() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ headers: [], rows: [] });
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const [csvText, assetsRes] = await Promise.all([
          fetch(MFV_CSV_URL).then(r => r.text()),
          fetch("/api/assets").then(r => r.json())
        ]);
        if (!alive) return;
        setSummary(csvToRows(csvText));
        setAssets(Array.isArray(assetsRes) ? assetsRes : []);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    const id = setInterval(load, 60_000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const metrics = useMemo(() => {
    const H = summary.headers || [];
    const R = summary.rows || [];
    if (!H.length || !R.length || !assets.length) {
      return {
        p518Pct: 0, p716Pct: 0,
        denom518: 0, denom716: 0,
        mfv518: 0, mfv716: 0
      };
    }

    const findIdx = (pred) => H.findIndex(h => pred(normTxt(h)));
    const idxTs   = findIdx(h => h.startsWith("TIMESTAMP"));
    const idxPpc  = findIdx(h => h.includes("PPC#"));
    const idxSize = findIdx(h => h.includes("VALVE SIZE"));
    const idxQual = findIdx(h => h.includes("VALVE IS QUALIFIED AS"));

    const assetsByNum = {};
    for (const a of assets) {
      const key = normalizeAssetPpcNumber(a?.id);
      if (key) assetsByNum[key] = a;
    }

    const latest = {};
    for (const row of R) {
      const pNum = normalizeCsvPpcNumber(row[idxPpc]);
      if (!pNum || !assetsByNum[pNum]) continue;
      const ts = new Date(row[idxTs] || "").getTime() || 0;
      if (!latest[pNum] || ts > latest[pNum].ts) {
        latest[pNum] = {
          ts,
          size: row[idxSize],
          qual: normTxt(row[idxQual] || ""),
          asset: assetsByNum[pNum]
        };
      }
    }

    const items = Object.values(latest);
    const isMFV = (q) => /\bMFV\b/.test(q);

    const withSize = items.map(it => ({
      ...it,
      sizeKey: classifySize({ summarySize: it.size, assetName: it.asset?.name })
    }));

    const b518 = withSize.filter(x => x.sizeKey === "5-1/8 15K");
    const b716 = withSize.filter(x => x.sizeKey === "7-1/16 15K");

    const mfv518 = b518.filter(x => isMFV(x.qual)).length;
    const mfv716 = b716.filter(x => isMFV(x.qual)).length;

    return {
      p518Pct: pct(mfv518, b518.length),
      p716Pct: pct(mfv716, b716.length),
      denom518: b518.length,
      denom716: b716.length,
      mfv518,
      mfv716
    };
  }, [summary, assets]);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center w-full h-full rounded-md border"
        style={{ borderColor: "#444a39", background: "linear-gradient(180deg,#0b0c09 0%,#0a0b08 100%)" }}
      >
        <div className="text-[10px] text-[#b0b79f] tracking-widest uppercase">Loading MFV Analytics…</div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col w-full h-full rounded-md border p-2 overflow-hidden"
      style={{
        borderColor: "#444a39",
        background: "linear-gradient(180deg,#0b0c09 0%,#0a0b08 100%)",
        boxShadow: "inset 0 0 0 1px rgba(106,114,87,0.12)"
      }}
    >
      <div
        className="grid grid-cols-6 gap-2 w-full"
        style={{ alignItems: "start", justifyItems: "center", overflow: "hidden" }}
      >
        <RingGauge
          value={metrics.p518Pct}
          label="VALVE | 5-1/8 15K MFV%"
          sublabel={`${metrics.mfv518}/${metrics.denom518}`}
        />
        <RingGauge
          value={metrics.p716Pct}
          label="VALVE | 7-1/16 15K MFV%"
          sublabel={`${metrics.mfv716}/${metrics.denom716}`}
        />

        {/* Right four rings stubbed at zero for now */}
        <RingGauge value={0} label="TOTAL MFV'S SUCCESSFUL" sublabel={`0`} />
        <RingGauge value={0} label="TOTAL OEM" sublabel={`0`} />
        <RingGauge value={0} label="TOTAL MFV SUCCESSFUL RE-TESTS" sublabel={`0`} />
        <RingGauge value={0} label="TOTAL MFV SUCCESS RATE IN FIELD" sublabel={`0%`} />
      </div>
    </div>
  );
}
