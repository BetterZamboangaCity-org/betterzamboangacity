import React from 'react';
import type { Bill } from './types';
import { getNormalizedPdfUrl } from './types';

interface BillCardItemProps {
  bill: Bill;
  onOpenHistory: (bill: Bill) => void;
}

export const BillCardItem: React.FC<BillCardItemProps> = ({ bill, onOpenHistory }) => {
  const isLocal = bill.significance.toLowerCase() === 'local';
  const isPrincipal = bill.authorshipType.toLowerCase().includes('principal');

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] shadow-xs overflow-hidden transition-all duration-200 hover:border-blue-400 hover:shadow-md relative group font-sans">
      {/* Top Solid Vinta Flag Multicolor Accent Stripe */}
      <div className="h-1.5 w-full flex overflow-hidden">
        <div className="w-[16.66%] h-full bg-[#c084fc]" />
        <div className="w-[16.66%] h-full bg-[#38bdf8]" />
        <div className="w-[16.66%] h-full bg-[#4ade80]" />
        <div className="w-[16.66%] h-full bg-[#e11d48]" />
        <div className="w-[16.66%] h-full bg-[#fca5a5]" />
        <div className="w-[16.66%] h-full bg-[#fbbf24]" />
      </div>

      {/* Header Bar: Bill No with Vinta Styling */}
      <div className="bg-slate-100/90 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base font-bold text-[#0f172a] font-mono tracking-tight">
            {bill.billNo}
          </span>
          {/* Significance Vinta Badge */}
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-[2px] border ${isLocal
                ? 'bg-sky-50 text-sky-900 border-sky-200'
                : 'bg-purple-50 text-purple-900 border-purple-200'
              }`}
          >
            {bill.significance || 'Measure'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-[2px] border ${isPrincipal
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : 'bg-indigo-50 text-indigo-800 border-indigo-200'
              }`}
          >
            {bill.authorshipType}
          </span>
        </div>
      </div>

      {/* Bill Body Details Content */}
      <div className="p-4 sm:p-6 space-y-4">
        {/* Bill Title */}
        <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug tracking-tight">
          {bill.fullTitle}
        </h4>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-1 gap-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200/80 rounded-[4px] p-3.5 sm:p-4">
          <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-1 md:gap-4 items-baseline">
            <span className="font-bold text-slate-700">Date Filed:</span>
            <span className="font-mono text-slate-800">{bill.dateFiled || 'N/A'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-1 md:gap-4 items-baseline">
            <span className="font-bold text-slate-700">Principal Authors:</span>
            <span className="font-medium text-slate-800">{bill.principalAuthors || 'N/A'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-1 md:gap-4 items-baseline">
            <span className="font-bold text-slate-700">Date Read:</span>
            <span className="font-medium text-slate-800 font-mono">{bill.dateRead || 'N/A'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-1 md:gap-4 items-baseline">
            <span className="font-bold text-slate-700">Primary Referral:</span>
            <span className="font-bold text-blue-700 tracking-tight">{bill.primaryReferral || 'N/A'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-1 md:gap-4 items-baseline">
            <span className="font-bold text-slate-700">Bill Status:</span>
            <span className="font-medium text-slate-900">{bill.billStatus || 'N/A'}</span>
          </div>
        </div>

        {/* Bottom Action Buttons Container */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
          {/* History Button */}
          <button
            type="button"
            onClick={() => onOpenHistory(bill)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-[4px] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>History</span>
          </button>

          {/* Text As Filed Button (PDF Link) */}
          {bill.pdfUrl ? (
            <a
              href={getNormalizedPdfUrl(bill.pdfUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-[4px] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Text As Filed</span>
            </a>
          ) : (
            <span className="text-xs text-slate-400 italic">No PDF Document available</span>
          )}
        </div>
      </div>
    </div>
  );
};
