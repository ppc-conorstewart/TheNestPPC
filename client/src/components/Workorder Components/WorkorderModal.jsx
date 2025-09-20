// src/components/WorkorderModal.jsx

import WorkorderFooter from './WorkorderFooter';
import WorkorderHeader from './WorkorderHeader';

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
  canPublish = false,
  onGenerate,
  onExportPdf,
  isExportingPdf = false,
  onClose,
  metadata,
  woNumber,
  alerts = [],
  onToggleAlerts,
  children,
  dfitSelections = [],
  dfitActiveTab = 0,
  contentRef,
}) {
  return (
    <div
      className="relative w-full h-screen flex flex-col bg-black text-white overflow-hidden"
      ref={contentRef}
    >
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
        dfitSelections={dfitSelections}
        dfitActiveTab={dfitActiveTab}
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
        onExportPdf={onExportPdf}
        isExportingPdf={isExportingPdf}
        canNext={canNext}
        canPublish={canPublish}
      />
    </div>
  );
}
