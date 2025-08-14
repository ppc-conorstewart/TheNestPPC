// AddRequiredItemModal.jsx

import React, { useState, useRef, useEffect } from 'react';

const categories = ['Consumables', 'Equipment'];

const modalBackdropStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(12,14,11,0.87)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const modalStyle = {
  background: '#000000ff',
  color: '#E6E8DF',
  borderRadius: 17,
  minWidth: 700,
  minHeight: 290,
  maxWidth: 440,
  boxShadow: '0 5px 32px #000000b0, 0 0 0 1.5px #6a7257',
  border: '2px solid #6a7257',
  padding: '26px 30px 20px 30px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  position: 'relative'
};

const labelStyle = {
  color: '#a6ce7d',
  fontWeight: 600,
  fontSize: '1.09rem',
  marginBottom: 8,
  marginTop: 0,
  letterSpacing: '0.06em'
};

const selectStyle = {
  padding: '9px 12px',
  borderRadius: 7,
  border: '1.3px solid #949C7F',
  background: '#131610',
  color: '#E6E8DF',
  fontSize: '1.05rem',
  marginBottom: 0,
  outline: 'none'
};

const inputRowStyle = {
  display: 'flex',
  flexDirection: 'row',
  gap: 4,
  marginBottom: 4,
  marginTop: 4
};

const qtyInputStyle = {
  width: 74,
  padding: '9px 7px',
  borderRadius: 6,
  border: '1.2px solid #6a7257',
  background: '#202317',
  color: '#A1CE81',
  fontWeight: 700,
  fontSize: '1.15rem',
  textAlign: 'center'
};

const itemInputStyle = {
  flex: 1,
  padding: '2px 13px',
  borderRadius: 6,
  border: '1.2px solid #6a7257',
  background: '#202317',
  color: '#E6E8DF',
  fontWeight: 600,
  fontSize: '1.1rem'
};

const actionsRow = {
  marginTop: 10,
  display: 'flex',
  flexDirection: 'row',
  gap: 10,
  justifyContent: 'center'
};

const buttonStyle = (variant) => ({
  padding: '4px 32px',
  borderRadius: 7,
  fontSize: '1.15rem',
  fontWeight: 700,
  border: 'none',
  cursor: 'pointer',
  background: variant === 'cancel' ? '#23281c' : '#a6ce7d',
  color: variant === 'cancel' ? '#f1f3e1' : '#23281c',
  boxShadow: variant === 'add'
    ? '0 2px 24px #c4ff8b38'
    : 'none',
  outline: 'none',
  transition: 'background 0.17s'
});

const errorStyle = {
  color: '#ff3b4e',
  background: 'rgba(30,0,0,0.12)',
  borderRadius: 6,
  fontSize: '0.99rem',
  padding: '5px 5px',
  margin: '0px 0 0 0',
  minHeight: 22
};

export default function AddRequiredItemModal({ onClose, onAdd }) {
  const [category, setCategory] = useState(categories[0]);
  const [qty, setQty] = useState('');
  const [item, setItem] = useState('');
  const [error, setError] = useState('');

  const qtyInputRef = useRef(null);
  const itemInputRef = useRef(null);

  useEffect(() => {
    qtyInputRef.current && qtyInputRef.current.focus();
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleAdd = () => {
    setError('');
    const qtyVal = parseInt(qty, 10);
    if (!category) {
      setError('Please select a category.');
      return;
    }
    if (!qty || isNaN(qtyVal) || qtyVal <= 0) {
      setError('Enter a valid quantity.');
      qtyInputRef.current && qtyInputRef.current.focus();
      return;
    }
    if (!item || !item.trim()) {
      setError('Enter a required item description.');
      itemInputRef.current && itemInputRef.current.focus();
      return;
    }
    onAdd({
      category,
      qty: qtyVal,
      name: item.trim()
    });
    onClose();
  };

  const handleEnter = (e) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div style={modalBackdropStyle} onClick={onClose}>
      <div
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
        tabIndex={0}
        aria-modal="true"
      >
        <div style={{ fontSize: '1.33rem', fontWeight: 800, letterSpacing: '0.13em', color: '#b7cf94', textAlign: 'center', marginBottom: 2 }}>
          Add Required Item
        </div>
        <div style={labelStyle}>Category</div>
        <select
          style={selectStyle}
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <div style={inputRowStyle}>
          <input
            style={qtyInputStyle}
            ref={qtyInputRef}
            type="number"
            min="1"
            placeholder="QTY"
            value={qty}
            onChange={e => setQty(e.target.value.replace(/[^0-9]/g, ''))}
            onKeyDown={handleEnter}
          />
          <input
            style={itemInputStyle}
            ref={itemInputRef}
            placeholder="ITEM"
            value={item}
            onChange={e => setItem(e.target.value)}
            onKeyDown={handleEnter}
          />
        </div>
        <div style={errorStyle}>{error}</div>
        <div style={actionsRow}>
          <button style={buttonStyle('cancel')} onClick={onClose}>
            Cancel
          </button>
          <button style={buttonStyle('add')} onClick={handleAdd}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
