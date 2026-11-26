import type { APIRoute } from 'astro';
import { createHash } from 'node:crypto';
import { fetchBarangays, fetchEmergencyFacilities, fetchOrdinances } from '../../../lib/civic-data';
import { civicJsonResponse } from '../../../lib/civic-api';
import ordinanceSource from '../../../data/ordinances.manifest.json';
import repositorySource from '../../../data/repository.manifest.json';

export const prerender = true;

function metadata(name: string, data: unknown[], capturedAt: string, sourceSha256: string) {
  return {
    url: `${import.meta.env.BASE_URL}api/v1/${name}.json`,
    recordCount: data.length,
    capturedAt,
    revision: `sha256:${createHash('sha256').update(JSON.stringify(data), 'utf8').digest('hex')}`,
    sourceRevision: `sha256:${sourceSha256}`,
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
        ...metadata('ordinances', ordinances.data, ordinanceSource.capturedFrom, ordinanceSource.sha256),
        source: ordinanceSource.sourcePublisher,
      },
      barangays: {
        ...metadata('barangays', barangays.data, repositorySource.capturedAt, repositorySource.datasets.find(item => item.dataset === 'barangays')!.sha256),
        source: { kind: 'repository', baseCommit: repositorySource.baseCommit },
      },
      'emergency-facilities': {
        ...metadata('emergency-facilities', facilities.data, repositorySource.capturedAt, repositorySource.datasets.find(item => item.dataset === 'emergency-facilities')!.sha256),
        source: { kind: 'repository', baseCommit: repositorySource.baseCommit },
      },
    },
  });
};
