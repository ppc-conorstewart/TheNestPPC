// =================== Imports and Dependencies ===================

// =================== Form Field Component ===================
export default function FormField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  options = [],
}) {
  // =================== Render Field ===================
  return (
    <div className="mb-4">
      <label className="block mb-1">{label}</label>
      {type === 'text' ? (
        // --------- Text Input Field ---------
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-600 rounded bg-black text-white"
        />
      ) : (
        // --------- Select Dropdown Field ---------
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-600 rounded bg-black text-white"
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
