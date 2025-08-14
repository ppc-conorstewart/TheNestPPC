// =================== Imports and Dependencies ===================
// src/pages/JobPlannerComponents/JobModal.jsx

import { useEffect, useRef, useState } from 'react';

// =================== JobModal Component ===================
export default function JobModal({
  isOpen,
  onClose,
  onSave,
  existingJob = null,
  customers,
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
    work_orders: '',
  });
  const firstInputRef = useRef(null);

  // --------- Effect: Populate Form on Edit ---------
  useEffect(() => {
    if (existingJob) {
      // Map possible legacy "lsd" -> "surface_lsd" just in case
      const mapped = {
        ...existingJob,
        surface_lsd:
          existingJob.surface_lsd != null
            ? existingJob.surface_lsd
            : existingJob.lsd || '',
      };
      setFormValues({
        customer: mapped.customer || '',
        surface_lsd: mapped.surface_lsd || '',
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
        work_orders: mapped.work_orders ?? '',
      });
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 0);
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
        work_orders: '',
      });
    }
  }, [existingJob, isOpen]);

  // --------- Handle Form Change ---------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((vals) => ({ ...vals, [name]: value }));
  };

  // --------- Handle Form Submit ---------
  const handleSubmit = (e) => {
    e.preventDefault();
    // Make sure we only send surface_lsd (no stray lsd)
    const payload = { ...formValues };
    if ('lsd' in payload && !payload.surface_lsd) {
      payload.surface_lsd = payload.lsd;
    }
    delete payload.lsd;
    onSave(payload);
  };

  // --------- Modal Render ---------
  if (!isOpen) return null;
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
        {/* --------- Modal Title --------- */}
        <h2 className="text-xl font-bold mb-1 p-2 text-center uppercase text-white">
          {existingJob ? 'Edit Job' : 'Add New Job'}
        </h2>
        {/* --------- Job Form --------- */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 space-y-2 pb-4">
          {/* Customer Dropdown */}
          <div>
            <label className="block mb-1 font-semibold text-gray-200">Customer</label>
            <select
              name="customer"
              value={formValues.customer}
              onChange={handleChange}
              ref={firstInputRef}
              className="w-full bg-black border border-[#6a7257] px-2 py-1 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#6a7257]"
              required
            >
              <option value="">Select Customer</option>
              {customers.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* LSD Field */}
          <div>
            <label className="block mb-1 font-semibold text-gray-200">LSD</label>
            <input
              name="surface_lsd"
              value={formValues.surface_lsd}
              onChange={handleChange}
              className="w-full bg-black border border-[#6a7257] px-2 py-1 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#6a7257]"
              placeholder="e.g., 12-34-56-7"
              required
            />
          </div>

          {/* Products Field */}
          <div>
            <label className="block mb-1 font-semibold text-gray-200">Product(s)</label>
            <input
              name="products"
              value={formValues.products}
              onChange={handleChange}
              className="w-full bg-black border border-[#6a7257] px-2 py-1 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#6a7257]"
              placeholder="List products"
              required
            />
          </div>

          {/* Rig-In Date Field */}
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

          {/* Start & End Dates */}
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
                className="w-full bg-black border border-[#6a7257] px-2 py-1 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#6a7257]"
                required
              />
            </div>
          </div>

          {/* Numeric Fields Grid */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: '# Wells', name: 'num_wells' },
              { label: '7-1/16" Valves', name: 'valve_7_1_16' },
              { label: '5-1/8" Valves', name: 'valve_5_1_8' },
              { label: '3-1/16" HYD', name: 'valve_hyd' },
              { label: '3-1/16" MAN', name: 'valve_man' },
              { label: 'Gateway Pods', name: 'gateway_pods' },
              { label: 'AWC Pods', name: 'awc_pods' },
              { label: 'Grease Unit', name: 'grease_unit' },
              { label: 'Coil Trees', name: 'coil_trees' },
              { label: 'Accumulator', name: 'accumulator' },
              { label: 'Techs', name: 'techs' },
              { label: 'Work Orders', name: 'work_orders' },
            ].map((field) => (
              <div key={field.name}>
                <label className="block mb-1 font-semibold text-gray-200">{field.label}</label>
                <input
                  type="number"
                  name={field.name}
                  value={formValues[field.name]}
                  onChange={handleChange}
                  className="w-full bg-black border border-[#6a7257] px-2 py-1 text-white rounded focus:outline-none focus:ring-2 focus:ring-[#6a7257]"
                  min="0"
                  required
                />
              </div>
            ))}
          </div>

          {/* Modal Action Buttons */}
          <div className="flex justify-end gap-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#6a7257] text-[#6a7257] rounded hover:bg-[#6a7257] hover:text-black transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#6a7257] text-black rounded hover:bg-blue-600 transition"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
