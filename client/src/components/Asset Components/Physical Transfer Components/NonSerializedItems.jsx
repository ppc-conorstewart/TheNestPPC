// =================== Imports and Dependencies ===================

// =================== Non-Serialized Items Component ===================
export default function NonSerializedItems({
  showAddNonSerialized,
  nonSerForm,
  handleNonSerInput,
  handleAddNonSerialized,
  setShowAddNonSerialized,
  nonSerialized,
  handleRemoveNonSerialized,
}) {
  // =================== Render Non-Serialized Items Form and Table Rows ===================
  return (
    <>
      {/* --------- Non-Serialized Item Entry Form --------- */}
      {showAddNonSerialized && (
        <div className="mb-2 flex gap-3 flex-nowrap items-end bg-[#e6e8df] p-2 rounded">
          <div className="flex flex-col flex-1 max-w-[60px]">
            <label className="block font-bold text-black mb-0" style={{ fontSize: '10px' }}>QTY</label>
            <input
              type="number"
              min="1"
              name="qty"
              value={nonSerForm.qty}
              onChange={handleNonSerInput}
              className="border rounded px-2 py-1 text-black w-full"
              style={{ minHeight: '20px', fontSize: '10px' }}
              placeholder="QTY"
            />
          </div>
          <div className="flex flex-col flex-[2_2_0%] min-w-[170px]">
            <label className="block font-bold text-black mb-0" style={{ fontSize: '10px' }}>ITEM DESCRIPTION</label>
            <input
              type="text"
              name="name"
              value={nonSerForm.name}
              onChange={handleNonSerInput}
              className="border rounded px-2 py-1 text-black w-full"
              style={{ minHeight: '20px', fontSize: '10px' }}
              placeholder="Item Description"
            />
          </div>
          <div className="flex flex-col flex-1 max-w-[80px]">
            <label className="block font-bold text-black mb-0" style={{ fontSize: '10px' }}>WEIGHT</label>
            <input
              type="text"
              name="weight"
              value={nonSerForm.weight}
              onChange={handleNonSerInput}
              className="border rounded px-2 py-1 text-black w-full"
              style={{ minHeight: '20px', fontSize: '10px' }}
              placeholder="Weight"
            />
          </div>
          <button
            className="bg-[#6a7257] text-black font-bold rounded px-3 py-1 border-2 border-black hover:bg-[#35392e] hover:text-white transition"
            style={{ minHeight: '22px', fontSize: '10px' }}
            onClick={handleAddNonSerialized}
          >
            Add
          </button>
          <button
            className="bg-black text-white px-2 py-1 rounded font-bold border ml-1 border-[#6a7257] hover:bg-[#494f3c] transition"
            style={{ minHeight: '22px', fontSize: '10px' }}
            onClick={() => setShowAddNonSerialized(false)}
          >
            Cancel
          </button>
        </div>
      )}

      {/* --------- Table Rows for Non-Serialized Items --------- */}
      {nonSerialized.length > 0 && nonSerialized.map(item => (
        <tr key={item._id}>
          <td className="border px-2 py-1 text-black text-center font-bold" style={{ fontSize: '10px' }}>{item.qty}</td>
          <td className="border px-2 py-1 text-black font-bold" style={{ fontSize: '10px' }}>{item.name}</td>
          <td className="border px-2 py-1 text-black font-bold" style={{ fontSize: '10px' }}>-</td>
          <td className="border px-2 py-1 text-black text-center font-bold" style={{ fontSize: '10px' }}>{item.weight || '-'}</td>
          <td className="border px-2 py-1">
            <button
              className="text-red-600 font-bold px-1 py-0.5 rounded hover:underline"
              style={{ fontSize: '10px' }}
              onClick={() => handleRemoveNonSerialized(item._id)}
            >
              Remove
            </button>
          </td>
        </tr>
      ))}
    </>
  );
}
