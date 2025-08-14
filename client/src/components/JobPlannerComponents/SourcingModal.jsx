// =================== Imports and Dependencies ===================
// src/pages/JobPlannerComponents/SourcingModal.jsx

import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { API } from '../../api'; // Adjust path as needed

// =================== SourcingModal Component ===================
export default function SourcingModal({ isOpen, onClose, job, onSubmit }) {
  // --------- Field and State Setup ---------
  const firstField = useRef(null);
  const [form, setForm] = useState({
    base: '',
    neededBy: '',
    project: '',
    vendor: '',
    category: 'Other',
    priority: 'Medium',
    status: 'Requested',
    items: [{ description: '', quantity: '' }],
  });
  const [error, setError] = useState('');

  // --------- Effect: Prefill on Modal Open ---------
  useEffect(() => {
    if (!isOpen) return;

    setTimeout(() => firstField.current?.focus(), 0);

    const prefilledProject = job
      ? `${(job.customer || '').toUpperCase()} – ${(job.surface_lsd || '').toUpperCase()}`
      : '';

    setForm({
      base: '',
      neededBy: '',
      project: prefilledProject,
      vendor: '',
      category: 'Other',
      priority: 'Medium',
      status: 'Requested',
      items: [{ description: '', quantity: '' }],
    });
    setError('');
  }, [isOpen, job]);

  // --------- Handlers for Form Fields and Item Rows ---------
  const handleField = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleItemChange = (idx, field, value) => {
    setForm((f) => {
      const items = [...f.items];
      items[idx][field] = value;
      return { ...f, items };
    });
  };

  const addItemRow = () =>
    setForm((f) => ({
      ...f,
      items: [...f.items, { description: '', quantity: '' }],
    }));

  const removeItemRow = (i) =>
    setForm((f) => {
      const items = f.items.filter((_, idx) => idx !== i);
      return {
        ...f,
        items: items.length ? items : [{ description: '', quantity: '' }],
      };
    });

  // --------- Handle Submit (Validation + Backend Call) ---------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.base || !form.neededBy) {
      setError('BASE AND NEEDED BY ARE REQUIRED.');
      return;
    }
    for (let it of form.items) {
      if (!it.description.trim() || !it.quantity || isNaN(Number(it.quantity)) || Number(it.quantity) <= 0) {
        setError('EACH ITEM NEEDS A DESCRIPTION AND VALID QUANTITY.');
        return;
      }
    }

    try {
      await Promise.all(
        form.items.map((item) =>
          axios.post(`${API}/api/sourcing`, {
            base: form.base,
            neededBy: form.neededBy,
            project: form.project,
            vendor: form.vendor,
            category: form.category,
            priority: form.priority,
            status: form.status,
            itemDescription: item.description,
            quantity: item.quantity,
          })
        )
      );
      if (typeof onSubmit === 'function') {
        await onSubmit();
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
        'FAILED TO SUBMIT TICKET. PLEASE TRY AGAIN.'
      );
    }
  };

  // --------- Modal Render ---------
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
      <div
        className="bg-black border-2 border-[#6a7257] rounded-2xl px-9 py-7 text-[#e6e8df] shadow-2xl w-full"
        style={{
          maxWidth: 900,
          minWidth: 500,
          boxShadow: '0 0 36px 4px #1a1d17',
          fontFamily: 'Erbaum, Arial, sans-serif',
        }}
      >
        {/* --------- Modal Title --------- */}
        <h2
          className="text-lg text-center font-erbaum font-bold mb-4 tracking-wider"
          style={{ letterSpacing: 2, color: '#e6e8df', textShadow: '0 0 6px #6a7257', fontSize: 22 }}
        >
          SUBMIT SOURCING TICKET
        </h2>
        {/* --------- Error Display --------- */}
        {error && (
          <div className="text-red-500 mb-3 text-center uppercase tracking-wide font-semibold" style={{ fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* --------- Sourcing Form --------- */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* BASE */}
          <div>
            <label className="block text-[#e6e8df] text-xs font-bold uppercase mb-1 text-left" style={{ fontSize: 13 }}>
              BASE:
            </label>
            <select
              name="base"
              ref={firstField}
              value={form.base}
              onChange={handleField}
              className="w-full bg-[#1B1D16] text-center text-[#e6e8df] border border-[#949c7f] px-3 py-2 rounded-lg text-sm uppercase tracking-wide"
              required
              style={{ fontWeight: 600, letterSpacing: 2, fontSize: 15 }}
            >
              <option value="" disabled>
                SELECT A BASE
              </option>
              <option>RED DEER</option>
              <option>NISKU</option>
              <option>GRANDE PRAIRIE</option>
            </select>
          </div>

          {/* NEEDED BY */}
          <div>
            <label className="block text-[#e6e8df] text-xs font-bold uppercase mb-1 text-left" style={{ fontSize: 13 }}>
              NEEDED BY:
            </label>
            <input
              type="date"
              name="neededBy"
              value={form.neededBy}
              onChange={handleField}
              className="w-full bg-[#1B1D16] text-center text-[#e6e8df] border border-[#949c7f] px-3 py-2 rounded-lg text-sm uppercase tracking-wide"
              required
              style={{ fontWeight: 600, letterSpacing: 2, fontSize: 15 }}
            />
          </div>

          {/* PROJECT */}
          <div>
            <label className="block text-[#e6e8df] text-xs font-bold uppercase mb-1 text-left" style={{ fontSize: 13 }}>
              PROJECT:
            </label>
            <input
              name="project"
              value={form.project}
              readOnly
              className="w-full bg-[#949c7f] text-black text-center font-erbaum border border-[#949c7f] px-3 py-2 rounded-lg text-sm font-bold uppercase tracking-wider cursor-not-allowed"
              style={{ fontWeight: 700, letterSpacing: 2, fontSize: 15 }}
            />
          </div>

          {/* VENDOR */}
          <div>
            <label className="block text-[#e6e8df] text-xs font-bold uppercase mb-1 text-left" style={{ fontSize: 13 }}>
              VENDOR (OPTIONAL):
            </label>
            <input
              name="vendor"
              value={form.vendor}
              onChange={handleField}
              placeholder="E.G. ACME SUPPLIES"
              className="w-full text-center bg-[#1B1D16] text-[#e6e8df] border border-[#949c7f] px-3 py-2 rounded-lg text-sm uppercase tracking-wider"
              style={{ fontWeight: 600, letterSpacing: 2, fontSize: 15 }}
            />
          </div>

          {/* CATEGORY / PRIORITY / STATUS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[#e6e8df] text-xs font-bold uppercase mb-1 text-center" style={{ fontSize: 12 }}>
                CATEGORY:
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleField}
                className="w-full bg-[#1B1D16] text-[#e6e8df] border border-[#949c7f] px-2 py-1.5 rounded-lg text-sm uppercase tracking-wide"
                style={{ fontWeight: 600, fontSize: 14 }}
              >
                <option>CONSUMABLES</option>
                <option>EQUIPMENT</option>
                <option>SPARE PARTS</option>
                <option>OTHER</option>
              </select>
            </div>
            <div>
              <label className="block text-[#e6e8df] text-xs font-bold uppercase mb-1 text-center" style={{ fontSize: 12 }}>
                PRIORITY:
              </label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleField}
                className="w-full bg-[#1B1D16] text-[#e6e8df] border border-[#949c7f] px-2 py-1.5 rounded-lg text-sm uppercase tracking-wide"
                style={{ fontWeight: 600, fontSize: 14 }}
              >
                <option>HIGH</option>
                <option>MEDIUM</option>
                <option>LOW</option>
              </select>
            </div>
            <div>
              <label className="block text-[#e6e8df] text-xs font-bold uppercase mb-1 text-center" style={{ fontSize: 12 }}>
                STATUS:
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleField}
                className="w-full bg-[#1B1D16] text-[#e6e8df] border border-[#949c7f] px-2 py-1.5 rounded-lg text-sm uppercase tracking-wide"
                style={{ fontWeight: 600, fontSize: 14 }}
              >
                <option>REQUESTED</option>
                <option>ORDERED</option>
                <option>RECEIVED</option>
                <option>CANCELLED</option>
              </select>
            </div>
          </div>

          {/* ITEMS */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-xs text-white font-semibold uppercase tracking-wide" style={{ fontSize: 14 }}>
                ITEMS
              </h3>
              <button
                type="button"
                onClick={addItemRow}
                className="text-fly-green hover:underline text-xs font-bold uppercase"
                style={{ fontSize: 13 }}
              >
                + ADD ITEM
              </button>
            </div>
            {form.items.map((it, idx) => (
              <div key={idx} className="relative grid grid-cols-3 gap-2 mb-2">
                {form.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItemRow(idx)}
                    className="absolute top-0 right-0 text-red-500 text-lg"
                    title="Remove"
                    style={{ fontSize: 16 }}
                  >
                    &times;
                  </button>
                )}
                <input
                  type="text"
                  value={it.description}
                  onChange={(e) => handleItemChange(idx, 'description', e.target.value.toUpperCase())}
                  placeholder="ITEM DESCRIPTION"
                  className="col-span-2 bg-[#1B1D16] text-[#e6e8df] border border-[#949c7f] px-2 py-1.5 rounded-lg text-xs uppercase tracking-wide"
                  required
                  style={{ fontWeight: 600, fontSize: 13 }}
                />
                <input
                  type="number"
                  value={it.quantity}
                  onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                  placeholder="QTY"
                  className="bg-[#1B1D16] text-[#e6e8df] border border-[#949c7f] px-2 py-1.5 rounded-lg text-xs uppercase tracking-wide"
                  required
                  style={{ fontWeight: 600, fontSize: 13 }}
                />
              </div>
            ))}
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-1.5 border border-red-500 text-red-500 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-red-600 hover:text-white transition"
              style={{ fontSize: 14 }}
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-blue-700 transition"
              style={{ fontSize: 14 }}
            >
              SUBMIT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
