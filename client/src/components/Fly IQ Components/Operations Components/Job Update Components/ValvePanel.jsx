// ==============================
// ValvePanel.jsx — Always Fills Panel, No Dead Space, Black to Bottom
// ==============================
import { useState } from "react";

export default function ValvePanel({
  mode = "input",
  valves = [],
  onPsiChange,
  onDefine,
  form,
  handleChange,
  showEquipList
}) {
  // Start with 16 fields
  const [defineVals, setDefineVals] = useState(
    Array.from({ length: 16 }, () => ({ ppc: "", location: "" }))
  );

  function handleDefineChange(idx, key, value) {
    setDefineVals(defs =>
      defs.map((d, i) => (i === idx ? { ...d, [key]: value } : d))
    );
  }

  function handleAddRows() {
    setDefineVals(defs => [
      ...defs,
      { ppc: "", location: "" },
      { ppc: "", location: "" }
    ]);
  }

  function handleDefineSubmit(e) {
    e.preventDefault();
    const filtered = defineVals
      .map((v, i) => ({
        label: `${v.ppc}${v.location ? " [" + v.location + "]" : ""}`,
        ppc: v.ppc,
        location: v.location,
        psi: ""
      }))
      .filter(v => v.ppc || v.location);
    if (filtered.length > 0 && onDefine) onDefine(filtered);
  }

  // Equipment section logic
  const [equipmentList, setEquipmentList] = useState([]);
  const [equipItem, setEquipItem] = useState("");
  const [equipQty, setEquipQty] = useState("");

  function handleAddEquipment(e) {
    e.preventDefault();
    if (!equipItem.trim() || !equipQty || isNaN(Number(equipQty))) return;
    setEquipmentList((prev) => [
      ...prev,
      { item: equipItem.trim(), qty: Number(equipQty) }
    ]);
    setEquipItem("");
    setEquipQty("");
  }

  function handleRemove(idx) {
    setEquipmentList((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <div
      className="flex flex-col items-center justify-start"
      style={{
        width: "100%",
        height: "100%",
        minHeight: 0,
        minWidth: 0,
        alignSelf: "stretch",
        position: "relative",
        background: "#000",
        boxSizing: "border-box",
        display: "flex",
        flex: 1,
        overflow: "hidden"
      }}
    >
      <style>{`
        .paloma-add-plus {
          color: #17c964;
          font-size: 1.35em;
          border: none;
          background: none !important;
          padding: 0 2px;
          border-radius: 4px;
          font-weight: 900;
          outline: none;
          transition: color 0.15s;
          min-width: 27px;
          min-height: 27px;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .paloma-add-plus:hover,
        .paloma-add-plus:focus {
          color: #3ae184;
        }
        .mfv-define-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3px 10px;
          margin-bottom: 0.1em;
          width: 100%;
        }
        .mfv-define-row {
          display: flex;
          flex-direction: row;
          gap: 5px;
          margin-bottom: 0px;
        }
      `}</style>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflow: "auto"
        }}
      >
        <div className="w-full flex flex-col items-center px-0 pt-3 pb-1">
          
          <div className="w-full text-center pb-1">
            <div className="text-2xl font-bold tracking-widest text-[#e6e8df]" style={{ letterSpacing: '0.1em', marginTop: '-4px' }}>
              MFV
            </div>
          </div>
          <div className="w-full flex flex-row items-center justify-center px-2 mb-0">
            <div className="flex-1 h-[2px] bg-[#35392e] rounded-full" />
          </div>
        </div>

        {/* DEFINE VALVES MODE */}
        {mode === "define" ? (
          <form className="w-full px-1 pb-1 pt-2" onSubmit={handleDefineSubmit} autoComplete="off">
            <div className="text-center text-[#e6e8df] font-bold text-[1.12em] pb-0">
              Define MFV Valves for This Job
            </div>
            <div className="mfv-define-grid mt-1">
              {defineVals.map((val, idx) => (
                <div className="mfv-define-row" key={idx}>
                  <input
                    className="w-16 rounded border px-1 py-1 bg-black text-white text-[12px] h-7 border-[#6a7257] focus:outline-none"
                    placeholder="PPC#"
                    value={val.ppc}
                    onChange={e => handleDefineChange(idx, "ppc", e.target.value)}
                    style={{ marginBottom: 0 }}
                  />
                  <input
                    className="flex-1 rounded border px-1 py-1 bg-black text-white text-[12px] h-7 border-[#6a7257] focus:outline-none"
                    placeholder="Location"
                    value={val.location}
                    onChange={e => handleDefineChange(idx, "location", e.target.value)}
                    style={{ marginBottom: 0 }}
                  />
                </div>
              ))}
            </div>
            <div className="flex flex-row justify-between w-full gap-2 mt-0 pb-1">
              <button
                type="button"
                className="rounded px-2 py-1 font-bold bg-[#35392e] text-[#e6e8df] hover:bg-[#494f3c] transition border border-[#6a7257] text-xs"
                style={{ minWidth: 90 }}
                onClick={handleAddRows}
              >
                + Add More Rows
              </button>
              <button
                type="submit"
                className="rounded px-2 py-1 font-bold bg-[#6a7257] hover:bg-[#88a05e] text-black transition border border-[#6a7257]"
                style={{ minWidth: 90, fontSize: 13, letterSpacing: ".02em" }}
              >
                Save Valves
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* INPUT PSI MODE */}
            <div className="w-full flex flex-row text-center uppercase underline items-center justify-between px-8 pb-1 mt-1" style={{ fontFamily: "monospace, sans-serif" }}>
              <span className="text-[#b0b79f] font-bold text-base tracking-widest" style={{ letterSpacing: ".06em" }}>Valve</span>
              <span className="text-[#b0b79f] font-bold text-base tracking-widest" style={{ letterSpacing: ".06em" }}>Pressure</span>
            </div>
            <div className="w-full flex flex-col gap-0 px-2">
              {valves.map((valve, i) => (
                <div
                  key={i}
                  className="flex flex-row items-center justify-between w-full py-0 px-2 pr-4 gap-1"
                  style={{
                    fontFamily: "monospace, sans-serif",
                    fontSize: "13px",
                    marginBottom: 0
                  }}
                >
                  <span className="text-white font-semibold mr-2" style={{ minWidth: 120, whiteSpace: "nowrap", textOverflow: "clip", overflow: "visible" }}>
                    {valve.label}
                  </span>
                  <input
                    type="text"
                    value={valve.psi}
                    onChange={e => onPsiChange(i, e.target.value)}
                    placeholder="PSI"
                    className="rounded border px-2 py-1 bg-black text-[#e6e8df] text-[10px] w-16 h-6 text-right border-[#6a7257] focus:outline-none focus:border-[#ffe996]"
                    style={{ fontFamily: "inherit", marginBottom: 0 }}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Divider */}
        <div className="w-full flex flex-row items-center justify-center px-2 my-0">
          <div className="flex-1 h-[2.5px] bg-[#35392e] rounded-full" />
        </div>

        {/* Equipment Section */}
        <div
          className="w-full flex flex-col px-0 pb-0"
          style={{
            background: "#000",
            borderRadius: 0,
            margin: "0 0px",
            marginBottom: 0,
            marginTop: 0,
            flex: 1,
            minHeight: 0,
            height: "100%"
          }}
        >
          <div className="w-full flex flex-row items-end gap-2 pt-2 px-4 pb-1">
            <div className="flex-1">
              <label
                className="block text-[13px] text-center underline font-bold uppercase mb-0 tracking-widest"
                style={{ marginBottom: 0, color: "#e6e8df", letterSpacing: ".05em" }}
              >
                Add Equipment Requirement
              </label>
            </div>
          </div>
          <form
            className="flex flex-row gap-2 items-center px-4 pb-1"
            onSubmit={handleAddEquipment}
            autoComplete="off"
            style={{ marginTop: -2, marginBottom: 2 }}
          >
            <div style={{ width: 32 }}>
              <label className="block text-[11px] font-semibold uppercase mb-0" htmlFor="equip-qty">
                Qty:
              </label>
              <input
                id="equip-qty"
                type="number"
                min={0}
                value={equipQty}
                onChange={e => setEquipQty(e.target.value)}
                className="w-full rounded border px-1 py-1 bg-black text-white text-[12px] h-6"
                style={{ minWidth: 10, textAlign: "center" }}
              />
            </div>
            <div className="flex-1">
              <label className="block text-[11px] text-center font-semibold uppercase mb-0" htmlFor="equip-item">
                Item:
              </label>
              <input
                id="equip-item"
                type="text"
                value={equipItem}
                onChange={e => setEquipItem(e.target.value)}
                className="w-full rounded border px-2 py-0 bg-black text-white text-[13px] h-6"
                placeholder="Equipment"
              />
            </div>
            <button
              type="submit"
              className="paloma-add-plus"
              aria-label="Add equipment"
              tabIndex={0}
              style={{ marginLeft: 0, marginTop: 16 }}
            >
              +
            </button>
          </form>
          <div
            className="w-full flex flex-col pb-0 px-2"
            style={{
              minHeight: 90
            }}
          >
            <div
              className="font-bold text-center border-t-2 border-[#6a7257] underline text-[13px] uppercase mt-1 pt-1 mb-4"
              style={{ color: "#e6e8df", letterSpacing: ".07em" }}
            >
              Current Equipment List:
            </div>
            <div className="w-full flex flex-col gap-1 px-1">
              {equipmentList.length === 0 ? (
                <span className="text-[13px] text-center text-[#8b8f78]">No items added.</span>
              ) : (
                equipmentList.map((eq, idx) => (
                  <div key={idx} className="flex flex-row items-center gap-2 mb-1 group">
                    <span className="font-bold text-[#ffe996] min-w-[22px]">{eq.qty}x</span>
                    <span className="text-[#e6e8df]">{eq.item}</span>
                    <button
                      className="ml-auto px-2 py-0 rounded bg-[#35392e] hover:bg-[#e82e2e] hover:text-white text-xs text-[#c1c7a4] font-bold"
                      onClick={() => handleRemove(idx)}
                      style={{ marginLeft: 8, fontSize: 11, height: 17, lineHeight: "15px" }}
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
