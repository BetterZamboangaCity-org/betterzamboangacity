import type { APIRoute } from 'astro';
import { fetchEmergencyFacilities } from '../../lib/civic-data';

export const prerender = true;
export const GET: APIRoute = async () => Response.json((await fetchEmergencyFacilities()).data);
