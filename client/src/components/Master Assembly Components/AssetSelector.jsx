// ==============================
// src/components/Master Assembly Components/AssetSelector.jsx
// ==============================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Select, { components } from 'react-select';
import { FixedSizeList as List } from 'react-window';

// ==============================
// CONSTANTS
// ==============================
const palomaGreen = '#6a7257';
const assetRed = '#e53939';
const ROW_HEIGHT = 32;
const MAX_VISIBLE_ROWS = 9;

// ==============================
// UTILS
// ==============================
function filterOption(option, rawInput) {
  if (!rawInput) return true;
  const input = rawInput.toLowerCase();
  return (
    (option.data.id || '').toLowerCase().includes(input) ||
    (option.data.name || '').toLowerCase().includes(input)
  );
}

function normalizeOptions(opts = []) {
  const out = new Array(opts.length);
  for (let i = 0; i < opts.length; i++) {
    const a = opts[i] || {};
    out[i] = { value: a.id || '', id: a.id || '', name: a.name || '' };
  }
  return out;
}

function areAssetListsEqual(a = [], b = []) {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const ax = a[i] || {};
    const bx = b[i] || {};
    if ((ax.id || '') !== (bx.id || '')) return false;
    if ((ax.name || '') !== (bx.name || '')) return false;
  }
  return true;
}

// ==============================
// VIRTUALIZED MENULIST
// ==============================
const MenuList = (props) => {
  const { children, maxHeight } = props;
  const items = Array.isArray(children) ? children : React.Children.toArray(children);
  const itemCount = items.length;
  const height = Math.min(itemCount, MAX_VISIBLE_ROWS) * ROW_HEIGHT;

  const outerRef = useRef(null);

  const onWheelCapture = (e) => {
    const el = outerRef.current;
    if (!el) return;
    const before = el.scrollTop;
    el.scrollTop = Math.max(0, Math.min(el.scrollHeight, el.scrollTop + e.deltaY));
    if (el.scrollTop !== before) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  if (!itemCount) {
    return <components.MenuList {...props}>{children}</components.MenuList>;
  }

  return (
    <components.MenuList
      {...props}
      innerProps={{ ...(props.innerProps || {}), onWheelCapture }}
    >
      <List
        height={Math.min(height, maxHeight || height)}
        width="100%"
        itemCount={itemCount}
        itemSize={ROW_HEIGHT}
        outerRef={outerRef}
      >
        {({ index, style }) => <div style={style}>{items[index]}</div>}
      </List>
    </components.MenuList>
  );
};

// ==============================
// OPTION RENDERERS
// ==============================
const Option = (optionProps) => (
  <components.Option {...optionProps}>
    <span>
      <span style={{ color: assetRed, fontWeight: 700 }}>[{optionProps.data.id}]</span>{' '}
      <span style={{ color: '#ffffff' }}>{optionProps.data.name || ''}</span>
    </span>
  </components.Option>
);

const SingleValue = (singleProps) => (
  <components.SingleValue {...singleProps}>
    <span>
      <span style={{ color: assetRed, fontWeight: 700 }}>[{singleProps.data.id}]</span>{' '}
      <span style={{ color: '#ffffff' }}>{singleProps.data.name || ''}</span>
    </span>
  </components.SingleValue>
);

// ==============================
// COMPONENT
// ==============================
function AssetSelector({
  label,
  asset,
  onChange,
  assetOptions = [],
  accentColor,
  style,
}) {
  // ---------- Stable identity ----------
  const instanceIdRef = useRef(`asset-select-${Math.random().toString(36).slice(2)}`);
  const rootRef = useRef(null);

  // ---------- Menu open state (hard-locked against polling) ----------
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const openRef = useRef(false);
  const allowCloseNextRef = useRef(false);
  const selectionCloseNextRef = useRef(false);

  const setOpen = useCallback((v) => {
    openRef.current = v;
    setMenuIsOpen(v);
  }, []);

  const handleMenuOpen = useCallback(() => setOpen(true), [setOpen]);

  const handleMenuClose = useCallback(() => {
    if (selectionCloseNextRef.current || allowCloseNextRef.current) {
      selectionCloseNextRef.current = false;
      allowCloseNextRef.current = false;
      setOpen(false);
      return;
    }
    setOpen(true); // block auto-close from re-render/polling/scroll
  }, [setOpen]);

  const handleInputChange = useCallback((val, meta) => {
    if (meta.action === 'input-change') setOpen(true);
    return val;
  }, [setOpen]);

  const handleChange = useCallback((opt) => {
    selectionCloseNextRef.current = true;
    onChange(opt ? opt.value : '');
    // ----- Ensure close on first click (controlled menu) -----
    // close immediately so we don't rely on react-select's internal close
    setTimeout(() => setOpen(false), 0);
  }, [onChange, setOpen]);

  // ---------- Global "any menu open" reference counter (pauses polling app-wide) ----------
  const countedRef = useRef(false);
  useEffect(() => {
    const g = typeof window !== 'undefined' ? window : globalThis;
    if (!g.__palomaMenuOpenAny) g.__palomaMenuOpenAny = 0;
    if (menuIsOpen && !countedRef.current) {
      g.__palomaMenuOpenAny = Number(g.__palomaMenuOpenAny) + 1;
      countedRef.current = true;
    } else if (!menuIsOpen && countedRef.current) {
      g.__palomaMenuOpenAny = Math.max(0, Number(g.__palomaMenuOpenAny) - 1);
      countedRef.current = false;
    }
    return () => {
      if (countedRef.current) {
        const gg = typeof window !== 'undefined' ? window : globalThis;
        gg.__palomaMenuOpenAny = Math.max(0, Number(gg.__palomaMenuOpenAny) - 1);
        countedRef.current = false;
      }
    };
  }, [menuIsOpen]);

  // ---------- Suppress true outside clicks only ----------
  useEffect(() => {
    if (!menuIsOpen) return;
    const onMouseDown = (e) => {
      const root = rootRef.current;
      const target = e.target;
      const clickedInsideControl = !!(root && root.contains(target));
      const clickedInMenu = !!document.querySelector('.rs__menu') && e.composedPath().some((el) => {
        try { return el && el.classList && el.classList.contains('rs__menu'); } catch { return false; }
      });
      if (!clickedInsideControl && !clickedInMenu) {
        allowCloseNextRef.current = true;
      }
    };
    document.addEventListener('mousedown', onMouseDown, true);
    return () => document.removeEventListener('mousedown', onMouseDown, true);
  }, [menuIsOpen]);

  // ---------- Options memo with deep equality ----------
  const lastAssetOptionsRef = useRef(assetOptions);
  const stableAssetOptions = useMemo(() => {
    if (areAssetListsEqual(lastAssetOptionsRef.current, assetOptions)) {
      return lastAssetOptionsRef.current;
    }
    lastAssetOptionsRef.current = assetOptions;
    return assetOptions;
  }, [assetOptions]);

  const options = useMemo(() => normalizeOptions(stableAssetOptions), [stableAssetOptions]);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === asset) || null,
    [options, asset]
  );

  const borderColor = accentColor || palomaGreen;

  return (
    <div
      ref={rootRef}
      style={{
        marginBottom: 0,
        fontSize: 12,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        minWidth: 0,
        ...(style || {}),
      }}
    >
      <label
        style={{
          fontWeight: 300,
          fontSize: 11,
          color: palomaGreen,
          whiteSpace: 'nowrap',
          flex: '0 0 auto',
        }}
      >
        {label}:
      </label>

      <div style={{ flex: '1 1 auto', minWidth: 0 }}>
        <Select
          instanceId={instanceIdRef.current}
          inputId={`${instanceIdRef.current}-input`}
          classNamePrefix="rs"
          value={selectedOption}
          onChange={handleChange}
          onInputChange={handleInputChange}
          options={options}
          isClearable
          isSearchable
          placeholder="Select Asset..."
          menuPlacement="auto"
          menuPosition="fixed"
          filterOption={filterOption}
          hideSelectedOptions={false}
          maxMenuHeight={ROW_HEIGHT * MAX_VISIBLE_ROWS}
          menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
          menuShouldBlockScroll={false}
          closeMenuOnScroll={false}
          menuShouldScrollIntoView={false}
          menuIsOpen={menuIsOpen}
          onMenuOpen={handleMenuOpen}
          onMenuClose={handleMenuClose}
          closeMenuOnSelect
          blurInputOnSelect={false}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              e.stopPropagation();
              setOpen(true);
            }
          }}
          components={{ Option, SingleValue, MenuList }}
          getOptionValue={(o) => o.value}
          getOptionLabel={(o) => (o.name ? `[${o.id}] ${o.name}` : `[${o.id}]`)}
          __accentColor={borderColor}
          styles={{
            control: (provided, state) => ({
              ...provided,
              backgroundColor: '#181818',
              borderColor: borderColor,
              color: '#ffffff',
              borderRadius: 6,
              minHeight: 36,
              height: 30,
              fontWeight: 500,
              fontSize: 12,
              width: '100%',
              minWidth: 0,
              boxShadow: state.isFocused ? `0 0 0 1px ${borderColor}` : 'none',
              ':hover': { borderColor: borderColor },
              transition: 'box-shadow .18s, border-color .18s',
            }),
            valueContainer: (p) => ({ ...p, paddingTop: 2, paddingBottom: 2 }),
            menu: (p) => ({
              ...p,
              backgroundColor: '#222',
              color: '#ffffff',
              fontSize: 12,
              zIndex: 3000,
            }),
            menuPortal: (b) => ({ ...b, zIndex: 9999 }),
            menuList: (p) => ({
              ...p,
              paddingTop: 0,
              paddingBottom: 0,
              overflowY: 'hidden',
              maxHeight: ROW_HEIGHT * MAX_VISIBLE_ROWS,
            }),
            option: (p, s) => ({
              ...p,
              backgroundColor: s.isFocused ? '#323f2f' : '#181818',
              color: '#ffffff',
              fontWeight: 500,
              fontSize: 12,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              minHeight: ROW_HEIGHT,
              lineHeight: `${ROW_HEIGHT - 6}px`,
            }),
            input: (p) => ({ ...p, color: '#ffffff', fontSize: 12 }),
            singleValue: (p) => ({
              ...p,
              color: '#ffffff',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              maxWidth: '100%',
            }),
            placeholder: (p) => ({ ...p, color: '#888', fontSize: 12 }),
            indicatorsContainer: (p) => ({ ...p, height: 30 }),
            dropdownIndicator: (p) => ({ ...p, padding: 4 }),
            clearIndicator: (p) => ({ ...p, padding: 4 }),
            indicatorSeparator: () => ({ display: 'none' }),
          }}
        />
      </div>
    </div>
  );
}

// ==============================
// MEMO
// ==============================
function areEqual(prevProps, nextProps) {
  if (prevProps.label !== nextProps.label) return false;
  if (prevProps.asset !== nextProps.asset) return false;
  if (prevProps.accentColor !== nextProps.accentColor) return false;
  if (prevProps.style !== nextProps.style) return false;
  if (!areAssetListsEqual(prevProps.assetOptions, nextProps.assetOptions)) return false;
  return true;
}

export default React.memo(AssetSelector, areEqual);
