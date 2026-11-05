import React from 'react';

const sources = [
  {
    title: "Zamboanga City Govt Official Memorial Commemoration",
    url: "https://www.facebook.com/zambocitygovt/posts/watch-zamboanga-city-holds-a-memorial-commemoration-as-it-remembers-the-valor-an/1386869690220579/",
    publisher: "Zamboanga City Local Government Unit"
  },
  {
    title: "Zamboanga Siege Historical Overview",
    url: "https://en.wikipedia.org/wiki/Zamboanga_siege",
    publisher: "Wikipedia"
  },
  {
    title: "On This Day: 2013 Zamboanga Siege Report",
    url: "https://www.facebook.com/gmanews/posts/on-this-day-zamboanga-siegeon-sept-9-2013-moro-national-liberation-front-mnlf-fo/1686596703511980/",
    publisher: "GMA News"
  },
  {
    title: "Urban Warfare Monograph Analysis",
    url: "https://www.jstor.org/content/oa_chapter_monograph/10.7249/j.ctt1cd0md9.14",
    publisher: "JSTOR Open Access"
  },
  {
    title: "Zamboanga City Marks Day of Remembrance",
    url: "https://newsinfo.inquirer.net/2302020/zamboanga-city-marks-day-of-remembrance-for-bloody-2013-siege",
    publisher: "Inquirer.net"
  },
  {
    title: "Remembering the Zamboanga Siege Commemoration",
    url: "https://www.facebook.com/100063857807349/posts/%EF%B8%8F-remembering-the-zamboanga-siege-13-years-later13-years-have-passed-but-the-mem/1572490981556147/",
    publisher: "Public Remembrance Archive"
  }
];

export default function ZamboangaSiegeSection() {
  return (
    <section className="w-full max-w-6xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-12 shadow-sm relative overflow-hidden">
        
        {/* Decorative Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#B32435] via-amber-500 to-[#0032A0]"></div>

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-red-100 text-[#B32435] text-xs font-black rounded-full uppercase tracking-wider">
                Sept 9–28, 2013
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full">
                Historical Milestone & Day of Remembrance
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              The 2013 Zamboanga Siege
            </h2>
            <p className="text-slate-600 text-base sm:text-lg mt-2 max-w-3xl leading-relaxed font-medium">
              On September 9, 2013, Zamboanga City faced a 20-day armed crisis that tested the valor of government forces and the enduring strength of its residents.
            </p>
          </div>
        </div>

        {/* Impact Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-red-50/80 border border-red-100 rounded-2xl p-5 text-center">
            <span className="block text-3xl sm:text-4xl font-black text-[#B32435]">120,000+</span>
            <span className="text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wide mt-1 block">
              Residents Displaced
            </span>
          </div>
          <div className="bg-amber-50/80 border border-amber-100 rounded-2xl p-5 text-center">
            <span className="block text-3xl sm:text-4xl font-black text-amber-700">~10,000</span>
            <span className="text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wide mt-1 block">
              Homes Destroyed
            </span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center">
            <span className="block text-3xl sm:text-4xl font-black text-slate-900">38</span>
            <span className="text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wide mt-1 block">
              Fallen Heroes & Civilians
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">20 Soldiers, 5 Police, 13 Civilians</span>
          </div>
          <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-5 text-center">
            <span className="block text-3xl sm:text-4xl font-black text-[#0032A0]">5</span>
            <span className="text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wide mt-1 block">
              Coastal Barangays Affected
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Rio Hondo, Mariki, Sta. Barbara, Sta. Catalina, Mampang</span>
          </div>
        </div>

        {/* Detailed Content Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          
          {/* Background and Causes */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-[#B32435] flex items-center justify-center font-bold">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Background & Causes</h3>
                <p className="text-xs text-slate-500 font-medium">Catalysts of the 2013 Conflict</p>
              </div>
            </div>

            <ul className="space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#B32435] mt-2 shrink-0"></span>
                <div>
                  <strong className="font-bold text-slate-900">Rogue MNLF Faction:</strong> A faction of the Moro National Liberation Front loyal to founding chair Nur Misuari and commanded by Ustadz Habier Malik carried out the attack.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#B32435] mt-2 shrink-0"></span>
                <div>
                  <strong className="font-bold text-slate-900">Protest of Peace Agreement:</strong> The faction opposed the government's perceived failure to fully implement the 1996 final peace agreement and sought to declare independence for a "Bangsamoro Republik".
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#B32435] mt-2 shrink-0"></span>
                <div>
                  <strong className="font-bold text-slate-900">City Hall Objective:</strong> Armed fighters attempted to march to Zamboanga City Hall to hoist their independent flag.
                </div>
              </li>
            </ul>
          </div>

          {/* Conflict and Impact */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0032A0] flex items-center justify-center font-bold">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V9a2 2 0 012-2h2a2 2 0 012 2v12" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Conflict & City Impact</h3>
                <p className="text-xs text-slate-500 font-medium">Urban Warfare and Toll on the City</p>
              </div>
            </div>

            <ul className="space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#0032A0] mt-2 shrink-0"></span>
                <div>
                  <strong className="font-bold text-slate-900">Urban Warfare:</strong> The Armed Forces of the Philippines (AFP) and Philippine National Police (PNP) engaged rebels in intense urban combat across coastal barangays, including Rio Hondo, Mariki, Santa Barbara, Santa Catalina, and Mampang.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#0032A0] mt-2 shrink-0"></span>
                <div>
                  <strong className="font-bold text-slate-900">Paralyzed City:</strong> The city came to a complete standstill with closed schools, businesses, and suspended flights and sea voyages during the height of the siege.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#0032A0] mt-2 shrink-0"></span>
                <div>
                  <strong className="font-bold text-slate-900">Casualties & Loss:</strong> The fighting claimed 38 lives among government forces and civilians (20 soldiers, 5 policemen, and 13 civilians), alongside over 150 killed among the rebel forces.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#0032A0] mt-2 shrink-0"></span>
                <div>
                  <strong className="font-bold text-slate-900">Displacement & Reconstruction:</strong> Over 120,000 residents were displaced, and close to 10,000 homes were destroyed by heavy fighting and fires before the siege was officially cleared.
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* References & Citations Footer */}
        <div className="pt-6 border-t border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Historical References & Official Records
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {sources.map((src, index) => (
              <a
                key={index}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all flex items-start gap-2 group text-xs"
              >
                <span className="font-bold text-slate-400 group-hover:text-[#0032A0] shrink-0">[{index + 1}]</span>
                <div className="min-w-0">
                  <span className="font-semibold text-slate-800 group-hover:text-[#0032A0] block truncate">
                    {src.title}
                  </span>
                  <span className="text-[11px] text-slate-500 block truncate">
                    {src.publisher}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
