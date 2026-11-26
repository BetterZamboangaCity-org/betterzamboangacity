import React, { useId } from 'react';
import { useModalDialog } from '../hooks/useModalDialog';
import type { Bill } from './types';
import { getNormalizedPdfUrl } from './types';

interface BillHistoryModalProps {
  bill: Bill | null;
  onClose: () => void;
}

export const BillHistoryModal: React.FC<BillHistoryModalProps> = ({ bill, onClose }) => {
  const dialogRef = useModalDialog(Boolean(bill));
  const titleId = useId();
  if (!bill) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      className="fixed inset-0 m-0 h-dvh w-full max-h-none max-w-none border-0 bg-transparent p-3 sm:p-4 open:flex items-center justify-center overflow-y-auto backdrop:bg-slate-900/40 backdrop:backdrop-blur-xs animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-slate-200 rounded-[4px] shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-slide-in my-auto font-sans">
        {/* Modal Light Theme Header with Vinta Accent Stripe */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-start justify-between gap-4 shrink-0 relative">
          {/* Top Solid Vinta Flag Multicolor Accent Stripe */}
          <div className="absolute top-0 left-0 right-0 h-1.5 flex overflow-hidden">
            <div className="w-[16.66%] h-full bg-[#c084fc]" />
            <div className="w-[16.66%] h-full bg-[#38bdf8]" />
            <div className="w-[16.66%] h-full bg-[#4ade80]" />
            <div className="w-[16.66%] h-full bg-[#e11d48]" />
            <div className="w-[16.66%] h-full bg-[#fca5a5]" />
            <div className="w-[16.66%] h-full bg-[#fbbf24]" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-blue-700 block mb-0.5 uppercase tracking-wider">
              HOUSE BILL HISTORY · {bill.billNo}
            </span>
            <h3 id={titleId} className="text-base sm:text-lg font-black text-slate-900 leading-tight line-clamp-2">
              {bill.fullTitle}
            </h3>
          </div>
          <button
            type="button"
            autoFocus
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 p-1.5 rounded-[2px] focus-visible:ring-2 focus-visible:ring-blue-600 transition-colors shrink-0"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-800 divide-y divide-slate-100">
          {/* Key Timeline Info */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Key Timeline & Action Summary</span>
            </h4>

            <div className="bg-slate-50/80 border border-slate-200/90 rounded-[4px] p-4 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3">
                <span className="font-bold text-slate-700">Date Filed:</span>
                <span className="font-mono text-slate-900 font-semibold">{bill.dateFiled || 'N/A'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3">
                <span className="font-bold text-slate-700">First Reading Info:</span>
                <span className="text-slate-800">{bill.history?.firstReading || bill.dateRead || 'N/A'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3">
                <span className="font-bold text-slate-700">Primary Referral:</span>
                <span className="font-bold text-blue-700">{bill.primaryReferral || 'N/A'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3">
                <span className="font-bold text-slate-700">Committee Actions:</span>
                <span className="text-slate-800">{bill.history?.committeeActions || 'No committee actions recorded yet.'}</span>
              </div>

              {bill.history?.coAuthors && (
                <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-3">
                  <span className="font-bold text-slate-700">Co-Authors:</span>
                  <div className="whitespace-pre-line font-medium text-slate-800">
                    {bill.history.coAuthors}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Full History Log Text */}
          {bill.history?.fullHistoryText && (
            <div className="pt-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Full Official History Log</span>
              </h4>
              <pre className="bg-slate-50 text-slate-800 p-4 rounded-[4px] text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-60 border border-slate-200 shadow-inner">
                {bill.history.fullHistoryText}
              </pre>
            </div>
          )}

          {/* PDF Document Direct Link inside Modal */}
          {bill.pdfUrl && (
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/60 border border-blue-100 p-3.5 rounded-[4px]">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="text-xs text-slate-700 font-semibold">Official Legislative Document PDF:</span>
              </div>
              <a
                href={getNormalizedPdfUrl(bill.pdfUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-[4px] shadow-xs transition-colors shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download / View Official PDF</span>
              </a>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between shrink-0">
          <span className="text-[11px] font-medium text-slate-500">
            Source: 20th Congress Public Web Registry
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-[4px] transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </dialog>
  );
};
