// src/components/NotesPage.jsx

import React from 'react';

export default function NotesPage({ title }) {
  return (
    <div>
      <label className="block text-center text-[#6a7257] uppercase font-semibold mb-2 text-lg">
        Details for {title}
      </label>
      <textarea
        rows={4}
        className="w-full bg-black border border-gray-700 rounded p-2 text-white text-sm"
        placeholder={`Enter notes or parameters for ${title}`}
      />
    </div>
  );
}
