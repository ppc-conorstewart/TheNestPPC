// =================== Imports and Assets ===================
import { Player } from '@lottiefiles/react-lottie-player';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import AddIcon from '../../assets/Fly-HQ Icons/AddIcon.json';
import ManagementIcon from '../../assets/Fly-HQ Icons/ManagementIcon.json';
import SearchIcon from '../../assets/Fly-HQ Icons/SearchIcon.json';
import TruckingIcon from '../../assets/Fly-HQ Icons/TruckingIcon.json';
import PalomaLogo from '../../assets/palomaassets.png';

// =================== Responsive Grid Constants ===================
const CONTROL_H = 32;
const SEARCH_H = 40;
const GAP = 6;
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
  const shopRef = useRef();
  const adminRef = useRef();
  const addRef = useRef();
  const searchRef = useRef();
  const logoWrapRef = useRef(null);
  const containerRef = useRef(null);

  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);
  const [hovering, setHovering] = useState(false);

  const [panelHeight, setPanelHeight] = useState(0);
  const [row1Cols, setRow1Cols] = useState(4);
  const [row2Cols, setRow2Cols] = useState(3);
  const [searchFocused, setSearchFocused] = useState(false);

  // =================== Debounced Search State ===================
  const [localSearch, setLocalSearch] = useState(searchTerm || '');
  useEffect(() => setLocalSearch(searchTerm || ''), [searchTerm]);
  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(localSearch), 140);
    return () => clearTimeout(t);
  }, [localSearch, setSearchTerm]);

  // =================== Gentle Idle Tilt ===================
  useEffect(() => {
    let raf;
    let t = 0;
    const loop = () => {
      t += 0.017;
      if (!hovering) {
        setTiltX(Math.sin(t) * 1.2);
        setTiltY(Math.cos(t * 0.8) * 1.2);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [hovering]);

  // =================== Responsive Measurements ===================
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const calc = (width) => {
      const gapX = GAP;
      const c1 = Math.max(2, Math.min(6, Math.floor((width + gapX) / (140 + gapX))));
      const c2 = Math.max(2, Math.min(4, Math.floor((width + gapX) / (240 + gapX))));
      setRow1Cols(c1);
      setRow2Cols(c2);
      const rowsControls = Math.ceil(6 / c1) + Math.ceil(4 / c2);
      const totalHeight =
        rowsControls * CONTROL_H +
        Math.max(0, rowsControls - 1) * GAP +
        GAP +
        SEARCH_H;
      setPanelHeight(totalHeight);
    };
    const ro = new ResizeObserver(([entry]) => {
      calc(entry.contentRect?.width || el.clientWidth);
    });
    ro.observe(el);
    calc(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  return (
    <div className='flex items-start mb-0 gap-2' style={{ fontSize: '1.05em', width: '100%' }}>
      {/* =================== Left: Paloma Logo =================== */}
      <div
        ref={logoWrapRef}
        className='paloma-logo-wrap paloma-frosted-glass'
        style={{
          minWidth: 280,
          height: panelHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 14px',
          position: 'relative',
          overflow: 'hidden',
          border: '2px solid #6a7257',
          borderRadius: 14,
          background: 'rgba(0,0,0,0.25)',
          backdropFilter: 'blur(6px)',
          transform: `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
          transition: hovering ? 'transform 60ms linear' : 'transform 400ms ease-out',
          boxShadow: 'inset 0 0 0 1px rgba(106,114,87,.25), 0 18px 44px rgba(0,0,0,.5)'
        }}
        onMouseEnter={() => setHovering(true)}
        onMouseMove={(e) => {
          const el = logoWrapRef.current; if (!el) return;
          const rect = el.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          const y = (e.clientY - rect.top) / rect.height;
          setTiltX((0.5 - y) * 8);
          setTiltY((x - 0.5) * 8);
        }}
        onMouseLeave={() => setHovering(false)}
      >
        <img
          src={PalomaLogo}
          alt='Paloma Assets'
          style={{ height: '100%', width: 'auto', objectFit: 'contain', display: 'block' }}
        />
      </div>

      {/* =================== Right: Filters Panel =================== */}
      <div
        ref={containerRef}
        className='w-full'
        style={{
          borderRadius: 12,
          boxShadow: '0 14px 44px #00000080',
          background: 'rgba(0,0,0,0.2)',
          backdropFilter: 'blur(6px)',
          padding: GAP,
          paddingLeft: 24,
          paddingRight: 12
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${row1Cols}, minmax(120px, 1fr))`,
            gridAutoRows: `${CONTROL_H}px`,
            gap: GAP,
            marginBottom: GAP
          }}
        >
          <SelectCell label='PPC#’s' value={filters.id} setValue={(v) => setFilters({ ...filters, id: v })} options={idOptions} rowHeight={CONTROL_H} />
          <SelectCell label='Serial Numbers' value={filters.sn} setValue={(v) => setFilters({ ...filters, sn: v })} options={snOptions} rowHeight={CONTROL_H} />
          <SelectCell label='Asset Name' value={filters.name} setValue={(v) => setFilters({ ...filters, name: v })} options={nameOptions} rowHeight={CONTROL_H} />
          <SelectCell label='Asset Category' value={filters.category} setValue={(v) => setFilters({ ...filters, category: v })} options={categoryOptions} rowHeight={CONTROL_H} />
          <SelectCell label='Asset Location' value={filters.location} setValue={(v) => setFilters({ ...filters, location: v })} options={locationOptions} rowHeight={CONTROL_H} />
          <SelectCell label='Asset Status' value={filters.status} setValue={(v) => setFilters({ ...filters, status: v })} options={statusOptions} rowHeight={CONTROL_H} />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${row2Cols}, minmax(200px, 1fr))`,
            gridAutoRows: `${CONTROL_H}px`,
            gap: GAP,
            marginBottom: GAP
          }}
        >
          <MAToggle
            isOn={showMAAssets}
            onToggle={onToggleMAAssets}
            rowHeight={CONTROL_H}
          />
          <ButtonBOL onClick={onOpenPhysicalTransfer} shopRef={shopRef} rowHeight={CONTROL_H} />
          <ButtonAdmin onClick={onOpenAssetTransfer} adminRef={adminRef} rowHeight={CONTROL_H} />
          <ButtonAdd onClick={onAddNewAsset} addRef={addRef} rowHeight={CONTROL_H} />
        </div>

        {/* =================== Prominent Search Bar =================== */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: SEARCH_H,
            background: 'rgba(0,0,0,0.25)',
            backdropFilter: 'blur(6px)',
            borderRadius: 6
          }}
          onMouseEnter={() => searchRef.current && searchRef.current.play()}
          onMouseLeave={() => { if (!searchFocused && searchRef.current) searchRef.current.stop(); }}
        >
          <Player
            ref={searchRef}
            autoplay={false}
            loop
            src={SearchIcon}
            style={{
              position: 'absolute', left: 10, top: '50%',
              transform: 'translateY(-50%)',
              height: Math.max(18, SEARCH_H * 0.45),
              width: Math.max(18, SEARCH_H * 0.45),
              pointerEvents: 'none', zIndex: 2
            }}
          />
          <input
            type='search'
            placeholder='Search Assets'
            value={localSearch}
            onFocus={() => { setSearchFocused(true); searchRef.current?.play(); }}
            onBlur={() => { setSearchFocused(false); searchRef.current?.stop(); }}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') { setLocalSearch(''); setSearchTerm(''); } }}
            autoComplete='off'
            spellCheck={false}
            inputMode='search'
            className='text-center uppercase rounded border border-[#6a7257] bg-transparent text-white focus:outline-none '
            style={{
              width: '100%', height: '100%',
              paddingLeft: Math.max(28, SEARCH_H * 0.7),
              fontSize: '1.24em', letterSpacing: '0.03em', boxSizing: 'border-box'
            }}
            aria-label='Search Assets'
          />
        </div>
      </div>
    </div>
  );
}

// =================== UI: Select ===================
function SelectCell({ label, value, setValue, options, rowHeight }) {
  return (
    <div style={{ height: rowHeight, background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(6px)', borderRadius: 6 }}>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className='bg-transparent text-white border border-[#6a7257] rounded focus:outline-none focus:ring hover:bg-zinc-900/40 transition w-full h-full text-center'
        style={{ height: '100%', width: '100%' }}
      >
        <option value=''>{label}</option>
        {options?.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

// =================== UI: MA Toggle (Stateful, remembers position; smaller size; left = red, right = green) ===================
function MAToggle({ isOn, onToggle, rowHeight }) {
  const trackH = Math.max(18, Math.floor(rowHeight * 0.58));
  const trackW = Math.max(42, Math.floor(trackH * 2.0));
  const knob = trackH - 6;
  const knobTranslate = isOn ? trackW - knob - 3 : 3;

  return (
    <button
      type='button'
      onClick={onToggle}
      role='switch'
      aria-checked={isOn}
      className='text-white border border-[#6a7257] rounded transition flex items-center justify-center gap-3 w-full'
      style={{
        height: '100%',
        padding: '0 12px',
        fontSize: '.95em',
        fontWeight: 700,
        boxSizing: 'border-box',
        background: 'rgba(0,0,0,0.25)',
        backdropFilter: 'blur(6px)',
        alignItems: 'center'
      }}
    >
      <div
        style={{
          width: trackW,
          height: trackH,
          position: 'relative',
          borderRadius: 999,
          border: '1px solid rgba(255,255,255,.25)',
          boxShadow: isOn
            ? 'inset 0 0 8px rgba(46, 204, 113, .35), 0 0 6px rgba(46, 204, 113, .25)'
            : 'inset 0 0 8px rgba(231, 76, 60, .35), 0 0 6px rgba(231, 76, 60, .25)',
          background: isOn
            ? 'linear-gradient(180deg, rgba(46,204,113,.35), rgba(46,204,113,.15))'
            : 'linear-gradient(180deg, rgba(231,76,60,.35), rgba(231,76,60,.15))',
          transition: 'background 220ms ease, box-shadow 220ms ease',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 3,
            left: 0,
            transform: `translateX(${knobTranslate}px)`,
            width: knob,
            height: knob,
            borderRadius: 999,
            background: 'linear-gradient(180deg, #ffffff, #cfcfcf)',
            boxShadow: '0 1px 2px rgba(0,0,0,.6), inset 0 0 2px rgba(0,0,0,.2)',
            transition: 'transform 220ms cubic-bezier(.22,.61,.36,1)'
          }}
        />
      </div>
      <span style={{ letterSpacing: '.03em', whiteSpace: 'nowrap', userSelect: 'none' }}>
        Master Assembly Assets
      </span>
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
      className='text-white border border-[#6a7257] rounded transition flex items-center justify-center gap-2 w-full'
      style={{
        height: '100%',
        padding: '0 10px',
        fontSize: '1em',
        fontWeight: 400,
        boxSizing: 'border-box',
        background: 'rgba(0,0,0,0.25)',
        backdropFilter: 'blur(6px)'
      }}
    >
      <Player ref={shopRef} autoplay={false} loop src={TruckingIcon} style={{ height: Math.max(22, rowHeight * 0.5), width: Math.max(22, rowHeight * 0.5) }} />
      Initiate Shop Transfer [BOL]
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
      className='text-white border border-[#6a7257] rounded transition flex items-center justify-center gap-2 w-full'
      style={{
        height: '100%',
        padding: '0 10px',
        fontSize: '1em',
        fontWeight: 400,
        boxSizing: 'border-box',
        background: 'rgba(0,0,0,0.25)',
        backdropFilter: 'blur(6px)'
      }}
    >
      <Player ref={adminRef} autoplay={false} loop src={ManagementIcon} style={{ height: Math.max(22, rowHeight * 0.5), width: Math.max(22, rowHeight * 0.5) }} />
      Admin Asset Transfer
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
      className='text-white border border-[#6a7257] rounded transition flex items-center justify-center gap-2 w-full'
      style={{
        height: '100%',
        padding: '0 10px',
        fontSize: '1em',
        fontWeight: 400,
        boxSizing: 'border-box',
        background: 'rgba(0,0,0,0.25)',
        backdropFilter: 'blur(6px)'
      }}
    >
      <Player ref={addRef} autoplay={false} loop src={AddIcon} style={{ height: Math.max(22, rowHeight * 0.5), width: Math.max(22, rowHeight * 0.5) }} />
      + Add New Asset
    </button>
  );
}
