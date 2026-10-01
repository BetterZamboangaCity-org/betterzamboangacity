import React, { useMemo } from 'react';
import l020Data from '../../../content/congressman/congresswoman_L020_bills.json';
import l095Data from '../../../content/congressman/congressman_L095_bills.json';

export const CommitteeFocusGraph: React.FC = () => {
  const committeeData = useMemo(() => {
    const counts1: Record<string, number> = {};
    const counts2: Record<string, number> = {};

    l020Data.bills.forEach((b) => {
      const comm = (b.primaryReferral || 'UNSPECIFIED').toUpperCase().trim();
      counts1[comm] = (counts1[comm] || 0) + 1;
    });

    l095Data.bills.forEach((b) => {
      const comm = (b.primaryReferral || 'UNSPECIFIED').toUpperCase().trim();
      counts2[comm] = (counts2[comm] || 0) + 1;
    });

    const allCommittees = new Set([...Object.keys(counts1), ...Object.keys(counts2)]);
    const sorted = Array.from(allCommittees)
      .map((comm) => ({
        committee: comm,
        d1Count: counts1[comm] || 0,
        d2Count: counts2[comm] || 0,
        combinedTotal: (counts1[comm] || 0) + (counts2[comm] || 0),
      }))
      .filter((item) => item.combinedTotal > 0)
      .sort((a, b) => b.combinedTotal - a.combinedTotal)
      .slice(0, 8);

    return sorted;
  }, []);

  return (
    <div className="space-y-6 font-sans">
      {/* Light Theme Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 text-slate-900 p-5 rounded-[6px] shadow-xs border border-slate-200">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-purple-700 bg-purple-100 px-2.5 py-1 rounded border border-purple-200">
            Sector Referral Cards
          </span>
          <h3 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 mt-1.5">
            Primary Committee Referrals & Policy Sectors
          </h3>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Comparative measure referrals across top House standing committees.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-black shrink-0 bg-white p-2.5 rounded border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-blue-600 ring-2 ring-blue-200 shadow-xs" />
            <span className="text-blue-900">District 1</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 ring-2 ring-amber-200 shadow-xs" />
            <span className="text-amber-900">District 2</span>
          </div>
        </div>
      </div>

      {/* Comparative Sector Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {committeeData.map((item) => (
          <div
            key={item.committee}
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-[6px] p-4 shadow-xs space-y-3 transition-colors relative overflow-hidden"
          >
            {/* Top Solid Vinta Flag Multicolor Accent Stripe */}
            <div className="absolute top-0 left-0 right-0 h-1 flex overflow-hidden">
              <div className="w-[16.66%] h-full bg-[#c084fc]" />
              <div className="w-[16.66%] h-full bg-[#38bdf8]" />
              <div className="w-[16.66%] h-full bg-[#4ade80]" />
              <div className="w-[16.66%] h-full bg-[#e11d48]" />
              <div className="w-[16.66%] h-full bg-[#fca5a5]" />
              <div className="w-[16.66%] h-full bg-[#fbbf24]" />
            </div>
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-tight truncate">
                {item.committee}
              </h4>
              <span className="text-xs font-black text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200 shrink-0">
                {item.combinedTotal} measures
              </span>
            </div>

            {/* Split Comparison Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] font-extrabold">
                <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  District 1: {item.d1Count} bills
                </span>
                <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  District 2: {item.d2Count} bills
                </span>
              </div>
              <div className="w-full h-3.5 bg-slate-100 rounded overflow-hidden flex gap-0.5 border border-slate-200 shadow-xs">
                {item.d1Count > 0 && (
                  <div
                    style={{ width: `${(item.d1Count / item.combinedTotal) * 100}%` }}
                    className="h-full bg-blue-600 rounded-l"
                  />
                )}
                {item.d2Count > 0 && (
                  <div
                    style={{ width: `${(item.d2Count / item.combinedTotal) * 100}%` }}
                    className="h-full bg-amber-500 rounded-r"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
