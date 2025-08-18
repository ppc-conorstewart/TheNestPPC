import React from 'react';
import { ChevronLeft } from 'lucide-react';

const palomaGreen = '#6a7257';

export default function MasterAssemblyDetail({ assemblies, selectedAssembly, onSelect, onBack }) {
  if (!selectedAssembly) return null;

  return (
    <div
      className="w-full min-h-[calc(100vh-180px)] flex items-stretch"
      style={{
        background: '#10110f',
        borderRadius: 18,
        maxWidth: '100%',
        minHeight: 'calc(100vh - 180px)',
        margin: '0 auto',
        boxShadow: '0 6px 36px #0007',
        overflow: 'hidden',
      }}
    >
      {/* LEFT NAV */}
      <div
        className="flex flex-col py-6 px-0 bg-black border-r border-[#35392E]"
        style={{
          flexGrow: 1,
          maxWidth: '33%',
          background: '#000',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 mb-4 rounded-lg border border-[#23251d] text-[#b0b79f] font-bold uppercase hover:bg-[#6a7257] hover:text-black transition"
          style={{ fontSize: '1.1em', letterSpacing: '0.1em' }}
          title="Back to Hub"
        >
          <ChevronLeft size={22} />
          Back
        </button>
        <div className="font-bold text-xl uppercase text-[#6a7257] text-center mb-5 tracking-wider">
          Assemblies
        </div>
        <div className="flex flex-col gap-2 overflow-y-auto flex-grow">
          {assemblies.map((a) => (
            <button
              key={a.id}
              onClick={() => onSelect(a)}
              className="flex items-center gap-2 px-6 py-3 rounded-lg border border-[#23251d] text-left transition"
              style={{
                background: selectedAssembly.id === a.id ? palomaGreen : '#181818',
                color: selectedAssembly.id === a.id ? '#10110f' : '#d8ddc7',
                fontWeight: selectedAssembly.id === a.id ? 700 : 500,
                boxShadow: selectedAssembly.id === a.id ? '0 0 0 2px #6a7257' : 'none',
                cursor: 'pointer',
                fontSize: '1.1em',
                transition: 'background 0.13s, color 0.13s',
                outline: 'none',
              }}
            >
              {a.title}
            </button>
          ))}
        </div>
      </div>

      {/* CENTER VISUAL PANEL */}
      <div
        className="flex flex-col items-center justify-center px-6 py-8"
        style={{
          background: '#161816',
          flexGrow: 1,
          maxWidth: '33%',
          minWidth: 0,
          borderRight: '1.5px solid #35392E',
          alignItems: 'center',
          justifyContent: 'center',
          overflowY: 'auto',
        }}
      >
        <div
          className="rounded-xl bg-black border border-[#35392E] flex flex-col items-center justify-center shadow-xl"
          style={{
            width: '90%',
            minHeight: 320,
            margin: '0 auto',
            padding: '40px 10px',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Placeholder visual */}
          <div className="text-4xl mb-6" style={{ color: palomaGreen }}>
            {selectedAssembly.title}
          </div>
          <div
            className="text-[#b0b79f] text-center"
            style={{
              minHeight: 62,
              maxWidth: 300,
              fontWeight: 500,
              fontSize: '1.13em',
            }}
          >
            {selectedAssembly.description}
          </div>
          <div className="mt-9 text-center text-xs text-[#6a7257] uppercase">
            Visual area — diagrams, images or 3D (future)
          </div>
        </div>
      </div>

      {/* RIGHT DETAILS PANEL */}
      <div
        className="flex flex-col justify-start items-center py-8 px-7 bg-black"
        style={{
          background: '#000',
          flexGrow: 1,
          maxWidth: '33%',
          minWidth: 0,
          color: '#e6e8df',
          borderLeft: '1.5px solid #35392E',
          overflowY: 'auto',
        }}
      >
        <div className="text-2xl font-extrabold mb-2 tracking-widest text-[#6a7257] uppercase text-center">
          {selectedAssembly.title}
        </div>
        <div
          className="text-[#b0b79f] text-md mb-7 text-center"
          style={{ fontWeight: 600 }}
        >
          Master Assembly Info
        </div>
        {/* Example details */}
        <div
          className="rounded-lg p-5 w-full bg-[#181818] border border-[#35392E] mb-6"
          style={{ fontSize: '1.05em', minHeight: 118 }}
        >
          <div>
            <b>Status:</b> <span style={{ color: palomaGreen }}>Active</span>
          </div>
          <div>
            <b>ID:</b> {selectedAssembly.id}
          </div>
          <div>
            <b>Description:</b>{' '}
            <span style={{ color: '#b0b79f' }}>{selectedAssembly.description}</span>
          </div>
        </div>
        <div
          className="text-center mt-5 text-xs text-[#b0b79f] opacity-70"
          style={{ letterSpacing: 0.8 }}
        >
          More technical details and controls coming soon.
        </div>
      </div>
    </div>
  );
}
