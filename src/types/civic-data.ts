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
