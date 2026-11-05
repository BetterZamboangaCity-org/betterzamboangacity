import React from 'react';
import type { Ordinance } from '../../types/ordinance';

interface CategoryCountItem {
  id: string;
  name: string;
  count: number;
}

interface Props {
  sidebarMode: 'categories' | 'years';
  setSidebarMode: (mode: 'categories' | 'years') => void;
  selectedCategory: string;
  handleCategorySelect: (slug: string) => void;
  selectedYear: string;
  handleYearSelect: (year: string) => void;
  categoryCounts: CategoryCountItem[];
  availableYears: string[];
  totalOrdinancesCount: number;
  ordinances: Ordinance[];
}

export const OrdinanceFilterSidebar: React.FC<Props> = ({
  sidebarMode,
  setSidebarMode,
  selectedCategory,
  handleCategorySelect,
  selectedYear,
  handleYearSelect,
  categoryCounts,
  availableYears,
  totalOrdinancesCount,
  ordinances,
}) => {
  return (
    <div className="w-72 xl:w-80 bg-slate-50 border-r border-slate-200 p-4 shrink-0 flex flex-col space-y-3.5">
      {/* Mode Switch */}
      <div className="flex items-center justify-between p-1 bg-slate-200/70 rounded-lg border border-slate-200">
        <button
          onClick={() => setSidebarMode('categories')}
          className={`flex-1 py-1.5 text-xs font-bold rounded transition-all ${
            sidebarMode === 'categories'
              ? 'bg-[#0032A0] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Categories
        </button>
        <button
          onClick={() => setSidebarMode('years')}
          className={`flex-1 py-1.5 text-xs font-bold rounded transition-all ${
            sidebarMode === 'years'
              ? 'bg-[#0032A0] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Years
        </button>
      </div>

      {/* Vertical Tabs List */}
      <div className="space-y-1 max-h-[75vh] overflow-y-auto pr-1">
        <button
          onClick={() => {
            if (sidebarMode === 'categories') handleCategorySelect('all');
            else handleYearSelect('all');
          }}
          className={`w-full text-left px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-between ${
            (sidebarMode === 'categories' && (selectedCategory === 'all' || selectedCategory === 'regulatory')) ||
            (sidebarMode === 'years' && selectedYear === 'all')
              ? 'bg-[#0032A0] text-white shadow-xs font-bold'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/60'
          }`}
        >
          <span>Overall Directory</span>
          <span className="text-xs px-2 py-0.5 rounded bg-white/20 text-white font-bold">
            {totalOrdinancesCount}
          </span>
        </button>

        {sidebarMode === 'categories' &&
          categoryCounts.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`w-full text-left px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-[#0032A0] text-white font-bold'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                <span className="truncate">{cat.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded font-bold shrink-0 ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {cat.count}
                </span>
              </button>
            );
          })}

        {sidebarMode === 'years' &&
          availableYears.map((yr) => {
            const isSelected = selectedYear === yr;
            const yearCount = ordinances.filter(
              (o) => String(o.ordinance_year) === yr || (o.date_approved && String(new Date(o.date_approved).getFullYear()) === yr)
            ).length;

            return (
              <button
                key={yr}
                onClick={() => handleYearSelect(yr)}
                className={`w-full text-left px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#0032A0] text-white font-bold'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                <span>Year {yr}</span>
                <span className={`text-xs px-2 py-0.5 rounded font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {yearCount}
                </span>
              </button>
            );
          })}
      </div>
    </div>
  );
};
