// src/components/WorkorderModal.jsx

import React from 'react';
import WorkorderHeader from './WorkorderHeader';
import WorkorderFooter from './WorkorderFooter';

export default function WorkorderModal({
  pages,
  currentPageIndex,
  onChangePage,
  prevLabel,
  nextLabel,
  onPrev,
  onNext,
  onSave,
  canNext,
  onGenerate,
  onClose,
  metadata,
  woNumber,
  alerts = [],
  onToggleAlerts,
  children,
  dfitSelections = [],
  dfitActiveTab = 0,
}) {
  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-black border text-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden">
        {/* Page bullets */}
        <div className="flex justify-center items-center py-1 px-2 gap-1 bg-[#1a1a1a] border-b border-[#6a7257]">
          {pages.map((p, i) => (
            <button
              key={i}
              onClick={() => onChangePage(i)}
              className={`text-[10px] w-6 h-6 rounded-full border ${
                i === currentPageIndex
                  ? 'bg-[#6a7257] text-black font-bold'
                  : 'bg-[#333] text-white'
              }`}
              title={p.title}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Header */}
        <WorkorderHeader
          currentPageIndex={currentPageIndex}
          pages={pages}
          onClose={onClose}
          metadata={metadata}
          woNumber={woNumber}
          alerts={alerts}
          onToggleAlerts={onToggleAlerts}
          dfitSelections={dfitSelections}    // Pass for WO # logic
          dfitActiveTab={dfitActiveTab}      // Pass for WO # logic
        />

        {/* Page content */}
        <section className="px-4 py-2 flex-grow overflow-auto">
          {children}
        </section>

        {/* Footer */}
        <WorkorderFooter
          currentPageIndex={currentPageIndex}
          prevPageLabel={prevLabel}
          nextPageLabel={nextLabel}
          onPrev={onPrev}
          onNext={onNext}
          onGenerate={onGenerate}
          onSave={onSave}
          canNext={canNext}
        />
      </div>
    </div>
  );
}
