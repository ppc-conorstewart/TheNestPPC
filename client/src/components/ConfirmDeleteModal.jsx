// src/components/ConfirmDeleteModal.jsx
import React, { useState } from 'react';

export default function ConfirmDeleteModal({ 
  isOpen, 
  asset, 
  onConfirm, 
  onCancel 
}) {
  const [typed, setTyped] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#222] text-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
        <div className="mb-4">
          <p>Type <span className="font-bold">"DELETE"</span> to confirm asset deletion.</p>
          <p className="mt-1 text-yellow-400">{asset.id} - {asset.name}</p>
        </div>
        <input
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          className="w-full px-3 py-2 border border-gray-600 rounded bg-[#111] text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          placeholder='Type "DELETE" here'
        />
        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (typed === 'DELETE') {
                onConfirm();
              }
            }}
            className={`px-4 py-2 font-bold rounded ${
              typed === 'DELETE'
                ? 'bg-red-600 hover:bg-red-500'
                : 'bg-red-800 opacity-50 cursor-not-allowed'
            } text-white`}
            disabled={typed !== 'DELETE'}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
