import ordinanceSnapshot from '../data/ordinances.json';
import barangaySnapshot from '../data/barangays.json';
import cityOfficials from '../content/city-officials/zamboanga_city_officials.json';
import emergencySnapshot from '../data/emergency-facilities.json';
import type { Ordinance } from '../types/ordinance';
import type { Barangay, CityOfficial, EmergencyFacility } from '../types/civic-data';

export async function fetchEmergencyFacilities(): Promise<{ data: EmergencyFacility[] }> {
  return { data: emergencySnapshot };
}

export async function fetchBarangays(): Promise<{ data: Barangay[] }> {
  return { data: barangaySnapshot };
}

export async function fetchCityOfficials(filters?: { year?: number; position?: string }): Promise<{ data: CityOfficial[] }> {
  let data = cityOfficials;
  if (filters?.year) data = data.filter(official => Number(official.year) === Number(filters.year));
  if (filters?.position) {
    const position = filters.position.toUpperCase();
    data = data.filter(official => official.position.toUpperCase().includes(position));
  }
  return { data };
}

// Build and server readers use repository data without an HTTP request.
export async function fetchOrdinances(): Promise<{ data: Ordinance[] }> {
  const data = ordinanceSnapshot.map(record => {
    let categories = record.ordinance_category_links
      .map(link => link.ordinance_categories?.name)
      .filter(Boolean);
    if (!categories.length) {
      const title = record.official_title.toLowerCase();
      categories = title.includes('appropriat') || title.includes('budget') || title.includes('fund')
        ? ['Appropriation']
        : title.includes('tax') || title.includes('revenue') || title.includes('fee')
          ? ['Revenue'] : ['Regulatory'];
    }
    return {
      ...record,
      categories,
      authors: Array.isArray(record.authors) ? record.authors : [],
      co_authors: Array.isArray(record.co_authors) ? record.co_authors : [],
      articles_and_sections: record.articles_and_sections || [],
      fines: record.fines || [],
    };
  });
  data.sort((a, b) => b.ordinance_year - a.ordinance_year || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return { data };
}
