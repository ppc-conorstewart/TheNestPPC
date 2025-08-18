// src/pages/ValveReports.jsx

import React, { useState, useEffect } from 'react';

export default function ValveReports() {
  // Dynamically inject the Lordicon script if not already present
  useEffect(() => {
    if (!document.querySelector('script[src="https://cdn.lordicon.com/lordicon.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://cdn.lordicon.com/lordicon.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const palomaLogoPath = '/assets/Paloma_Logo_White_Rounded2.png';

  const [activeForm, setActiveForm] = useState(null);
  const [formData, setFormData] = useState({
    ppc: '',
    shopOrigin: '',
    valveSize: '',
    bodyStyle: '',
    sealConfig: '',
    gateGuides: '',
    stepSize: '',
    seatPocket: '',
    seatThicknessA: '',
    seatThicknessB: '',
    gateThickness: '',
    file: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted Data:', { ...formData, reportType: activeForm });
    setActiveForm(null);
  };

  const reportTypes = [
    { key: 'build', title: 'MFV Build/Test Report', description: 'Upload factory build or test documentation.' },
    { key: 'field', title: 'MFV Testing Report', description: 'Log and attach field valve test results.' },
    { key: 'oem', title: 'OEM Valve Report', description: 'Attach OEM files and additional remarks.' },
  ];

  const dropdowns = {
    shopOrigin: ['Nisku', 'Red Deer', 'Grande Prairie'],
    valveSize: ['7-1/16" 15K Hydraulic', '7-1/16" 15K Manual', '5-1/8" 15K Hydraulic', '5-1/8" 15K Manual'],
    bodyStyle: ['Flanged', 'Flanged x Studded', 'Studded'],
    sealConfig: [
      'DD w/ split 4.75mm O-ring',
      'Reversed UTEX Seal 4.75 Split Face Seal',
    ],
    gateGuides: ['Yes', 'No'],
    stepSize: ['OEM', 'A', 'B', 'C', 'D', 'E', 'F'],
  };

  return (
    <div className="min-h-screen bg-black text-white px-12 py-16" style={{ zoom: 0.65 }}>
      

      <button
        onClick={() => window.history.back()}
        className="mb-6 px-4 py-2 bg-black border border-[#666666] rounded-md text-[#666666] text-sm hover:bg-[#EF4444] hover:text-black transition"
      >
        ← Return to Base Dashboard
      </button>

      <h1 className="text-4xl font-bold text-center mb-12">Valve Reports</h1>

      <div className="flex flex-wrap justify-center gap-10">
        {reportTypes.map((report) => (
          <div
            key={report.key}
            className="bg-[#111] border border-[#666666] rounded-xl w-[320px] p-6 text-center shadow-lg"
          >
            {report.key === 'build' ? (
  <lord-icon
    src="/assets/wrench-valve.json"
    trigger="in"
    delay="1500"
    stroke="bold"
    state="in-reveal"
    colors="primary:#ef4444,secondary:#000000"
    style={{ width: '80px', height: '80px' }}
    className="mx-auto mb-4"
  ></lord-icon>
) : (
              <img
                src="/assets/mfv-icon2.png"
                alt="MFV Icon"
                className="w-20 h-20 mx-auto mb-4"
              />
            )}
            <h2 className="text-xl font-bold text-[#999] mb-2">{report.title}</h2>
            <p className="text-sm text-gray-400 mb-4">{report.description}</p>
            <button
              onClick={() => setActiveForm(report.key)}
              className="px-4 py-2 bg-[#EF4444] text-black rounded hover:bg-red-500 transition"
            >
              Submit Report →
            </button>
          </div>
        ))}
      </div>

      {activeForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-12 max-w-3xl mx-auto bg-[#1a1a1a] border-2 border-[#EF4444] rounded-xl p-6 shadow-xl grid grid-cols-2 gap-4"
        >
          <h2 className="col-span-2 text-2xl text-center font-bold text-[#EF4444] mb-2 capitalize">
            MFV {activeForm} Report Form
          </h2>

          <label className="font-bold">PPC#</label>
          <input
            name="ppc"
            required
            value={formData.ppc}
            onChange={handleChange}
            className="bg-[#222] p-2 rounded border border-[#444]"
            placeholder="e.g. 30341"
          />

          {Object.entries(dropdowns).map(([field, options]) => (
            <React.Fragment key={field}>
              <label className="font-bold capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
              <select
                name={field}
                required={field !== 'stepSize'}
                value={formData[field]}
                onChange={handleChange}
                className="bg-[#222] p-2 rounded border border-[#444]"
              >
                <option value="">Select</option>
                {options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </React.Fragment>
          ))}

          <label className="font-bold">Seat Pocket to Seat Pocket</label>
          <input
            name="seatPocket"
            value={formData.seatPocket}
            onChange={handleChange}
            className="bg-[#222] p-2 rounded border border-[#444]"
            placeholder="e.g. 14.102"
          />

          <label className="font-bold">A-Side Seat Thickness</label>
          <input
            name="seatThicknessA"
            value={formData.seatThicknessA}
            onChange={handleChange}
            className="bg-[#222] p-2 rounded border border-[#444]"
            placeholder="e.g. 4.476"
          />

          <label className="font-bold">B-Side Seat Thickness</label>
          <input
            name="seatThicknessB"
            value={formData.seatThicknessB}
            onChange={handleChange}
            className="bg-[#222] p-2 rounded border border-[#444]"
            placeholder="e.g. 4.476"
          />

          <label className="font-bold">Gate Thickness</label>
          <input
            name="gateThickness"
            value={formData.gateThickness}
            onChange={handleChange}
            className="bg-[#222] p-2 rounded border border-[#444]"
            placeholder="e.g. 5.120"
          />

          {/* Drop-Zone File Attachment */}
          <div className="col-span-2">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-[#EF4444] rounded-lg bg-[#1a1a1a] hover:bg-[#222] cursor-pointer transition"
            >
              <div className="flex flex-col text-[#EF4444] items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 mb-4 text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-400">PDF (max. 10 MB)</p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
                required
              />
            </label>
          </div>

          <div className="col-span-2 flex justify-between mt-4">
            <button
              type="button"
              onClick={() => setActiveForm(null)}
              className="px-4 py-2 border border-[#EF4444] text-[#EF4444] rounded hover:bg-[#333]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#EF4444] text-black font-bold rounded hover:bg-red-500"
            >
              Submit Report
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
