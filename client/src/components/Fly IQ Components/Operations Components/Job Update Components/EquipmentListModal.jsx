// ==============================
// EquipmentListModal.jsx — Popup Modal for Required Equipment List
// ==============================
export default function EquipmentListModal({ open, onClose, equipmentList = [] }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.63)" }}
      onClick={onClose}
    >
      <div
        className="bg-[#242823] border-2 border-[#b0b79f] rounded-xl p-6 min-w-[300px] max-w-[90vw] shadow-2xl flex flex-col items-center relative"
        style={{ boxShadow: "0 8px 32px #181e18d1, 0 2px 18px #232c18af" }}
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute top-3 right-4 text-2xl text-[#b0b79f] hover:text-white"
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer"
          }}
        >×</button>
        <h3 className="text-base font-bold text-[#e6e8df] mb-2 uppercase tracking-wide">
          Current Required Equipment
        </h3>
        <ul className="w-full text-center text-[13px]">
          {(equipmentList.length ? equipmentList : [{ item: "No Equipment Listed", qty: "" }]).map((eq, idx) => (
            <li key={idx} className="mb-1 flex justify-between px-3">
              <span className="text-[#ffe996]">{eq.item}</span>
              <span className="text-[#a5ffd2] font-semibold ml-3">{eq.qty ? `x${eq.qty}` : ""}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            className="bg-[#6a7257] px-6 py-1 rounded font-bold text-black shadow hover:bg-[#b0b79f] uppercase text-[13px]"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
