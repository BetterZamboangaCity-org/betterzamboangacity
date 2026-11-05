import React, { useState, useMemo } from 'react';
import type { CityOfficial } from '../../lib/supabase';

interface Props {
  initialOfficials: CityOfficial[];
}

export const CityOfficialsDirectory: React.FC<Props> = ({ initialOfficials }) => {
  // Dynamically derive available election years from the database
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    initialOfficials.forEach((o) => {
      if (o.year) yearsSet.add(Number(o.year));
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [initialOfficials]);

  // Dynamically determine the latest election year in the dataset
  const latestYear = useMemo(() => availableYears[0] || 2025, [availableYears]);

  const [selectedYear, setSelectedYear] = useState<string>(String(latestYear));
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const filteredOfficials = useMemo(() => {
    return initialOfficials.filter((official) => {
      // Year filter
      if (selectedYear !== 'all' && String(official.year) !== selectedYear) {
        return false;
      }
      // Position filter
      if (selectedPosition !== 'all') {
        const posUpper = official.position.toUpperCase();
        if (selectedPosition === 'MAYOR' && !posUpper.includes('MAYOR')) return false;
        if (selectedPosition === 'MAYOR' && posUpper.includes('VICE')) return false;
        if (selectedPosition === 'VICE MAYOR' && !posUpper.includes('VICE')) return false;
        if (selectedPosition === 'COUNCILOR' && !posUpper.includes('COUNCILOR')) return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = official.fullName.toLowerCase().includes(q);
        const matchPos = official.position.toLowerCase().includes(q);
        const matchYr = String(official.year).includes(q);
        const matchDist = (official.district || '').toLowerCase().includes(q);
        return matchName || matchPos || matchYr || matchDist;
      }
      return true;
    });
  }, [initialOfficials, selectedYear, selectedPosition, searchQuery]);

  // Helper for official role rank (Mayor = 1, Vice Mayor = 2, Councilor = 3)
  const getRoleRank = (pos: string) => {
    const p = pos.toUpperCase();
    if (p.includes('MAYOR') && !p.includes('VICE')) return 1;
    if (p.includes('VICE')) return 2;
    if (p.includes('COUNCILOR')) return 3;
    return 4;
  };

  // Sort officials so Mayor is 1st, Vice Mayor is 2nd, and Councilors are 3rd
  const sortedOfficials = useMemo(() => {
    return [...filteredOfficials].sort((a, b) => {
      const rankA = getRoleRank(a.position);
      const rankB = getRoleRank(b.position);

      if (rankA !== rankB) {
        return rankA - rankB;
      }

      if (a.year !== b.year) {
        return b.year - a.year;
      }

      return a.fullName.localeCompare(b.fullName);
    });
  }, [filteredOfficials]);

  // Helper to resolve district key for grouping dynamically from official.district
  const getDistrictKey = (official: CityOfficial): 'executive' | 'district1' | 'district2' | 'other' => {
    const posUpper = official.position.toUpperCase();
    if (posUpper.includes('MAYOR')) return 'executive';

    if (official.district) {
      const dUpper = official.district.toUpperCase();
      if (dUpper.includes('DISTRICT 1') || dUpper.includes('1ST') || dUpper.includes('WEST')) return 'district1';
      if (dUpper.includes('DISTRICT 2') || dUpper.includes('2ND') || dUpper.includes('EAST')) return 'district2';
    }

    return 'other';
  };

  const getDistrictLabel = (official: CityOfficial): string => {
    if (official.district) return official.district;
    const key = getDistrictKey(official);
    if (key === 'executive') return 'City-wide';
    return 'City Council';
  };

  const formatPositionTitle = (pos: string) => {
    const p = pos.toUpperCase();
    if (p === 'MAYOR') return 'City Mayor';
    if (p === 'VICE MAYOR') return 'City Vice Mayor';
    if (p === 'COUNCILOR') return 'City Councilor';
    return pos;
  };

  // Dynamic Vinta flag color themes for Mayor, Vice Mayor, District 1, District 2
  const getThemeStyle = (official: CityOfficial) => {
    const posUpper = official.position.toUpperCase();
    
    if (posUpper.includes('MAYOR') && !posUpper.includes('VICE')) {
      // Mayor -> Amber / Gold Vinta Theme
      return {
        avatarBg: 'bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500',
        badgeBg: 'bg-amber-50 text-amber-900 border-amber-200/80',
        posText: 'text-amber-700',
        hover: 'hover:border-amber-300 hover:shadow-amber-500/5',
      };
    }

    if (posUpper.includes('VICE')) {
      // Vice Mayor -> Blue / Sky Vinta Theme
      return {
        avatarBg: 'bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600',
        badgeBg: 'bg-blue-50 text-blue-900 border-blue-200/80',
        posText: 'text-blue-700',
        hover: 'hover:border-blue-300 hover:shadow-blue-500/5',
      };
    }

    const districtKey = getDistrictKey(official);
    if (districtKey === 'district1') {
      // District 1 (West Coast) -> Emerald Green Vinta Theme
      return {
        avatarBg: 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600',
        badgeBg: 'bg-emerald-50 text-emerald-900 border-emerald-200/80',
        posText: 'text-emerald-700',
        hover: 'hover:border-emerald-300 hover:shadow-emerald-500/5',
      };
    }

    if (districtKey === 'district2') {
      // District 2 (East Coast) -> Purple / Indigo Vinta Theme
      return {
        avatarBg: 'bg-purple-50 text-purple-600 border-purple-100 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600',
        badgeBg: 'bg-purple-50 text-purple-900 border-purple-200/80',
        posText: 'text-purple-700',
        hover: 'hover:border-purple-300 hover:shadow-purple-500/5',
      };
    }

    // Fallback -> Slate / Blue
    return {
      avatarBg: 'bg-slate-50 text-slate-600 border-slate-100 group-hover:bg-slate-700 group-hover:text-white group-hover:border-slate-700',
      badgeBg: 'bg-slate-50 text-slate-800 border-slate-200',
      posText: 'text-slate-700',
      hover: 'hover:border-slate-300 hover:shadow-slate-500/5',
    };
  };

  // Dynamic Grouping for current election term district separation
  const currentTermGroups = useMemo(() => {
    if (selectedYear !== String(latestYear)) return null;

    const executive = sortedOfficials.filter(o => getDistrictKey(o) === 'executive');
    const district1 = sortedOfficials.filter(o => getDistrictKey(o) === 'district1');
    const district2 = sortedOfficials.filter(o => getDistrictKey(o) === 'district2');
    const other = sortedOfficials.filter(o => getDistrictKey(o) === 'other');

    return { executive, district1, district2, other };
  }, [selectedYear, latestYear, sortedOfficials]);

  // Card component renderer matching ServiceCard.astro design tokens and Vinta flag theme colors
  const renderCard = (official: CityOfficial, idx: number) => {
    // Only current/latest term records display pictures & district metadata
    const isCurrentTerm = Number(official.year) === latestYear;
    const theme = getThemeStyle(official);

    return (
      <div
        key={`card-${official.fullName}-${official.year}-${idx}`}
        className={`bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between group h-full relative rounded-[4px] ${theme.hover}`}
      >
        {isCurrentTerm ? (
          /* CURRENT TERM CARD FORMAT (ServiceCard design with Vinta flag color themes) */
          <div>
            {/* Top Row: Profile Photo Container & District Badge */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center border transition-colors duration-200 shrink-0 rounded-[4px] overflow-hidden ${theme.avatarBg}`}>
                {official.photoUrl ? (
                  <img
                    src={official.photoUrl}
                    alt={official.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM12 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                )}
              </div>

              <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border rounded-[2px] shrink-0 ${theme.badgeBg}`}>
                {getDistrictLabel(official)}
              </span>
            </div>

            {/* Position Title */}
            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${theme.posText}`}>
              {formatPositionTitle(official.position)}
            </p>

            {/* Official Name */}
            <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-snug mb-3">
              {official.fullName}
            </h3>
          </div>
        ) : (
          /* PAST TERM CARD FORMAT (ServiceCard design, without photo or district) */
          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className={`text-xs font-bold uppercase tracking-wider ${theme.posText}`}>
                {formatPositionTitle(official.position)}
              </p>
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border rounded-[2px] bg-slate-50 text-slate-700 border-slate-200">
                {official.year} Election
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-snug mb-3">
              {official.fullName}
            </h3>
          </div>
        )}

        {/* Action / Footer Row (ServiceCard footer) */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-600">
          <span>
            {isCurrentTerm ? 'Term' : 'Term Year'}: <strong className="text-slate-900 font-bold">{isCurrentTerm ? `${official.year}–${official.year + 3}` : official.year}</strong>
          </span>
          <span className="text-[11px] text-slate-400 font-mono">Zamboanga City</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* FILTER CONTROLS BAR */}
      <div className="bg-white rounded-[4px] p-5 border border-slate-200/90 shadow-xs space-y-4">
        
        {/* YEAR SELECTION TABS */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Select Election Year:
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedYear('all')}
              className={`px-3 py-1.5 rounded-[2px] text-xs font-bold transition-all ${
                selectedYear === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Years ({availableYears[availableYears.length - 1] || 2001}–{latestYear})
            </button>
            {availableYears.map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(String(yr))}
                className={`px-3 py-1.5 rounded-[2px] text-xs font-bold transition-all ${
                  selectedYear === String(yr)
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {yr} Election
              </button>
            ))}
          </div>
        </div>

        {/* SEARCH AND POSITION FILTERS */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          
          {/* SEARCH BOX */}
          <div className="relative flex-1 max-w-md">
            <svg className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search official by name or position..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-[2px] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-900 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* POSITION FILTER TABS & VIEW MODE TOGGLE */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <div className="flex items-center bg-slate-100 p-1 rounded-[2px]">
              <button
                onClick={() => setSelectedPosition('all')}
                className={`px-3 py-1 text-xs font-bold rounded-[2px] transition-colors ${
                  selectedPosition === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Roles
              </button>
              <button
                onClick={() => setSelectedPosition('MAYOR')}
                className={`px-3 py-1 text-xs font-bold rounded-[2px] transition-colors ${
                  selectedPosition === 'MAYOR' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mayor
              </button>
              <button
                onClick={() => setSelectedPosition('VICE MAYOR')}
                className={`px-3 py-1 text-xs font-bold rounded-[2px] transition-colors ${
                  selectedPosition === 'VICE MAYOR' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Vice Mayor
              </button>
              <button
                onClick={() => setSelectedPosition('COUNCILOR')}
                className={`px-3 py-1 text-xs font-bold rounded-[2px] transition-colors ${
                  selectedPosition === 'COUNCILOR' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Councilors
              </button>
            </div>

            {/* VIEW MODE TOGGLE */}
            <div className="flex items-center bg-slate-100 p-1 rounded-[2px] shrink-0">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-[2px] transition-colors ${
                  viewMode === 'cards' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Grid Cards View"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-[2px] transition-colors ${
                  viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Table View"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RESULTS STATS BAR */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-900 font-bold">{sortedOfficials.length}</strong> official records
          {selectedYear !== 'all' ? ` for Election Year ${selectedYear}` : ' across all election years'}
        </span>
        {searchQuery && (
          <span className="text-blue-600 font-semibold">
            Filtered by search "{searchQuery}"
          </span>
        )}
      </div>

      {/* NO RESULTS STATE */}
      {sortedOfficials.length === 0 && (
        <div className="bg-white border border-slate-200/90 rounded-[4px] p-12 text-center space-y-3">
          <h3 className="text-base font-bold text-slate-800">No Officials Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No official records matched your search parameters. Try clearing your filters or selecting a different election year.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedYear('all');
              setSelectedPosition('all');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-[2px] text-xs font-bold hover:bg-blue-700 transition-colors inline-block"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* CARDS GRID VIEW */}
      {viewMode === 'cards' && sortedOfficials.length > 0 && (
        <>
          {/* CURRENT TERM WITH DISTRICT SEPARATION */}
          {currentTermGroups ? (
            <div className="space-y-8">
              {/* Executive Leadership */}
              {currentTermGroups.executive.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      Executive Leadership
                    </h3>
                    <span className="text-xs font-extrabold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-[2px] border border-amber-200/80 uppercase tracking-wider">
                      City-wide
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentTermGroups.executive.map((official, idx) => renderCard(official, idx))}
                  </div>
                </div>
              )}

              {/* District 1 — West Coast */}
              {currentTermGroups.district1.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      District 1 — West Coast
                    </h3>
                    <span className="text-xs font-extrabold text-emerald-900 bg-emerald-50 px-2.5 py-0.5 rounded-[2px] border border-emerald-200/80 uppercase tracking-wider">
                      {currentTermGroups.district1.length} Councilors
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentTermGroups.district1.map((official, idx) => renderCard(official, idx))}
                  </div>
                </div>
              )}

              {/* District 2 — East Coast */}
              {currentTermGroups.district2.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      District 2 — East Coast
                    </h3>
                    <span className="text-xs font-extrabold text-purple-900 bg-purple-50 px-2.5 py-0.5 rounded-[2px] border border-purple-200/80 uppercase tracking-wider">
                      {currentTermGroups.district2.length} Councilors
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentTermGroups.district2.map((official, idx) => renderCard(official, idx))}
                  </div>
                </div>
              )}

              {/* Other Councilors if unassigned */}
              {currentTermGroups.other.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      City Councilors
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentTermGroups.other.map((official, idx) => renderCard(official, idx))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* PAST TERMS OR ALL YEARS (Single grid, ordered by Mayor -> Vice Mayor -> Councilors) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedOfficials.map((official, idx) => renderCard(official, idx))}
            </div>
          )}
        </>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && sortedOfficials.length > 0 && (
        <div className="bg-white rounded-[4px] border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Official Name</th>
                  <th className="py-3 px-4">Position</th>
                  {selectedYear === String(latestYear) && <th className="py-3 px-4">District</th>}
                  <th className="py-3 px-4">Election Year</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {sortedOfficials.map((official, idx) => (
                  <tr
                    key={`tbl-${official.fullName}-${official.year}-${idx}`}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                      {official.fullName}
                    </td>
                    <td className="py-3 px-4 font-semibold text-blue-900">
                      {formatPositionTitle(official.position)}
                    </td>
                    {selectedYear === String(latestYear) && (
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {getDistrictLabel(official)}
                      </td>
                    )}
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {official.year}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DATA ATTRIBUTION & CREDIT FOOTER NOTE */}
      <div className="bg-slate-100 rounded-[4px] p-4 border border-slate-200/90 text-slate-600 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-10">
        <div className="space-y-1">
          <p className="font-semibold text-slate-800">
            Data Source & Attribution: Commission on Elections (COMELEC) Winners Registry
          </p>
          <p className="text-slate-500">
            Compiled and standardized via the OpenHalalan Project by Robert R. Leung.
          </p>
        </div>
        <a
          href="https://robertrleung.github.io/OpenHalalan"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:text-blue-700 hover:border-blue-300 font-bold text-xs rounded-[2px] shadow-xs transition-colors shrink-0"
        >
          <span>OpenHalalan Project</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

    </div>
  );
};
