import React, { useState } from 'react';

interface PopularSearch {
  label: string;
  query: string;
  type: 'document' | 'heart' | 'briefcase' | 'medical';
}

const popularSearches: PopularSearch[] = [
  { label: 'Birth Certificate', query: 'birth certificate', type: 'document' },
  { label: 'Marriage Certificate', query: 'marriage certificate', type: 'heart' },
  { label: 'Business Permit', query: 'business permit', type: 'briefcase' },
  { label: 'Health Certificate', query: 'health certificate', type: 'medical' },
];

const mockServices = [
  { id: '1', title: 'Civil Registry & Birth Certificate', category: 'Certificates & Vital Records', link: '/services?q=birth' },
  { id: '2', title: 'Business Permit Application & Renewal', category: 'Business & Trade', link: '/services?q=business' },
  { id: '3', title: 'Marriage License Request', category: 'Certificates & Vital Records', link: '/services?q=marriage' },
  { id: '4', title: 'Health Clearance & Sanitary Permit', category: 'Health & Wellness', link: '/services?q=health' },
  { id: '5', title: 'Real Property Tax Online Payment', category: 'Finance & Taxation', link: '/services?q=tax' },
];

export const ServiceSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const filteredServices = searchTerm.trim()
    ? mockServices.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleSelectPopular = (query: string) => {
    setSearchTerm(query);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/services?search=${encodeURIComponent(searchTerm)}`;
    }
  };

  // Clean vector SVG icons for popular search items (No emojis!)
  const renderIcon = (type: PopularSearch['type']) => {
    switch (type) {
      case 'document':
        return (
          <svg className="w-3.5 h-3.5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'heart':
        return (
          <svg className="w-3.5 h-3.5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'briefcase':
        return (
          <svg className="w-3.5 h-3.5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7h-4V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v3H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM10 4h4v3h-4V4z" />
          </svg>
        );
      case 'medical':
        return (
          <svg className="w-3.5 h-3.5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        );
    }
  };

  return (
    <div suppressHydrationWarning className="bg-white p-6 sm:p-8 shadow-2xl shadow-blue-900/10 border border-slate-200 max-w-lg w-full font-sans rounded-[4px]">
      {/* Search Box Title Header */}
      <div className="flex items-center gap-2.5 mb-5 text-slate-800 font-bold text-lg sm:text-xl">
        <div className="w-8 h-8 bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 rounded-[4px]">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <span>Find a Service</span>
      </div>

      {/* Search Input Form */}
      <form onSubmit={handleSearchSubmit} className="relative mb-6">
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="e.g., birth certificate, business permit..."
            className="w-full pl-4 pr-12 py-3.5 sm:py-4 bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all rounded-[4px]"
            aria-label="Search for city services"
          />
          
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-14 text-slate-400 hover:text-slate-600 p-1 rounded-[2px]"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <button
            type="submit"
            className="absolute right-2 p-2.5 sm:p-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-[4px]"
            aria-label="Submit search"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {/* Dynamic Instant Search Suggestions Overlay */}
        {isFocused && filteredServices.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 shadow-xl z-50 overflow-hidden divide-y divide-slate-100 rounded-[4px]">
            <div className="px-4 py-2 bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Matching Services ({filteredServices.length})
            </div>
            {filteredServices.map(service => (
              <a
                key={service.id}
                href={service.link}
                className="block px-4 py-2.5 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="text-xs font-semibold text-slate-800">{service.title}</div>
                <div className="text-[10px] text-blue-600 font-medium">{service.category}</div>
              </a>
            ))}
          </div>
        )}
      </form>

      {/* Popular Searches Section */}
      <div>
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
          Popular Searches
        </div>
        <div className="flex flex-wrap gap-2">
          {popularSearches.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleSelectPopular(item.query)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold border transition-all rounded-[2px] ${
                searchTerm.toLowerCase() === item.query.toLowerCase()
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
              }`}
            >
              {renderIcon(item.type)}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceSearch;
