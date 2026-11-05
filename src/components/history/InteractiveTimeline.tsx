import { useState } from 'react';

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  image?: string | null;
}

const timelineEvents: TimelineEvent[] = [
  {
    year: '13th-14th Century',
    title: 'Center of Barter Trade',
    description: 'Zamboanga was a bustling center of barter trading among Chinese, Malays, and native Tausugs, Samals, Subanons, and Badjaos.',
    image: null // Optional image
  },
  {
    year: '1569',
    title: 'Spanish Mission at La Caldera',
    description: 'The Spaniards made their presence felt with a small Catholic Mission established briefly at La Caldera, now known as Recodo.',
    image: null
  },
  {
    year: 'June 23, 1635',
    title: 'Founding of Fort Pilar',
    description: 'The cornerstone of Fort Pilar was laid by Father Melchor de Vera, marking the city\'s founding date and the official change of name from Samboangan to Zamboanga.',
    image: null
  },
  {
    year: '1899',
    title: 'American Military Government',
    description: 'Following the Spanish-American War, the US established full authority. Zamboanga was made the capital of the Moro province and converted into a city under a Commission Form.',
    image: null
  },
  {
    year: '1936',
    title: 'Charter City Status',
    description: 'The Commonwealth of the Philippines officially declared Zamboanga as a Charter City, handing governance back to Filipino residents.',
    image: null
  },
  {
    year: '1983',
    title: 'Highly Urbanized City',
    description: 'Minister of Interior Jose Roño proclaimed Zamboanga City as a highly urbanized city as progress and development continued.',
    image: null
  },
  {
    year: 'Sept 9–28, 2013',
    title: 'The Zamboanga Siege',
    description: 'A critical 20-day urban conflict triggered by a rogue MNLF faction attempting to march on City Hall. Intense urban combat across coastal barangays tested the city\'s strength and security forces before resolution.',
    image: null
  }
];

export default function InteractiveTimeline() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const vintaColors = ['bg-[#0032A0]', 'bg-[#1A9714]', 'bg-[#F6CD18]', 'bg-[#B32435]', 'bg-[#0032A0]', 'bg-[#1A9714]', 'bg-[#B32435]'];
  const textColors = ['text-[#0032A0]', 'text-[#1A9714]', 'text-amber-600', 'text-[#B32435]', 'text-[#0032A0]', 'text-[#1A9714]', 'text-[#B32435]'];

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4 sm:px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">Chronicle of Jambangan</h2>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          Explore the historical milestones that shaped the Land of Flowers into the vibrant city it is today.
        </p>
      </div>

      <div className="relative flex flex-col md:flex-row gap-8 items-start">
        {/* Vertical Timeline Navigation */}
        <div className="relative w-full md:w-1/3 flex flex-col space-y-2 border-l-2 border-slate-200 ml-4 md:ml-0 pl-6">
          {timelineEvents.map((event, index) => (
            <button
              key={event.year}
              onClick={() => setActiveIndex(index)}
              className={`relative text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                activeIndex === index
                  ? `bg-slate-50 ${textColors[index]} font-bold shadow-xs border border-slate-200`
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 font-medium'
              }`}
            >
              {/* Timeline dot */}
              <span 
                className={`absolute -left-[31px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-4 transition-colors duration-300 ${
                  activeIndex === index ? `${vintaColors[index]} border-white` : 'bg-slate-200 border-white'
                }`}
              />
              <span className="block text-xs uppercase tracking-wider mb-1 opacity-80">{event.year}</span>
              <span className="block">{event.title}</span>
            </button>
          ))}
        </div>

        {/* Event Content Panel */}
        <div className="w-full md:w-2/3 bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm transition-all duration-500 min-h-[300px] flex flex-col justify-start">
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500" key={activeIndex}>
            <span className={`inline-block px-3 py-1 text-sm font-bold rounded-full border border-slate-100 shadow-xs ${vintaColors[activeIndex]} text-white`}>
              {timelineEvents[activeIndex].year}
            </span>
            <h3 className={`text-2xl sm:text-3xl font-black ${textColors[activeIndex]}`}>
              {timelineEvents[activeIndex].title}
            </h3>
            <p className="text-slate-600 text-lg leading-relaxed">
              {timelineEvents[activeIndex].description}
            </p>
            
            {/* Conditional Image Rendering if an image is provided in the array */}
            {timelineEvents[activeIndex].image && (
              <div className="mt-6 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative h-56 sm:h-64 bg-slate-100">
                 {!imgErrors[timelineEvents[activeIndex].image!] ? (
                   <div className="relative w-full h-full">
                     <img 
                       src={timelineEvents[activeIndex].image!} 
                       alt={timelineEvents[activeIndex].title}
                       className="w-full h-full object-cover"
                       onError={() => setImgErrors(prev => ({ ...prev, [timelineEvents[activeIndex].image!]: true }))}
                     />
                     <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-md p-2.5 text-slate-800 text-xs flex items-center gap-1.5 font-medium border-t border-slate-200">
                       <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                       <span className="text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80">
                         Representation only — Not an actual historical photograph
                       </span>
                     </div>
                   </div>
                 ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                     <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                     </svg>
                     <span className="text-sm">Image required: {timelineEvents[activeIndex].image}</span>
                   </div>
                 )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
