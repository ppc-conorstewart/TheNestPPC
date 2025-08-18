// =================== Imports and Dependencies ===================
import { useEffect, useState } from 'react';
import logo from '../../assets/whitelogo.png'; // company branding
import FormField from './FormField';

// =================== Edit Asset Modal Component ===================
export default function EditAssetModal({
  isOpen,
  initialData,
  onClose,
  onSave,
  nameOptions,
  categoryOptions,
  locationOptions,
  statusOptions,
}) {
  // --------- Local State Management ---------
  const [form, setForm] = useState({
    id: '',
    sn: '',
    name: '',
    category: '',
    location: '',
    status: '',
  });

  // --------- Populate State from Initial Data ---------
  useEffect(() => {
    if (initialData) {
      setForm({
        id: initialData.id || '',
        sn: initialData.sn || '',
        name: initialData.name || '',
        category: initialData.category || '',
        location: initialData.location || '',
        status: initialData.status || '',
      });
    }
  }, [initialData]);

  // --------- Keyboard shortcuts (Esc to close, Enter to save) ---------
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'Enter') {
        if (document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          handleSubmit();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, form, initialData]);

  if (!isOpen || !initialData) return null;

  // --------- Submit Handler ---------
  const handleSubmit = () => {
    const hasChanges =
      form.sn !== initialData.sn ||
      form.name !== initialData.name ||
      form.category !== initialData.category ||
      form.location !== initialData.location ||
      form.status !== initialData.status;

    if (!hasChanges) {
      alert('No changes made to asset.');
      return;
    }
    onSave(form);
  };

  // ---- Theme tokens ----
  const palomaGreen = '#6a7257';
  const goldAccent = '#b0b79f';

  // Tight, professional header: no dead space, centered title
  const LOGO_SIZE = 152; // keeps the 4× boost you requested earlier

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-[2px]">
      {/* Shell */}
      <div
        className="relative w-[760px] max-w-[92vw] rounded-lg shadow-2xl"
        style={{
          background: '#0e0f0e',
          border: `1.5px solid ${palomaGreen}`,
        }}
      >
        {/* Header (compact, no extra vertical padding) */}
        <div
          className="relative border-b"
          style={{
            borderColor: '#23261F',
            paddingTop: 8,
            paddingBottom: 8,
            minHeight: 56, // enough to comfortably fit the logo/title without extra space
          }}
        >
          {/* Left logo (anchored; no surrounding dead space from padding) */}
          <img
            src={logo}
            alt="Company"
            className="select-none"
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              width: LOGO_SIZE,
              height: LOGO_SIZE,
              objectFit: 'contain',
              pointerEvents: 'none',
            }}
            draggable={false}
          />

          {/* Centered title (absolute center horizontally) */}
          <h2
            className="font-black uppercase"
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)', // absolute horizontal center, vertically aligned to header
              color: 'white',
              fontSize: 26,
              letterSpacing: '0.12em',
              lineHeight: 1, // remove extra vertical whitespace
              whiteSpace: 'nowrap',
            }}
          >
            Edit Asset
          </h2>

          {/* Close button (top-right; tight spacing) */}
          <button
            onClick={onClose}
            title="Close"
            className="inline-flex items-center justify-center rounded-md px-2 py-1 text-sm font-bold transition"
            style={{
              position: 'absolute',
              right: 10,
              top: 10,
              color: palomaGreen,
              border: `1px solid ${palomaGreen}`,
              background: '#0f120e',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pb-5 pt-4">
          {/* Field groups */}
          <div className="grid grid-cols-1 gap-3">
            {/* --------- PPC# Field --------- */}
            <FormField
              label="PPC#"
              type="text"
              value={form.id}
              onChange={(val) => setForm((prev) => ({ ...prev, id: val }))}
              placeholder="PPC number"
            />

            {/* --------- Serial Number Field --------- */}
            <FormField
              label="Serial #"
              type="text"
              value={form.sn}
              onChange={(val) => setForm((prev) => ({ ...prev, sn: val }))}
              placeholder="Serial Number"
            />

            {/* --------- Name Selector --------- */}
            <FormField
              label="Name"
              type="select"
              value={form.name}
              onChange={(val) => setForm((prev) => ({ ...prev, name: val }))}
              placeholder="-- Select Name --"
              options={nameOptions}
            />

            {/* --------- Category Selector --------- */}
            <FormField
              label="Category"
              type="select"
              value={form.category}
              onChange={(val) => setForm((prev) => ({ ...prev, category: val }))}
              placeholder="-- Select Category --"
              options={categoryOptions}
            />

            {/* --------- Location Selector --------- */}
            <FormField
              label="Location"
              type="select"
              value={form.location}
              onChange={(val) => setForm((prev) => ({ ...prev, location: val }))}
              placeholder="-- Select Location --"
              options={locationOptions}
            />

            {/* --------- Status Selector --------- */}
            <FormField
              label="Status"
              type="select"
              value={form.status}
              onChange={(val) => setForm((prev) => ({ ...prev, status: val }))}
              placeholder="-- Select Status --"
              options={statusOptions}
            />
          </div>

          {/* Footer actions */}
          <div className="mt-5 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-extrabold uppercase tracking-wide transition-colors"
              style={{
                color: '#e6e8df',
                background: '#23261F',
                border: '1px solid #2f3329',
                borderRadius: 6,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-extrabold uppercase tracking-wide transition-colors"
              style={{
                color: '#0f120e',
                background: palomaGreen,
                border: `1px solid ${palomaGreen}`,
                borderRadius: 6,
                boxShadow: '0 2px 14px rgba(106,114,87,0.25)',
              }}
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Subtle bottom edge accent */}
        <div
          className="h-[3px] w-full"
          style={{
            background:
              'linear-gradient(90deg, rgba(106,114,87,0) 0%, rgba(106,114,87,0.9) 35%, rgba(176,183,159,0.9) 50%, rgba(106,114,87,0.9) 65%, rgba(106,114,87,0) 100%)',
          }}
        />
      </div>
    </div>
  );
}
