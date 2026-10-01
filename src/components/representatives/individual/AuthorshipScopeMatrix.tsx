import React, { useMemo } from 'react';
import type { RepresentativeData } from '../types';

interface Props {
  currentRep: RepresentativeData;
}

export const AuthorshipScopeMatrix: React.FC<Props> = ({ currentRep }) => {
  const matrix = useMemo(() => {
    let principalLocal = 0;
    let principalNational = 0;
    let coAuthorLocal = 0;
    let coAuthorNational = 0;

    currentRep.bills.forEach((b) => {
      const isPrincipal = (b.authorshipType || '').toLowerCase().includes('principal');
      const sig = (b.significance || '').toLowerCase().trim();
      const isLocal = sig === 'local';

      if (isPrincipal && isLocal) principalLocal++;
      else if (isPrincipal && !isLocal) principalNational++;
      else if (!isPrincipal && isLocal) coAuthorLocal++;
      else coAuthorNational++;
    });

    const total = currentRep.bills.length || 1;

    return {
      principalLocal: { count: principalLocal, pct: Number(((principalLocal / total) * 100).toFixed(1)) },
      principalNational: { count: principalNational, pct: Number(((principalNational / total) * 100).toFixed(1)) },
      coAuthorLocal: { count: coAuthorLocal, pct: Number(((coAuthorLocal / total) * 100).toFixed(1)) },
      coAuthorNational: { count: coAuthorNational, pct: Number(((coAuthorNational / total) * 100).toFixed(1)) },
      total,
    };
  }, [currentRep]);

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
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200/60">
            Strategy Quadrant
          </span>
          <h3 className="text-base font-bold text-slate-900 mt-1">
            Authorship & Scope Matrix
          </h3>
        </div>
        <span className="text-xs font-semibold text-slate-500">
          Initiative vs. Alignment
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
        {/* Quadrant 1: Principal + Local (Vinta Emerald) */}
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-tight">
              Principal + Local
            </span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              {matrix.principalLocal.pct}%
            </span>
          </div>
          <span className="text-2xl font-bold text-emerald-900 block">
            {matrix.principalLocal.count} <span className="text-xs font-semibold text-emerald-700">measures</span>
          </span>
          <p className="text-[11px] text-emerald-800 font-medium leading-relaxed">
            Direct district deliverables (local college conversions, hospital upgrades, local infrastructure).
          </p>
        </div>

        {/* Quadrant 2: Principal + National (Vinta Crimson/Rose) */}
        <div className="bg-rose-50/80 border border-rose-200/80 rounded p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-900 uppercase tracking-tight">
              Principal + National
            </span>
            <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
              {matrix.principalNational.pct}%
            </span>
          </div>
          <span className="text-2xl font-bold text-rose-900 block">
            {matrix.principalNational.count} <span className="text-xs font-semibold text-rose-700">measures</span>
          </span>
          <p className="text-[11px] text-rose-800 font-medium leading-relaxed">
            Member’s flagship national statutory reforms & countrywide policy agenda.
          </p>
        </div>

        {/* Quadrant 3: Co-Author + Local (Vinta Amber Gold) */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-tight">
              Co-Author + Local
            </span>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
              {matrix.coAuthorLocal.pct}%
            </span>
          </div>
          <span className="text-2xl font-bold text-amber-900 block">
            {matrix.coAuthorLocal.count} <span className="text-xs font-semibold text-amber-700">measures</span>
          </span>
          <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
            Supporting measures co-sponsored alongside neighboring district allies.
          </p>
        </div>

        {/* Quadrant 4: Co-Author + National (Vinta Ocean Sky) */}
        <div className="bg-sky-50/80 border border-sky-200/80 rounded p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-900 uppercase tracking-tight">
              Co-Author + National
            </span>
            <span className="text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
              {matrix.coAuthorNational.pct}%
            </span>
          </div>
          <span className="text-2xl font-bold text-sky-900 block">
            {matrix.coAuthorNational.count} <span className="text-xs font-semibold text-sky-700">measures</span>
          </span>
          <p className="text-[11px] text-sky-800 font-medium leading-relaxed">
            Broad coalition alignment & party voting bloc participation.
          </p>
        </div>
      </div>
    </div>
  );
};
