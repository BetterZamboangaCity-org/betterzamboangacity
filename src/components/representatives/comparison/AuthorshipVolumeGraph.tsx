import React, { useState } from 'react';
import l020Data from '../../../content/congressman/congresswoman_L020_bills.json';
import l095Data from '../../../content/congressman/congressman_L095_bills.json';

export const AuthorshipVolumeGraph: React.FC = () => {
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

  const d1 = {
    name: 'Rep. Katrina Reiko Chua-Tai',
    district: 'District 1 (West)',
    principal: l020Data.summary.principalAuthoredCount,
    coAuthored: l020Data.summary.coAuthoredCount,
    total: l020Data.summary.totalBills,
  };

  const d2 = {
    name: 'Rep. Jerry Evangelista Perez',
    district: 'District 2 (East)',
    principal: l095Data.summary.principalAuthoredCount,
    coAuthored: l095Data.summary.coAuthoredCount,
    total: l095Data.summary.totalBills,
  };

  const d1LeadPct = Math.round((d1.principal / d1.total) * 100);
  const d1CoPct = 100 - d1LeadPct;

  const d2LeadPct = Math.round((d2.principal / d2.total) * 100);
  const d2CoPct = 100 - d2LeadPct;

  const maxTotal = Math.max(d1.total, d2.total) || 1;
  const maxPrincipal = Math.max(d1.principal, d2.principal) || 1;
  const maxCoAuthored = Math.max(d1.coAuthored, d2.coAuthored) || 1;

  const renderRadialGauge = (leadPct: number, colorLead: string, colorCo: string, label: string) => {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${circumference} ${circumference}`;
    const leadOffset = circumference - (leadPct / 100) * circumference;

    return (
      <div className="relative flex flex-col items-center justify-center p-4 bg-white text-slate-900 rounded-[6px] border border-slate-200 shadow-xs">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            {/* Background ring */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              className="stroke-slate-100"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Co-Authored Arc */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke={colorCo}
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={0}
              className="transition-all duration-1000 opacity-30"
            />
            {/* Lead Sponsorship Arc */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke={colorLead}
              strokeWidth="10"
              strokeLinecap="round"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={leadOffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-slate-900 tracking-tight">{leadPct}%</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Principal Lead</span>
          </div>
        </div>
        <span className="text-xs font-black mt-2 text-slate-800">{label}</span>
      </div>
    );
  };

  const metrics = [
    {
      id: 'principal',
      title: 'Principal Authored Measures',
      d1Val: d1.principal,
      d2Val: d2.principal,
      maxVal: maxPrincipal,
    },
    {
      id: 'coauthored',
      title: 'Co-Authored Measures',
      d1Val: d1.coAuthored,
      d2Val: d2.coAuthored,
      maxVal: maxCoAuthored,
    },
    {
      id: 'total',
      title: 'Total Filed Volume',
      d1Val: d1.total,
      d2Val: d2.total,
      maxVal: maxTotal,
    },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Light Theme Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 text-slate-900 p-5 rounded-[6px] shadow-xs border border-slate-200">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 bg-blue-100 px-2.5 py-1 rounded border border-blue-200">
            Radial & Horizon Spectrum
          </span>
          <h3 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 mt-1.5">
            Authorship Composition & Dual-Polarity Spectrum
          </h3>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Radial Sponsorship Balance Gauges paired with a Center-Zero Diverging Horizon Meter.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-bold shrink-0 bg-white p-2.5 rounded border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-blue-600 shadow-xs" />
            <span className="text-blue-900">District 1</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-xs" />
            <span className="text-amber-900">District 2</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: Dual Radial Sponsorship Arc Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-[6px] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                District 1
              </span>
              <h4 className="text-sm font-black text-slate-900 mt-1">{d1.name}</h4>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-500 block">Total Volume</span>
              <span className="text-lg font-black text-slate-900">{d1.total}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-4 pt-2">
            {renderRadialGauge(d1LeadPct, '#2563eb', '#6366f1', d1.name)}
            <div className="space-y-3 text-xs font-semibold text-slate-700 grow">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600">Principal Authored</span>
                <span className="font-black text-blue-700 text-sm">{d1.principal} bills</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600">Co-Authored</span>
                <span className="font-black text-indigo-700 text-sm">{d1.coAuthored} bills</span>
              </div>
              <div className="p-2.5 bg-slate-100/80 rounded border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600">Sponsorship Ratio</span>
                <span className="font-bold text-slate-900">{d1LeadPct}% Lead / {d1CoPct}% Co</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[6px] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                District 2
              </span>
              <h4 className="text-sm font-black text-slate-900 mt-1">{d2.name}</h4>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-500 block">Total Volume</span>
              <span className="text-lg font-black text-slate-900">{d2.total}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-4 pt-2">
            {renderRadialGauge(d2LeadPct, '#d97706', '#f59e0b', d2.name)}
            <div className="space-y-3 text-xs font-semibold text-slate-700 grow">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600">Principal Authored</span>
                <span className="font-black text-amber-700 text-sm">{d2.principal} bills</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600">Co-Authored</span>
                <span className="font-black text-amber-900 text-sm">{d2.coAuthored} bills</span>
              </div>
              <div className="p-2.5 bg-slate-100/80 rounded border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600">Sponsorship Ratio</span>
                <span className="font-bold text-slate-900">{d2LeadPct}% Lead / {d2CoPct}% Co</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Light Theme Center-Zero Diverging Horizon Meter */}
      <div className="bg-white border border-slate-200 rounded-[6px] p-5 sm:p-6 shadow-xs space-y-6">
        <div>
          <h4 className="text-base font-black tracking-tight text-slate-900">
            Dual-Polarity Horizon Meter
          </h4>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Visualizing measure metrics extending outward from a centered zero axis point. Left wing represents District 1; right wing represents District 2.
          </p>
        </div>

        <div className="space-y-7">
          {metrics.map((m) => {
            const leftPct = Math.max(8, Math.round((m.d1Val / m.maxVal) * 100));
            const rightPct = Math.max(8, Math.round((m.d2Val / m.maxVal) * 100));
            const isHovered = hoveredMetric === m.id;

            return (
              <div
                key={m.id}
                onMouseEnter={() => setHoveredMetric(m.id)}
                onMouseLeave={() => setHoveredMetric(null)}
                className={`space-y-2 p-3 rounded transition-colors ${
                  isHovered ? 'bg-slate-50 border border-slate-200' : 'bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-black text-slate-700">
                  <span className="text-blue-700 font-bold">{m.d1Val} measures</span>
                  <span className="text-xs uppercase tracking-wider text-slate-900 font-black">{m.title}</span>
                  <span className="text-amber-700 font-bold">{m.d2Val} measures</span>
                </div>

                {/* Horizon Meter Track */}
                <div className="relative w-full h-6 bg-slate-100 rounded overflow-hidden flex items-center border border-slate-200">
                  {/* Center Line Axis */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-400 z-10 shadow-xs" />

                  {/* Left Half (District 1) */}
                  <div className="w-1/2 h-full flex justify-end items-center pr-0.5">
                    <div
                      style={{ width: `${leftPct}%` }}
                      className="h-4 bg-gradient-to-l from-blue-600 to-indigo-600 rounded-l transition-all duration-700 flex items-center justify-start pl-2 shadow-xs group"
                    >
                      <span className="text-[10px] font-black text-white">{m.d1Val}</span>
                    </div>
                  </div>

                  {/* Right Half (District 2) */}
                  <div className="w-1/2 h-full flex justify-start items-center pl-0.5">
                    <div
                      style={{ width: `${rightPct}%` }}
                      className="h-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded-r transition-all duration-700 flex items-center justify-end pr-2 shadow-xs group"
                    >
                      <span className="text-[10px] font-black text-white">{m.d2Val}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
