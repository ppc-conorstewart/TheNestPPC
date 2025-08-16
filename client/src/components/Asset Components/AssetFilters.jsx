// =================== Imports and Assets ===================
import { Player } from '@lottiefiles/react-lottie-player';
import { useLayoutEffect, useRef, useState } from 'react';
import AddIcon from '../../assets/Fly-HQ Icons/AddIcon.json';
import ManagementIcon from '../../assets/Fly-HQ Icons/ManagementIcon.json';
import SearchIcon from '../../assets/Fly-HQ Icons/SearchIcon.json';
import ToggleIcon from '../../assets/Fly-HQ Icons/ToggleIcon.json';
import TruckingIcon from '../../assets/Fly-HQ Icons/TruckingIcon.json';
import PalomaLogo from '../../assets/palomaassets.png';

// =================== Responsive Grid Constants ===================
// Base row height and vertical gap between rows
const ROW_H = 40;
const GAP = 6;

// Minimum cell widths used to determine how many columns fit per row
const MIN_W_FILTER = 170; // per select
const MIN_W_BUTTON = 240; // per action button

// Lottie frame positions for the MA toggle
const OFF_FRAME = 0;
const ON_FRAME = 15;

// =================== Component ===================
export default function AssetFilters({
  filters,
  setFilters,
  searchTerm,
  setSearchTerm,
  idOptions,
  snOptions,
  nameOptions,
  categoryOptions,
  locationOptions,
  statusOptions,
  onOpenPhysicalTransfer,
  onOpenAssetTransfer,
  onAddNewAsset,
  showMAAssets,
  onToggleMAAssets,
}) {
  // ---- Refs for Lottie players
  const shopRef = useRef();
  const adminRef = useRef();
  const addRef = useRef();
  const toggleRef = useRef();
  const searchRef = useRef();

  // ---- Layout refs + state (drives responsive rows/cols)
  const rightGridRef = useRef(null);
  const [row1Cols, setRow1Cols] = useState(6); // filters
  const [row2Cols, setRow2Cols] = useState(4); // action buttons
  const [row1Rows, setRow1Rows] = useState(1);
  const [row2Rows, setRow2Rows] = useState(1);
  const [panelHeight, setPanelHeight] = useState(ROW_H * 3 + GAP * 2); // default = 3 rows

  const [searchFocused, setSearchFocused] = useState(false);

  // ---- Keep MA toggle in sync
  useLayoutEffect(() => {
    if (toggleRef.current) toggleRef.current.setSeeker(showMAAssets ? ON_FRAME : OFF_FRAME, false);
  }, [showMAAssets]);

  const handleToggleLoad = () => {
    if (toggleRef.current) toggleRef.current.setSeeker(showMAAssets ? ON_FRAME : OFF_FRAME, false);
  };
  const handleToggleClick = () => {
    const goingOn = !showMAAssets;
    const p = toggleRef.current;
    if (p) {
      if (typeof p.playSegments === 'function') {
        goingOn ? p.playSegments([OFF_FRAME, ON_FRAME], true) : p.playSegments([ON_FRAME, OFF_FRAME], true);
      } else {
        p.setSeeker(goingOn ? ON_FRAME : OFF_FRAME, false);
        p.play?.();
      }
    }
    onToggleMAAssets && onToggleMAAssets();
  };

  // =================== Resize Observer — Computes grid dynamically ===================
  useLayoutEffect(() => {
    const el = rightGridRef.current;
    if (!el) return;

    const calc = (width) => {
      const gapX = 8;

      // Row 1 (6 selects)
      const c1 = Math.max(2, Math.min(6, Math.floor((width + gapX) / (MIN_W_FILTER + gapX))));
      const r1 = Math.ceil(6 / c1);

      // Row 2 (4 buttons)
      const c2 = Math.max(2, Math.min(4, Math.floor((width + gapX) / (MIN_W_BUTTON + gapX))));
      const r2 = Math.ceil(4 / c2);

      setRow1Cols(c1);
      setRow2Cols(c2);
      setRow1Rows(r1);
      setRow2Rows(r2);

      const totalRows = r1 + r2 + 1; // +1 for the search row
      const h = totalRows * ROW_H + (totalRows - 1) * GAP;
      setPanelHeight(h);
    };

    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect?.width || el.clientWidth;
      calc(w);
    });

    ro.observe(el);
    // initial tick
    calc(el.clientWidth);

    return () => ro.disconnect();
  }, []);

  return (
    <div className="flex items-start mb-2 ml-4 mt-2 gap-2" style={{ fontSize: '1.05em', width: '100%' }}>
      {/* =================== Left: Paloma Logo (height matches dynamic panel) =================== */}
      <div className="flex items-center" style={{ minWidth: 220, height: panelHeight }}>
        <img src={PalomaLogo} alt="Paloma" style={{ height: '100%', objectFit: 'contain', display: 'block' }} />
      </div>

      {/* =================== Divider =================== */}
      <div style={{ width: 4, alignSelf: 'stretch', background: '#23251d', margin: '0 10px' }} />

      {/* =================== Right: Responsive Grid =================== */}
      <div
        ref={rightGridRef}
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateRows: `${row1Rows * ROW_H}px ${row2Rows * ROW_H}px ${ROW_H}px`,
          gap: `${GAP}px`,
          height: panelHeight,
          maxWidth: "100%",
          marginRight: 24
        }}
      >
        {/* =================== Row 1 — Filters =================== */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${row1Cols}, minmax(0, 1fr))`,
            gap: 8,
            alignItems: 'stretch',
          }}
        >
          <SelectBox value={filters.id}       onChange={(v) => setFilters((p) => ({ ...p, id: v }))}       options={idOptions}       placeholder="PPC#'s" />
          <SelectBox value={filters.sn}       onChange={(v) => setFilters((p) => ({ ...p, sn: v }))}       options={snOptions}       placeholder="Serial Numbers" />
          <SelectBox value={filters.name}     onChange={(v) => setFilters((p) => ({ ...p, name: v }))}     options={nameOptions}     placeholder="Asset Name" />
          <SelectBox value={filters.category} onChange={(v) => setFilters((p) => ({ ...p, category: v }))} options={categoryOptions} placeholder="Asset Category" />
          <SelectBox value={filters.location} onChange={(v) => setFilters((p) => ({ ...p, location: v }))} options={locationOptions} placeholder="Asset Location" />
          <SelectBox value={filters.status}   onChange={(v) => setFilters((p) => ({ ...p, status: v }))}   options={statusOptions}   placeholder="Asset Status" />
        </div>

        {/* =================== Row 2 — Toggle + Actions =================== */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${row2Cols}, minmax(0, 1fr))`,
            gap: 8,
            alignItems: 'stretch',
          }}
        >
          <ButtonToggle
            showMAAssets={showMAAssets}
            onClick={handleToggleClick}
            onLoad={handleToggleLoad}
            toggleRef={toggleRef}
            rowHeight={ROW_H}
          />
          <ButtonBOL onClick={onOpenPhysicalTransfer} shopRef={shopRef} rowHeight={ROW_H} />
          <ButtonAdmin onClick={onOpenAssetTransfer} adminRef={adminRef} rowHeight={ROW_H} />
          <ButtonAdd onClick={onAddNewAsset} addRef={addRef} rowHeight={ROW_H} />
        </div>

        {/* =================== Row 3 — Search =================== */}
        <div
          style={{ position: 'relative', width: '100%', height: '100%' }}
          onMouseEnter={() => searchRef.current && searchRef.current.play()}
          onMouseLeave={() => { if (!searchFocused && searchRef.current) searchRef.current.stop(); }}
        >
          <Player
            ref={searchRef}
            autoplay={false}
            loop
            src={SearchIcon}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              height: Math.max(16, ROW_H * 0.5),
              width: Math.max(16, ROW_H * 0.5),
              pointerEvents: 'none',
              zIndex: 2
            }}
          />
          <input
            type="text"
            placeholder="Search Assets"
            value={searchTerm}
            onFocus={() => { setSearchFocused(true); searchRef.current?.play(); }}
            onBlur={() => { setSearchFocused(false); searchRef.current?.stop(); }}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-center uppercase rounded  border  border-[#6a7257] bg-black text-white focus:outline-none focus:ring"
            style={{
              width: '100%',
              height: '100%',
              paddingLeft: Math.max(28, ROW_H * 0.8),
              fontSize: '1.2em',
              letterSpacing: '0.03em',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>
    </div>
  );
}

// =================== UI: Select ===================
function SelectBox({ value, onChange, options = [], placeholder }) {
  return (
    <select
      className="bg-black text-white text-center rounded border border-[#6a7257]"
      style={{
        width: '100%',
        height: '100%',
        padding: '0 8px',
        fontSize: '0.98em',
        fontWeight: 400,
        letterSpacing: '0.02em',
        boxSizing: 'border-box'
      }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {[...options].sort((a, b) => String(a).localeCompare(String(b))).map((val) => (
        <option key={val} value={val}>
          {val}
        </option>
      ))}
    </select>
  );
}

// =================== UI: Toggle Button ===================
function ButtonToggle({ showMAAssets, onClick, onLoad, toggleRef, rowHeight }) {
  return (
    <button
      onClick={onClick}
      className="rounded shadow transition border flex items-center justify-center gap-2 w-full"
      style={{
        height: '100%',
        padding: '0 10px',
        fontSize: '1em',
        fontWeight: 400,
        background: showMAAssets ? '#000000ac' : '#000000b5',
        color: 'white',
        border: `1px solid ${showMAAssets ? '#2ecc40a6' : '#b94c4ccd'}`,
        boxSizing: 'border-box'
      }}
      title={showMAAssets ? 'Show all assets including MA assignments' : 'Hide MA in-use assets'}
    >
      <Player
        ref={toggleRef}
        autoplay={false}
        loop={false}
        src={ToggleIcon}
        style={{ height: Math.max(16, rowHeight * 0.5), width: Math.max(16, rowHeight * 0.5) }}
        keepLastFrame={true}
        onEvent={(event) => { if (event === 'load') onLoad(); }}
      />
      Master Assembly Assets
    </button>
  );
}

// =================== UI: BOL Button ===================
function ButtonBOL({ onClick, shopRef, rowHeight }) {
  return (
    <button
      onMouseEnter={() => shopRef.current && shopRef.current.play()}
      onMouseLeave={() => shopRef.current && shopRef.current.stop()}
      onClick={onClick}
      className="bg-black text-white border border-[#6a7257] rounded shadow hover:bg-gray-800 transition flex items-center justify-center gap-2 w-full"
      style={{
        height: '100%',
        padding: '0 10px',
        fontSize: '1em',
        fontWeight: 400,
        boxSizing: 'border-box'
      }}
    >
      <Player ref={shopRef} autoplay={false} loop src={TruckingIcon} style={{ height: Math.max(16, rowHeight * 0.5), width: Math.max(22, rowHeight * 0.5) }} />
      Initiate Shop Transfer (BOL)
    </button>
  );
}

// =================== UI: Admin Transfer Button ===================
function ButtonAdmin({ onClick, adminRef, rowHeight }) {
  return (
    <button
      onMouseEnter={() => adminRef.current && adminRef.current.play()}
      onMouseLeave={() => adminRef.current && adminRef.current.stop()}
      onClick={onClick}
      className="bg-black text-white border border-[#6a7257] rounded shadow hover:bg-gray-800 transition flex items-center justify-center gap-2 w-full"
      style={{
        height: '100%',
        padding: '0 10px',
        fontSize: '1em',
        fontWeight: 400,
        boxSizing: 'border-box'
      }}
    >
      <Player ref={adminRef} autoplay={false} loop src={ManagementIcon} style={{ height: Math.max(16, rowHeight * 0.5), width: Math.max(22, rowHeight * 0.5) }} />
      Admin Asset Transfer (Instant)
    </button>
  );
}

// =================== UI: Add Button ===================
function ButtonAdd({ onClick, addRef, rowHeight }) {
  return (
    <button
      onMouseEnter={() => addRef.current && addRef.current.play()}
      onMouseLeave={() => addRef.current && addRef.current.stop()}
      onClick={onClick}
      className="bg-black text-white border border-[#6a7257] rounded shadow hover:bg-gray-800 transition flex items-center justify-center gap-2 w-full"
      style={{
        height: '100%',
        padding: '0 10px',
        fontSize: '1em',
        fontWeight: 400,
        boxSizing: 'border-box'
      }}
    >
      <Player ref={addRef} autoplay={false} loop src={AddIcon} style={{ height: Math.max(16, rowHeight * 0.5), width: Math.max(22, rowHeight * 0.5) }} />
      + Add New Asset
    </button>
  );
}
