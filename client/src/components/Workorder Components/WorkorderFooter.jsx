// ==============================
// FILE: src/components/WorkorderFooter.jsx
// ==============================

import React from 'react';
import {
  PrevButton,
  PrimaryButton,
  SecondaryButton,
  NextButton,
} from '../ui/WorkorderButtons';
import '../ui/ButtonEffects.css';

export default function WorkorderFooter({
  currentPageIndex,
  prevPageLabel,
  nextPageLabel,
  onPrev,
  onNext,
  onGenerate,
  onSave,
  onExportPdf,
  isExportingPdf = false,
  canNext,
  canPublish,
}) {
  return (
    <footer className="relative px-4 py-1 border-t flex items-center justify-between text-xs">
      {/* Back */}
      <PrevButton
        onClick={onPrev}
        disabled={currentPageIndex === 0}
        label={` ${prevPageLabel}`}
      />

      {/* Publish / Save / Export */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2">
        <div className="flex gap-2 items-center">
          <PrimaryButton
            onClick={onGenerate}
            label="Publish Revision"
            disabled={!canPublish}
            style={{
              opacity: canPublish ? 1 : 0.5,
              cursor: canPublish ? 'pointer' : 'not-allowed',
            }}
          />
          <SecondaryButton onClick={onSave} label="Save Progress" />
          <SecondaryButton
            onClick={onExportPdf}
            label={isExportingPdf ? 'Generating PDF...' : 'Generate Full PDF'}
            disabled={isExportingPdf}
          />
          {/* Exclamation with tooltip */}
          {!canPublish && (
            <div className="relative group ml-2" style={{ width: 26, height: 26 }}>
              <span
                className="relative flex items-center justify-center rounded-full border-2 border-yellow-500 bg-black text-yellow-400 text-xl font-bold w-[26px] h-[26px] z-10"
                style={{ boxShadow: '0 0 8px 2pxrgb(255, 102, 102)', pointerEvents: 'auto' }}
              >
                !
              </span>
              <span className="workorder-tooltip-simple">
                Please save the workorder before publishing a revision.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Next */}
      <NextButton
        onClick={onNext}
        disabled={!canNext}
        label={`${nextPageLabel} `}
      />
    </footer>
  );
}
