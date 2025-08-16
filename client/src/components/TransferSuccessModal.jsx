// src/components/TransferSuccessModal.jsx
import React from 'react';

/**
 * Props:
 * - isOpen: boolean
 * - transferredIds: array of asset IDs that were transferred
 * - onClose: () => void
 */
export default function TransferSuccessModal({ isOpen, transferredIds, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[500px] max-w-full text-black">
        <h2 className="text-xl font-bold mb-4">Transfer Successful</h2>
        <p className="mb-2">The following assets were successfully transferred:</p>
        <ul className="list-disc list-inside mb-4">
          {transferredIds.map((id) => (
            <li key={id}>{id}</li>
          ))}
        </ul>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
