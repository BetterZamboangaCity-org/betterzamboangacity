import type { Ordinance } from '../types/ordinance';
import type { EmergencyFacility } from '../types/civic-data';

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function ordinance(value: unknown): value is Ordinance {
  return record(value) && typeof value.ordinance_number === 'string' && typeof value.official_title === 'string' &&
    (typeof value.ordinance_year === 'number' || typeof value.ordinance_year === 'string') &&
    /^\d+$/.test(String(value.ordinance_year).trim()) &&
    Number.isSafeInteger(Number(value.ordinance_year)) && Number(value.ordinance_year) > 0 &&
    (value.active_status === undefined || typeof value.active_status === 'string') &&
    [value.date_enacted, value.date_approved].every(date => date == null || typeof date === 'string') &&
    typeof value.eli5_summary === 'string' && Array.isArray(value.authors) && value.authors.every(item => typeof item === 'string') &&
    Array.isArray(value.categories) && value.categories.every(item => typeof item === 'string') &&
    Array.isArray(value.articles_and_sections) && value.articles_and_sections.every(item => record(item) && typeof item.title === 'string' && typeof item.eli5_explanation === 'string') &&
    Array.isArray(value.fines) && value.fines.every(item => record(item) && typeof item.offense_level === 'string' && typeof item.penalty === 'string');
}

async function readJSON<T>(name: string, valid: (value: unknown) => value is T, signal?: AbortSignal): Promise<{ data: T[] }> {
  const response = await fetch(`${import.meta.env.BASE_URL}api/v1/${name}.json`, { signal });
  if (!response.ok) throw new Error('Repository data is unavailable.');
  const data: unknown = await response.json();
  if (!Array.isArray(data) || !data.every(valid)) throw new Error('Repository data is malformed.');
  signal?.throwIfAborted();
  return { data };
}

export function fetchOrdinances(signal?: AbortSignal) {
  return readJSON('ordinances', ordinance, signal);
}

function facility(value: unknown): value is EmergencyFacility {
  return record(value) && typeof value.id === 'string' && typeof value.name === 'string' &&
    typeof value.category === 'string' && typeof value.catLabel === 'string' &&
    typeof value.lat === 'number' && Number.isFinite(value.lat) && typeof value.lng === 'number' && Number.isFinite(value.lng) &&
    typeof value.phone === 'string' && typeof value.address === 'string';
}

export function fetchEmergencyFacilities(signal?: AbortSignal) {
  return readJSON('emergency-facilities', facility, signal);
}
