import React from 'react';
import type { RepresentativeData } from './types';

interface RepresentativeHeaderBannerProps {
  currentRep: RepresentativeData;
  onBack: () => void;
}

export const RepresentativeHeaderBanner: React.FC<RepresentativeHeaderBannerProps> = ({
  currentRep,
  onBack,
}) => {
  return (
    <div className="space-y-4 font-sans">
      {/* Top Header: Back Button & Congress Badge */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-700 bg-white hover:bg-slate-100 border border-slate-300 px-3.5 py-2 rounded-[4px] shadow-xs transition-colors"
        >
          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Representative Profiles</span>
        </button>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-[2px] border border-slate-200">
          20th Congress (2025–Present)
        </span>
      </div>

      {/* Representative Profile Details Header Banner */}
      <div className="relative bg-white border border-slate-200 rounded-[4px] p-6 sm:p-7 shadow-xs overflow-hidden">
        {/* Top Solid Vinta Flag Multicolor Accent Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex overflow-hidden">
          <div className="w-[16.66%] h-full bg-[#c084fc]" />
          <div className="w-[16.66%] h-full bg-[#38bdf8]" />
          <div className="w-[16.66%] h-full bg-[#4ade80]" />
          <div className="w-[16.66%] h-full bg-[#e11d48]" />
          <div className="w-[16.66%] h-full bg-[#fca5a5]" />
          <div className="w-[16.66%] h-full bg-[#fbbf24]" />
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src={`/images/representatives/${currentRep.profile.memberId}.jpg`}
            alt={`Photo of ${currentRep.profile.name}`}
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-[4px] object-cover object-top border-2 border-slate-200 shadow-sm shrink-0"
          />

          <div className="space-y-3 text-center sm:text-left grow">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-[2px] border border-blue-200 inline-block mb-1.5">
                {currentRep.profile.districtInfo}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {currentRep.profile.name}
              </h2>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-lg bg-slate-50 border border-slate-200/90 rounded-[4px] p-3 text-center divide-x divide-slate-200">
              <div>
                <span className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-tight">Principal Authored</span>
                <span className="block text-xl sm:text-2xl font-black text-blue-700 mt-0.5">
                  {currentRep.summary.principalAuthoredCount}
                </span>
              </div>
              <div>
                <span className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-tight">Co-Authored</span>
                <span className="block text-xl sm:text-2xl font-black text-indigo-700 mt-0.5">
                  {currentRep.summary.coAuthoredCount}
                </span>
              </div>
              <div>
                <span className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-tight">Total Bills</span>
                <span className="block text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  {currentRep.summary.totalBills}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
