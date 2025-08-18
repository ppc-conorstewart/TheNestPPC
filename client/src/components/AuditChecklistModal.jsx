// client/src/components/AuditChecklistModal.jsx

import React, { useState } from 'react';

export default function AuditChecklistModal({ isOpen, onClose, job }) {
  const [file, setFile] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }
    const formData = new FormData();
    formData.append('auditChecklist', file);
    formData.append('jobId', job.id);

    try {
      const res = await fetch(`http://localhost:3001/api/jobs/${job.id}/audit-checklist`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      alert('Audit checklist uploaded successfully.');
       // Refresh table so the new URL shows up
       window.location.reload();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to upload audit checklist. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black border border-fly-blue rounded-lg p-6 w-full max-w-md text-fly-blue text-center">
        {/* Header */}
        <h2 className="text-xl font-bold mb-2">Upload Audit Checklist</h2>
        {/* Customer and LSD */}
        <p className="mb-1 font-semibold">{job.customer}</p>
        <p className="mb-4 font-semibold">{job.surface_lsd}</p>

        {/* Form */}
        <form onSubmit={handleUpload}>
          {/* Choose File Button */}
          <label className="mb-4 inline-block px-4 py-2 bg-black border border-fly-blue text-fly-blue rounded cursor-pointer">
            Choose File
            <input
              type="file"
              accept=".pdf,.jpg,.png"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
            />
          </label>

          {/* Selected Filename & Remove before upload */}
          {file && (
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-fly-blue">{file.name}</span>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="px-2 py-1 bg-red-600 text-white rounded"
              >
                Remove File
              </button>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-center mt-6 space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 rounded text-fly-blue"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-800 rounded text-fly-blue"
            >
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
