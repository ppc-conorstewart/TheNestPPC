// ==========================================
// FILE: client/src/components/ui/CustomerSelect.jsx
// ==========================================

// ==============================
// Imports
// ==============================
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { useCustomers } from '../../hooks/useCustomers';

// ==============================
// Component
// ==============================
const CustomerSelect = forwardRef(function CustomerSelect(
  {
    value,
    onChange,
    placeholder = 'Select Customer',
    disabled = false,
    className = '',
    customers: customersProp = null,
    showSearch = true,
    size = 'md',
  },
  forwardedRef
) {
  const { customers: fetched, loading } = useCustomers();
  const customers = customersProp || fetched;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const buttonRef = useRef(null);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (!forwardedRef) return;
    if (typeof forwardedRef === 'function') {
      forwardedRef(buttonRef.current);
    } else {
      forwardedRef.current = buttonRef.current;
    }
  }, [forwardedRef]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => (c.name || '').toLowerCase().includes(q));
  }, [customers, query]);

  const selected = useMemo(() => {
    if (!value) return null;
    return customers.find((c) => c.name === value) || null;
  }, [customers, value]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!buttonRef.current && !listRef.current) return;
      if (buttonRef.current?.contains(e.target) || listRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (open && showSearch) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open, showSearch]);

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  }[size];

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOpen(true);
        setActiveIndex(0);
      }
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      scrollActiveIntoView();
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      scrollActiveIntoView();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[activeIndex]) {
        onChange?.(filtered[activeIndex].name);
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
  };

  const scrollActiveIntoView = () => {
    const list = listRef.current;
    if (!list) return;
    const el = list.querySelector('[data-active="true"]');
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const listRect = list.getBoundingClientRect();
    if (rect.top < listRect.top) list.scrollTop -= (listRect.top - rect.top);
    else if (rect.bottom > listRect.bottom) list.scrollTop += (rect.bottom - listRect.bottom);
  };

  const renderButtonLabel = () => {
    if (selected) {
      return (
        <div className='flex items-center gap-2'>
          {selected.logo_url ? (
            <img
              src={selected.logo_url}
              alt=''
              className='w-5 h-5 rounded-sm object-contain bg-zinc-900 border border-[#6a7257]/40'
              draggable='false'
            />
          ) : (
            <div className='w-5 h-5 rounded-sm bg-zinc-800 border border-zinc-700' />
          )}
          <span className='truncate'>{selected.name}</span>
        </div>
      );
    }
    return <span className='opacity-70'>{placeholder}</span>;
  };

  return (
    <div className={`relative inline-block ${className}`} onKeyDown={handleKeyDown}>
      <button
        type='button'
        ref={buttonRef}
        disabled={disabled}
        aria-haspopup='listbox'
        aria-expanded={open}
        className={`w-full bg-black border border-[#6a7257] rounded ${sizeClasses} text-white flex items-center justify-between hover:bg-[#1b1d16] focus:outline-none focus:ring-2 focus:ring-[#6a7257]`}
        onClick={() => setOpen((o) => !o)}
      >
        {renderButtonLabel()}
        <svg width='16' height='16' viewBox='0 0 20 20' fill='currentColor' className='opacity-80'>
          <path d='M5.25 7.5l4.5 4.5 4.5-4.5' />
        </svg>
      </button>

      {open && (
        <div
          role='listbox'
          ref={listRef}
          tabIndex={-1}
          className='absolute z-50 mt-1 w-[min(32rem,92vw)] max-w-[32rem] min-w-[18rem] bg-[#0b0b0b] border border-[#6a7257] rounded shadow-xl'
        >
          {showSearch && (
            <div className='p-2 border-b border-[#6a7257]/50'>
              <input
                ref={inputRef}
                type='text'
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
                placeholder='Search customers...'
                className='w-full bg-black border border-[#6a7257] rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-[#6a7257]'
              />
            </div>
          )}

          <ul className='max-h-72 overflow-auto py-1'>
            {loading ? (
              <li className='px-3 py-2 text-sm text-zinc-400'>Loading customers…</li>
            ) : filtered.length === 0 ? (
              <li className='px-3 py-2 text-sm text-zinc-400'>No matches</li>
            ) : (
              filtered.map((c, i) => {
                const isActive = i === activeIndex;
                const isSelected = value && c.name === value;
                const key = c.id != null ? `id:${String(c.id)}` : `name:${c.name}|idx:${i}`;
                return (
                  <li
                    key={key}
                    data-active={isActive ? 'true' : 'false'}
                    role='option'
                    aria-selected={isSelected}
                    className={`px-3 py-2 cursor-pointer flex items-center gap-2 text-sm ${
                      isActive ? 'bg-[#10140f]' : ''
                    } ${isSelected ? 'text-[#b6c0a1]' : 'text-white'}`}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => { onChange?.(c.name); setOpen(false); buttonRef.current?.focus(); }}
                  >
                    {c.logo_url ? (
                      <img
                        src={c.logo_url}
                        alt=''
                        className='w-5 h-5 rounded-sm object-contain bg-zinc-900 border border-[#6a7257]/40'
                        draggable='false'
                      />
                    ) : (
                      <div className='w-5 h-5 rounded-sm bg-zinc-800 border border-zinc-700' />
                    )}
                    <span className='truncate'>{c.name}</span>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
});

export default CustomerSelect;
