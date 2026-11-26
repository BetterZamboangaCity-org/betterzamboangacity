import React from 'react';
import l020Data from '../../content/congressman/congresswoman_L020_bills.json';
import l095Data from '../../content/congressman/congressman_L095_bills.json';

export interface RepresentativeCardProps {
  memberId: string;
  districtSlug: string;
  name: string;
  districtTitle: string;
  districtSubtitle: string;
  photoUrl: string;
  summary: {
    totalBills: number;
    principalAuthoredCount: number;
    coAuthoredCount: number;
  };
  vintaGradient: string;
  badgeBg: string;
  badgeText: string;
}

const representatives: RepresentativeCardProps[] = [
  {
    memberId: 'L020',
    districtSlug: 'district-1',
    name: 'Chua-Tai, Katrina Reiko',
    districtTitle: 'District 1 Representative',
    districtSubtitle: 'Zamboanga City, 1st District (West District)',
    photoUrl: '/images/representatives/L020.jpg',
    summary: l020Data.summary,
    vintaGradient: 'from-[#c084fc] via-[#38bdf8] to-[#4ade80]',
    badgeBg: 'bg-blue-50 border-blue-200',
    badgeText: 'text-blue-800',
  },
  {
    memberId: 'L095',
    districtSlug: 'district-2',
    name: 'Perez, Jerry Evangelista',
    districtTitle: 'District 2 Representative',
    districtSubtitle: 'Zamboanga City, 2nd District (East District)',
    photoUrl: '/images/representatives/L095.jpg',
    summary: l095Data.summary,
    vintaGradient: 'from-[#4ade80] via-[#38bdf8] to-[#fbbf24]',
    badgeBg: 'bg-amber-50 border-amber-200',
    badgeText: 'text-amber-900',
  },
];

export interface RepresentativeProfileCardsProps {
  selectedMemberId?: string;
  onSelectRepresentative?: (memberId: string) => void;
  showDisclaimer?: boolean;
}

export const RepresentativeProfileCards: React.FC<RepresentativeProfileCardsProps> = ({
  selectedMemberId,
  onSelectRepresentative,
  showDisclaimer = true,
}) => {
  return (
    <div className="space-y-8 font-sans">
      {/* Vinta Pastel Header Stripe Accent */}
      <div className="w-full h-1.5 flex rounded-t-[4px] overflow-hidden shadow-xs">
        <div className="w-[16.66%] h-full bg-[#c084fc]" />
        <div className="w-[16.66%] h-full bg-[#38bdf8]" />
        <div className="w-[16.66%] h-full bg-[#4ade80]" />
        <div className="w-[16.66%] h-full bg-[#e11d48]" />
        <div className="w-[16.66%] h-full bg-[#fca5a5]" />
        <div className="w-[16.66%] h-full bg-[#fbbf24]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {representatives.map((rep) => {
          const isSelected = selectedMemberId === rep.memberId;

          const CardContent = (
            <>
              {/* Top Solid Vinta Flag Multicolor Accent Stripe */}
              <div className="h-1.5 w-full flex overflow-hidden">
                <div className="w-[16.66%] h-full bg-[#c084fc]" />
                <div className="w-[16.66%] h-full bg-[#38bdf8]" />
                <div className="w-[16.66%] h-full bg-[#4ade80]" />
                <div className="w-[16.66%] h-full bg-[#e11d48]" />
                <div className="w-[16.66%] h-full bg-[#fca5a5]" />
                <div className="w-[16.66%] h-full bg-[#fbbf24]" />
              </div>

              {/* Photo + Info Section */}
              <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 grow">
                {/* Representative Photo Container */}
                <div className="relative shrink-0">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-[4px] overflow-hidden border-2 border-slate-200 group-hover:border-blue-500 shadow-sm transition-colors bg-slate-100 relative">
                    <img
                      src={rep.photoUrl}
                      alt={`Photo of Rep. ${rep.name}`}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                    {/* Subtle Vinta Ribbon on Photo Corner */}
                    <div className="absolute top-0 right-0 w-7 h-7 pointer-events-none opacity-80">
                      <div className="w-full h-full bg-gradient-to-bl from-blue-600 to-transparent" />
                    </div>
                  </div>

                  {/* Badge underneath photo */}
                  <div className="mt-2 text-center">
                    <span className="text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-[2px] border border-slate-200 block">
                      20th Congress
                    </span>
                  </div>
                </div>

                {/* Profile Details Content */}
                <div className="flex flex-col justify-between grow space-y-3.5 text-center sm:text-left w-full min-w-0">
                  <div>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                      <span className={`inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-[2px] border ${rep.badgeBg} ${rep.badgeText}`}>
                        {rep.districtTitle}
                      </span>
                      {isSelected && (
                        <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-[2px]">
                          Active Representative
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight group-hover:text-blue-700 transition-colors">
                      {rep.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                      {rep.districtSubtitle}
                    </p>
                  </div>

                  {/* Statistics Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-200/80 rounded-[4px] p-3 text-center divide-x divide-slate-200">
                    <div className="px-0.5">
                      <span className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-tight whitespace-nowrap">Principal</span>
                      <span className="block text-lg sm:text-xl font-black text-blue-700 mt-0.5">
                        {rep.summary.principalAuthoredCount}
                      </span>
                    </div>
                    <div className="px-0.5">
                      <span className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-tight whitespace-nowrap">Co-Authored</span>
                      <span className="block text-lg sm:text-xl font-black text-indigo-700 mt-0.5">
                        {rep.summary.coAuthoredCount}
                      </span>
                    </div>
                    <div className="px-0.5">
                      <span className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-tight whitespace-nowrap">Total Bills</span>
                      <span className="block text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                        {rep.summary.totalBills}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full-Width Bottom Footer Bar */}
              <div className="bg-slate-50 border-t border-slate-200/80 px-5 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 text-xs">
                <span className="font-semibold text-slate-600 flex items-center gap-1.5 shrink-0">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1e-5M9 11h1e-5M9 15h1e-5M15 7h1e-5M15 11h1e-5M15 15h1e-5" />
                  </svg>
                  <span className="whitespace-nowrap">House of Representatives</span>
                </span>

                <span className={`inline-flex items-center gap-1.5 font-extrabold transition-colors shrink-0 ${isSelected ? 'text-emerald-700' : 'text-blue-600 group-hover:text-blue-800'}`}>
                  <span className="whitespace-nowrap">{isSelected ? 'Currently Viewing Record' : 'Select to View Record & Bills'}</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </div>
            </>
          );

          if (onSelectRepresentative) {
            return (
              <div
                key={rep.memberId}
                className={`group relative bg-white border rounded-[4px] transition-all duration-300 flex flex-col overflow-hidden cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-600/20 shadow-md'
                    : 'border-slate-200 hover:border-blue-500 shadow-xs hover:shadow-xl'
                }`}
              >
                {CardContent}
                <button
                  type="button"
                  onClick={() => onSelectRepresentative(rep.memberId)}
                  aria-label={`View records for ${rep.name}`}
                  className="absolute inset-0 rounded-[4px] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-blue-600"
                />
              </div>
            );
          }

          return (
            <a
              key={rep.memberId}
              href={`/zamboanga-city/house-of-representatives?district=${rep.districtSlug}`}
              className="group relative bg-white border border-slate-200 hover:border-blue-500 rounded-[4px] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {CardContent}
            </a>
          );
        })}
      </div>

      {/* Data Source & Web Scraping Disclaimer Banner */}
      {showDisclaimer && (
        <div className="bg-white border border-slate-200 rounded-[4px] p-5 sm:p-6 shadow-xs text-slate-800 space-y-3 relative overflow-hidden">
          {/* Top Solid Vinta Flag Multicolor Accent Stripe */}
          <div className="absolute top-0 left-0 right-0 h-1.5 flex overflow-hidden">
            <div className="w-[16.66%] h-full bg-[#c084fc]" />
            <div className="w-[16.66%] h-full bg-[#38bdf8]" />
            <div className="w-[16.66%] h-full bg-[#4ade80]" />
            <div className="w-[16.66%] h-full bg-[#e11d48]" />
            <div className="w-[16.66%] h-full bg-[#fca5a5]" />
            <div className="w-[16.66%] h-full bg-[#fbbf24]" />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-3">
              {/* Official House of Representatives Philippines Seal Emblem */}
              <img
                src="/images/house-representatives-seal.png"
                alt="House of Representatives Philippines Seal"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain shrink-0"
              />
              <div>
                <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  Data Source & Web Scraping Disclaimer
                </h4>
                <span className="text-[11px] font-semibold text-blue-700">
                  Public Records Transparency · 20th Congress of the Philippines
                </span>
              </div>
            </div>

            <a
              href="https://www.congress.gov.ph/house-members"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded-[4px] transition-colors shrink-0 shadow-xs"
            >
              <span>Official Directory</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            The legislative profiles, measures, and bill histories published on this portal are aggregated via automated public web scraping directly from the official{' '}
            <a
              href="https://www.congress.gov.ph/house-members"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-blue-700 underline hover:text-blue-900 transition-colors"
            >
              House of Representatives Philippines Directory
            </a>
            . Because source data is extracted automatically, synchronization delays or format changes from the source website may occasionally result in incomplete or inaccurate data. For official legal or legislative verification, please consult the source site directly.
          </p>
        </div>
      )}
    </div>
  );
};
