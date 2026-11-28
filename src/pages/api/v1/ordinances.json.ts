import type { APIRoute } from 'astro';
import { fetchOrdinances } from '../../../lib/civic-data';
import { civicJsonResponse } from '../../../lib/civic-api';

export const prerender = true;
export const GET: APIRoute = async () => civicJsonResponse((await fetchOrdinances()).data);
