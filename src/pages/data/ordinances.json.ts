import type { APIRoute } from 'astro';
import { fetchOrdinances } from '../../lib/civic-data';

export const prerender = true;
export const GET: APIRoute = async () => Response.json((await fetchOrdinances()).data);
