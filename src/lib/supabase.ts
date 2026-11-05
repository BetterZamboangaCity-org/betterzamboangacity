import { createClient } from '@supabase/supabase-js';
import type { Ordinance } from '../types/ordinance';
import { allBarangays } from '../data/barangay-data';
import { floodControlProjects } from '../data/flood-control-data';
import { emergencyFacilities } from '../data/disaster-data';
import cityOfficialsFallback from '../content/city-officials/zamboanga_city_officials.json';

export interface CityOfficial {
  id?: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  middleNameSource?: string;
  title?: string;
  fullName: string;
  position: string;
  party?: string;
  year: number;
  province: string;
  city: string;
  region?: string;
  sex?: string;
  sexSource?: string;
  district?: string;
  photoUrl?: string;
}

export interface BarangayOfficial {
  id: string;
  barangayId: string;
  position: string;
  fullName: string;
  contactNumber?: string;
}

export interface Barangay {
  id: string;
  slug: string;
  name: string;
  district: number;
  coast: string;
  category: string;
  zipCode?: string;
  population?: string;
  barangayCaptain?: string;
  hallAddress?: string;
  phone?: string;
  psgcUrl?: string;
}

export interface FloodControlProject {
  id: string;
  projectID: string;
  contractID: string;
  description: string;
  typeOfWork: string;
  infraType: string;
  infraYear: number;
  lat: number;
  lng: number;
  contractCost: number;
  abc: number;
  contractor: string;
  barangay: string;
  district: string;
}

export interface EmergencyFacility {
  id: string;
  name: string;
  category: string;
  catLabel: string;
  lat: number;
  lng: number;
  phone: string;
  address: string;
}

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

const ordinancesSupabaseUrl = import.meta.env.PUBLIC_ORDINANCES_SUPABASE_URL || supabaseUrl;
const ordinancesSupabaseAnonKey = import.meta.env.PUBLIC_ORDINANCES_SUPABASE_ANON_KEY || supabaseAnonKey;

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const ordinancesSupabase = ordinancesSupabaseUrl && ordinancesSupabaseAnonKey
  ? createClient(ordinancesSupabaseUrl, ordinancesSupabaseAnonKey)
  : supabase;

// ----------------------------------------------------------------------------
// 1. ORDINANCES FETCH
// ----------------------------------------------------------------------------
export async function fetchOrdinances(): Promise<{ data: Ordinance[]; isMock: boolean }> {
  const client = ordinancesSupabase || supabase;
  if (client) {
    try {
      // Fetch ordinances from the ordinances database
      const { data, error } = await client
        .from('ordinances')
        .select('*, ordinance_category_links(ordinance_categories(name))')
        .order('ordinance_year', { ascending: false });

      if (error) {
        console.error("Supabase ordinances fetch error:", error);
      }

      if (!error && data && data.length > 0) {
        const normalizedData: Ordinance[] = data.map((item: any) => {
          let categories: string[] = [];
          if (Array.isArray(item.ordinance_category_links)) {
            categories = item.ordinance_category_links
              .map((link: any) => link.ordinance_categories?.name)
              .filter(Boolean);
          }

          if (categories.length === 0 && item.categories && Array.isArray(item.categories)) {
            categories = item.categories;
          }

          if (categories.length === 0) {
            const titleLower = (item.official_title || '').toLowerCase();
            if (titleLower.includes('appropriat') || titleLower.includes('budget') || titleLower.includes('fund')) {
              categories = ['Appropriation'];
            } else if (titleLower.includes('tax') || titleLower.includes('revenue') || titleLower.includes('fee')) {
              categories = ['Revenue'];
            } else {
              categories = ['Regulatory'];
            }
          }

          return {
            ...item,
            categories,
            authors: Array.isArray(item.authors) ? item.authors : [],
            co_authors: Array.isArray(item.co_authors) ? item.co_authors : item["co-authors"] || [],
            articles_and_sections: item.articles_and_sections || [],
            fines: item.fines || []
          };
        });

        return { data: normalizedData, isMock: false };
      }
    } catch (err) {
      console.error("Supabase ordinances fetch error:", err);
    }
  }

  return { data: [], isMock: true };
}

// ----------------------------------------------------------------------------
// 2. BARANGAYS FETCH
// ----------------------------------------------------------------------------
export async function fetchBarangays(): Promise<{ data: Barangay[]; isMock: boolean }> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('barangays')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped: Barangay[] = data.map((b: any) => ({
          id: b.id,
          slug: b.slug,
          name: b.name,
          district: b.district === 'District 1' ? 1 : 2,
          coast: b.coast,
          category: b.category,
          zipCode: b.zip_code,
          population: b.population ? b.population.toLocaleString() : undefined,
          barangayCaptain: b.barangay_captain,
          hallAddress: b.hall_address,
          phone: b.phone,
        }));
        return { data: mapped, isMock: false };
      }
    } catch (err) {
      console.error("Supabase barangays fetch error:", err);
    }
  }

  return { data: allBarangays, isMock: true };
}

// ----------------------------------------------------------------------------
// 2.5 BARANGAY OFFICIALS FETCH
// ----------------------------------------------------------------------------
export async function fetchBarangayOfficials(barangayId?: string): Promise<{ data: BarangayOfficial[]; isMock: boolean }> {
  if (supabase) {
    try {
      let query = supabase.from('barangay_officials').select('*');
      if (barangayId) {
        query = query.eq('barangay_id', barangayId);
      }
      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        const mapped: BarangayOfficial[] = data.map((o: any) => ({
          id: o.id,
          barangayId: o.barangay_id,
          position: o.position,
          fullName: o.full_name,
          contactNumber: o.contact_number
        }));
        return { data: mapped, isMock: false };
      }
    } catch (err) {
      console.error("Supabase barangay_officials fetch error:", err);
    }
  }

  return { data: [], isMock: true };
}

// ----------------------------------------------------------------------------
// 3. FLOOD CONTROL PROJECTS FETCH
// ----------------------------------------------------------------------------
export async function fetchFloodControlProjects(): Promise<{ data: FloodControlProject[]; isMock: boolean }> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('flood_control_projects')
        .select(`
          *,
          contractors ( name ),
          barangays ( name, district )
        `)
        .order('infra_year', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: FloodControlProject[] = data.map((p: any) => ({
          id: p.id,
          projectID: p.project_code,
          contractID: p.contract_id || '',
          description: p.description,
          typeOfWork: p.type_of_work,
          infraType: p.infra_type,
          infraYear: p.infra_year,
          lat: Number(p.latitude) || 0,
          lng: Number(p.longitude) || 0,
          contractCost: Number(p.contract_cost) || 0,
          abc: Number(p.abc_budget) || 0,
          contractor: p.contractors?.name || 'Unspecified Contractor',
          barangay: p.barangays?.name || 'Zamboanga City',
          district: p.barangays?.district || 'District 1'
        }));

        return { data: mapped, isMock: false };
      }
    } catch (err) {
      console.error("Supabase flood control projects fetch error:", err);
    }
  }

  return { data: floodControlProjects, isMock: true };
}

// ----------------------------------------------------------------------------
// 4. EMERGENCY FACILITIES FETCH
// ----------------------------------------------------------------------------
export async function fetchEmergencyFacilities(): Promise<{ data: EmergencyFacility[]; isMock: boolean }> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('emergency_facilities')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped: EmergencyFacility[] = data.map((f: any) => ({
          id: f.id,
          name: f.name,
          category: f.category,
          catLabel: f.category.toUpperCase(),
          lat: Number(f.latitude) || 0,
          lng: Number(f.longitude) || 0,
          phone: f.phone_numbers?.[0] || '',
          address: f.address
        }));

        return { data: mapped, isMock: false };
      }
    } catch (err) {
      console.error("Supabase emergency facilities fetch error:", err);
    }
  }

  return { data: emergencyFacilities, isMock: true };
}

// ----------------------------------------------------------------------------
// 5. HISTORICAL ERAS FETCH
// ----------------------------------------------------------------------------
export async function fetchHistoricalEras() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('historical_eras')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return { data, isMock: false };
      }
    } catch (err) {
      console.error("Supabase historical eras fetch error:", err);
    }
  }

  return { data: [], isMock: true };
}

// ----------------------------------------------------------------------------
// 6. ETHNIC TRIBES FETCH
// ----------------------------------------------------------------------------
export async function fetchEthnicTribes() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('ethnic_tribes')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return { data, isMock: false };
      }
    } catch (err) {
      console.error("Supabase ethnic tribes fetch error:", err);
    }
  }

  return { data: [], isMock: true };
}

// ----------------------------------------------------------------------------
// 7. CITY OFFICIALS FETCH (NLE WINNERS 2001-2025)
// ----------------------------------------------------------------------------
export async function fetchCityOfficials(filters?: { year?: number; position?: string }) {
  if (supabase) {
    try {
      let query = supabase.from('city_officials').select('*').order('year', { ascending: false });
      
      if (filters?.year) {
        query = query.eq('year', filters.year);
      }
      if (filters?.position) {
        query = query.ilike('position', `%${filters.position}%`);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        const mapped: CityOfficial[] = data.map((o: any) => ({
          id: o.id,
          lastName: o.last_name,
          firstName: o.first_name,
          middleName: o.middle_name,
          middleNameSource: o.middle_name_source,
          title: o.title,
          fullName: o.full_name,
          position: o.position,
          party: o.party,
          year: o.year,
          province: o.province,
          city: o.city,
          region: o.region,
          sex: o.sex,
          sexSource: o.sex_source,
          district: o.district,
          photoUrl: o.photo_url || o.picture_url,
        }));
        return { data: mapped, isMock: false };
      }
    } catch (err) {
      console.error("Supabase city officials fetch error:", err);
    }
  }

  // Fallback to local extracted JSON dataset
  let result = cityOfficialsFallback as CityOfficial[];
  if (filters?.year) {
    result = result.filter((o) => Number(o.year) === Number(filters.year));
  }
  if (filters?.position) {
    const posUpper = filters.position.toUpperCase();
    result = result.filter((o) => o.position.toUpperCase().includes(posUpper));
  }

  return { data: result, isMock: true };
}

