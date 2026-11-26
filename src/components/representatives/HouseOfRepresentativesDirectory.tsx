import React, { useState, useMemo, useEffect } from 'react';
import l020Data from '../../content/congressman/congresswoman_L020_bills.json';
import l095Data from '../../content/congressman/congressman_L095_bills.json';
import type { Bill, RepresentativeData } from './types';
import { RepresentativeProfileCards } from './RepresentativeProfileCards';
import { RepresentativeHeaderBanner } from './RepresentativeHeaderBanner';
import { BillCardItem } from './BillCardItem';
import { BillHistoryModal } from './BillHistoryModal';
import { RepresentativeComparisonGraphs } from './comparison/RepresentativeComparisonGraphs';
import { RepresentativeIndividualAnalytics } from './individual/RepresentativeIndividualAnalytics';

const repsData: Record<string, RepresentativeData> = {
  L020: l020Data as unknown as RepresentativeData,
  L095: l095Data as unknown as RepresentativeData,
};

interface DirectoryProps {
  initialMemberId?: 'L020' | 'L095';
}

export const HouseOfRepresentativesDirectory: React.FC<DirectoryProps> = ({
  initialMemberId,
}) => {
  const [selectedRepId, setSelectedRepId] = useState<string | null>(initialMemberId || null);
  const [authorshipFilter, setAuthorshipFilter] = useState<'principal' | 'coauthor' | 'all'>('principal');
  const [significanceFilter, setSignificanceFilter] = useState<'all' | 'local' | 'national'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [historyModalBill, setHistoryModalBill] = useState<Bill | null>(null);

  const pageSize = 10;
  const currentRep = selectedRepId ? repsData[selectedRepId] : null;

  useEffect(() => {
    if (initialMemberId) {
      setSelectedRepId(initialMemberId);
    } else if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const district = params.get('district');
      const rep = params.get('rep');
      if (district === 'district-2' || rep === 'L095') {
        setSelectedRepId('L095');
      } else if (district === 'district-1' || rep === 'L020') {
        setSelectedRepId('L020');
      }
    }
  }, [initialMemberId]);

  // Reset pagination when filters or selected rep change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRepId, authorshipFilter, significanceFilter, searchQuery]);

  const filteredBills = useMemo(() => {
    if (!currentRep) return [];
    return currentRep.bills.filter((bill) => {
      // Authorship filter
      if (authorshipFilter === 'principal') {
        if (!bill.authorshipType.toLowerCase().includes('principal')) return false;
      } else if (authorshipFilter === 'coauthor') {
        if (!bill.authorshipType.toLowerCase().includes('co-authored')) return false;
      }

      // Significance filter
      if (significanceFilter === 'local') {
        if (bill.significance.toLowerCase() !== 'local') return false;
      } else if (significanceFilter === 'national') {
        if (bill.significance.toLowerCase() !== 'national') return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchBillNo = bill.billNo.toLowerCase().includes(q);
        const matchTitle = bill.fullTitle.toLowerCase().includes(q);
        const matchReferral = bill.primaryReferral.toLowerCase().includes(q);
        const matchStatus = bill.billStatus.toLowerCase().includes(q);
        const matchAuthors = bill.principalAuthors.toLowerCase().includes(q);
        return matchBillNo || matchTitle || matchReferral || matchStatus || matchAuthors;
      }

      return true;
    });
  }, [currentRep, authorshipFilter, significanceFilter, searchQuery]);

  const totalPages = Math.ceil(filteredBills.length / pageSize) || 1;
  const paginatedBills = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBills.slice(start, start + pageSize);
  }, [filteredBills, currentPage]);

  // If no representative is selected, show ONLY the 2 profile cards view with header
  if (!selectedRepId || !currentRep) {
    return (
      <div className="space-y-8 font-sans">
        {/* Page Header (rendered ONLY when viewing the 2 profile cards) */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            <span className="text-[#0032A0]">House of</span> <span className="text-amber-500">Representatives</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            Select a District Representative below to explore their complete legislative records, principal authored bills, co-authored bills, and official bill history.
          </p>
        </div>

        <RepresentativeProfileCards
          onSelectRepresentative={(id) => {
            setSelectedRepId(id);
            setAuthorshipFilter('principal');
          }}
          showDisclaimer={false}
        />

        {/* Dynamic 3-Tab Public Records Comparison Visualizer Container */}
        <RepresentativeComparisonGraphs />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      <style>{`
        @keyframes tabFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Top Banner & Header */}
      <RepresentativeHeaderBanner
        currentRep={currentRep}
        onBack={() => setSelectedRepId(null)}
      />

      {/* Individual Analytics Graphs */}
      <RepresentativeIndividualAnalytics
        currentRep={currentRep}
        onSelectStatusFilter={(keyword) => setSearchQuery(keyword)}
      />

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-[4px] p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Authorship Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-[4px] border border-slate-200/80">
            <button
              type="button"
              onClick={() => setAuthorshipFilter('principal')}
              className={`px-4 py-1.5 text-xs font-bold rounded-[2px] transition-all duration-200 ease-out transform active:scale-95 ${authorshipFilter === 'principal'
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200 scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
            >
              Principal Authored ({currentRep.summary.principalAuthoredCount})
            </button>
            <button
              type="button"
              onClick={() => setAuthorshipFilter('coauthor')}
              className={`px-4 py-1.5 text-xs font-bold rounded-[2px] transition-all duration-200 ease-out transform active:scale-95 ${authorshipFilter === 'coauthor'
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200 scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
            >
              Co-Authored ({currentRep.summary.coAuthoredCount})
            </button>
            <button
              type="button"
              onClick={() => setAuthorshipFilter('all')}
              className={`px-4 py-1.5 text-xs font-bold rounded-[2px] transition-all duration-200 ease-out transform active:scale-95 ${authorshipFilter === 'all'
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200 scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
            >
              All Bills ({currentRep.summary.totalBills})
            </button>
          </div>

          {/* Right: Scope Filter & Search Input */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Scope Select */}
            <div className="flex items-center gap-2 shrink-0">
              <label htmlFor="significance-select" className="text-xs font-bold text-slate-600 uppercase tracking-tight">
                Scope:
              </label>
              <select
                id="significance-select"
                value={significanceFilter}
                onChange={(e) => setSignificanceFilter(e.target.value as any)}
                className="bg-white border border-slate-300 text-xs font-semibold text-slate-800 rounded-[2px] px-2.5 py-1.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="all">All</option>
                <option value="local">Local</option>
                <option value="national">National</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64 lg:w-72">
              <input
                type="text"
                aria-label="Search bills"
                placeholder="Search bill no, title, committee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-[2px] focus:ring-2 focus:ring-blue-600 focus:outline-none text-slate-900 placeholder-slate-400"
              />
              <svg
                className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear bill search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold px-1"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Info Counter */}
        <div className="flex items-center justify-between text-xs font-medium text-slate-600 pt-1 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-900">{filteredBills.length}</strong> {filteredBills.length === 1 ? 'bill' : 'bills'} for{' '}
            <strong className="text-blue-700">{currentRep.profile.name}</strong>
          </span>
          {filteredBills.length > 0 && (
            <span>
              Page {currentPage} of {totalPages}
            </span>
          )}
        </div>
      </div>

      {/* Bills List Container with Animated Smooth Transitions */}
      <div
        key={`${selectedRepId}-${authorshipFilter}-${significanceFilter}-${searchQuery}-${currentPage}`}
        style={{ animation: 'tabFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
        className="space-y-6"
      >
        {paginatedBills.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-[4px] p-8 text-center space-y-3">
            <p className="text-slate-600 font-medium text-sm">
              No bills found matching your current filter criteria.
            </p>
            <button
              type="button"
              onClick={() => {
                setAuthorshipFilter('all');
                setSignificanceFilter('all');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-blue-600 hover:underline inline-block"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          paginatedBills.map((bill) => (
            <BillCardItem
              key={bill.billNo}
              bill={bill}
              onOpenHistory={(targetBill) => setHistoryModalBill(targetBill)}
            />
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200 rounded-[4px] p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-600">
            Page <strong className="text-slate-900">{currentPage}</strong> of{' '}
            <strong className="text-slate-900">{totalPages}</strong> ({filteredBills.length} total bills)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-[2px] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>

            {/* Quick Page Selector */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = currentPage;
                if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;

                if (pageNum < 1 || pageNum > totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 text-xs font-bold rounded-[2px] transition-colors ${currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-[2px] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Individual Representative Profile Data & Graphs Disclaimer */}
      <div className="bg-white border border-slate-200 rounded-[6px] p-5 sm:p-6 shadow-xs text-slate-800 space-y-4 relative overflow-hidden font-sans">
        {/* Top Solid Vinta Flag Multicolor Accent Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex overflow-hidden">
          <div className="w-[16.66%] h-full bg-[#c084fc]" />
          <div className="w-[16.66%] h-full bg-[#38bdf8]" />
          <div className="w-[16.66%] h-full bg-[#4ade80]" />
          <div className="w-[16.66%] h-full bg-[#e11d48]" />
          <div className="w-[16.66%] h-full bg-[#fca5a5]" />
          <div className="w-[16.66%] h-full bg-[#fbbf24]" />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <img
              src="/images/house-representatives-seal.png"
              alt="House of Representatives Philippines Seal"
              className="w-10 h-10 sm:w-11 sm:h-11 object-contain shrink-0"
            />
            <div>
              <h4 className="text-base font-bold text-slate-900 tracking-tight">
                Individual Legislative Data & Visualizer Disclaimer
              </h4>
              <span className="text-xs font-semibold text-blue-700">
                Member Profile Records · {currentRep.profile.name} (20th Congress)
              </span>
            </div>
          </div>

          <a
            href="https://www.congress.gov.ph/house-members"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded-[4px] transition-colors shrink-0 shadow-xs"
          >
            <span>Official Profile Record</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
          The individual legislative graphs and bill records displayed above reflect the official public filings of <strong>{currentRep.profile.name}</strong>, aggregated directly from the public database of the House of Representatives of the Philippines (<code className="text-blue-700 font-semibold">congress.gov.ph</code>).
        </p>

        {/* 4 Individual Graphs Explanation Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="bg-slate-50 border border-slate-200/80 rounded p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200/60 inline-block">
              Status Breakdown
            </span>
            <p className="text-[11px] text-slate-600 leading-normal font-medium">
              Categorizes measures into 5 procedural reading stages based on official House committee logs and reading action text.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 inline-block">
              Authorship & Scope Matrix
            </span>
            <p className="text-[11px] text-slate-600 leading-normal font-medium">
              Cross-references lead sponsorship (Principal Author) vs supporting co-authorship across District (Local) and Countrywide (National) scope.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60 inline-block">
              Policy Portfolio
            </span>
            <p className="text-[11px] text-slate-600 leading-normal font-medium">
              Groups measures by primary committee referral to reveal domain concentration across standing committees.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/60 inline-block">
              Filing Cadence & Velocity
            </span>
            <p className="text-[11px] text-slate-600 leading-normal font-medium">
              Displays monthly measure filing velocity along the Congressional term timeline.
            </p>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 font-medium leading-relaxed border-t border-slate-100 pt-2.5">
          * Note: Legislative tracking reflects statutory document filings only. Unindexed records such as General Appropriations Act (GAA) budget allocations, district office casework, committee leadership roles, or floor speeches are not cataloged in official bill repositories.
        </p>
      </div>

      {/* Refactored Light Theme Bill History Modal */}
      <BillHistoryModal
        bill={historyModalBill}
        onClose={() => setHistoryModalBill(null)}
      />
    </div>
  );
};
