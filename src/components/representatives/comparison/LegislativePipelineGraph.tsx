import React, { useMemo } from 'react';
import l020Data from '../../../content/congressman/congresswoman_L020_bills.json';
import l095Data from '../../../content/congressman/congressman_L095_bills.json';

export const LegislativePipelineGraph: React.FC = () => {
  const pipeline = useMemo(() => {
    const calcRepPipeline = (data: typeof l020Data, name: string, district: string) => {
      const principalBills = data.bills.filter((b) =>
        (b.authorshipType || '').toLowerCase().includes('principal')
      );
      const totalPrincipal = principalBills.length || 1;

      let commApproved = 0;
      let floorPassed = 0;
      let enactedRA = 0;

      principalBills.forEach((b) => {
        const status = (b.billStatus || '').toLowerCase();
        const historyText = (b.history?.fullHistoryText || '').toLowerCase();

        const isRA = status.includes('republic act') || historyText.includes('republic act');
        const isFloor =
          isRA ||
          status.includes('approved by the house') ||
          status.includes('passed by the house') ||
          status.includes('approved on third reading') ||
          historyText.includes('approved on third reading') ||
          historyText.includes('passed by the house');

        const isComm =
          isFloor ||
          status.includes('approved by the committee') ||
          status.includes('substituted by') ||
          status.includes('twg') ||
          status.includes('scheduled for meeting') ||
          status.includes('deliberated upon') ||
          historyText.includes('approved by the committee') ||
          historyText.includes('committee report');

        if (isComm) commApproved++;
        if (isFloor) floorPassed++;
        if (isRA) enactedRA++;
      });

      return {
        name,
        district,
        totalPrincipal,
        commApproved,
        floorPassed,
        enactedRA,
        commConversionRate: Number(((commApproved / totalPrincipal) * 100).toFixed(1)),
        floorPassageRate: Number(((floorPassed / totalPrincipal) * 100).toFixed(1)),
        enactmentYield: Number(((enactedRA / totalPrincipal) * 100).toFixed(1)),
      };
    };

    return {
      d1: calcRepPipeline(l020Data, 'Rep. Katrina Reiko Chua-Tai', 'District 1 (West)'),
      d2: calcRepPipeline(l095Data as any, 'Rep. Jerry Evangelista Perez', 'District 2 (East)'),
    };
  }, []);

  const stages = [
    {
      title: '1. Principal Measures Filed',
      desc: 'Lead sponsorship bills introduced in the House',
      d1Val: pipeline.d1.totalPrincipal,
      d1Pct: 100,
      d2Val: pipeline.d2.totalPrincipal,
      d2Pct: 100,
    },
    {
      title: '2. Committee Approval & Advancement',
      desc: 'Bills approved by standing committees or substituted into committee reports',
      d1Val: pipeline.d1.commApproved,
      d1Pct: pipeline.d1.commConversionRate,
      d2Val: pipeline.d2.commApproved,
      d2Pct: pipeline.d2.commConversionRate,
    },
    {
      title: '3. House Floor Passage (3rd Reading)',
      desc: 'Measures approved on 3rd reading by the full House of Representatives',
      d1Val: pipeline.d1.floorPassed,
      d1Pct: pipeline.d1.floorPassageRate,
      d2Val: pipeline.d2.floorPassed,
      d2Pct: pipeline.d2.floorPassageRate,
    },
    {
      title: '4. Enacted into Law (Republic Act)',
      desc: 'Enacted statutes signed by the President or lapsed into law',
      d1Val: pipeline.d1.enactedRA,
      d1Pct: pipeline.d1.enactmentYield,
      d2Val: pipeline.d2.enactedRA,
      d2Pct: pipeline.d2.enactmentYield,
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Light Theme Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 text-slate-900 p-5 rounded-[6px] shadow-xs border border-slate-200">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 bg-blue-100 px-2.5 py-1 rounded border border-blue-200">
            Pipeline Stage Funnel
          </span>
          <h3 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 mt-1.5">
            Legislative Funnel Stages & Conversion Progression
          </h3>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Tracking measure progression step-by-step through 4 legislative stages.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-black shrink-0 bg-white p-2.5 rounded border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-blue-600 ring-2 ring-blue-200 shadow-xs" />
            <span className="text-blue-900">District 1</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 ring-2 ring-amber-200 shadow-xs" />
            <span className="text-amber-900">District 2</span>
          </div>
        </div>
      </div>

      {/* Pipeline Funnel Visual Stage Progress Rows */}
      <div className="bg-white border border-slate-200 rounded-[6px] p-5 sm:p-6 shadow-xs space-y-6 relative overflow-hidden">
        {/* Top Solid Vinta Flag Multicolor Accent Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex overflow-hidden">
          <div className="w-[16.66%] h-full bg-[#c084fc]" />
          <div className="w-[16.66%] h-full bg-[#38bdf8]" />
          <div className="w-[16.66%] h-full bg-[#4ade80]" />
          <div className="w-[16.66%] h-full bg-[#e11d48]" />
          <div className="w-[16.66%] h-full bg-[#fca5a5]" />
          <div className="w-[16.66%] h-full bg-[#fbbf24]" />
        </div>
        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight border-b border-slate-100 pb-3">
          Step-by-Step Funnel Progression
        </h4>

        <div className="space-y-6">
          {stages.map((st, idx) => (
            <div key={idx} className="space-y-2.5 pb-5 border-b border-slate-100 last:border-0 last:pb-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <h5 className="text-xs sm:text-sm font-black text-slate-900">{st.title}</h5>
                  <span className="text-[11px] font-medium text-slate-500">{st.desc}</span>
                </div>
                <div className="text-xs font-bold text-slate-600 flex items-center gap-2">
                  <span className="text-blue-700">D1: {st.d1Pct}% ({st.d1Val})</span>
                  <span>vs</span>
                  <span className="text-amber-800">D2: {st.d2Pct}% ({st.d2Val})</span>
                </div>
              </div>

              {/* District 1 Stage Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                  <span>District 1 (Katrina Reiko Chua-Tai)</span>
                  <span className="font-bold text-blue-700">{st.d1Val} measures ({st.d1Pct}%)</span>
                </div>
                <div className="w-full h-3.5 bg-slate-100 rounded overflow-hidden flex border border-slate-200">
                  <div
                    style={{ width: `${Math.max(4, st.d1Pct)}%` }}
                    className="h-full bg-blue-600 rounded transition-all duration-700"
                  />
                </div>
              </div>

              {/* District 2 Stage Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                  <span>District 2 (Jerry Evangelista Perez)</span>
                  <span className="font-bold text-amber-800">{st.d2Val} measures ({st.d2Pct}%)</span>
                </div>
                <div className="w-full h-3.5 bg-slate-100 rounded overflow-hidden flex border border-slate-200">
                  <div
                    style={{ width: `${Math.max(4, st.d2Pct)}%` }}
                    className="h-full bg-amber-500 rounded transition-all duration-700"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
