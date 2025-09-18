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
  excludedIds = new Set(),
  accentColor,
  style,
}) {
  // ---------- Stable identity ----------
  const instanceIdRef = useRef(`asset-select-${Math.random().toString(36).slice(2)}`);
  const rootRef = useRef(null);

  // ---------- Outside click control for menu ----------
  const [menuOpen, setMenuOpen] = useState(false);
  const onMenuClose = useCallback(() => setMenuOpen(false), []);
  const onMenuOpen = useCallback(() => setMenuOpen(true), []);

  // ---------- Focus the input when opening ----------
  useEffect(() => {
    if (!menuOpen) return;
    const root = rootRef.current;
    const input = root && root.querySelector('input');
    if (input) {
      requestAnimationFrame(() => { try { input.focus(); } catch {} });
    }
  }, [menuOpen]);

  // ---------- Options memo with deep equality ----------
  const lastAssetOptionsRef = useRef(assetOptions);
  const stableAssetOptions = useMemo(() => {
    if (areAssetListsEqual(lastAssetOptionsRef.current, assetOptions)) {
      return lastAssetOptionsRef.current;
    }
    lastAssetOptionsRef.current = assetOptions;
    return assetOptions;
  }, [assetOptions]);

  const options = useMemo(() => {
    const all = normalizeOptions(stableAssetOptions);
    const has = excludedIds && typeof excludedIds.has === 'function';
    const sel = asset || '';
    return has ? all.filter((opt) => opt.value === sel || !excludedIds.has(opt.value)) : all;
  }, [stableAssetOptions, excludedIds, asset]);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === asset) || null,
    [options, asset]
  );

  const borderColor = accentColor || palomaGreen;

  const handleSelectChange = useCallback((opt) => {
    setMenuOpen(false);
    if (onChange) onChange((opt && opt.value) || '');
  }, [onChange]);

  const portalTarget = typeof document !== 'undefined' ? document.body : null;

  return (
    <div
      ref={rootRef}
      style={{
        marginBottom: 0,
        ...(style || {}),
      }}
    >
      <Select
        instanceId={instanceIdRef.current}
        classNamePrefix="rs"
        isClearable={false}
        isSearchable
        options={options}
        value={selectedOption}
        filterOption={filterOption}
        onChange={handleSelectChange}
        onMenuOpen={onMenuOpen}
        onMenuClose={onMenuClose}
        components={{ MenuList, Option, SingleValue }}
        menuPortalTarget={portalTarget}
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
          }),
          option: (p, state) => ({
            ...p,
            height: ROW_HEIGHT,
            lineHeight: ROW_HEIGHT + 'px',
            paddingTop: 0,
            paddingBottom: 0,
            color: '#eaeaea',
            backgroundColor: state.isFocused ? '#2a2a2a' : 'transparent',
            cursor: 'pointer',
          }),
          singleValue: (p) => ({ ...p, margin: 0 }),
          indicatorsContainer: (p) => ({ ...p, height: 30 }),
          dropdownIndicator: (p) => ({ ...p, paddingTop: 2, paddingBottom: 2 }),
          clearIndicator: (p) => ({ ...p, paddingTop: 2, paddingBottom: 2 }),
          input: (p) => ({ ...p, color: '#fff' }),
          placeholder: (p) => ({ ...p, color: '#999' }),
        }}
      />
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
  if (prevProps.excludedIds !== nextProps.excludedIds) return false;
  return true;
}

export default React.memo(AssetSelector, areEqual);
