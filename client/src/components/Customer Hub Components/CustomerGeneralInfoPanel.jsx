// =====================================================
// CustomerGeneralInfoPanel.jsx — Customer Hub General Information Panel • Glass
// Sections: Component
// =====================================================

export default function CustomerGeneralInfoPanel({
  selected,
  editMode,
  form,
  onFormChange
}) {
  return (
    <div className="glass-card p-4 flex flex-col flex-1 gap-3 min-w-[240px]">
      <h2 className="text-xl font-bold text-[#949C7F] mb-2">
        General Information
      </h2>
      <div className="flex flex-col gap-2">
        <label className="font-bold text-sm text-white">
          Head Office Address:
        </label>
        {editMode ? (
          <input
            className="bg-[#232429] border border-[#949C7F] rounded px-2 py-1 text-white"
            value={form.head_office_address || ''}
            onChange={e => onFormChange('head_office_address', e.target.value)}
          />
        ) : (
          <div className="text-[#b0b79f] text-sm">
            {selected?.head_office_address || <span className="text-gray-500">—</span>}
          </div>
        )}

        <label className="font-bold text-sm text-white">
          Head of Completions:
        </label>
        {editMode ? (
          <input
            className="bg-[#232429] border border-[#949C7F] rounded px-2 py-1 text-white"
            value={form.head_of_completions || ''}
            onChange={e => onFormChange('head_of_completions', e.target.value)}
          />
        ) : (
          <div className="text-[#b0b79f] text-sm">
            {selected?.head_of_completions || <span className="text-gray-500">—</span>}
          </div>
        )}

        <label className="font-bold text-sm text-white">
          Head Office Phone:
        </label>
        {editMode ? (
          <input
            className="bg-[#232429] border border-[#949C7F] rounded px-2 py-1 text-white"
            value={form.head_office_phone || ''}
            onChange={e => onFormChange('head_office_phone', e.target.value)}
          />
        ) : (
          <div className="text-[#b0b79f] text-sm">
            {selected?.head_office_phone || <span className="text-gray-500">—</span>}
          </div>
        )}
      </div>
    </div>
  );
}
