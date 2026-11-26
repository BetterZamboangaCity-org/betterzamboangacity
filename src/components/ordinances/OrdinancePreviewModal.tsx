import React, { useId } from 'react';
import { useModalDialog } from '../hooks/useModalDialog';
import type { Ordinance } from '../../types/ordinance';

interface Props {
  ordinance: Ordinance | null;
  onClose: () => void;
  getExternalLink: (ord: Ordinance) => string;
  toFormalTitleCase: (str: string) => string;
}

export const OrdinancePreviewModal: React.FC<Props> = ({
  ordinance,
  onClose,
  getExternalLink,
  toFormalTitleCase,
}) => {
  const dialogRef = useModalDialog(Boolean(ordinance));
  const titleId = useId();
  if (!ordinance) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      className="fixed inset-0 m-0 h-dvh w-full max-h-none max-w-none border-0 bg-transparent p-3 sm:p-6 open:flex items-center justify-center overflow-y-auto backdrop:bg-slate-900/40 backdrop:backdrop-blur-xs"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 text-slate-900 overflow-hidden">
        
        {/* Vinta Top Ribbon Accent */}
        <div className="h-2 w-full flex shrink-0">
          <div className="flex-1 bg-[#0032A0]"></div>
          <div className="flex-1 bg-[#1A9714]"></div>
          <div className="flex-1 bg-[#F6CD18]"></div>
          <div className="flex-1 bg-[#B32435]"></div>
        </div>

        {/* Light Modal Header with Larger Title */}
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200/90 text-slate-900 relative shrink-0">
          <button
            type="button"
            autoFocus
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-200/70 hover:bg-slate-200 active:bg-slate-300 text-slate-600 hover:text-slate-900 transition-all"
            aria-label="Close modal"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="bg-amber-100 text-[#9B4817] border border-amber-300/80 px-2.5 py-0.5 rounded-md text-xs font-black uppercase">
              {ordinance.ordinance_number}
            </span>
            {ordinance.ordinance_year && (
              <span className="bg-slate-200/80 text-slate-800 px-2 py-0.5 rounded-md text-xs font-bold">
                Year {String(ordinance.ordinance_year)}
              </span>
            )}
            {ordinance.active_status && (
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-md text-xs font-bold">
                {ordinance.active_status}
              </span>
            )}
          </div>

          {/* Modal Title */}
          <h2 id={titleId} className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed pr-8">
            {toFormalTitleCase(ordinance.official_title)}
          </h2>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs sm:text-sm text-slate-800">
          
          {/* ELI5 Summary */}
          {ordinance.eli5_summary && (
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 space-y-2 shadow-xs">
              <div className="font-extrabold text-amber-900 uppercase text-xs flex items-center gap-1.5 tracking-wider">
                <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>Simplified Explanation (ELI5)</span>
              </div>
              <p className="text-slate-800 leading-relaxed font-normal text-sm sm:text-base">
                {ordinance.eli5_summary}
              </p>
            </div>
          )}

          {/* CLEAN & ORGANIZED PENALTIES & FINES SECTION */}
          {ordinance.fines && ordinance.fines.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-rose-100 pb-2">
                <div className="font-extrabold text-rose-800 uppercase text-xs tracking-wider flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Penalties & Administrative Fines</span>
                </div>
                <span className="text-[11px] font-bold text-rose-800 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-md">
                  {ordinance.fines.length} Tiered Violations
                </span>
              </div>

              <div className="space-y-2.5">
                {ordinance.fines.map((fine, i) => (
                  <div
                    key={i}
                    className="bg-rose-50/60 border border-rose-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-rose-950 text-xs sm:text-sm">
                        {fine.offense_level}
                      </span>
                    </div>

                    <div className="font-bold text-rose-800 bg-white border border-rose-200 rounded-lg px-3 py-1.5 text-xs text-right sm:self-auto shrink-0 shadow-2xs">
                      {fine.penalty}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Link Box */}
          <div className="bg-sky-50/70 border border-sky-200/80 rounded-xl p-4 text-center space-y-2.5 shadow-xs">
            <p className="text-slate-700 text-xs font-medium">
              Access official PDF gazette documents, full text, and search on <strong>Ley De Zamboanga</strong>:
            </p>
            <a
              href={getExternalLink(ordinance)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0032A0] hover:bg-[#002680] active:bg-[#001c60] text-white font-extrabold text-xs rounded-xl shadow-md transition-all border border-blue-900"
            >
              <span>Open Full Ordinance on Ley De Zamboanga</span>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] font-semibold text-slate-500">
            Sourced from Ley De Zamboanga (by Chex)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-800 font-bold rounded-xl text-xs transition-colors shadow-2xs"
          >
            Close Preview
          </button>
        </div>
      </div>
    </dialog>
  );
};
