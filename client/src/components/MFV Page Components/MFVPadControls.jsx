// ==============================
// MFVPadControls.jsx — Sorted: Active Pads at Top, No Tooltips, Pulsing Glow for Active
// ==============================
import Papa from 'papaparse';
import { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { showPalomaToast } from '../../utils/toastUtils';

async function addPad({ pad_key, label, url, customer, lsd }) {
  const res = await fetch('/api/mfv/pads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pad_key, label, url, customer, lsd })
  });
  return res.json();
}
async function importPadCsv(pad_key, headers, rows, url) {
  const res = await fetch(`/api/mfv/pads/${pad_key}/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ headers, rows, url })
  });
  return res.json();
}
async function fetchPads() {
  const res = await fetch('/api/mfv/pads');
  return res.json();
}
async function refreshAllPads() {
  const res = await fetch('/api/mfv/sync-all', {
    method: 'POST'
  });
  return res.json();
}
async function setPadActive(pad_key, is_active) {
  const res = await fetch(`/api/mfv/pads/${pad_key}/active`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_active })
  });
  return res.json();
}

const FALLBACK_LOGO = "/assets/Paloma_Logo_White_Rounded2.png";

export default function MFVPadControls({
  pads,
  setPads,
  selectedPad,
  setSelectedPad,
  showAdd,
  setShowAdd,
  newLabel,
  setNewLabel,
  newUrl,
  setNewUrl,
  customers = [],
  handlePadListRefresh
}) {
  const [selectedCustomer, setSelectedCustomer] = useState(customers[0]?.name || "");
  const [lsd, setLsd] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loadingToggle, setLoadingToggle] = useState({});
  const [activeToggles, setActiveToggles] = useState({});

  useEffect(() => {
    if (pads && Array.isArray(pads)) {
      const nextActive = {};
      pads.forEach((pad) => {
        nextActive[pad.key] = !!pad.is_active;
      });
      setActiveToggles(nextActive);
    }
  }, [pads]);

  const handleAddPadToast = async () => {
    if (!newUrl.trim() || !selectedCustomer || !lsd.trim()) return;
    const pad_key = `${selectedCustomer}-${lsd}`.toLowerCase().replace(/\W+/g, '-');
    const pad_label = `${selectedCustomer} ${lsd}`;
    try {
      await addPad({ pad_key, label: pad_label, url: newUrl, customer: selectedCustomer, lsd });
      try {
        const res = await fetch(newUrl);
        const text = await res.text();
        const parsed = Papa.parse(text, { skipEmptyLines: true });
        const headers = parsed.data[0] || [];
        const rows = parsed.data.slice(1).filter(r => r.length === headers.length);
        if (headers.length && rows.length) {
          await importPadCsv(pad_key, headers, rows, newUrl);
          showPalomaToast({
            message: "CSV Imported!",
            detail: `${rows.length} rows imported for pad "${pad_label}".`,
            type: "success"
          });
        } else {
          showPalomaToast({
            message: "CSV Import Skipped",
            detail: "Could not parse headers/rows from provided URL.",
            type: "warning"
          });
        }
      } catch (err) {
        showPalomaToast({
          message: "CSV Import Error",
          detail: err?.message || "Failed to fetch or parse CSV.",
          type: "error"
        });
      }
      showPalomaToast({
        message: "Pad Added!",
        detail: `Pad "${pad_label}" has been created and selected.`,
        type: "success"
      });
      setShowAdd(false);
      setNewLabel('');
      setNewUrl('');
      setLsd('');
      setSelectedCustomer(customers[0]?.name || "");
      const all = await fetchPads();
      const _pads = all.filter(p => !p.archived).map(pad => ({ ...pad, key: pad.pad_key }));
      _pads.sort((a, b) => b.id - a.id);
      setPads(_pads);
      setSelectedPad(pad_key);
      if (handlePadListRefresh) handlePadListRefresh();
    } catch (err) {
      showPalomaToast({
        message: "Add Pad Failed",
        detail: err?.message || "Could not add pad.",
        type: "error"
      });
    }
  };

  const handleRefreshAll = async () => {
    setRefreshing(true);
    try {
      showPalomaToast({
        message: "Refreshing All Pads...",
        detail: "Syncing all pad data from CSV.",
        type: "info"
      });
      const res = await refreshAllPads();
      if (res.ok) {
        showPalomaToast({
          message: "Pads Synced!",
          detail: "All pads have been refreshed from source.",
          type: "success"
        });
        const all = await fetchPads();
        const _pads = all.filter(p => !p.archived).map(pad => ({ ...pad, key: pad.pad_key }));
        _pads.sort((a, b) => b.id - a.id);
        setPads(_pads);
        if (handlePadListRefresh) handlePadListRefresh();
      } else {
        showPalomaToast({
          message: "Pad Sync Error",
          detail: res.error || "Failed to sync all pads.",
          type: "error"
        });
      }
    } catch (err) {
      showPalomaToast({
        message: "Pad Sync Error",
        detail: err?.message || "Failed to sync pads.",
        type: "error"
      });
    }
    setRefreshing(false);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(sortedPads);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setPads(items);
  };

  const handleStatusToggle = async (padKey, makeActive) => {
    setLoadingToggle((prev) => ({ ...prev, [padKey]: true }));
    try {
      await setPadActive(padKey, makeActive);
      setActiveToggles((prev) => ({
        ...prev,
        [padKey]: makeActive
      }));
      const all = await fetchPads();
      const _pads = all.filter(p => !p.archived).map(pad => ({ ...pad, key: pad.pad_key }));
      _pads.sort((a, b) => b.id - a.id);
      setPads(_pads);
      showPalomaToast({
        message: makeActive ? `Pad Marked as Active` : `Pad Marked as Complete`,
        detail: makeActive
          ? `Pad is now marked as active.`
          : `Pad is now marked as complete.`,
        type: "success"
      });
    } catch (err) {
      showPalomaToast({
        message: "Status Change Failed",
        detail: err?.message || "Could not update pad status.",
        type: "error"
      });
    }
    setLoadingToggle((prev) => ({ ...prev, [padKey]: false }));
  };

  const parsePad = (pad) => {
    if (pad.label && pad.label.includes(" ")) {
      const [first, ...rest] = pad.label.split(" ");
      return { customer: first, lsd: rest.join(" ") };
    }
    return { customer: pad.customer || pad.label, lsd: pad.lsd || "" };
  };

  const getLogoPath = (customer) => {
    if (!customer) return FALLBACK_LOGO;
    return `/assets/logos/${customer.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`;
  };

  // SORT: Active at the top, Complete below (preserves drag-drop within groups)
  const sortedPads = [...pads].sort((a, b) => {
    const aActive = !!activeToggles[a.key];
    const bActive = !!activeToggles[b.key];
    if (aActive === bActive) return 0;
    return aActive ? -1 : 1;
  });

  return (
    <div className="flex flex-col items-stretch h-full w-full" style={{ minWidth: 320, maxWidth: 360, width: "100%" }}>
      <style>{`
        @keyframes paloma-pad-pulse {
          0% { box-shadow: 0 0 0 0 #19c37d88, 0 0 4px #23281c; }
          70% { box-shadow: 0 0 0 5px #19c37d00, 0 0 4px #23281c; }
          100% { box-shadow: 0 0 0 0 #19c37d00, 0 0 4px #23281c; }
        }
        .paloma-pad-pulse {
          animation: paloma-pad-pulse 1.3s infinite;
        }
        .pad-logo {
          width: 28px;
          height: 28px;
          object-fit: contain;
          border-radius: 6px;
          background: #222;
          border: 1.5px solid #35392E;
        }
        .status-square {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          margin-left: 6px;
          margin-right: 2px;
          display: inline-block;
          vertical-align: middle;
          border: 2.5px solid #222;
          cursor: pointer;
          transition: filter 0.12s;
        }
        .status-square.active {
          background: #17c964;
          border-color: #17c964;
          filter: drop-shadow(0 0 4px #17c96466);
        }
        .status-square.complete {
          background: #e82e2e;
          border-color: #e82e2e;
          filter: drop-shadow(0 0 4px #e82e2e44);
        }
        .status-square.inactive {
          background: #252525;
          border-color: #494F3C;
          filter: none;
        }
        .status-square:disabled {
          opacity: 0.6;
          cursor: progress;
        }
        .status-square:hover {
          filter: brightness(1.2) drop-shadow(0 0 6px #fff8);
        }
      `}</style>

      <div className="flex flex-row items-center ml-1 mt-2  justify-between w-full mb-3 px-1 gap-2">
        <button
          type="button"
          className="py-1 px-0 font-varien text-[0.2px] rounded bg-black border-2 border-[#6a7257] hover:bg-green-700 uppercase text-green-400 shadow flex items-center justify-center gap-2"
          style={{
            minHeight: 20,
            marginTop: 4,
            width: "48%",
            alignSelf: "flex-start"
          }}
          onClick={() => setShowAdd(true)}
        >
          + Add Pad
        </button>
        <button
          type="button"
          className="py-1 px-0 font-varien tracking text-[0.2px] rounded bg-black border-2 border-[#6a7257] hover:bg-blue-700 uppercase text-white shadow flex items-center justify-center gap-1"
          style={{
            minHeight: 20,
            marginTop: 4,
            width: "48%",
            alignSelf: "flex-end",
            opacity: refreshing ? 0.6 : 1,
            pointerEvents: refreshing ? "none" : "auto"
          }}
          onClick={handleRefreshAll}
          disabled={refreshing}
        >
          {refreshing ? "⟳ Refreshing..." : "⟳ Refresh All"}
        </button>
      </div>

      <div className="flex-1 ml-1  overflow-y-auto px-0">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="padList">
            {(provided) => (
              <div
                className="flex flex-col gap-[8px]"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {sortedPads.map((pad, index) => {
                  const { customer, lsd } = parsePad(pad);
                  const isActive = !!activeToggles[pad.key];
                  return (
                    <Draggable key={pad.key} draggableId={pad.key} index={index}>
                      {(provided) => (
                        <button
                          type="button"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => {
                            setSelectedPad(pad.key);
                            showPalomaToast({
                              message: "Pad Selected",
                              detail: `Now viewing pad: ${pad.label}`
                            });
                          }}
                          className={`w-full max-w-full rounded font-erbaum text-[.75rem]
                            flex flex-row items-center justify-between gap-0 shadow-lg transition-all
                            ${selectedPad === pad.key
                              ? 'bg-black text-white border-gray-400'
                              : 'bg-black text-[#949C7F] border-[#35392E] hover:bg-[#23281c] hover:text-white'}
                            ${isActive ? 'paloma-pad-pulse border-[#19c37d] border-2' : ''}`}
                          style={{
                            height: 44,
                            fontWeight: 400,
                            paddingLeft: 6,
                            paddingRight: 6,
                            borderWidth: isActive ? 4 : 2,
                            justifyContent: "flex-start",
                            width: "100%"
                          }}
                        >
                          {/* Customer Logo */}
                          <div
                            style={{
                              marginRight: 10,
                              display: "flex",
                              alignItems: "center",
                              flexDirection: "column",
                              width: 38
                            }}
                          >
                            <img
                              src={getLogoPath(customer)}
                              onError={e => { e.currentTarget.src = FALLBACK_LOGO; }}
                              className="pad-logo"
                              alt={customer}
                              title={customer}
                            />
                          </div>
                          {/* Label stack */}
                          <div className="flex flex-col items-start w-full pl-1" style={{ minWidth: 0 }}>
                            <span
                              className="truncate"
                              style={{
                                fontSize: "1.02em",
                                fontWeight: 700,
                                lineHeight: 1.09,
                                color: "#fff",
                                letterSpacing: ".01em",
                                marginBottom: "0px",
                                maxWidth: "100%"
                              }}
                            >
                              {customer}
                            </span>
                            <span
                              className="truncate"
                              style={{
                                fontSize: "0.90em",
                                fontWeight: 400,
                                opacity: 0.81,
                                marginTop: "-1.2px",
                                maxWidth: "100%"
                              }}
                            >
                              {lsd}
                            </span>
                          </div>
                          {/* Right Side Status Squares */}
                          <div
                            className="flex flex-row items-center"
                            style={{
                              marginLeft: 6,
                              minWidth: 56,
                              justifyContent: "flex-end",
                              position: "relative"
                            }}
                          >
                            {/* Green (Active) */}
                            <span
                              className={`status-square ${isActive ? "active" : "inactive"}`}
                              onClick={e => {
                                e.stopPropagation();
                                if (!isActive && !loadingToggle[pad.key]) handleStatusToggle(pad.key, true);
                              }}
                              style={{}}
                            />
                            {/* Red (Complete) */}
                            <span
                              className={`status-square ${!isActive ? "complete" : "inactive"}`}
                              onClick={e => {
                                e.stopPropagation();
                                if (isActive && !loadingToggle[pad.key]) handleStatusToggle(pad.key, false);
                              }}
                              style={{}}
                            />
                          </div>
                        </button>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {showAdd && (
        <div className="fixed inset-0 flex items-center justify-center z-40 bg-black bg-opacity-80">
          <div className="bg-[#1a1a1a] p-6 rounded-xl shadow-2xl w-[320px] flex flex-col gap-3">
            <h2 className="font-erbaum text-base mb-1 text-white">Add New Pad</h2>
            <select
              className="p-0 rounded border border-[#6a7257] bg-black text-white text-xs"
              value={selectedCustomer}
              onChange={e => setSelectedCustomer(e.target.value)}
            >
              <option value="">Select Customer</option>
              {customers.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="LSD (Well Location)"
              className="p-1 rounded border border-[#6a7257] bg-black text-white text-xs"
              value={lsd}
              onChange={e => setLsd(e.target.value)}
            />
            <input
              type="text"
              placeholder="CSV URL"
              className="p-1 rounded border border-[#6a7257] bg-black text-white text-xs"
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 bg-green-600 hover:bg-green-700 rounded text-white py-1 text-xs font-bold"
                onClick={handleAddPadToast}
              >Add</button>
              <button
                type="button"
                className="flex-1 bg-gray-700 hover:bg-gray-800 rounded text-white py-1 text-xs font-bold"
                onClick={() => setShowAdd(false)}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
