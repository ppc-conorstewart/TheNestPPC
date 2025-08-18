// src/pages/Safety.jsx

import React from "react";

export default function Safety() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white bg-[#1B1D16]">
      <div className="bg-[#222] rounded-2xl p-10 shadow-xl w-full max-w-2xl text-center">
        <h1 className="text-3xl font-bold mb-4 text-[#6a7257]">Safety Hub</h1>
        <p className="text-gray-200 text-lg mb-8">
          Welcome to the Paloma Safety Resources page.
        </p>
        <ul className="space-y-4 text-left">
          <li>• Download safety manuals and SOPs</li>
          <li>• Submit a safety observation or incident report</li>
          <li>• Review safety training and certifications</li>
        </ul>
      </div>
    </div>
  );
}
