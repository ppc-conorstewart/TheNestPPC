// ==============================
// FILE: src/components/AlertsModal.jsx
// ==============================


export default function AlertsModal({ alerts, onClose }) {
  // ==============================
  // SECTION: FILTER CONFIG
  // ==============================
  const categorySet = new Set([
    'Valves',
    'Adapters',
    'Weco',
    'Spools',
    'Instrumentation Flanges',
    'Other',
  ]);

  // ==============================
  // SECTION: PARSE & NORMALIZE ALERTS
  // ==============================
  const normalized = [];
  const seen = new Set();

  (alerts || []).forEach((item) => {
    const msg = typeof item === 'object' && item.message ? item.message : item;
    const pageInfo = typeof item === 'object' && item.page ? item.page : null;
    if (typeof msg !== 'string') return;

    // Match with or without "have"
    const m = msg.match(
      /Insufficient\s+"?(.+?)"?\s+in\s+(.+?)\s+for\s+([^:]+):\s+need\s+([\d.]+)(?:,\s*have\s+([\d.]+))?/i
    );
    if (!m) return;

    let [, asset, base, rawPageDesc, needRaw] = m;

    // Ignore category-only lines and numeric/nameless artifacts like "2 in Grand Prairie"
    const cleanAsset = (asset || '').trim();
    if (!cleanAsset || categorySet.has(cleanAsset) || !/[A-Za-z]/.test(cleanAsset)) return;

    const pd = (pageInfo || rawPageDesc || '').split(',')[0].trim();
    let pageLabel = pd;
    const dfitTab = pd.match(/DFIT\s*tab\s*#(\d+)/i);
    if (dfitTab) {
      const idx = parseInt(dfitTab[1], 10);
      pageLabel = `DFIT-${String.fromCharCode(64 + idx)}`;
    }

    const entry = {
      asset: cleanAsset,
      base: (base || '').trim(),
      page: pageLabel,
      need: Math.floor(parseFloat(needRaw)) || 0,
    };

    const key = `${entry.asset}|${entry.base}|${entry.page}|${entry.need}`;
    if (seen.has(key)) return;
    seen.add(key);
    normalized.push(entry);
  });

  // ==============================
  // SECTION: RENDER
  // ==============================
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
      onClick={onClose}
    >
      <div
        className="bg-black text-white w-11/12 max-w-md p-2 rounded-lg border border-[#6a7257]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===== Header ===== */}
        <div className="flex items-center justify-between mb-1 pb-1 border-b border-gray-700">
          <h2 className="text-lg font-bold uppercase text-white">Asset Alerts</h2>
          <button
            onClick={onClose}
            className="text-white text-xl leading-none"
            title="Close"
          >
            ×
          </button>
        </div>

        {/* ===== No alerts ===== */}
        {normalized.length === 0 && (
          <p className="text-center text-gray-400 text-sm">No alerts.</p>
        )}

        {/* ===== Alerts List ===== */}
        {normalized.map(({ asset, base, page, need }, idx) => (
          <div
            key={idx}
            className="mb-2 p-2 bg-gray-900 rounded border border-[#6a7257] text-sm"
          >
            {page && (
              <div className="text-right text-xs font-bold text-gray-400 mb-1">
                {page}
              </div>
            )}

            <div className="font-bold text-white mb-0">Insufficient Assets</div>

            <div className="flex justify-between items-start text-xs mb-1">
              <div className="leading-tight">
                <span className="text-yellow-400">{asset}</span>
                <span> in </span>
                <span className="font-semibold">{base}</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-red-400">Short:</span>{' '}
                <span className="font-mono text-red-400">{need}</span>
              </div>
            </div>

            <div className="text-center text-gray-500 text-[11px]">
              Shops to take inventory or Consider transferring assets.
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
