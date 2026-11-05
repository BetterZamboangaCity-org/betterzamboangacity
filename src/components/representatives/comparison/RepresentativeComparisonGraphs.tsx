import React, { useState, useMemo } from 'react';
import { LegislativePipelineGraph } from './LegislativePipelineGraph';
import { AuthorshipWeightGraph } from './AuthorshipWeightGraph';
import { CommitteeFocusGraph } from './CommitteeFocusGraph';

import l020Data from '../../../content/congressman/congresswoman_L020_bills.json';
import l095Data from '../../../content/congressman/congressman_L095_bills.json';

export const RepresentativeComparisonGraphs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'authorship' | 'committees'>('pipeline');
  const [showMethodology, setShowMethodology] = useState<boolean>(false);

  const tableMetrics = useMemo(() => {
    const calcSummary = (data: typeof l020Data) => {
      const total = data.bills.length || 1;
      const principal = data.bills.filter((b) =>
        (b.authorshipType || '').toLowerCase().includes('principal')
      );
      const totalPrincipal = principal.length || 1;

      let commApproved = 0;
      let floorPassed = 0;
      let enactedRA = 0;
      let local = 0;

      principal.forEach((b) => {
        const status = (b.billStatus || '').toLowerCase();
        const historyText = (b.history?.fullHistoryText || '').toLowerCase();

        const isRA = status.includes('republic act') || historyText.includes('republic act');
        const isFloor =
          isRA ||
          status.includes('approved by the house') ||
          status.includes('passed by the house') ||
          status.includes('approved on third reading') ||
          historyText.includes('approved on third reading');

        const isComm =
          isFloor ||
          status.includes('approved by the committee') ||
          status.includes('substituted by') ||
          status.includes('twg') ||
          historyText.includes('approved by the committee');

        if (isComm) commApproved++;
        if (isFloor) floorPassed++;
        if (isRA) enactedRA++;
      });

      data.bills.forEach((b) => {
        if ((b.significance || '').toLowerCase().trim() === 'local') local++;
      });

      // Top committee calculation
      const committees: Record<string, number> = {};
      data.bills.forEach((b) => {
        const comm = (b.primaryReferral || 'UNSPECIFIED').toUpperCase().trim();
        committees[comm] = (committees[comm] || 0) + 1;
      });
      const topCommEntry = Object.entries(committees).sort((a, b) => b[1] - a[1])[0];
      const topCommName = topCommEntry ? topCommEntry[0] : 'Basic Education';

      return {
        totalAssociated: total,
        totalPrincipal,
        principalRatio: ((totalPrincipal / total) * 100).toFixed(1),
        commRate: ((commApproved / totalPrincipal) * 100).toFixed(1),
        floorRate: ((floorPassed / totalPrincipal) * 100).toFixed(1),
        enactmentYield: ((enactedRA / totalPrincipal) * 100).toFixed(1),
        localRatio: ((local / total) * 100).toFixed(1),
        nationalRatio: (((total - local) / total) * 100).toFixed(1),
        topCommName,
      };
    };

    return {
      d1: calcSummary(l020Data),
      d2: calcSummary(l095Data as any),
    };
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-[6px] shadow-xs overflow-hidden font-sans space-y-0">
      {/* Vinta Pastel Header Stripe Accent */}
      <div className="w-full h-1.5 flex overflow-hidden">
        <div className="w-[16.66%] h-full bg-[#c084fc]" />
        <div className="w-[16.66%] h-full bg-[#38bdf8]" />
        <div className="w-[16.66%] h-full bg-[#4ade80]" />
        <div className="w-[16.66%] h-full bg-[#e11d48]" />
        <div className="w-[16.66%] h-full bg-[#fca5a5]" />
        <div className="w-[16.66%] h-full bg-[#fbbf24]" />
      </div>

      {/* Main Container Header */}
      <div className="p-5 sm:p-6 border-b border-slate-200/80 bg-slate-50/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-[2px]">
                Percentage-Normalized Comparative Visualizer
              </span>
              <span className="text-[11px] font-bold text-slate-500">20th Congress</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Legislative Efficiency & Policy Focus Overview
            </h2>
          </div>
        </div>

        {/* 1. NON-PARTISAN COMPARATIVE METRICS SUMMARY TABLE */}
        <div className="overflow-x-auto border border-slate-200 rounded-[4px] bg-white shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-tight">
                <th className="p-3 border-r border-slate-200">Comparative Dimension</th>
                <th className="p-3 border-r border-slate-200 text-blue-800 bg-blue-50/60">
                  District 1 (Katrina Chua-Tai)
                </th>
                <th className="p-3 text-amber-900 bg-amber-50/60">
                  District 2 (Jerry Perez)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3 border-r border-slate-200 font-bold text-slate-900">
                  Active Authorship (Lead Ratio)
                </td>
                <td className="p-3 border-r border-slate-200 font-black text-blue-700">
                  {tableMetrics.d1.principalRatio}% ({tableMetrics.d1.totalPrincipal} / {tableMetrics.d1.totalAssociated})
                </td>
                <td className="p-3 font-black text-amber-800">
                  {tableMetrics.d2.principalRatio}% ({tableMetrics.d2.totalPrincipal} / {tableMetrics.d2.totalAssociated})
                </td>
              </tr>

              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3 border-r border-slate-200 font-bold text-slate-900">
                  Committee Conversion Rate (%)
                </td>
                <td className="p-3 border-r border-slate-200 font-black text-blue-700">
                  {tableMetrics.d1.commRate}%
                </td>
                <td className="p-3 font-black text-amber-800">
                  {tableMetrics.d2.commRate}%
                </td>
              </tr>

              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3 border-r border-slate-200 font-bold text-slate-900">
                  Floor Passage Rate (%)
                </td>
                <td className="p-3 border-r border-slate-200 font-black text-blue-700">
                  {tableMetrics.d1.floorRate}%
                </td>
                <td className="p-3 font-black text-amber-800">
                  {tableMetrics.d2.floorRate}%
                </td>
              </tr>

              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3 border-r border-slate-200 font-bold text-slate-900">
                  Statutory Enactment Yield (%)
                </td>
                <td className="p-3 border-r border-slate-200 font-black text-blue-700">
                  {tableMetrics.d1.enactmentYield}%
                </td>
                <td className="p-3 font-black text-amber-800">
                  {tableMetrics.d2.enactmentYield}%
                </td>
              </tr>

              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3 border-r border-slate-200 font-bold text-slate-900">
                  Local vs. National Policy Share
                </td>
                <td className="p-3 border-r border-slate-200 font-black text-blue-700">
                  {tableMetrics.d1.localRatio}% Local / {tableMetrics.d1.nationalRatio}% National
                </td>
                <td className="p-3 font-black text-amber-800">
                  {tableMetrics.d2.localRatio}% Local / {tableMetrics.d2.nationalRatio}% National
                </td>
              </tr>

              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3 border-r border-slate-200 font-bold text-slate-900">
                  Primary Domain Concentration
                </td>
                <td className="p-3 border-r border-slate-200 font-bold text-slate-800">
                  {tableMetrics.d1.topCommName}
                </td>
                <td className="p-3 font-bold text-slate-800">
                  {tableMetrics.d2.topCommName}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 3-Tab Container Navigation Bar */}
        <div className="pt-2">
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/70 rounded-[4px] border border-slate-300/70">
            <button
              type="button"
              onClick={() => setActiveTab('pipeline')}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-[2px] transition-all duration-200 ease-out transform active:scale-95 grow sm:grow-0 justify-center ${
                activeTab === 'pipeline'
                  ? 'bg-white text-blue-800 shadow-sm border border-slate-200 scale-[1.01]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              Pipeline & Conversion Rates
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('authorship')}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-[2px] transition-all duration-200 ease-out transform active:scale-95 grow sm:grow-0 justify-center ${
                activeTab === 'authorship'
                  ? 'bg-white text-blue-800 shadow-sm border border-slate-200 scale-[1.01]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              Authorship Weight & Policy Balance
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('committees')}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-[2px] transition-all duration-200 ease-out transform active:scale-95 grow sm:grow-0 justify-center ${
                activeTab === 'committees'
                  ? 'bg-white text-blue-800 shadow-sm border border-slate-200 scale-[1.01]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              Primary Committee Referrals
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content Display */}
      <div className="p-5 sm:p-6 bg-slate-50/30">
        <div key={activeTab} className="animate-fadeIn">
          {activeTab === 'pipeline' && <LegislativePipelineGraph />}
          {activeTab === 'authorship' && <AuthorshipWeightGraph />}
          {activeTab === 'committees' && <CommitteeFocusGraph />}
        </div>
      </div>

      {/* Comprehensive Methodology & Data Disclaimer Footer */}
      <div className="bg-slate-50 border-t border-slate-200 p-5 sm:p-6 space-y-4 text-xs font-sans text-slate-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-3.5">
          <div className="flex items-center gap-3">
            <img
              src="/images/house-representatives-seal.png"
              alt="House of Representatives Philippines Seal"
              className="w-10 h-10 sm:w-11 sm:h-11 object-contain shrink-0"
            />
            <div>
              <h4 className="text-base font-bold text-slate-900 tracking-tight">
                Data & Context Disclaimer
              </h4>
              <span className="text-xs font-semibold text-blue-700">
                Public Record & Non-Partisan Notice · 20th Congress of the Philippines
              </span>
            </div>
          </div>

          <a
            href="https://www.congress.gov.ph/house-members"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-blue-700 bg-white hover:bg-blue-50 border border-slate-200 rounded-[4px] transition-colors shrink-0 shadow-xs"
          >
            <span>Official House Directory</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
          This visualizer is an independent, non-partisan public information tool designed to make publicly accessible legislative records transparent, structured, and easy to interpret. It does not rank, endorse, evaluate, or campaign for or against any elected official.
        </p>

        {/* Compact In-App Notice Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3.5 rounded border border-slate-200 shadow-xs">
          <div className="space-y-0.5">
            <strong className="text-slate-900 block font-bold">Source & Provenance:</strong>
            <p className="text-slate-600 text-[11px] leading-normal">
              Extracted directly from official public records published on the House of Representatives website (<code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded border border-blue-200/60">congress.gov.ph</code>).
            </p>
          </div>
          <div className="space-y-0.5">
            <strong className="text-slate-900 block font-bold">Volume Normalization:</strong>
            <p className="text-slate-600 text-[11px] leading-normal">
              To prevent distortion between disparate filing totals (e.g. 447 vs 29), metrics emphasize percentage conversion rates and authorship share rather than raw counts.
            </p>
          </div>
          <div className="space-y-0.5">
            <strong className="text-slate-900 block font-bold">Platform Scope:</strong>
            <p className="text-slate-600 text-[11px] leading-normal">
              Tracks legislative document history only. Direct district budget allocations (GAA earmarks), committee leadership roles, constituent casework, and floor deliberations are not published in bill repositories.
            </p>
          </div>
          <div className="space-y-0.5">
            <strong className="text-slate-900 block font-bold">Non-Partisan Mandate:</strong>
            <p className="text-slate-600 text-[11px] leading-normal">
              Strictly non-partisan structural data analysis without endorsing, rating, or ranking any representative.
            </p>
          </div>
        </div>

        {/* Collapsible Methodology Deep-Dive Accordion */}
        <div>
          <button
            type="button"
            onClick={() => setShowMethodology(!showMethodology)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline transition-colors"
          >
            <span>{showMethodology ? 'Hide' : 'Read'} Full Comprehensive Methodology & Data Limits</span>
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 ${showMethodology ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showMethodology && (
            <div className="mt-4 p-4.5 bg-white border border-slate-200 rounded text-slate-600 space-y-4 text-xs leading-relaxed animate-fadeIn">
              <div>
                <h5 className="font-black text-slate-900 border-b border-slate-100 pb-1">1. Data Provenance and Scope</h5>
                <p className="mt-1">
                  <strong>Official Source:</strong> All measure titles, bill histories, referral records, authorship metadata, and reading statuses are extracted directly from the public database of the House of Representatives of the Philippines (<code>congress.gov.ph</code>).
                </p>
                <p className="mt-1">
                  <strong>Record Latency:</strong> The data reflects public records as published by the House Secretariat. Real-time actions on the floor, in bicameral conference committees, or within executive action may take time to reflect on the official portal.
                </p>
              </div>

              <div>
                <h5 className="font-black text-slate-900 border-b border-slate-100 pb-1">2. Why Metrics Are Percentage-Normalized</h5>
                <p className="mt-1">
                  Direct numerical comparisons between representatives with substantial disparities in total measures filed (e.g., 447 measures versus 29 measures) inherently distort visual assessments. A high volume of filings does not inherently denote productivity, nor does a lower volume denote inactivity.
                </p>
                <p className="mt-1">
                  To eliminate raw volume bias, this platform uses percentage conversion rates to assess pipeline progression relative to each member's own legislative portfolio, and authorship weight distributions (Lead vs. Supporting) to distinguish individually drafted priorities from co-sponsored consensus measures.
                </p>
              </div>

              <div>
                <h5 className="font-black text-slate-900 border-b border-slate-100 pb-1">3. Data Not Captured by the House Public Portal</h5>
                <p className="mt-1">
                  The official House database records statutory document history, not holistic representative performance. Users should consider that this dataset does not include:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-[11px]">
                  <li><strong>Budgetary Impact & GAA Allocations:</strong> Funding secured for local district infrastructure, health facilities, education grants, or social assistance through the General Appropriations Act (GAA) is not tracked within bill-filing records.</li>
                  <li><strong>Constituent Services:</strong> Direct public assistance, district office casework, medical/burial assistance programs, and local town halls are not cataloged in legislative tracking systems.</li>
                  <li><strong>Substantive vs. Ceremonial Classifications:</strong> Official records tag measures only by jurisdiction (Local vs. National). They do not distinguish between major structural socioeconomic reforms and standard ceremonial measures.</li>
                  <li><strong>Committee Leadership & Floor Influence:</strong> Formal positions (e.g. Committee Chairmanships, Vice Chairmanships), oral committee deliberations, oversight inquiries, and floor defense do not appear as quantitative attributes in measure histories.</li>
                  <li><strong>Co-Sponsor Party Affiliation:</strong> The directory records names of co-authors as text entries without party or coalition tags.</li>
                </ul>
              </div>

              <div>
                <h5 className="font-black text-slate-900 border-b border-slate-100 pb-1">4. Institutional and Political Context</h5>
                <p className="mt-1">
                  A bill's advancement through the House pipeline—from committee referral to Third Reading passage and presidential enactment—is subject to broader legislative dynamics beyond an individual sponsor's control. These include majority vs. minority party standing, alignment with LEDAC priority agendas, committee docket scheduling, and bicameral reconciliations with the Senate.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
