import React from 'react';
import type { Ordinance } from '../../types/ordinance';

interface Props {
  ordinances: Ordinance[];
  isLoading?: boolean;
  sortBy: 'number-desc' | 'number-asc' | 'year-desc' | 'year-asc';
  setSortBy: (sortBy: 'number-desc' | 'number-asc' | 'year-desc' | 'year-asc') => void;
  cleanOrdinanceNum: (numStr: string) => string;
  getExternalLink: (ord: Ordinance) => string;
  formatDateStr: (dateStr?: string | null) => string | null;
  toFormalTitleCase: (str: string) => string;
  setActiveModalOrdinance: (ord: Ordinance) => void;
  setSearchQuery: (q: string) => void;
  setSelectedCategory: (cat: string) => void;
  setSelectedYear: (yr: string) => void;
}

export const OrdinanceTable: React.FC<Props> = ({
  ordinances,
  isLoading = false,
  sortBy,
  setSortBy,
  cleanOrdinanceNum,
  getExternalLink,
  formatDateStr,
  toFormalTitleCase,
  setActiveModalOrdinance,
  setSearchQuery,
  setSelectedCategory,
  setSelectedYear,
}) => {
  if (isLoading) {
    return (
      <div className="p-8 space-y-4 flex-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse flex items-center justify-between p-4 bg-slate-50 rounded-[4px]">
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-200 rounded-[2px] w-1/4"></div>
              <div className="h-3 bg-slate-200 rounded-[2px] w-3/4"></div>
            </div>
            <div className="h-8 bg-slate-200 rounded-[4px] w-24"></div>
          </div>
        ))}
      </div>
    );
  }

  if (ordinances.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500 flex-1 flex flex-col items-center justify-center space-y-2">
        <h3 className="text-base font-bold text-slate-800">No Ordinances Found</h3>
        <p className="text-xs">No matching record found for this category or search term.</p>
        <button
          onClick={() => {
            setSearchQuery('');
            setSelectedCategory('all');
            setSelectedYear('all');
          }}
          className="px-4 py-1.5 bg-[#0032A0] text-white rounded-[4px] font-bold text-xs"
        >
          Reset Filters
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full flex-1">
      <table className="w-full text-left border-collapse min-w-[750px]">
        <thead>
          <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 text-xs font-bold uppercase tracking-wider">
            <th className="py-3 px-6 whitespace-nowrap w-44 shrink-0">
              <button
                onClick={() => setSortBy(sortBy === 'number-desc' ? 'number-asc' : 'number-desc')}
                className="flex items-center gap-1.5 hover:text-[#0032A0] font-bold text-xs uppercase tracking-wider"
              >
                <span>Ordinance No.</span>
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>
            </th>
            <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider">Title</th>
            <th className="py-3 px-6 w-56 shrink-0 font-bold text-xs uppercase tracking-wider whitespace-nowrap">Remarks</th>
            <th className="py-3 px-6 w-44 shrink-0 text-center font-bold text-xs uppercase tracking-wider whitespace-nowrap">Links</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs font-medium">
          {ordinances.map((ord) => {
            const cleanNum = cleanOrdinanceNum(ord.ordinance_number);
            const extUrl = getExternalLink(ord);
            const enactedDate = formatDateStr(ord.date_enacted);
            const approvedDate = formatDateStr(ord.date_approved);
            const formalTitle = toFormalTitleCase(ord.official_title);

            return (
              <tr
                key={ord.ordinance_number}
                className="hover:bg-sky-50/50 transition-colors group"
              >
                {/* Ordinance Number */}
                <td className="py-4 px-6 align-top font-bold text-[#0032A0] text-sm whitespace-nowrap">
                  <a
                    href={extUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline inline-flex items-center gap-1"
                  >
                    <span>{cleanNum ? `No. ${cleanNum}` : ord.ordinance_number}</span>
                  </a>
                </td>

                {/* Larger Title, Medium Font Weight */}
                <td className="py-4 px-6 align-top">
                  <a
                    href={extUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-900 font-medium text-base sm:text-lg leading-relaxed hover:text-[#0032A0] block transition-colors"
                  >
                    {formalTitle}
                  </a>
                </td>

                {/* Remarks (Date Enacted & Date Approved displayed here only) */}
                <td className="py-4 px-6 align-top text-xs space-y-1 text-slate-600 whitespace-nowrap">
                  {enactedDate && (
                    <div>
                      <span className="font-semibold text-slate-800">Enacted:</span> {enactedDate}
                    </div>
                  )}
                  {approvedDate && (
                    <div>
                      <span className="font-semibold text-slate-800">Approved:</span> {approvedDate}
                    </div>
                  )}
                  {!enactedDate && !approvedDate && (
                    <div>
                      <span className="font-semibold text-slate-800">Year:</span> {String(ord.ordinance_year || '')}
                    </div>
                  )}
                  <div className="text-[11px] font-bold text-[#1A9714] mt-0.5">
                    {ord.active_status || 'Active'}
                  </div>
                </td>

                {/* Links */}
                <td className="py-4 px-6 align-top text-center space-y-2 whitespace-nowrap">
                  <button
                    onClick={() => setActiveModalOrdinance(ord)}
                    className="block mx-auto text-slate-600 hover:text-slate-900 font-semibold text-xs underline"
                  >
                    Quick Preview
                  </button>

                  <a
                    href={extUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#0032A0] hover:bg-[#002680] text-white font-bold text-xs transition-all shadow-xs"
                  >
                    <span>Read Full</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
