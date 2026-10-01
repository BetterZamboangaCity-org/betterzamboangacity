import React, { useMemo } from 'react';
import l020Data from '../../../content/congressman/congresswoman_L020_bills.json';
import l095Data from '../../../content/congressman/congressman_L095_bills.json';

export const AuthorshipWeightGraph: React.FC = () => {
  const data = useMemo(() => {
    const calc = (repData: typeof l020Data, name: string, district: string) => {
      const total = repData.bills.length || 1;
      const principal = repData.summary.principalAuthoredCount;
      const coAuthored = repData.summary.coAuthoredCount;

      const principalPct = Number(((principal / total) * 100).toFixed(1));
      const coAuthoredPct = Number(((coAuthored / total) * 100).toFixed(1));

      return {
        name,
        district,
        total,
        principal,
        coAuthored,
        principalPct,
        coAuthoredPct,
      };
    };

    return {
      d1: calc(l020Data, 'Rep. Katrina Reiko Chua-Tai', 'District 1 (West)'),
      d2: calc(l095Data as any, 'Rep. Jerry Evangelista Perez', 'District 2 (East)'),
    };
  }, []);

  return (
    <div className="space-y-6 font-sans">
      {/* Light Theme Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 text-slate-900 p-5 rounded-[6px] shadow-xs border border-slate-200">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded border border-emerald-200">
            Authorship Weight Share
          </span>
          <h3 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 mt-1.5">
            Primary Agenda Ratio (Lead Sponsor vs. Supporting Co-Author)
          </h3>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Separates lead authorship (personal legislative agenda) from supporting co-authorship (coalition voting support).
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

      {/* Stacked 100% Authorship Weight Bar Chart */}
      <div className="bg-white border border-slate-200 rounded-[6px] p-5 sm:p-6 shadow-xs space-y-6 relative overflow-hidden">
        {/* Top Solid Vinta Flag Multicolor Accent Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex overflow-hidden">
          <div className="w-[16.66%] h-full bg-[#c084fc]" />
          <div className="w-[16.66%] h-full bg-[#38bdf8]" />
          <div className="w-[16.66%] h-full bg-[#4ade80]" />
          <div className="w-[16.66%] h-full bg-[#e11d48]" />
          <div className="w-[16.66%] h-full bg-[#fca5a5]" />
          <div className="w-[16.66%] h-full bg-[#fbbf24]" />
        </div>
        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight border-b border-slate-100 pb-3">
          Sponsorship Composition Breakdown
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* District 1 Stacked Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded border border-blue-200">
                District 1: {data.d1.name}
              </span>
              <span className="text-xs font-bold text-slate-600">{data.d1.total} Total Measures</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-700">
                <span>Principal Lead: {data.d1.principalPct}%</span>
                <span>Co-Authored: {data.d1.coAuthoredPct}%</span>
              </div>
              {/* Stacked 100% Bar */}
              <div className="w-full h-6 bg-slate-200 rounded overflow-hidden flex border border-slate-300">
                <div
                  style={{ width: `${data.d1.principalPct}%` }}
                  className="h-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-black"
                >
                  {data.d1.principalPct}%
                </div>
                <div
                  style={{ width: `${data.d1.coAuthoredPct}%` }}
                  className="h-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-black"
                >
                  {data.d1.coAuthoredPct}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1 font-semibold">
              <div className="bg-white p-2.5 rounded border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase block">Lead Author</span>
                <span className="text-sm font-black text-blue-700">{data.d1.principal} bills</span>
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase block">Co-Author</span>
                <span className="text-sm font-black text-indigo-700">{data.d1.coAuthored} bills</span>
              </div>
            </div>
          </div>

          {/* District 2 Stacked Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded border border-amber-200">
                District 2: {data.d2.name}
              </span>
              <span className="text-xs font-bold text-slate-600">{data.d2.total} Total Measures</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-700">
                <span>Principal Lead: {data.d2.principalPct}%</span>
                <span>Co-Authored: {data.d2.coAuthoredPct}%</span>
              </div>
              {/* Stacked 100% Bar */}
              <div className="w-full h-6 bg-slate-200 rounded overflow-hidden flex border border-slate-300">
                <div
                  style={{ width: `${data.d2.principalPct}%` }}
                  className="h-full bg-amber-500 flex items-center justify-center text-white text-[10px] font-black"
                >
                  {data.d2.principalPct}%
                </div>
                <div
                  style={{ width: `${data.d2.coAuthoredPct}%` }}
                  className="h-full bg-amber-700 flex items-center justify-center text-white text-[10px] font-black"
                >
                  {data.d2.coAuthoredPct}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1 font-semibold">
              <div className="bg-white p-2.5 rounded border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase block">Lead Author</span>
                <span className="text-sm font-black text-amber-700">{data.d2.principal} bills</span>
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase block">Co-Author</span>
                <span className="text-sm font-black text-amber-900">{data.d2.coAuthored} bills</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
