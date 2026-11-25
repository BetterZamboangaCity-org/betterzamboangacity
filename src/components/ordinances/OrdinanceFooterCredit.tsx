import React from 'react';
import { capturedFrom } from '../../content/snapshots/ordinances.manifest.json';

const LEY_DE_ZAMBOANGA_URL = 'https://zamboangacity-ordinance.vercel.app/';

export const OrdinanceFooterCredit: React.FC = () => {
  return (
    <div className="text-center py-4 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
      <div className="inline-flex items-center gap-1">
        <span>Snapshot captured {capturedFrom.slice(0, 10)} from</span>
        <a 
          href={LEY_DE_ZAMBOANGA_URL} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="font-bold text-[#0032A0] hover:underline inline-flex items-center gap-0.5"
        >
          <span>Ley De Zamboanga</span>
          <svg className="w-3 h-3 text-[#0032A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
      <div className="font-medium text-slate-600">
        Created & Maintained by <span className="font-bold text-slate-900">Chex</span>
      </div>
    </div>
  );
};
