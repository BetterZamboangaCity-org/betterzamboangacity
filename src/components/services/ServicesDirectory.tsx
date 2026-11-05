import React, { useState, useMemo } from 'react';

export interface CategoryCardData {
  id: string;
  title: string;
  description: string;
  icon: string;
  themeKey: 'amber' | 'blue' | 'purple' | 'emerald' | 'indigo' | 'teal' | 'orange' | 'sky' | 'rose' | 'forest';
  office: string;
  servicesList: string[];
  requirements: string[];
  processingTime: string;
  contact: string;
}

export interface LifeEventData {
  id: string;
  title: string;
  icon: string;
  themeKey: 'amber' | 'blue' | 'purple' | 'emerald' | 'indigo' | 'teal' | 'orange' | 'sky' | 'rose' | 'forest';
  matchingCategoryId: string;
}

const COLOR_THEMES: Record<string, { bg: string; text: string; borderHover: string; iconBg: string }> = {
  amber: { bg: 'bg-amber-500', text: 'text-amber-700', borderHover: 'hover:border-amber-400', iconBg: 'bg-amber-50' },
  blue: { bg: 'bg-[#0032A0]', text: 'text-[#0032A0]', borderHover: 'hover:border-[#0032A0]/50', iconBg: 'bg-blue-50' },
  purple: { bg: 'bg-purple-600', text: 'text-purple-700', borderHover: 'hover:border-purple-400', iconBg: 'bg-purple-50' },
  emerald: { bg: 'bg-[#1A9714]', text: 'text-[#1A9714]', borderHover: 'hover:border-emerald-400', iconBg: 'bg-emerald-50' },
  indigo: { bg: 'bg-indigo-600', text: 'text-indigo-700', borderHover: 'hover:border-indigo-400', iconBg: 'bg-indigo-50' },
  teal: { bg: 'bg-teal-600', text: 'text-teal-700', borderHover: 'hover:border-teal-400', iconBg: 'bg-teal-50' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-600', borderHover: 'hover:border-orange-400', iconBg: 'bg-orange-50' },
  sky: { bg: 'bg-sky-500', text: 'text-sky-600', borderHover: 'hover:border-sky-400', iconBg: 'bg-sky-50' },
  rose: { bg: 'bg-[#B32435]', text: 'text-[#B32435]', borderHover: 'hover:border-rose-400', iconBg: 'bg-rose-50' },
  forest: { bg: 'bg-emerald-700', text: 'text-emerald-700', borderHover: 'hover:border-emerald-500', iconBg: 'bg-emerald-50' },
};

const CATEGORIES_DATA: CategoryCardData[] = [
  {
    id: 'vital-records',
    title: 'Certificates & Vital Records',
    description: 'Birth, death, marriage certificates, and other vital records.',
    icon: 'document',
    themeKey: 'amber',
    office: 'City Civil Registrar Office (CCRO)',
    servicesList: [
      'Birth Certificate Request & Registration',
      'Marriage License Application & Certification',
      'Death Certificate Processing',
      'Legitimation & Legal Instrument Registration',
      'Correction of Clerical Error (R.A. 9048 / 10172)',
    ],
    requirements: [
      'Valid Government-issued ID',
      'Duly accomplished application form',
      'Barangay Certification (if applicable)',
    ],
    processingTime: '1 - 3 Working Days',
    contact: '(062) 991-2345 · civilregistry@zamboangacity.gov.ph',
  },
  {
    id: 'business-trade',
    title: 'Business, Trade & Investment',
    description: 'Business permits, licenses, and trade registration services.',
    icon: 'briefcase',
    themeKey: 'blue',
    office: 'Business Permits & Licensing Office (BPLO)',
    servicesList: [
      'New Business Permit Application (Mayor’s Permit)',
      'Annual Business Permit Renewal',
      'Special Permit for Promos & Events',
      'Occupational Permit & Sanitary Clearance',
      'Investment Incentives Registration',
    ],
    requirements: [
      'DTI / SEC Registration',
      'Barangay Business Clearance',
      'Occupancy Permit & Real Property Tax Clearance',
    ],
    processingTime: '3 - 5 Working Days',
    contact: '(062) 992-5678 · bplo@zamboangacity.gov.ph',
  },
  {
    id: 'social-services',
    title: 'Social Services & Assistance',
    description: 'Welfare programs, senior citizen services, PWD benefits, and financial aid.',
    icon: 'users',
    themeKey: 'purple',
    office: 'City Social Welfare & Development Office (CSWDO)',
    servicesList: [
      'Senior Citizen ID & Purchase Booklet Issuance',
      'PWD ID Registration & Discount Benefits',
      'Crisis Financial Assistance (AICS)',
      'Solo Parent ID & Assistance Card',
      'Child & Youth Protection Services',
    ],
    requirements: [
      '1x1 or 2x2 Recent ID Photo',
      'Barangay Certificate of Indigency',
      'Medical Certificate (for PWD applicants)',
    ],
    processingTime: 'Same Day Issuance',
    contact: '(062) 991-8899 · cswdo@zamboangacity.gov.ph',
  },
  {
    id: 'health-wellness',
    title: 'Health & Wellness',
    description: 'Vaccination programs, health certificates, and medical assistance.',
    icon: 'heart',
    themeKey: 'emerald',
    office: 'City Health Office (CHO)',
    servicesList: [
      'Free Anti-Rabies & Routine Immunizations',
      'Health Certificate & Sanitary Clearance',
      'Maternal & Child Health Clinic Consultations',
      'Free Essential Medicine Distribution',
      'Laboratory & Diagnostic Testing Support',
    ],
    requirements: [
      'Urinalysis & Chest X-Ray Results (for Health Cert)',
      'Valid ID',
      'PhilHealth Card / Number (if available)',
    ],
    processingTime: '1 Working Day',
    contact: '(062) 991-4432 · health@zamboangacity.gov.ph',
  },
  {
    id: 'taxation-payments',
    title: 'Taxation & Payments',
    description: 'Property tax, business tax, payments, and tax clearance.',
    icon: 'receipt',
    themeKey: 'indigo',
    office: 'City Treasurer’s Office (CTO)',
    servicesList: [
      'Real Property Tax (RPT) Payment & Declaration',
      'Business Tax & Municipal Fees Settlement',
      'Local Tax Clearance Issuance',
      'Community Tax Certificate (Cedula)',
      'Transfer Tax & Property Assessment Clearance',
    ],
    requirements: [
      'Previous Real Property Tax Receipt',
      'Tax Declaration Document',
      'Valid Government ID',
    ],
    processingTime: '15 - 30 Minutes',
    contact: '(062) 991-1122 · treasurer@zamboangacity.gov.ph',
  },
  {
    id: 'agriculture-economic',
    title: 'Agriculture & Economic Development',
    description: 'Agricultural loans, crop insurance, fertilizer assistance, and training.',
    icon: 'sprout',
    themeKey: 'teal',
    office: 'Office of the City Agriculturist (OCA)',
    servicesList: [
      'Crop & Fishery Insurance Registration',
      'High-Yield Seed & Fertilizer Assistance',
      'Farmers & Fisherfolk RSBSA Registration',
      'Agricultural Machinery & Equipment Support',
      'Technical Livelihood Workshops & Training',
    ],
    requirements: [
      'RSBSA Registration Record',
      'Barangay Certification of Farming/Fishing Activity',
      'Valid ID',
    ],
    processingTime: '2 - 4 Working Days',
    contact: '(062) 991-7788 · agri@zamboangacity.gov.ph',
  },
  {
    id: 'infrastructure-public-works',
    title: 'Infrastructure & Public Works',
    description: 'Construction permits, road maintenance requests, and public facilities.',
    icon: 'building',
    themeKey: 'orange',
    office: 'City Engineer’s Office & Office of the Building Official (OBO)',
    servicesList: [
      'Building & Structural Construction Permit',
      'Occupancy & Locational Zoning Clearance',
      'Road Repair & Streetlight Maintenance Request',
      'Drainage & Flood Infrastructure Complaints',
      'Public Facility Reservation & Usage Permit',
    ],
    requirements: [
      'Building Plans signed by Licensed Civil Engineer',
      'Land Title / Deed of Absolute Sale',
      'Zoning & Locational Clearance',
    ],
    processingTime: '5 - 7 Working Days',
    contact: '(062) 991-3344 · obo@zamboangacity.gov.ph',
  },
  {
    id: 'education-scholarship',
    title: 'Education & Scholarship',
    description: 'Scholarship programs, student assistance, and educational grants.',
    icon: 'academic',
    themeKey: 'sky',
    office: 'City Mayor’s Educational Assistance Program Office',
    servicesList: [
      'Zamboanga City Tertiary Scholarship Program',
      'Special Educational Financial Assistance',
      'Student Public Transport Discount Card',
      'Book Allowance & Laptop Grant Program',
    ],
    requirements: [
      'Report Card / Transcript of Records',
      'Certificate of Enrollment / Registration',
      'Parents’ Income Tax Return / Certificate of Indigency',
    ],
    processingTime: '2 Weeks (Per Academic Semester)',
    contact: '(062) 991-6677 · scholarships@zamboangacity.gov.ph',
  },
  {
    id: 'public-safety',
    title: 'Public Safety & Security',
    description: 'Emergency services, disaster preparedness, and community safety programs.',
    icon: 'shield',
    themeKey: 'rose',
    office: 'ZCDRRMO & Zamboanga City Police Office',
    servicesList: [
      '24/7 Hotline 911 Emergency Medical & Rescue',
      'Flood Warning System & Evacuation Alerts',
      'Police Clearance & Barangay Tanod Coordination',
      'Fire Safety & Prevention Inspection Clearance',
    ],
    requirements: [
      'Immediate 24/7 Hotline Access via 911 or ZCDRRMO Dispatch',
    ],
    processingTime: 'Immediate 24/7 Response',
    contact: 'Hotline 911 · (062) 991-2378 (ZCDRRMO)',
  },
  {
    id: 'environment-resources',
    title: 'Environment & Natural Resources',
    description: 'Environmental permits, waste management, and conservation programs.',
    icon: 'leaf',
    themeKey: 'forest',
    office: 'Office of the City Environment & Natural Resources (OCENR)',
    servicesList: [
      'Municipal Waste Collection Schedule & Guidelines',
      'Tree Cutting & Trimming Permit Request',
      'Environmental Compliance & Clearance',
      'Coastal Cleanup & Mangrove Reforestation Participation',
    ],
    requirements: [
      'Letter of Intent / Application Form',
      'Barangay Environmental Clearance',
      'Site Location Map',
    ],
    processingTime: '2 - 3 Working Days',
    contact: '(062) 991-9900 · ocenr@zamboangacity.gov.ph',
  },
];

const LIFE_EVENTS_DATA: LifeEventData[] = [
  { id: 'business', title: 'Starting a Business', icon: 'store', themeKey: 'blue', matchingCategoryId: 'business-trade' },
  { id: 'married', title: 'Getting Married', icon: 'heart', themeKey: 'rose', matchingCategoryId: 'vital-records' },
  { id: 'baby', title: 'Having a Baby', icon: 'baby', themeKey: 'amber', matchingCategoryId: 'vital-records' },
  { id: 'financial', title: 'Need Financial Help', icon: 'wallet', themeKey: 'purple', matchingCategoryId: 'social-services' },
  { id: 'senior', title: 'Senior Citizen Services', icon: 'user', themeKey: 'emerald', matchingCategoryId: 'social-services' },
  { id: 'pwd', title: 'Person with Disability', icon: 'accessibility', themeKey: 'teal', matchingCategoryId: 'social-services' },
  { id: 'home', title: 'Building/Home Improvement', icon: 'tools', themeKey: 'orange', matchingCategoryId: 'infrastructure-public-works' },
  { id: 'trouble', title: 'Got in Trouble', icon: 'shield_alert', themeKey: 'sky', matchingCategoryId: 'public-safety' },
];

export const ServicesDirectory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<CategoryCardData | null>(null);

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return CATEGORIES_DATA;
    return CATEGORIES_DATA.filter(
      (cat) =>
        cat.title.toLowerCase().includes(q) ||
        cat.description.toLowerCase().includes(q) ||
        cat.office.toLowerCase().includes(q) ||
        cat.servicesList.some((s) => s.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const handleLifeEventClick = (categoryId: string) => {
    const target = CATEGORIES_DATA.find((c) => c.id === categoryId);
    if (target) {
      setSelectedCard(target);
    }
  };

  const renderLeftIcon = (iconName: string) => {
    switch (iconName) {
      case 'document':
        return (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'briefcase':
        return (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7h-4V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v3H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM10 4h4v3h-4V4z" />
          </svg>
        );
      case 'users':
        return (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'heart':
        return (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'receipt':
        return (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'sprout':
        return (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21v-9m0 0C12 7.5 8 4 3 5c0 5 3.5 9 9 9zm0 0c0-4.5 4-8 9-7 0 5-3.5 9-9 9z" />
          </svg>
        );
      case 'building':
        return (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4m-4 0H9m4 0V7m0 0h4m-4 0H9" />
          </svg>
        );
      case 'academic':
        return (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        );
      case 'shield':
        return (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'leaf':
        return (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.24 12.24a6 6 0 00-8.49-8.49L5 10.5V19h8.5l6.74-6.76z M16 8L8 16" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const renderLifeEventIcon = (iconName: string, textColorClass: string) => {
    const iconClass = `w-5 h-5 ${textColorClass} group-hover:text-white transition-colors shrink-0`;
    switch (iconName) {
      case 'store':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4m-4 0H9m4 0V7m0 0h4m-4 0H9" />
          </svg>
        );
      case 'heart':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'baby':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'wallet':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'user':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'accessibility':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'tools':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 100-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
          </svg>
        );
      case 'shield_alert':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-10 font-sans text-slate-900">
      {/* Vinta Heritage Card Header */}
      <div className="bg-white border border-slate-200 overflow-hidden shadow-xs rounded-[4px]">
        {/* Vinta Flag 4-Color Heritage Top Ribbon */}
        <div className="h-2.5 w-full flex">
          <div className="flex-1 bg-[#0032A0]"></div>
          <div className="flex-1 bg-[#1A9714]"></div>
          <div className="flex-1 bg-[#F6CD18]"></div>
          <div className="flex-1 bg-[#B32435]"></div>
        </div>

        <div className="p-8 sm:p-12 text-center relative space-y-6">
          <div className="max-w-2xl mx-auto space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Municipal Services Directory
            </h1>
            <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed max-w-lg mx-auto">
              Browse all services offered by the City Government of Zamboanga
            </p>
          </div>

          {/* Centered Search Input Bar */}
          <div className="relative w-full max-w-xl mx-auto pt-2">
            <div className="relative flex items-center">
              <svg className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services (e.g., birth certificate, business permit)"
                className="w-full pl-12 pr-10 py-3.5 sm:py-4 bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0032A0] focus:bg-white transition-all rounded-[4px]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 text-slate-400 hover:text-slate-600 p-1 rounded-[2px]"
                  aria-label="Clear search"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main 10 Category Cards Grid */}
      {filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat) => {
            const theme = COLOR_THEMES[cat.themeKey] || COLOR_THEMES.blue;
            return (
              <div
                key={cat.id}
                className={`bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex overflow-hidden group rounded-[4px] ${theme.borderHover}`}
              >
                {/* Left Solid Colorful Vertical Accent Block with Icon */}
                <div className={`${theme.bg} w-14 sm:w-16 shrink-0 flex items-center justify-center p-3`}>
                  {renderLeftIcon(cat.icon)}
                </div>

                {/* Right Card Body Content */}
                <div className="p-5 sm:p-6 flex flex-col justify-between grow">
                  <div>
                    <h3 className={`text-base sm:text-lg font-bold text-slate-900 mb-1.5 leading-snug group-hover:${theme.text} transition-colors`}>
                      {cat.title}
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed mb-4">
                      {cat.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedCard(cat)}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold ${theme.text} hover:underline transition-colors mt-auto self-start`}
                  >
                    <span>&rarr; View Services</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 p-12 text-center max-w-md mx-auto rounded-[4px]">
          <h3 className="text-base font-bold text-slate-800 mb-1">No services matching "{searchQuery}"</h3>
          <p className="text-xs text-slate-500 mb-4">Try searching for keywords like birth, permit, tax, or health.</p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="px-4 py-2 bg-[#0032A0] text-white font-bold text-xs shadow-xs hover:bg-blue-800 transition-colors rounded-[4px]"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Browse by Life Event Section */}
      <div className="bg-white border border-slate-200/80 p-8 sm:p-10 shadow-xs rounded-[4px]">
        {/* Centered Section Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
            Browse by Life Event
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            Find services based on what's happening in your life
          </p>
        </div>

        {/* 4-Column Grid of Pill Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {LIFE_EVENTS_DATA.map((event) => {
            const theme = COLOR_THEMES[event.themeKey] || COLOR_THEMES.blue;
            return (
              <button
                key={event.id}
                type="button"
                onClick={() => handleLifeEventClick(event.matchingCategoryId)}
                className={`bg-slate-50 hover:bg-white border border-slate-200/90 ${theme.borderHover} p-4 flex items-center gap-3.5 shadow-2xs hover:shadow-md transition-all text-left group rounded-[4px]`}
              >
                <div className={`p-2.5 ${theme.iconBg} group-hover:${theme.bg} transition-colors shrink-0 rounded-[4px]`}>
                  {renderLifeEventIcon(event.icon, theme.text)}
                </div>
                <span className={`text-xs sm:text-sm font-bold text-slate-800 group-hover:${theme.text} transition-colors`}>
                  {event.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Modal when clicking "View Services" */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative max-h-[90vh] overflow-y-auto rounded-[4px]">
            <button
              type="button"
              onClick={() => setSelectedCard(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors rounded-[2px]"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div>
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#0032A0] border border-blue-200 inline-block mb-2 rounded-[2px]">
                {selectedCard.office}
              </span>
              <h3 className="text-2xl font-black text-slate-900 leading-tight">
                {selectedCard.title}
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed font-medium">
                {selectedCard.description}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 text-slate-500">
                  Available Services & Applications
                </h4>
                <ul className="space-y-2">
                  {selectedCard.servicesList.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                      <svg className="w-4 h-4 text-[#0032A0] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-600 font-medium rounded-[4px]">
                <div><strong className="text-slate-800">Processing Time:</strong> {selectedCard.processingTime}</div>
                <div><strong className="text-slate-800">Contact / Email:</strong> {selectedCard.contact}</div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedCard(null)}
                className="px-5 py-2.5 bg-[#0032A0] hover:bg-blue-800 text-white font-bold text-xs transition-colors shadow-xs rounded-[4px]"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesDirectory;
