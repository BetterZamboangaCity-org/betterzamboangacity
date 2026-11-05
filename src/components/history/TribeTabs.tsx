import { useState } from 'react';

const tribes = [
  {
    id: 'tausug',
    name: 'Tausug',
    subtitle: 'People of the Current',
    description: 'The Tausugs are Muslim natives of the Sulu Archipelago practicing the tenets of Islam. Culturally distinct, they have adapted Western ways through education and travel while preserving native dress like the female "sablay".',
    traits: [
      'Say prayers five times a day in the mosque.',
      'Place the greatest value on the reputation of the family; cowardice is considered shameful.',
      'Graceful dances using the "janggay" (metal fingernails).',
      'Love for bright colors, music, and arts.'
    ],
    bgClass: 'bg-[#B32435]',
    textClass: 'text-[#B32435]',
    image: '/images/history/tausug.jpg',
    imageCredit: 'https://bcpch.bangsamoro.gov.ph/tausug/',
    creditLabel: 'Bangsamoro Commission for the Preservation of Cultural Heritage'
  },
  {
    id: 'samal',
    name: 'Samal (Sama)',
    subtitle: 'Coastal Navigators',
    description: 'Living in houses built on bamboo stilts along the seashore, the Samal are spread across Mindanao. They are best known for their skills in boat building, mat weaving, and pearl diving.',
    traits: [
      'Main occupations include fishing, trading, and agriculture (cassava).',
      'Sama Bangingi group originated from Taluksangay ("sandy place").',
      'Favor the color violet ("taluk").',
      'Play indigenous instruments like the Rabana and Kulintang.'
    ],
    bgClass: 'bg-[#F6CD18]',
    textClass: 'text-amber-600',
    image: '/images/history/samal.jpg',
    imageCredit: 'https://commons.wikimedia.org/wiki/File:Sama-Bajau_houses_in_Cawa_Cawa,_Zamboanga_City_%281923%29.jpg',
    creditLabel: 'Wikimedia Commons (1923 Historical Archive)'
  },
  {
    id: 'subanen',
    name: 'Subanen',
    subtitle: 'People of the River',
    description: 'The original people of Zamboanga of Indonesian origin who arrived 2,000 to 6,000 years ago. Initially coastal, they moved to the hinterlands and riverbanks ("Suba") upon the arrival of Muslims.',
    traits: [
      'Wear colorful clothes (black, red, white) and women wear matching red earrings and beads.',
      'Rich musical heritage with songs like Ginarang and Sirdel accompanied by the Gong and Kutapi.',
      'Unique courtship through songs/dances and marriage via "taltal".',
      'Governed by a Timuay (similar to a Barangay Captain) who judges moral cases.'
    ],
    bgClass: 'bg-[#1A9714]',
    textClass: 'text-[#1A9714]',
    image: '/images/history/subanen.jpg',
    imageCredit: 'https://en.wikipedia.org/wiki/File:Subanen_-_Mount_Malindang.jpg',
    creditLabel: 'Wikipedia / Wikimedia Commons (Mount Malindang Archive)'
  },
  {
    id: 'badjao',
    name: 'Badjao',
    subtitle: 'Sea Gypsies',
    description: 'Known as the "Sea Gypsies" because they move with the wind and tide on small houseboats called vintas. They are among the world\'s most peace-loving and meek people.',
    traits: [
      'Live in boathouses or bamboo stilt houses; use "saguan" to push boats.',
      'Exceptional divers and swimmers capable of staying underwater for long periods.',
      'Main livelihood is fishing and agar-agar (seaweed) farming.',
      'Engaged in colorful mat weaving, which has become a tourist attraction.'
    ],
    bgClass: 'bg-[#0032A0]',
    textClass: 'text-[#0032A0]',
    image: '/images/history/badjao.jpg',
    imageCredit: 'https://badjaoculturecom.wordpress.com/2017/07/20/culture-of-badjao-2/',
    creditLabel: 'Badjao Cultural Archive'
  }
];

export default function TribeTabs() {
  const [activeTribe, setActiveTribe] = useState(tribes[0]);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  return (
    <div className="w-full max-w-7xl mx-auto py-16 px-4 sm:px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">Indigenous Peoples of Zamboanga</h2>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          Discover the rich cultural tapestry of the native tribes who first called this land their home.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {tribes.map((tribe) => (
          <button
            key={tribe.id}
            onClick={() => {
              if (activeTribe.id !== tribe.id) {
                setActiveTribe(tribe);
              }
            }}
            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTribe.id === tribe.id
                ? `${tribe.bgClass} text-white shadow-md transform scale-105`
                : `bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900`
            }`}
          >
            {tribe.name}
          </button>
        ))}
      </div>

      {/* Content Card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm min-h-[400px]">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Image Side */}
          <div className="relative h-72 lg:h-auto bg-slate-100 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col justify-end overflow-hidden">
             {!imgErrors[activeTribe.image] ? (
               <div className="relative w-full h-full group min-h-[320px]">
                 <img 
                   key={activeTribe.image}
                   src={activeTribe.image} 
                   alt={activeTribe.name}
                   className="w-full h-full object-cover animate-in fade-in duration-700"
                   onError={() => setImgErrors(prev => ({ ...prev, [activeTribe.image]: true }))}
                 />
                 
                 {/* Combined Tribe Name & Representation Disclaimer Banner */}
                 <div className="absolute inset-x-0 bottom-0 z-10 bg-white/95 backdrop-blur-md p-3 sm:p-3.5 text-slate-800 space-y-1.5 text-xs border-t border-slate-200 shadow-xs">
                   <div className="flex flex-wrap items-center justify-between gap-2">
                     <span className={`font-black text-xs sm:text-sm uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200/80 ${activeTribe.textClass}`}>
                       {activeTribe.name}
                     </span>
                     <div className="inline-flex items-center gap-1.5 font-medium text-amber-800 bg-amber-50/90 px-2 py-0.5 rounded-md border border-amber-200/80 text-[11px] sm:text-xs">
                       <svg className="w-3.5 h-3.5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                       <span>Representation only — Not an actual historical photograph</span>
                     </div>
                   </div>
                   {activeTribe.imageCredit && (
                     <div className="text-slate-500 text-[11px] truncate">
                       Source: {' '}
                       <a 
                         href={activeTribe.imageCredit}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="text-blue-600 underline hover:text-blue-800 font-medium transition-colors"
                       >
                         {activeTribe.creditLabel || activeTribe.imageCredit}
                       </a>
                     </div>
                   )}
                 </div>
               </div>
             ) : (
               <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50 min-h-[320px]">
                 <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                 </svg>
                 <span className="text-sm font-medium text-slate-500">
                   Image Required:<br/>
                   <code className="text-xs bg-slate-200 px-1 py-0.5 rounded mt-1 block">{activeTribe.image}</code>
                 </span>
               </div>
             )}
          </div>

          {/* Text Content Side */}
          <div className="p-8 lg:p-12 flex flex-col justify-center bg-slate-50 relative overflow-hidden">
            <div key={activeTribe.id} className="animate-in slide-in-from-right-8 fade-in duration-500 z-10 relative space-y-6">
              
              <div className="space-y-1">
                <span className={`text-xs font-black uppercase tracking-widest ${activeTribe.textClass}`}>Cultural Background</span>
                <h4 className="text-2xl font-black text-slate-900">{activeTribe.subtitle}</h4>
              </div>
              
              <p className="text-slate-600 leading-relaxed">
                {activeTribe.description}
              </p>

              <div className="space-y-3 pt-4 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-900 uppercase">Key Characteristics</span>
                <ul className="space-y-3">
                  {activeTribe.traits.map((trait, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                      <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {trait}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Background Watermark Letter */}
            <div className="absolute -right-12 -bottom-12 text-[15rem] font-black text-slate-200/50 select-none pointer-events-none z-0">
              {activeTribe.name.charAt(0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
