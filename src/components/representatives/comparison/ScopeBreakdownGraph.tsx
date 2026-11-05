import React, { useMemo, useState } from 'react';
import l020Data from '../../../content/congressman/congresswoman_L020_bills.json';
import l095Data from '../../../content/congressman/congressman_L095_bills.json';

export const ScopeBreakdownGraph: React.FC = () => {
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const stats = useMemo(() => {
    const calcRep = (data: typeof l020Data) => {
      let local = 0;
      let national = 0;
      data.bills.forEach((b) => {
        const sig = (b.significance || '').toLowerCase().trim();
        if (sig === 'local') local++;
        else if (sig === 'national') national++;
      });
      const total = data.bills.length || 1;
      const principal = data.summary.principalAuthoredCount;
      const leadRatio = Math.round((principal / total) * 100);
      const localPct = Math.round((local / total) * 100);
      const nationalPct = Math.round((national / total) * 100);

      return {
        total,
        local,
        national,
        leadRatio,
        localPct,
        nationalPct,
        volumeScore: Math.min(100, Math.round((total / 450) * 100)),
      };
    };

    return {
      d1: {
        name: 'Rep. Katrina Reiko Chua-Tai',
        district: 'District 1 (West)',
        ...calcRep(l020Data),
      },
      d2: {
        name: 'Rep. Jerry Evangelista Perez',
        district: 'District 2 (East)',
        ...calcRep(l095Data as any),
      },
    };
  }, []);

  const axes = [
    { key: 'nationalPct', label: 'National Scope', unit: '%', topVal1: stats.d1.nationalPct, topVal2: stats.d2.nationalPct },
    { key: 'localPct', label: 'Local Scope', unit: '%', topVal1: stats.d1.localPct, topVal2: stats.d2.localPct },
    { key: 'leadRatio', label: 'Lead Sponsorship', unit: '%', topVal1: stats.d1.leadRatio, topVal2: stats.d2.leadRatio },
    { key: 'volumeScore', label: 'Relative Measure Score', unit: 'pts', topVal1: stats.d1.volumeScore, topVal2: stats.d2.volumeScore },
  ];

  // Wide 500x400 SVG Canvas Dimensions so all 4 axis badges fit with zero clipping
  const centerX = 250;
  const centerY = 200;
  const maxRadius = 100;

  const getCoordinates = (valuePct: number, angleDeg: number) => {
    const angleRad = (angleDeg - 90) * (Math.PI / 180);
    const r = (valuePct / 100) * maxRadius;
    const x = centerX + r * Math.cos(angleRad);
    const y = centerY + r * Math.sin(angleRad);
    return { x, y };
  };

  const angles = [0, 90, 180, 270];

  const d1Points = angles
    .map((deg, idx) => {
      const val = stats.d1[axes[idx].key as keyof typeof stats.d1] as number;
      const { x, y } = getCoordinates(val, deg);
      return `${x},${y}`;
    })
    .join(' ');

  const d2Points = angles
    .map((deg, idx) => {
      const val = stats.d2[axes[idx].key as keyof typeof stats.d2] as number;
      const { x, y } = getCoordinates(val, deg);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="space-y-8 font-sans">
      {/* Light Theme Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 text-slate-900 p-5 rounded-[6px] shadow-xs border border-slate-200">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded border border-emerald-200">
            Multi-Axis Polar Radar Chart
          </span>
          <h3 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 mt-1.5">
            Polar Radar Polygon & Scope Matrix
          </h3>
          <p className="text-xs text-slate-600 font-medium mt-1">
            4-Dimensional Radar Polygon overlay measuring National Scope %, Local Scope %, Lead Sponsorship %, and Relative Volume Index.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-black shrink-0 bg-white p-2.5 rounded border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-blue-600 ring-2 ring-blue-200 shadow-xs" />
            <span className="text-blue-900">District 1 (Blue)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 ring-2 ring-amber-200 shadow-xs" />
            <span className="text-amber-900">District 2 (Amber)</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Light Theme Radar Graphic Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Radar SVG Container with 500x400 Canvas to guarantee zero text clipping */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-[6px] p-4 sm:p-6 shadow-xs flex flex-col items-center justify-center relative overflow-hidden">
          <div className="text-center mb-1">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Polar Axis Overlay
            </span>
          </div>

          <div className="relative w-full max-w-[440px] aspect-[5/4] flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 500 400">
              {/* Concentric Polar Grid Rings with Scale Percentage Text */}
              {[0.25, 0.5, 0.75, 1.0].map((scale, i) => {
                const r = maxRadius * scale;
                return (
                  <g key={i}>
                    <circle
                      cx={centerX}
                      cy={centerY}
                      r={r}
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="1.2"
                      strokeDasharray={scale === 1.0 ? 'none' : '4 4'}
                    />
                    <text
                      x={centerX + 4}
                      y={centerY - r + 11}
                      fill="#64748b"
                      className="text-[9px] font-bold"
                    >
                      {scale * 100}%
                    </text>
                  </g>
                );
              })}

              {/* Polar Axes Radial Spoke Lines */}
              {angles.map((deg, i) => {
                const { x, y } = getCoordinates(100, deg);
                return (
                  <line
                    key={i}
                    x1={centerX}
                    y1={centerY}
                    x2={x}
                    y2={y}
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                  />
                );
              })}

              {/* District 1 Polygon Overlay */}
              <polygon
                points={d1Points}
                fill="rgba(37, 99, 235, 0.25)"
                stroke="#2563eb"
                strokeWidth="3"
                className="transition-all duration-700 hover:fill-blue-600/40"
              />

              {/* District 2 Polygon Overlay */}
              <polygon
                points={d2Points}
                fill="rgba(217, 119, 6, 0.25)"
                stroke="#d97706"
                strokeWidth="3"
                className="transition-all duration-700 hover:fill-amber-600/40"
              />

              {/* Vertex Nodes for District 1 */}
              {angles.map((deg, i) => {
                const val = stats.d1[axes[i].key as keyof typeof stats.d1] as number;
                const { x, y } = getCoordinates(val, deg);
                return (
                  <g key={`d1-vertex-${i}`}>
                    <circle
                      cx={x}
                      cy={y}
                      r="6"
                      fill="#2563eb"
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="cursor-pointer hover:scale-125 transition-transform"
                      onMouseEnter={() => setActiveNode(`d1-${axes[i].key}`)}
                      onMouseLeave={() => setActiveNode(null)}
                    />
                  </g>
                );
              })}

              {/* Vertex Nodes for District 2 */}
              {angles.map((deg, i) => {
                const val = stats.d2[axes[i].key as keyof typeof stats.d2] as number;
                const { x, y } = getCoordinates(val, deg);
                return (
                  <g key={`d2-vertex-${i}`}>
                    <circle
                      cx={x}
                      cy={y}
                      r="6"
                      fill="#d97706"
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="cursor-pointer hover:scale-125 transition-transform"
                      onMouseEnter={() => setActiveNode(`d2-${axes[i].key}`)}
                      onMouseLeave={() => setActiveNode(null)}
                    />
                  </g>
                );
              })}

              {/* Mathematically Centered Non-Overlapping Axis Label Badges */}
              {/* TOP Axis: National Scope */}
              <g transform={`translate(${centerX}, ${centerY - maxRadius - 26})`}>
                <rect x="-65" y="-12" width="130" height="24" rx="4" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                <text x="0" y="4" textAnchor="middle" fill="#0369a1" className="text-[11px] font-black uppercase tracking-tight">
                  National Scope
                </text>
              </g>

              {/* RIGHT Axis: Local Scope */}
              <g transform={`translate(${centerX + maxRadius + 60}, ${centerY})`}>
                <rect x="-55" y="-12" width="110" height="24" rx="4" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                <text x="0" y="4" textAnchor="middle" fill="#15803d" className="text-[11px] font-black uppercase tracking-tight">
                  Local Scope
                </text>
              </g>

              {/* BOTTOM Axis: Lead Sponsorship */}
              <g transform={`translate(${centerX}, ${centerY + maxRadius + 26})`}>
                <rect x="-70" y="-12" width="140" height="24" rx="4" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                <text x="0" y="4" textAnchor="middle" fill="#7e22ce" className="text-[11px] font-black uppercase tracking-tight">
                  Lead Sponsorship
                </text>
              </g>

              {/* LEFT Axis: Measure Score */}
              <g transform={`translate(${centerX - maxRadius - 60}, ${centerY})`}>
                <rect x="-55" y="-12" width="110" height="24" rx="4" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                <text x="0" y="4" textAnchor="middle" fill="#b45309" className="text-[11px] font-black uppercase tracking-tight">
                  Measure Score
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* Polar Dimension Detail Cards */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-slate-200 rounded-[6px] p-5 shadow-xs space-y-4">
            <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">
              Dimensional Radar Comparison Metrics
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {axes.map((ax) => (
                <div
                  key={ax.key}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-[4px] space-y-2 hover:border-slate-300 transition-colors"
                >
                  <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight block">
                    {ax.label}
                  </span>
                  <div className="flex items-center justify-between text-xs font-black">
                    <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      D1: {ax.topVal1}{ax.unit}
                    </span>
                    <span className="text-slate-400 font-bold">vs</span>
                    <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      D2: {ax.topVal2}{ax.unit}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex gap-0.5">
                    <div style={{ width: `${ax.topVal1}%` }} className="h-full bg-blue-600 rounded-l-full" />
                    <div style={{ width: `${ax.topVal2}%` }} className="h-full bg-amber-500 rounded-r-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Light Theme Scope Explanation Box */}
          <div className="bg-blue-50/70 text-slate-800 border border-blue-200/80 rounded-[6px] p-4 text-xs space-y-2.5">
            <h5 className="font-black text-blue-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Understanding Radar Dimensions</span>
            </h5>
            <p className="leading-relaxed text-slate-700 font-medium text-xs">
              <strong className="text-emerald-700 font-bold">Local Scope:</strong> Infrastructure, local educational institutions, and district-bound public works.<br />
              <strong className="text-blue-700 font-bold">National Scope:</strong> Countrywide legislation, national security, institutional reform, and general public welfare laws.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
