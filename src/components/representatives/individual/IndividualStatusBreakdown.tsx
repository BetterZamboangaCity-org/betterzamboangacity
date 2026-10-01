import React, { useMemo } from 'react';
import type { RepresentativeData } from '../types';

interface Props {
  currentRep: RepresentativeData;
  onSelectStatusFilter?: (statusKeyword: string) => void;
}

export const IndividualStatusBreakdown: React.FC<Props> = ({
  currentRep,
  onSelectStatusFilter,
}) => {
  const stats = useMemo(() => {
    let pending = 0;
    let commApproved = 0;
    let floorPassed = 0;
    let senateBicam = 0;
    let enactedRA = 0;

    currentRep.bills.forEach((b) => {
      const status = (b.billStatus || '').toLowerCase();
      const historyText = (b.history?.fullHistoryText || '').toLowerCase();

      const isRA = status.includes('republic act') || historyText.includes('republic act');
      const isSenate =
        status.includes('transmitted to the senate') ||
        status.includes('received by the senate') ||
        status.includes('bicameral') ||
        historyText.includes('transmitted to the senate');

      const isFloor =
        isRA ||
        isSenate ||
        status.includes('approved by the house') ||
        status.includes('passed by the house') ||
        status.includes('approved on third reading') ||
        historyText.includes('approved on third reading');

      const isComm =
        isFloor ||
        status.includes('approved by the committee') ||
        status.includes('substituted by') ||
        status.includes('twg') ||
        status.includes('deliberated upon') ||
        historyText.includes('approved by the committee');

      if (isRA) enactedRA++;
      else if (isSenate) senateBicam++;
      else if (isFloor) floorPassed++;
      else if (isComm) commApproved++;
      else pending++;
    });

    const total = currentRep.bills.length || 1;

    return [
      { key: 'pending', label: 'Pending in Committee', count: pending, color: '#64748b', query: 'pending' },
      { key: 'commApproved', label: 'Committee Approved / Report', count: commApproved, color: '#0284c7', query: 'approved by the committee' },
      { key: 'floorPassed', label: 'Passed 2nd / 3rd Reading', count: floorPassed, color: '#d97706', query: 'third reading' },
      { key: 'senateBicam', label: 'Transmitted to Senate / Bicam', count: senateBicam, color: '#c026d3', query: 'senate' },
      { key: 'enactedRA', label: 'Enacted into Law (Republic Act)', count: enactedRA, color: '#10b981', query: 'republic act' },
    ].map((item) => ({
      ...item,
      percentage: Number(((item.count / total) * 100).toFixed(1)),
    }));
  }, [currentRep]);

  const totalBills = currentRep.bills.length;

  // SVG Donut Calculations
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let accumulatedDashOffset = 0;

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
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200/60">
            Procedural Pipeline
          </span>
          <h3 className="text-base font-bold text-slate-900 mt-1">
            Legislative Status Breakdown
          </h3>
        </div>
        <span className="text-xs font-semibold text-slate-500">
          {totalBills} Total Measures
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center pt-1">
        {/* SVG Donut Graphic */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="16" />
              {stats.map((s) => {
                const strokeDasharray = (s.percentage / 100) * circumference;
                const strokeDashoffset = -accumulatedDashOffset;
                accumulatedDashOffset += strokeDasharray;

                if (s.count === 0) return null;

                return (
                  <circle
                    key={s.key}
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke={s.color}
                    strokeWidth="16"
                    strokeDasharray={`${strokeDasharray} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-700 cursor-pointer hover:opacity-85"
                    onClick={() => onSelectStatusFilter && onSelectStatusFilter(s.query)}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">{totalBills}</span>
              <span className="text-[10px] uppercase font-semibold text-slate-500">Filed Measures</span>
            </div>
          </div>
        </div>

        {/* Status Breakdown Legend & Interactive Pills */}
        <div className="sm:col-span-7 space-y-2 text-xs font-medium">
          {stats.map((s) => (
            <div
              key={s.key}
              onClick={() => onSelectStatusFilter && onSelectStatusFilter(s.query)}
              className="flex items-center justify-between p-2 rounded hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
            >
              <div className="flex items-center gap-2.5 truncate">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-slate-800 font-semibold truncate">{s.label}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-bold text-slate-900">{s.count}</span>
                <span className="text-[11px] text-slate-500">({s.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
