// =====================================================
// CustomerLogoCard.jsx — Customer Hub Logo & Identity Card • Glass
// Sections: Imports • Component
// =====================================================
import { useRef } from 'react';
import { FiEdit2 } from 'react-icons/fi';

export default function CustomerLogoCard({
  selected,
  form,
  editMode,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onLogoChange,
  onLogoDelete,
  onNameChange
}) {
  const logoInputRef = useRef(null);

  return (
    <div className="glass-card px-4 py-4 flex flex-col items-center w-[250px] min-w-[200px] max-w-[290px]">
      <div className="relative w-[180px] h-[180px] bg-white rounded-full mb-2 flex items-center justify-center shadow-lg overflow-hidden mt-1">
        {selected && selected.logo_url ? (
          <>
            <img
              src={selected.logo_url}
              alt="Logo"
              className="object-contain h-full w-full"
              style={{ maxHeight: 170, maxWidth: 170 }}
            />
            {editMode && (
              <FiEdit2
                size={20}
                className="absolute top-1 right-1 cursor-pointer opacity-80 hover:opacity-100 z-10"
                onClick={() => logoInputRef.current && logoInputRef.current.click()}
              />
            )}
          </>
        ) : (
          <span className="text-black text-lg font-semibold">No Logo</span>
        )}
        <input
          ref={logoInputRef}
          type="file"
          style={{ display: 'none' }}
          accept="image/*"
          onChange={onLogoChange}
        />
      </div>

      <div className="relative w-full flex flex-col items-center">
        {editMode ? (
          <>
            <input
              className="text-2xl font-bold text-[#949C7F] mb-2 text-center w-full bg-transparent border-b border-[#949C7F] focus:outline-none"
              style={{
                fontFamily: 'Erbaum, sans-serif',
                maxWidth: 200
              }}
              value={form.name}
              onChange={e => onNameChange && onNameChange(e.target.value)}
              placeholder="Customer Name"
            />
            <FiEdit2
              size={16}
              className="absolute top-0 right-0 cursor-pointer opacity-80 hover:opacity-100 z-10"
              onClick={onEdit}
            />
          </>
        ) : (
          <div
            className="text-2xl text-white mt-1 mb-2 text-center w-full"
            style={{ fontFamily: 'Varien, sans-serif' }}
          >
            {selected?.name}
          </div>
        )}
      </div>

      {selected && editMode && (
        <div className="flex flex-row gap-2 mb-2 mt-1 justify-center w-full">
          <button
            className="text-xs bg-[#949C7F] text-black px-2 py-1 rounded font-bold"
            type="button"
            onClick={() => logoInputRef.current && logoInputRef.current.click()}
          >
            {form.logo_url ? 'Change Logo' : 'Add Logo'}
          </button>
          {form.logo_url && (
            <button
              className="text-xs bg-red-700 text-white px-2 py-1 rounded font-bold"
              type="button"
              onClick={onLogoDelete}
            >
              Delete Logo
            </button>
          )}
        </div>
      )}

      {selected && editMode && (
        <div className="flex flex-row gap-2 mb-2 mt-1 justify-center w-full">
          <button
            className="bg-[#949C7F] text-black px-2 py-1 rounded font-bold text-[0.87rem] min-w-[60px]"
            style={{ fontSize: '0.87rem', padding: '3px 14px' }}
            onClick={onSave}
          >
            Save
          </button>
          <button
            className="bg-gray-800 text-white px-2 py-1 rounded font-bold text-[0.87rem] min-w-[60px]"
            style={{ fontSize: '0.87rem', padding: '3px 14px' }}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      )}

      {selected && !editMode && (
        <div className="flex flex-row gap-2 mb-2 mt-1 justify-center w-full">
          <button
            className="bg-[#949C7F] text-black px-2 py-1 rounded font-bold text-[0.87rem] min-w-[60px]"
            style={{ fontSize: '0.87rem', padding: '3px 14px' }}
            onClick={onEdit}
          >
            Edit
          </button>
          <button
            className="bg-red-700 text-white px-2 py-1 rounded font-bold text-[0.87rem] min-w-[60px]"
            style={{ fontSize: '0.87rem', padding: '3px 14px' }}
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      )}

      {selected && editMode && form.logo_url && form.logoFile && (
        <img
          src={form.logo_url}
          alt="Thumb preview"
          className="w-10 h-10 object-contain bg-white rounded border mt-1"
        />
      )}
    </div>
  );
}
