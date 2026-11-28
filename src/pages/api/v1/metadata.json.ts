import type { APIRoute } from 'astro';
import { createHash } from 'node:crypto';
import { fetchBarangays, fetchEmergencyFacilities, fetchOrdinances } from '../../../lib/civic-data';
import { civicJsonResponse } from '../../../lib/civic-api';
import ordinanceSource from '../../../data/ordinances.manifest.json';
import repositorySource from '../../../data/repository.manifest.json';
import ordinanceRaw from '../../../data/ordinances.json?raw';
import barangayRaw from '../../../data/barangays.json?raw';
import facilitiesRaw from '../../../data/emergency-facilities.json?raw';

export const prerender = true;

function metadata(name: string, data: unknown[], capturedAt: string, rawSource: string) {
  return {
    url: `${import.meta.env.BASE_URL}api/v1/${name}.json`,
    recordCount: data.length,
    capturedAt,
    revision: `sha256:${createHash('sha256').update(JSON.stringify(data), 'utf8').digest('hex')}`,
    sourceRevision: `sha256:${createHash('sha256').update(rawSource, 'utf8').digest('hex')}`,
  };
}

export const GET: APIRoute = async () => {
  const [ordinances, barangays, facilities] = await Promise.all([
    fetchOrdinances(), fetchBarangays(), fetchEmergencyFacilities(),
  ]);
  return civicJsonResponse({
    apiVersion: 'v1',
    datasets: {
      ordinances: {
        ...metadata('ordinances', ordinances.data, ordinanceSource.capturedFrom, ordinanceRaw),
        source: ordinanceSource.sourcePublisher,
      },
      barangays: {
        ...metadata('barangays', barangays.data, repositorySource.capturedAt, barangayRaw),
        source: { kind: 'repository', baseCommit: repositorySource.baseCommit },
      },
      'emergency-facilities': {
        ...metadata('emergency-facilities', facilities.data, repositorySource.capturedAt, facilitiesRaw),
        source: { kind: 'repository', baseCommit: repositorySource.baseCommit },
      },
    },
  });
};
