import React, { useState, useMemo, useEffect } from 'react';
import type { Ordinance } from '../../types/ordinance';
import { fetchOrdinances } from '../../lib/supabase';
import { OrdinanceFilterSidebar } from './OrdinanceFilterSidebar';
import { OrdinanceTable } from './OrdinanceTable';
import { OrdinanceMobileCard } from './OrdinanceMobileCard';
import { OrdinancePreviewModal } from './OrdinancePreviewModal';
import { OrdinancePagination } from './OrdinancePagination';
import { OrdinanceFooterCredit } from './OrdinanceFooterCredit';

const LEY_DE_ZAMBOANGA_URL = 'https://zamboangacity-ordinance.vercel.app/';

// Convert category string to URL-safe slug
function toSlug(name: string): string {
  return name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Clean ordinance number for URL route e.g., "Ordinance No. 948" -> "948"
function cleanOrdinanceNum(numStr: string): string {
  if (!numStr) return '';
  return numStr.replace(/^Ordinance\s*(?:No\.?)?\s*/i, '').trim();
}

// Format string into formal Title Case
function toFormalTitleCase(str: string): string {
  if (!str) return '';
  if (/[a-z]/.test(str)) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const minorWords = new Set([
    'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet', 'with'
  ]);

  return str
    .toLowerCase()
    .split(' ')
    .map((word, index, arr) => {
      if (!word) return '';
      const isFirstOrLast = index === 0 || index === arr.length - 1;
      if (isFirstOrLast || !minorWords.has(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(' ');
}

// Date Formatter Helper
function formatDateStr(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

interface Props {
  initialCategory?: string;
}

export const OrdinanceExplorer: React.FC<Props> = ({ initialCategory = 'all' }) => {
  const [ordinances, setOrdinances] = useState<Ordinance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [sidebarMode, setSidebarMode] = useState<'categories' | 'years'>('categories');
  const [sortBy, setSortBy] = useState<'number-desc' | 'number-asc' | 'year-desc' | 'year-asc'>('number-desc');
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Active modal preview
  const [activeModalOrdinance, setActiveModalOrdinance] = useState<Ordinance | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const res = await fetchOrdinances();
      setOrdinances(res.data);
      setIsLoading(false);
    }
    loadData();
  }, []);

  // Compute Categories list with counts (excluding redundant regulatory category)
  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    ordinances.forEach((ord) => {
      (ord.categories || []).forEach((cat) => {
        const count = map.get(cat) || 0;
        map.set(cat, count + 1);
      });
    });
    return Array.from(map.entries())
      .filter(([name]) => {
        const slug = toSlug(name);
        return slug !== 'regulatory' && slug !== 'regulatory-ordinances' && slug !== 'regulatory-ordinance';
      })
      .map(([name, count]) => ({
        id: toSlug(name),
        name,
        count,
      }));
  }, [ordinances]);

  // Extract unique available years from dataset
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>();
    ordinances.forEach((ord) => {
      if (ord.ordinance_year) {
        yearsSet.add(String(ord.ordinance_year).trim());
      } else if (ord.date_approved) {
        try {
          const y = new Date(ord.date_approved).getFullYear();
          if (!isNaN(y)) yearsSet.add(String(y));
        } catch {
          // ignore
        }
      }
    });
    return Array.from(yearsSet).sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
  }, [ordinances]);

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
    setSelectedYear('all');
    setCurrentPage(1);
  };

  const handleYearSelect = (year: string) => {
    setSelectedYear(year);
    setSelectedCategory('all');
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Filter ordinances
  const filteredOrdinances = useMemo(() => {
    return ordinances.filter((ord) => {
      if (selectedCategory !== 'all' && selectedCategory !== 'regulatory') {
        if (selectedCategory === 'revenue') {
          const isRevenue = (ord.categories || []).some(cat => cat.toLowerCase().includes('tax') || cat.toLowerCase().includes('revenue'))
            || ord.official_title?.toLowerCase().includes('tax') || ord.official_title?.toLowerCase().includes('revenue') || ord.official_title?.toLowerCase().includes('fee');
          if (!isRevenue) return false;
        } else if (selectedCategory === 'appropriation') {
          const isAppropriation = (ord.categories || []).some(cat => cat.toLowerCase().includes('appropriat') || cat.toLowerCase().includes('budget'))
            || ord.official_title?.toLowerCase().includes('appropriat') || ord.official_title?.toLowerCase().includes('budget') || ord.official_title?.toLowerCase().includes('fund');
          if (!isAppropriation) return false;
        } else {
          const selectedSlug = toSlug(selectedCategory);
          const matchesCat = (ord.categories || []).some(
            (cat) => toSlug(cat) === selectedSlug || cat.toLowerCase() === selectedCategory.toLowerCase()
          );
          if (!matchesCat) return false;
        }
      }

      if (selectedYear !== 'all') {
        const ordYearStr = String(ord.ordinance_year || '').trim();
        const dateApprovedYearStr = ord.date_approved ? String(new Date(ord.date_approved).getFullYear()) : '';
        if (ordYearStr !== selectedYear && dateApprovedYearStr !== selectedYear) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const numMatch = ord.ordinance_number?.toLowerCase().includes(q);
        const titleMatch = ord.official_title?.toLowerCase().includes(q);
        const summaryMatch = ord.eli5_summary?.toLowerCase().includes(q);
        const catMatch = (ord.categories || []).some((cat) => cat.toLowerCase().includes(q));

        if (!numMatch && !titleMatch && !summaryMatch && !catMatch) {
          return false;
        }
      }

      return true;
    });
  }, [ordinances, selectedCategory, selectedYear, searchQuery]);

  // Sort ordinances
  const sortedOrdinances = useMemo(() => {
    return [...filteredOrdinances].sort((a, b) => {
      const numA = parseInt(cleanOrdinanceNum(a.ordinance_number), 10) || 0;
      const numB = parseInt(cleanOrdinanceNum(b.ordinance_number), 10) || 0;
      const yearA = parseInt(String(a.ordinance_year || 0), 10);
      const yearB = parseInt(String(b.ordinance_year || 0), 10);

      switch (sortBy) {
        case 'number-desc':
          return numB - numA;
        case 'number-asc':
          return numA - numB;
        case 'year-desc':
          return yearB - yearA;
        case 'year-asc':
          return yearA - yearB;
        default:
          return numB - numA;
      }
    });
  }, [filteredOrdinances, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(sortedOrdinances.length / itemsPerPage) || 1;
  const paginatedOrdinances = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedOrdinances.slice(start, start + itemsPerPage);
  }, [sortedOrdinances, currentPage, itemsPerPage]);

  const getExternalLink = (ord: Ordinance) => {
    const cleanNum = cleanOrdinanceNum(ord.ordinance_number);
    return cleanNum ? `${LEY_DE_ZAMBOANGA_URL}ordinance/${cleanNum}` : LEY_DE_ZAMBOANGA_URL;
  };

  return (
    <div className="w-full font-sans space-y-6">

      {/* MOBILE LAYOUT */}
      <div className="block lg:hidden w-full space-y-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3.5">
          {/* Mode Switch */}
          <div className="flex items-center justify-between p-1 bg-slate-100 rounded-lg border border-slate-200">
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

          {/* Tab Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none">
            <button
              onClick={() => {
                if (sidebarMode === 'categories') handleCategorySelect('all');
                else handleYearSelect('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                (sidebarMode === 'categories' && (selectedCategory === 'all' || selectedCategory === 'regulatory')) ||
                (sidebarMode === 'years' && selectedYear === 'all')
                  ? 'bg-[#0032A0] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>Overall</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 text-white font-bold">
                {ordinances.length}
              </span>
            </button>

            {sidebarMode === 'categories' &&
              categoryCounts.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#0032A0] text-white font-bold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#0032A0] text-white font-bold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{yr}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {yearCount}
                    </span>
                  </button>
                );
              })}
          </div>

          {/* Search Box */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search ordinances..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[#0032A0]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-50 text-slate-800 border border-slate-200 rounded-lg px-2 py-1 font-bold focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile Cards List */}
        <OrdinanceMobileCard
          ordinances={paginatedOrdinances}
          cleanOrdinanceNum={cleanOrdinanceNum}
          getExternalLink={getExternalLink}
          formatDateStr={formatDateStr}
          toFormalTitleCase={toFormalTitleCase}
          setActiveModalOrdinance={setActiveModalOrdinance}
        />
      </div>

      {/* DESKTOP UNIFIED CONTAINER CARD */}
      <div className="hidden lg:flex w-full bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex-row items-stretch">
        
        {/* LEFT VERTICAL TAB FILTER PANEL */}
        <OrdinanceFilterSidebar
          sidebarMode={sidebarMode}
          setSidebarMode={setSidebarMode}
          selectedCategory={selectedCategory}
          handleCategorySelect={handleCategorySelect}
          selectedYear={selectedYear}
          handleYearSelect={handleYearSelect}
          categoryCounts={categoryCounts}
          availableYears={availableYears}
          totalOrdinancesCount={ordinances.length}
          ordinances={ordinances}
        />

        {/* RIGHT DESKTOP TABLE AREA */}
        <div className="flex-1 w-full flex flex-col min-w-0">
          {/* Top Controls */}
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white text-slate-900 border border-slate-300 rounded px-2.5 py-1 font-bold shadow-xs focus:outline-none focus:ring-2 focus:ring-[#0032A0]"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>Entries per page</span>
            </div>

            {/* Search Box */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 w-full sm:w-auto">
              <span className="shrink-0">Search:</span>
              <div className="relative flex-1 sm:w-80">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search title, ordinance number..."
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-900 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[#0032A0] shadow-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* TABLE */}
          <OrdinanceTable
            ordinances={paginatedOrdinances}
            isLoading={isLoading}
            sortBy={sortBy}
            setSortBy={setSortBy}
            cleanOrdinanceNum={cleanOrdinanceNum}
            getExternalLink={getExternalLink}
            formatDateStr={formatDateStr}
            toFormalTitleCase={toFormalTitleCase}
            setActiveModalOrdinance={setActiveModalOrdinance}
            setSearchQuery={setSearchQuery}
            setSelectedCategory={setSelectedCategory}
            setSelectedYear={setSelectedYear}
          />

          {/* PAGINATION FOOTER */}
          <OrdinancePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalEntriesCount={sortedOrdinances.length}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>

      {/* Clean Footer Credit */}
      <OrdinanceFooterCredit />

      {/* LIGHT & CLEAN QUICK PREVIEW MODAL */}
      <OrdinancePreviewModal
        ordinance={activeModalOrdinance}
        onClose={() => setActiveModalOrdinance(null)}
        getExternalLink={getExternalLink}
        toFormalTitleCase={toFormalTitleCase}
      />
    </div>
  );
};

export default OrdinanceExplorer;
