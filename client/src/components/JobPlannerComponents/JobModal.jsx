// ===================
// FILE: src/pages/JobPlannerComponents/JobModal.jsx
// ===================

// =================== Imports and Dependencies ===================
import { useEffect, useRef, useState } from 'react';
import CustomerSelect from '../../components/ui/CustomerSelect';

// =================== Constants: Mask & Helpers ===================
// ---- AB (Alberta) ----
const AB_TEMPLATE = ['#','#','-','#','#','-','#','#','#','-','#','#','W','#','M'];
const AB_TOTAL_DIGITS = 10;
const AB_REGEX = /^\d{2}-\d{2}-\d{3}-\d{2}W\dM$/;

// ---- BC (British Columbia) ----
const BC_TEMPLATE = ['L','-','#','#','-','L'];
const BC_TOTAL_CHARS = 4;
const BC_REGEX = /^[A-Z]-\d{2}-[A-Z]$/;

// ---- Shared helpers ----
function onlyDigits(s) { return (s || '').replace(/\D+/g, ''); }
function onlyLetters(s) { return (s || '').replace(/[^A-Z]/gi, '').toUpperCase(); }
function buildFromTemplate(template, source) {
  const out = []; let si = 0;
  for (let i = 0; i < template.length; i++) {
    const t = template[i];
    if (t === '#') out.push(si < source.length ? source[si++] : '_');
    else if (t === 'L') out.push(si < source.length ? source[si++] : '_');
    else out.push(t);
  }
  return out.join('');
}
function caretToFirstUnderscore(masked) {
  const pos = masked.indexOf('_');
  return pos === -1 ? masked.length : pos;
}

// =================== JobModal Component ===================
export default function JobModal({
  isOpen,
  onClose,
  onSave,
  existingJob = null,
}) {
  // --------- Local State for Form Values ---------
  const [formValues, setFormValues] = useState({
    customer: '',
    surface_lsd: '',
    products: '',
    rig_in_date: '',
    start_date: '',
    end_date: '',
    num_wells: '',
    valve_7_1_16: '',
    valve_5_1_8: '',
    valve_hyd: '',
    valve_man: '',
    gateway_pods: '',
    awc_pods: '',
    grease_unit: '',
    coil_trees: '',
    accumulator: '',
    techs: '',
  });

  // --------- LSD Region & Masked Display ---------
  const [lsdRegion, setLsdRegion] = useState('AB');
  const [lsdMasked, setLsdMasked] = useState('');
  const [lsdError, setLsdError] = useState('');
  const firstInputRef = useRef(null);
  const lsdInputRef = useRef(null);

  // --------- Effect: Populate Form on Edit ---------
  useEffect(() => {
    if (existingJob) {
      const mapped = {
        ...existingJob,
        surface_lsd: existingJob.surface_lsd != null ? existingJob.surface_lsd : existingJob.lsd || '',
      };
      const raw = String(mapped.surface_lsd || '').toUpperCase().trim();

      let detectedRegion = 'AB';
      if (BC_REGEX.test(raw)) detectedRegion = 'BC';
      else if (AB_REGEX.test(raw)) detectedRegion = 'AB';
      setLsdRegion(detectedRegion);

      let initialMasked = '';
      if (detectedRegion === 'AB') {
        if (AB_REGEX.test(raw)) {
          initialMasked = raw;
        } else {
          const digs = onlyDigits(raw).slice(0, AB_TOTAL_DIGITS);
          initialMasked = buildFromTemplate(AB_TEMPLATE, digs).replaceAll('_', '');
        }
      } else {
        if (BC_REGEX.test(raw)) {
          initialMasked = raw;
        } else {
          const letters = onlyLetters(raw).slice(0, 2);
          const digits = onlyDigits(raw).slice(0, 2);
          const seq = (letters[0] || '') + (digits[0] || '') + (digits[1] || '') + (letters[1] || '');
          initialMasked = buildFromTemplate(BC_TEMPLATE, seq).replaceAll('_', '');
        }
      }

      setFormValues({
        customer: mapped.customer || '',
        surface_lsd: initialMasked || '',
        products: mapped.products || '',
        rig_in_date: mapped.rig_in_date || '',
        start_date: mapped.start_date || '',
        end_date: mapped.end_date || '',
        num_wells: mapped.num_wells ?? '',
        valve_7_1_16: mapped.valve_7_1_16 ?? '',
        valve_5_1_8: mapped.valve_5_1_8 ?? '',
        valve_hyd: mapped.valve_hyd ?? '',
        valve_man: mapped.valve_man ?? '',
        gateway_pods: mapped.gateway_pods ?? '',
        awc_pods: mapped.awc_pods ?? '',
        grease_unit: mapped.grease_unit ?? '',
        coil_trees: mapped.coil_trees ?? '',
        accumulator: mapped.accumulator ?? '',
        techs: mapped.techs ?? '',
      });

      setLsdMasked(initialMasked || '');
      const valid = detectedRegion === 'AB' ? AB_REGEX.test(initialMasked) : BC_REGEX.test(initialMasked);
      setLsdError(initialMasked && !valid ? 'Incomplete LSD format' : '');

      setTimeout(() => { firstInputRef.current?.focus?.(); }, 0);
    } else {
      setFormValues({
        customer: '',
        surface_lsd: '',
        products: '',
        rig_in_date: '',
        start_date: '',
        end_date: '',
        num_wells: '',
        valve_7_1_16: '',
        valve_5_1_8: '',
        valve_hyd: '',
        valve_man: '',
        gateway_pods: '',
        awc_pods: '',
        grease_unit: '',
        coil_trees: '',
        accumulator: '',
        techs: '',
      });
      setLsdMasked('');
      setLsdError('');
      setLsdRegion('AB');
    }
  }, [existingJob, isOpen]);

  // =================== LSD Masked Input (AB) ===================
  const setABFromDigits = (digits) => {
    const capped = digits.slice(0, AB_TOTAL_DIGITS);
    const masked = buildFromTemplate(AB_TEMPLATE, capped);
    const compact = masked.replaceAll('_', '');
    setLsdMasked(masked);
    setFormValues((vals) => ({ ...vals, surface_lsd: compact }));
    setLsdError(compact && !AB_REGEX.test(compact) ? 'Incomplete LSD format' : '');
  };
  const handleABChange = (e) => { setABFromDigits(onlyDigits(String(e.target.value || '').toUpperCase())); };
  const handleABKeyDown = (e) => {
    const navKeys = ['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Tab'];
    if (navKeys.includes(e.key)) return;
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      const currentDigits = onlyDigits(formValues.surface_lsd);
      if (currentDigits.length === 0) return;
      setABFromDigits(currentDigits.slice(0, -1));
      return;
    }
    if (!/^\d$/.test(e.key)) { e.preventDefault(); return; }
    const currentDigits = onlyDigits(formValues.surface_lsd);
    if (currentDigits.length >= AB_TOTAL_DIGITS) { e.preventDefault(); return; }
    e.preventDefault();
    setABFromDigits(currentDigits + e.key);
  };
  const handleABPaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData.getData('text') || '').toUpperCase();
    const digs = onlyDigits(text).slice(0, AB_TOTAL_DIGITS);
    setABFromDigits(digs);
    setTimeout(() => {
      const el = lsdInputRef.current;
      if (el) {
        const caret = caretToFirstUnderscore(buildFromTemplate(AB_TEMPLATE, digs));
        el.setSelectionRange(caret, caret);
      }
    }, 0);
  };

  // =================== LSD Masked Input (BC) ===================
  const setBCFromSequence = (seq) => {
    const Ls = onlyLetters(seq).slice(0, 2);
    const Ds = onlyDigits(seq).slice(0, 2);
    const ordered = (Ls[0] || '') + (Ds[0] || '') + (Ds[1] || '') + (Ls[1] || '');
    const masked = buildFromTemplate(BC_TEMPLATE, ordered);
    const compact = masked.replaceAll('_', '');
    setLsdMasked(masked);
    setFormValues((vals) => ({ ...vals, surface_lsd: compact }));
    setLsdError(compact && !BC_REGEX.test(compact) ? 'Incomplete LSD format' : '');
  };
  const handleBCKeyDown = (e) => {
    const navKeys = ['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Tab'];
    if (navKeys.includes(e.key)) return;
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      const compact = formValues.surface_lsd.replaceAll('-', '');
      if (compact.length === 0) return;
      setBCFromSequence(compact.slice(0, -1));
      return;
    }
    const isLetter = /^[A-Za-z]$/.test(e.key);
    const isDigit = /^\d$/.test(e.key);
    const compact = formValues.surface_lsd.replaceAll('-', '');
    const pos = compact.length;
    if (pos === 0 || pos === 3) {
      if (!isLetter) { e.preventDefault(); return; }
      e.preventDefault();
      setBCFromSequence(compact + e.key.toUpperCase());
      return;
    }
    if (pos === 1 || pos === 2) {
      if (!isDigit) { e.preventDefault(); return; }
      e.preventDefault();
      setBCFromSequence(compact + e.key);
      return;
    }
    e.preventDefault();
  };
  const handleBCPaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData.getData('text') || '').toUpperCase().trim();
    if (BC_REGEX.test(text)) {
      setLsdMasked(text);
      setFormValues((vals) => ({ ...vals, surface_lsd: text }));
      setLsdError('');
      return;
    }
    const Ls = onlyLetters(text).slice(0, 2);
    const Ds = onlyDigits(text).slice(0, 2);
    const ordered = (Ls[0] || '') + (Ds[0] || '') + (Ds[1] || '') + (Ls[1] || '');
    setBCFromSequence(ordered);
    setTimeout(() => {
      const el = lsdInputRef.current;
      if (el) {
        const caret = caretToFirstUnderscore(buildFromTemplate(BC_TEMPLATE, ordered));
        el.setSelectionRange(caret, caret);
      }
    }, 0);
  };
  const handleBCChange = (e) => {
    const raw = String(e.target.value || '').toUpperCase();
    const Ls = onlyLetters(raw).slice(0, 2);
    const Ds = onlyDigits(raw).slice(0, 2);
    const seq = (Ls[0] || '') + (Ds[0] || '') + (Ds[1] || '') + (Ls[1] || '');
    setBCFromSequence(seq);
  };

  // --------- Handle Generic Form Change ---------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((vals) => ({ ...vals, [name]: value }));
  };

  // --------- Handle Form Submit ---------
  const handleSubmit = (e) => {
    e.preventDefault();
    const valid = lsdRegion === 'AB' ? AB_REGEX.test(formValues.surface_lsd) : BC_REGEX.test(formValues.surface_lsd);
    if (!valid) {
      setLsdError(
        lsdRegion === 'AB'
          ? 'LSD must match NN-NN-NNN-NN W N M (e.g., 12-34-056-07W4M)'
          : 'LSD must match L-##-L (e.g., A-12-B)'
      );
      lsdInputRef.current?.focus();
      return;
    }
    const payload = { ...formValues };
    onSave(payload);
  };

  // --------- Modal Render ---------
  if (!isOpen) return null;
  const isLsdComplete = lsdRegion === 'AB' ? AB_REGEX.test(formValues.surface_lsd) : BC_REGEX.test(formValues.surface_lsd);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div
        className="
          bg-[#111] border border-[#6a7257] rounded-lg shadow-xl 
          w-1/2 max-w-8xl               
          max-h-[75vh]                  
          flex flex-col
          overflow-hidden
        "
      >
        <h2 className="text-xl font-bold mb-1 p-2 text-center uppercase text-white">
          {existingJob ? 'Edit Job' : 'Add New Job'}
        </h2>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 space-y-2 pb-4">
          <div>
            <label className="block mb-1 font-semibold text-gray-200">Customer</label>
            <CustomerSelect
              ref={firstInputRef}
              value={formValues.customer}
              onChange={(name) => setFormValues((v) => ({ ...v, customer: name }))}
              showSearch
              size="md"
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 items-end">
            <div>
              <label className="block mb-1 font-semibold text-gray-200">LSD Region</label>
              <select
                value={lsdRegion}
                onChange={(e) => {
                  const region = e.target.value;
                  setLsdRegion(region);
                  setLsdMasked('');
                  setFormValues((vals) => ({ ...vals, surface_lsd: '' }));
                  setTimeout(() => lsdInputRef.current?.focus(), 0);
                }}
                className="w-full bg-black border border-[#6a7257] px-2 py-1 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#6a7257]"
              >
                <option value="AB">Alberta (AB)</option>
                <option value="BC">British Columbia (BC)</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block mb-1 font-semibold text-gray-200">
                Surface LSD {lsdRegion === 'AB' ? '(NN-NN-NNN-NN W N M)' : '(L-##-L)'}
              </label>
              <input
                ref={lsdInputRef}
                type="text"
                value={lsdRegion === 'AB' ? lsdMasked || formValues.surface_lsd : lsdMasked || formValues.surface_lsd}
                onChange={lsdRegion === 'AB' ? handleABChange : handleBCChange}
                onKeyDown={lsdRegion === 'AB' ? handleABKeyDown : handleBCKeyDown}
                onPaste={lsdRegion === 'AB' ? handleABPaste : handleBCPaste}
                className={`w-full ${lsdRegion === 'AB' ? 'bg-white text-black' : 'bg-white text-black'} border border-[#6a7257] px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-[#6a7257]`}
                placeholder={lsdRegion === 'AB' ? '##-##-###-##W#M' : 'L-##-L'}
                inputMode={lsdRegion === 'AB' ? 'numeric' : 'text'}
                autoComplete="off"
                spellCheck="false"
              />
              {lsdError && <p className="text-red-500 text-sm mt-1">{lsdError}</p>}
            </div>
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-200">Product(s)</label>
            <select
              name="products"
              value={formValues.products}
              onChange={handleChange}
              className="w-full bg-black border border-[#6a7257] px-2 py-1 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#6a7257]"
              required
            >
              <option value="">Select Product</option>
              <option value="Frac Stacks">Frac Stacks</option>
              <option value="Frac Stacks + PPL">Frac Stacks + PPL</option>
              <option value="MISL">MISL</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-200">Rig-In Date</label>
            <input
              type="date"
              name="rig_in_date"
              value={formValues.rig_in_date}
              onChange={handleChange}
              className="w-full bg-black border border-[#6a7257] px-2 py-1 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#6a7257]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold text-gray-200">Start Date</label>
              <input
                type="date"
                name="start_date"
                value={formValues.start_date}
                onChange={handleChange}
                className="w-full bg-white border border-[#6a7257] px-2 py-1 text-black rounded focus:outline-none focus:ring-2 focus:ring-[#6a7257]"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-200">End Date</label>
              <input
                type="date"
                name="end_date"
                value={formValues.end_date}
                onChange={handleChange}
                className="w-full bg-white border border-[#6a7257] px-2 py-1 text-black rounded focus:outline-none focus:ring-2 focus:ring-[#6a7257]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 font-semibold text-gray-200">Number of Wells</label>
              <input
                type="number"
                name="num_wells"
                value={formValues.num_wells}
                onChange={handleChange}
                className="w-full bg-black border border-[#6a7257] px-2 py-1 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#6a7257]"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-200">7-1/16&quot; Valves</label>
              <input
                type="number"
                name="valve_7_1_16"
                value={formValues.valve_7_1_16}
                onChange={handleChange}
                className="w-full bg-black border border-[#6a7257] px-2 py-1 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#6a7257]"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-200">5-1/8&quot; Valves</label>
              <input
                type="number"
                name="valve_5_1_8"
                value={formValues.valve_5_1_8}
                onChange={handleChange}
                className="w-full bg-black border border-[#6a7257] px-2 py-1 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#6a7257]"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block mb-1 font-semibold text-gray-200">Hydraulic Valves</label>
              <input
                type="number"
                name="valve_hyd"
                value={formValues.valve_hyd}
                onChange={handleChange}
                className="w-full bg-black border border-[#6a7257] px-2 py-1 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#6a7257]"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-200">Manual Valves</label>
              <input
                type="number"
                name="valve_man"
                value={formValues.valve_man}
                onChange={handleChange}
                className="w-full bg-black border border-[#6a7257] px-2 py-1 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#6a7257]"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-200">Gateway Pods</label>
              <input
                type="number"
                name="gateway_pods"
                value={formValues.gateway_pods}
                onChange={handleChange}
                className="w-full bg-black border border-[#6a7257] px-2 py-1 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#6a7257]"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-200">AWC Pods</label>
              <input
                type="number"
                name="awc_pods"
                value={formValues.awc_pods}
                onChange={handleChange}
                className="w-full bg-black border border-[#6a7257] px-2 py-1 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#6a7257]"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block mb-1 font-semibold text-gray-200">Grease Unit</label>
              <input
                type="number"
                name="grease_unit"
                value={formValues.grease_unit}
                onChange={handleChange}
                className="w-full bg-black border border-[#6a7257] px-2 py-1 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#6a7257]"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-200">Coil Trees</label>
              <input
                type="number"
                name="coil_trees"
                value={formValues.coil_trees}
                onChange={handleChange}
                className="w-full bg-black border border-[#6a7257] px-2 py-1 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#6a7257]"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-200">Accumulator</label>
              <input
                type="number"
                name="accumulator"
                value={formValues.accumulator}
                onChange={handleChange}
                className="w-full bg-black border border-[#6a7257] px-2 py-1 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#6a7257]"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-200">Techs</label>
              <input
                type="text"
                name="techs"
                value={formValues.techs}
                onChange={handleChange}
                className="w-full bg-black border border-[#6a7257] px-2 py-1 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#6a7257]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              className="px-3 py-1 rounded border border-[#6a7257] text-white hover:bg-[#1b1d16] focus:outline-none focus:ring-2 focus:ring-[#6a7257]"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 rounded bg-[#6a7257] text-black font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#6a7257]"
              disabled={!formValues.customer || !isLsdComplete}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
