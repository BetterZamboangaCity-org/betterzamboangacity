export interface PoliceStation {
  station: string;
  location: string;
  number: string;
  sector: string;
}

export interface FireStation {
  station: string;
  location: string;
  numbers: string[];
  sector: string;
}

// ZCPO 12 Police Stations Data
export const policeStations: PoliceStation[] = [
  { station: 'ZCPS 1', location: 'Vitali', number: '0935-604-4139', sector: 'East Coast' },
  { station: 'ZCPS 2', location: 'Curuan', number: '0935-457-2483', sector: 'East Coast' },
  { station: 'ZCPS 3', location: 'Sangali', number: '0917-146-2240', sector: 'East Coast' },
  { station: 'ZCPS 4', location: 'Culianan', number: '0975-333-8826', sector: 'East Coast' },
  { station: 'ZCPS 5', location: 'Divisoria', number: '0917-677-8907', sector: 'Central' },
  { station: 'ZCPS 6', location: 'Tetuan', number: '0997-746-5666', sector: 'Central' },
  { station: 'ZCPS 7', location: 'Sta. Maria', number: '0917-307-8098', sector: 'Central' },
  { station: 'ZCPS 8', location: 'Sinunuc', number: '0906-853-9806', sector: 'West Coast' },
  { station: 'ZCPS 9', location: 'Ayala', number: '0917-864-8553', sector: 'West Coast' },
  { station: 'ZCPS 10', location: 'Labuan', number: '0917-309-3887', sector: 'West Coast' },
  { station: 'ZCPS 11', location: 'Central (Poblacion)', number: '0917-701-6340', sector: 'Central' },
  { station: 'ZCPS 12', location: 'Talon-Talon', number: '0977-855-8138', sector: 'East Coast' },
];

// Zamboanga City Fire District Stations Data
export const fireStations: FireStation[] = [
  { station: 'ZCFD Central', location: 'City Center (Central Substation)', numbers: ['160', '0955-781-6063'], sector: 'Central' },
  { station: 'Ayala', location: 'Ayala Substation', numbers: ['0965-094-9122'], sector: 'West Coast' },
  { station: 'Boalan', location: 'Boalan Substation', numbers: ['0997-703-1365'], sector: 'East Coast' },
  { station: 'Buenavista', location: 'Buenavista Substation', numbers: ['0967-637-8551', '0992-271-8146'], sector: 'East Coast' },
  { station: 'Cabaluay', location: 'Cabaluay Substation', numbers: ['0975-592-0791'], sector: 'East Coast' },
  { station: 'Upper Calarian', location: 'Upper Calarian Substation', numbers: ['0962-9400-823'], sector: 'West Coast' },
  { station: 'Culianan', location: 'Culianan Substation', numbers: ['0975-295-3599'], sector: 'East Coast' },
  { station: 'Guiwan', location: 'Guiwan Substation', numbers: ['0955-541-1415'], sector: 'Central' },
  { station: 'Labuan', location: 'Labuan Substation', numbers: ['0927-493-5473'], sector: 'West Coast' },
  { station: 'Lunzuran', location: 'Lunzuran Substation', numbers: ['0936-154-5366'], sector: 'Central' },
  { station: 'Manicahan', location: 'Manicahan Substation', numbers: ['0975-031-3372'], sector: 'East Coast' },
  { station: 'Mampang', location: 'Mampang Substation', numbers: ['0953-865-6340'], sector: 'East Coast' },
  { station: 'Mercedes', location: 'Mercedes Substation', numbers: ['0966-130-6100'], sector: 'East Coast' },
  { station: 'Pasonanca', location: 'Pasonanca Substation', numbers: ['0954-998-3555'], sector: 'Central' },
  { station: 'Putik', location: 'Putik Substation', numbers: ['0926-391-8236'], sector: 'East Coast' },
  { station: 'Quiniput', location: 'Quiniput Substation', numbers: ['0962-2934-154'], sector: 'East Coast' },
  { station: 'Recodo', location: 'Recodo Substation', numbers: ['0997-753-4860'], sector: 'West Coast' },
  { station: 'Sangali', location: 'Sangali Substation', numbers: ['0965-400-7329', '0969-464-4423'], sector: 'East Coast' },
  { station: 'San Jose Gusu', location: 'San Jose Gusu Substation', numbers: ['0993-981-7362'], sector: 'Central' },
  { station: 'San Roque', location: 'San Roque Substation', numbers: ['0969-262-3638'], sector: 'Central' },
  { station: 'Sinunuc', location: 'Sinunuc Substation', numbers: ['0917-1701-344'], sector: 'West Coast' },
  { station: 'Sta Catalina', location: 'Sta Catalina Substation', numbers: ['0956-158-0789'], sector: 'Central' },
  { station: 'Sta Maria', location: 'Sta Maria Substation', numbers: ['0935-287-2162'], sector: 'Central' },
  { station: 'Talisayan', location: 'Talisayan Substation', numbers: ['0936-462-2070'], sector: 'West Coast' },
  { station: 'Talon-Talon', location: 'Talon-Talon Substation', numbers: ['0955-4085-457'], sector: 'East Coast' },
  { station: 'Tetuan', location: 'Tetuan Substation', numbers: ['0906-444-7816'], sector: 'Central' },
  { station: 'Tigbalabag', location: 'Tigbalabag Substation', numbers: ['0965-263-1044'], sector: 'East Coast' },
  { station: 'Tumaga', location: 'Tumaga Substation', numbers: ['0953-867-1364'], sector: 'Central' },
  { station: 'Tugbungan', location: 'Tugbungan Substation', numbers: ['0917-670-1977'], sector: 'Central' },
  { station: 'Vitali', location: 'Vitali Substation', numbers: ['0970-290-5419'], sector: 'East Coast' }
];
