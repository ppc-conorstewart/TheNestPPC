// =================== Imports and Dependencies ===================
import { useEffect, useRef } from 'react';

// =================== Asset Selector Component ===================
export default function AssetSelector({
  assets,
  search,
  setSearch,
  selectedAssetName,
  setSelectedAssetName,
  selectedByName,
  handleCheckbox,
  showNameDropdown,
  setShowNameDropdown,
}) {
  // --------- Dropdown Ref ---------
  const dropdownRef = useRef();

  // --------- Unique Asset Name Filtering ---------
  const uniqueNames = [
    ...new Set(
      assets
        .filter(a =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          (a.ppc_a && a.ppc_a.toLowerCase().includes(search.toLowerCase()))
        )
        .map(a => a.name)
    ),
  ];

  // --------- Filtered Names Matching Search ---------
  const filteredNames = uniqueNames.filter(name => {
    const relevantAssets = assets.filter(a => a.name === name);
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      relevantAssets.some(
        a =>
          (a.ppc_a && a.ppc_a.toLowerCase().includes(search.toLowerCase())) ||
          (a.ppc && a.ppc.toLowerCase().includes(search.toLowerCase()))
      )
    );
  });

  // --------- Close Dropdown on Outside Click ---------
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNameDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowNameDropdown]);

  // --------- Handle Asset Name Click ---------
  function onAssetNameClick(name) {
    setSelectedAssetName(name);
    setShowNameDropdown(true);
  }

  // =================== Render Asset Selector ===================
  return (
    <div className="relative">
      {/* --------- Search Input --------- */}
      <input
        type="text"
        placeholder="Search Asset Name or PPC#"
        value={search}
        onChange={e => {
          setSearch(e.target.value);
          setShowNameDropdown(true);
          setSelectedAssetName(null);
        }}
        className="border rounded px-2 py-1 w-full text-black text-xs"
        style={{ minHeight: '28px' }}
        onFocus={() => setShowNameDropdown(true)}
      />

      {/* --------- Dropdown for Matching Asset Names --------- */}
      {showNameDropdown && (
        <div
          ref={dropdownRef}
          className="absolute left-0 mt-1 bg-white border border-gray-400 rounded shadow-xl z-50 w-[600px] max-h-60 overflow-y-auto"
        >
          {filteredNames.length === 0 && (
            <div className="p-2 text-gray-500 text-[2px]">No matches found.</div>
          )}
          {filteredNames.map(name => (
            <div
              key={name}
              className="cursor-pointer px-3 py-2 hover:bg-[#e6e8df] text-black text-[2px]]"
              onClick={() => onAssetNameClick(name)}
            >
              {name}
            </div>
          ))}
        </div>
      )}

      {/* --------- Expanded PPC# List with Checkboxes and Clear Button --------- */}
      {selectedAssetName && (
        <div
          ref={dropdownRef}
          className="absolute left-0 mt-1 bg-white border border-gray-400 rounded shadow-xl z-50 w-[600px]"
          style={{ maxHeight: '600px', maxWidth: '600px' }}
        >
          <div className="flex justify-between items-center px-3 pt-2 pb-1 font-bold text-black text-[2px]">
            <span>SELECT PPC#'s' FOR: {selectedAssetName}</span>
            <button
              className="text-red-600 font-bold text-[4px]"
              onClick={() => {
                setSelectedAssetName(null);
                setShowNameDropdown(false);
                setSearch('');
              }}
              aria-label="Clear selected asset group"
            >
              × Clear
            </button>
          </div>
          <table className="w-full text-xs">
            <tbody>
              {assets
                .filter(a => a.name === selectedAssetName)
                .map(a => (
                  <tr key={a.id} className="hover:bg-[#e6e8df]">
                    <td className="px- text-center">
                      <input
                        type="checkbox"
                        checked={selectedByName[selectedAssetName]?.includes(a.id) || false}
                        onChange={() => handleCheckbox(selectedAssetName, a.id)}
                      />
                    </td>
                    <td className="text-black text-[4px] text-left">{a.ppc_a || a.ppc || a.id}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
