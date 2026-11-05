import React, { useState, useMemo, useEffect } from 'react';
import { fetchBarangays, type Barangay } from '../../lib/supabase';

interface Props {
  initialBarangays?: Barangay[];
}

export const BarangayExplorer: React.FC<Props> = ({ initialBarangays = [] }) => {
  const [barangays, setBarangays] = useState<Barangay[]>(initialBarangays);
  const [isLoading, setIsLoading] = useState<boolean>(initialBarangays.length === 0);
  const [selectedDistrict, setSelectedDistrict] = useState<'all' | '1' | '2'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    if (initialBarangays.length > 0) return;
    async function loadData() {
      setIsLoading(true);
      const res = await fetchBarangays();
      setBarangays(res.data);
      setIsLoading(false);
    }
    loadData();
  }, [initialBarangays]);

  const district1Count = useMemo(() => barangays.filter((b) => b.district === 1).length, [barangays]);
  const district2Count = useMemo(() => barangays.filter((b) => b.district === 2).length, [barangays]);

  // Filter logic on state data
  const filteredBarangays = useMemo(() => {
    return barangays.filter((b) => {
      // District filter
      if (selectedDistrict === '1' && b.district !== 1) return false;
      if (selectedDistrict === '2' && b.district !== 2) return false;

      // Category filter
      if (selectedCategory !== 'all' && b.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = b.name.toLowerCase().includes(q);
        const addressMatch = (b.hallAddress || '').toLowerCase().includes(q);
        const coastMatch = b.coast.toLowerCase().includes(q);

        if (!nameMatch && !addressMatch && !coastMatch) {
          return false;
        }
      }

      return true;
    });
  }, [selectedDistrict, selectedCategory, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredBarangays.length / itemsPerPage) || 1;
  const paginatedBarangays = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBarangays.slice(start, start + itemsPerPage);
  }, [filteredBarangays, currentPage, itemsPerPage]);

  return (
    <div className="w-full font-sans space-y-6">

      {/* FULL-WIDTH CONTAINER CARD WITH INTEGRATED FILTERS TOOLBAR */}
      <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">

        {/* INTEGRATED TOP CONTROLS & FILTERS STRIP */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-4">
          
          {/* LEFT: DISTRICT & CATEGORY DROPDOWN FILTERS */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-700 w-full lg:w-auto">
            
            {/* Legislative District Dropdown Filter */}
            <div className="flex items-center gap-1.5">
              <span className="shrink-0 text-slate-500 font-extrabold">District:</span>
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value as 'all' | '1' | '2');
                  setCurrentPage(1);
                }}
                className="bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2 font-bold shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0032A0]"
              >
                <option value="all">All 98 Barangays</option>
                <option value="1">District 1 (West Coast · {district1Count})</option>
                <option value="2">District 2 (East Coast · {district2Count})</option>
              </select>
            </div>

            {/* Settlement Category Dropdown Filter */}
            <div className="flex items-center gap-1.5">
              <span className="shrink-0 text-slate-500 font-extrabold">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white text-slate-900 border border-slate-300 rounded-xl px-3 py-2 font-bold shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0032A0]"
              >
                <option value="all">All Categories</option>
                <option value="Urban">Urban</option>
                <option value="Suburban">Suburban</option>
                <option value="Rural">Rural</option>
                <option value="Island">Island</option>
              </select>
            </div>

            {/* Show Entries Selector */}
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="shrink-0 text-slate-500 font-extrabold">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white text-slate-900 border border-slate-300 rounded-xl px-2.5 py-2 font-bold shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0032A0]"
              >
                <option value={12}>12 cards</option>
                <option value={24}>24 cards</option>
                <option value={48}>48 cards</option>
                <option value={98}>98 (All)</option>
              </select>
            </div>

          </div>

          {/* RIGHT: SEARCH BAR INPUT */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 w-full lg:w-80">
            <span className="shrink-0 text-slate-500 font-extrabold">Search:</span>
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search barangay by name, coast..."
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[#0032A0] shadow-2xs"
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

        {/* BARANGAYS CARDS GRID ONLY (RESPONSIVE GRID) */}
        <div className="p-4 sm:p-6 flex-1 bg-slate-50/30">
          {paginatedBarangays.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {paginatedBarangays.map((b) => (
                <a
                  key={b.id}
                  href={`/government/barangays?slug=${b.slug}`}
                  className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group cursor-pointer"
                >
                  {/* Mini Vinta 6-Color Accent Ribbon Bar */}
                  <div className="h-1.5 w-full flex">
                    <div className="flex-1 bg-[#c084fc]"></div>
                    <div className="flex-1 bg-[#38bdf8]"></div>
                    <div className="flex-1 bg-[#4ade80]"></div>
                    <div className="flex-1 bg-[#475569]"></div>
                    <div className="flex-1 bg-[#fca5a5]"></div>
                    <div className="flex-1 bg-[#fde047]"></div>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Top Badges: District & Category */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        b.district === 1 
                          ? 'bg-amber-50 text-amber-900 border-amber-300' 
                          : 'bg-blue-50 text-[#0032A0] border-blue-300'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${b.district === 1 ? 'bg-amber-600' : 'bg-blue-600'}`}></span>
                        District {b.district} · {b.coast}
                      </span>

                      <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {b.category}
                      </span>
                    </div>

                    {/* Barangay Title */}
                    <div>
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-[#0032A0] transition-colors leading-tight">
                        Barangay {b.name}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-400 font-medium">ZIP Code {b.zipCode}</span>
                    </div>

                    {/* Info Metadata */}
                    <div className="space-y-2 text-xs text-slate-700 font-medium pt-1">
                      <div className="flex items-start gap-2">
                        <svg className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span className="truncate">{b.hallAddress || 'Zamboanga City'}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>2024 Population: <strong className="text-slate-900 font-bold">{b.population || '—'}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Link Hint */}
                  <div className="px-5 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500 group-hover:bg-blue-50/50 transition-colors">
                    <span>View Official Page</span>
                    <span className="font-bold text-[#0032A0] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      <span>Explore</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-slate-500 font-medium space-y-2">
              <p className="text-base font-bold text-slate-700">No barangays found</p>
              <p className="text-xs text-slate-500">Try adjusting your search terms or selecting a different district.</p>
            </div>
          )}
        </div>

        {/* PAGINATION FOOTER */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-600">
          <div>
            Showing <strong className="text-slate-900">{filteredBarangays.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</strong> to{' '}
            <strong className="text-slate-900">{Math.min(currentPage * itemsPerPage, filteredBarangays.length)}</strong> of{' '}
            <strong className="text-slate-900">{filteredBarangays.length}</strong> barangays
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
            >
              Previous
            </button>
            <span className="px-3 font-bold text-slate-800">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
            >
              Next
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default BarangayExplorer;
