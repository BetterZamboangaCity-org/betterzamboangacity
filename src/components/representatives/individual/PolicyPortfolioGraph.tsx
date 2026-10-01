import React, { useMemo } from 'react';
import type { RepresentativeData } from '../types';

interface Props {
  currentRep: RepresentativeData;
}

export const PolicyPortfolioGraph: React.FC<Props> = ({ currentRep }) => {
  const committeeData = useMemo(() => {
    const map: Record<string, { principal: number; coAuthored: number; total: number }> = {};

    currentRep.bills.forEach((b) => {
      const comm = (b.primaryReferral || 'UNSPECIFIED').toUpperCase().trim();
      const isPrincipal = (b.authorshipType || '').toLowerCase().includes('principal');

      if (!map[comm]) {
        map[comm] = { principal: 0, coAuthored: 0, total: 0 };
      }

      if (isPrincipal) map[comm].principal++;
      else map[comm].coAuthored++;
      map[comm].total++;
    });

    const repTotal = currentRep.bills.length || 1;

    return Object.entries(map)
      .map(([comm, item]) => ({
        committee: comm,
        ...item,
        pctShare: Number(((item.total / repTotal) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [currentRep]);

  const maxTotal = Math.max(...committeeData.map((c) => c.total), 1);

  return (
    <div className="bg-white border border-slate-200 rounded-[6px] p-5 shadow-xs space-y-4 relative overflow-hidden">
      {/* Top Solid Vinta Flag Multicolor Accent Stripe */}
      <div className="absolute top-0 left-0 right-0 h-1.5 flex overflow-hidden">
        <div className="w-[16.66%] h-full bg-[#c084fc]" />
        <div className="w-[16.66%] h-full bg-[#38bdf8]" />
        <div className="w-[16.66%] h-full bg-[#4ade80]" />
        <div className="w-[16.66%] h-full bg-[#e11d48]" />
        <div className="w-[16.66%] h-full bg-[#fca5a5]" />
        <div className="w-[16.66%] h-full bg-[#fbbf24]" />
      </div>
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200/60">
            Domain Focus
          </span>
          <h3 className="text-base font-bold text-slate-900 mt-1">
            Policy Portfolio & Committee Distribution
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-600" />
            <span className="text-slate-700">Principal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-teal-600" />
            <span className="text-slate-700">Co-Authored</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-1">
        {committeeData.map((item, idx) => {
          const barWidthPct = Math.max(8, Math.round((item.total / maxTotal) * 100));

          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                <span className="font-bold text-slate-900 uppercase tracking-tight truncate pr-2">
                  {item.committee}
                </span>
                <span className="font-medium text-slate-600 text-[11px] shrink-0">
                  <strong className="text-slate-900 font-bold">{item.total} bills</strong> ({item.pctShare}% of workload)
                </span>
              </div>

              {/* Dual-Color Stacked Bar (Vinta Crimson & Teal) */}
              <div className="w-full h-4 bg-slate-100 rounded overflow-hidden flex border border-slate-200 shadow-xs">
                {item.principal > 0 && (
                  <div
                    style={{ width: `${(item.principal / item.total) * barWidthPct}%` }}
                    className="h-full bg-rose-600 transition-all duration-500"
                    title={`Principal: ${item.principal} bills`}
                  />
                )}
                {item.coAuthored > 0 && (
                  <div
                    style={{ width: `${(item.coAuthored / item.total) * barWidthPct}%` }}
                    className="h-full bg-teal-600 transition-all duration-500"
                    title={`Co-authored: ${item.coAuthored} bills`}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
