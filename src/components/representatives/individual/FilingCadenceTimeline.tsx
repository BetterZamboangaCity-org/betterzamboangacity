import React, { useMemo } from 'react';
import type { RepresentativeData } from '../types';

interface Props {
  currentRep: RepresentativeData;
}

export const FilingCadenceTimeline: React.FC<Props> = ({ currentRep }) => {
  const timelineData = useMemo(() => {
    const monthlyCounts: Record<string, number> = {};

    currentRep.bills.forEach((b) => {
      const dateStr = b.dateFiled || '';
      if (!dateStr || dateStr.length < 7) return;
      const monthKey = dateStr.substring(0, 7); // e.g. "2025-07", "2025-08"
      monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1;
    });

    const sortedMonths = Object.keys(monthlyCounts).sort();

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const items = sortedMonths.map((month) => {
      const [year, m] = month.split('-');
      const monthName = monthNames[parseInt(m, 10) - 1];
      const fullMonthLabel = `${monthName} ${year}`;
      return {
        monthKey: month,
        monthLabel: fullMonthLabel,
        count: monthlyCounts[month],
      };
    });

    return items;
  }, [currentRep]);

  const maxMonthlyCount = Math.max(...timelineData.map((d) => d.count), 1);
  const totalBills = currentRep.bills.length;
  const activeMonths = timelineData.length || 1;
  const avgPerMonth = (totalBills / activeMonths).toFixed(1);

  // Vinta Solid Single Color Palette per Bar (No Gradients)
  const vintaSolidColors = [
    { bg: 'bg-[#0284c7]', text: 'text-[#0284c7]' }, // Ocean Cyan
    { bg: 'bg-[#e11d48]', text: 'text-[#e11d48]' }, // Crimson Rose
    { bg: 'bg-[#d97706]', text: 'text-[#d97706]' }, // Amber Gold
    { bg: 'bg-[#10b981]', text: 'text-[#10b981]' }, // Emerald Green
    { bg: 'bg-[#9333ea]', text: 'text-[#9333ea]' }, // Vinta Purple
    { bg: 'bg-[#06b6d4]', text: 'text-[#06b6d4]' }, // Teal Blue
    { bg: 'bg-[#f43f5e]', text: 'text-[#f43f5e]' }, // Magenta
  ];

  // Realistic Y-axis gridline benchmarks
  const midPoint = Math.round(maxMonthlyCount / 2);

  // Calculate dynamic min-width based on count of months (each gets 130px)
  const dynamicMinWidth = Math.max(600, timelineData.length * 130);

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
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200/60">
            Filing Velocity
          </span>
          <h3 className="text-base font-bold text-slate-900 mt-1">
            Legislative Cadence & Activity Timeline
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
          <span>Active Months: <strong className="text-slate-900">{activeMonths}</strong></span>
          <span>•</span>
          <span>Avg: <strong className="text-rose-700">{avgPerMonth} bills/mo</strong></span>
        </div>
      </div>

      <p className="text-xs text-slate-500 font-medium leading-relaxed">
        Chronological distribution of measure filings across the Congressional timeline. Scroll horizontally to view full activity across all active months.
      </p>

      {/* Realistic Bar Chart Container with Horizontal Scroll */}
      <div className="bg-slate-50/70 border border-slate-200 rounded-[4px] p-4 sm:p-5 pt-8 overflow-x-auto">
        <div style={{ minWidth: `${dynamicMinWidth}px` }} className="relative space-y-2">

          {/* Y-Axis Horizontal Grid Benchmark Lines */}
          <div className="absolute inset-0 top-8 bottom-10 pointer-events-none flex flex-col justify-between text-[10px] font-semibold text-slate-400">
            <div className="border-b border-dashed border-slate-200 w-full flex justify-between items-center pr-2">
              <span className="bg-slate-50/90 px-1 text-slate-400 font-bold">{maxMonthlyCount}</span>
            </div>
            <div className="border-b border-dashed border-slate-200 w-full flex justify-between items-center pr-2">
              <span className="bg-slate-50/90 px-1 text-slate-400">{midPoint}</span>
            </div>
            <div className="border-b border-slate-300 w-full flex justify-between items-center pr-2">
              <span className="bg-slate-50/90 px-1 text-slate-500 font-bold">0</span>
            </div>
          </div>

          {/* Realistic Bars Container */}
          <div className="h-44 flex items-end justify-around gap-6 border-b-2 border-slate-300 pb-0.5 px-4 pt-6 relative z-10">
            {timelineData.map((item, idx) => {
              const heightPct = Math.max(10, Math.round((item.count / maxMonthlyCount) * 100));
              const theme = vintaSolidColors[idx % vintaSolidColors.length];

              return (
                <div
                  key={idx}
                  className="w-[120px] shrink-0 flex flex-col items-center justify-end h-full group relative"
                >
                  {/* Hover Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 absolute -top-10 bg-slate-900 text-white text-[11px] font-semibold px-3 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-30">
                    {item.monthLabel}: <strong className="text-amber-400 font-bold">{item.count} measures</strong>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                  </div>

                  {/* Top Bar Number Badge */}
                  <span className={`text-[11px] font-bold ${theme.text} mb-1.5 group-hover:scale-110 transition-transform`}>
                    {item.count}
                  </span>

                  {/* Solid Color Realistic Bar */}
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-12 ${theme.bg} rounded-t-[4px] transition-all duration-300 group-hover:opacity-90 shadow-xs border-t border-x border-black/10 cursor-pointer`}
                  />
                </div>
              );
            })}
          </div>

          {/* X-Axis Full Month & Year Labels - NO TRUNCATION */}
          <div className="flex justify-around text-[11px] font-bold text-slate-800 px-4 pt-2 pb-1 relative z-10">
            {timelineData.map((item, idx) => (
              <span key={idx} className="w-[120px] shrink-0 text-center whitespace-nowrap font-bold text-slate-800">
                {item.monthLabel}
              </span>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};
