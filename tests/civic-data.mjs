import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createServer } from 'vite';
import { getViteConfig } from 'astro/config';

const expected = JSON.parse(await readFile('tests/fixtures/data-parity.json', 'utf8'));
const canonical = value => JSON.stringify(value, (_, item) => item && typeof item === 'object' && !Array.isArray(item)
  ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item);
const hash = value => createHash('sha256').update(canonical(value)).digest('hex');
const datasets = ['ordinances', 'barangays', 'emergency-facilities'];
const config = await getViteConfig({
  server: { middlewareMode: true, hmr: false }, optimizeDeps: { noDiscovery: true }, logLevel: 'error',
  plugins: [{
    name: 'raw-source-whitespace-fixture', enforce: 'pre',
    async load(id) {
      // Change raw file bytes without changing JSON values or capture manifests.
      if (datasets.some(name => id.endsWith(`/src/data/${name}.json?raw`))) {
        return `export default ${JSON.stringify(await readFile(id.slice(0, -4), 'utf8') + '\n')}`;
      }
    },
  }],
})({ mode: 'test', command: 'serve' });
const server = await createServer({ ...config, configFile: false });
try {
  const data = await server.ssrLoadModule('/src/lib/civic-data.ts');
  const { data: ordinances } = await data.fetchOrdinances();
  assert.equal(ordinances.length, expected.ordinances.rows);
  assert.equal(new Set(ordinances.map(record => record.id)).size, ordinances.length);
  for (const record of ordinances) {
    assert.equal(hash(record), expected.ordinances.normalizedById[record.id], `Legacy record parity: ${record.id}`);
  }
  for (let index = 1; index < ordinances.length; index++) {
    const previous = ordinances[index - 1], current = ordinances[index];
    assert.ok(previous.ordinance_year > current.ordinance_year ||
      (previous.ordinance_year === current.ordinance_year && previous.id < current.id), 'Year descending, ID ascending ties');
  }
  console.log('PASS: all 862 ordinance records match the pre-migration legacy oracle, with deterministic ordering');
  assert.equal(hash((await data.fetchBarangays()).data), expected.datasets.barangays.canonicalSha256, 'All barangay values and source order');
  assert.equal(hash((await data.fetchCityOfficials()).data), expected.datasets['city-officials'].canonicalSha256, 'All city-official values and source order');
  assert.equal(hash((await data.fetchEmergencyFacilities()).data), expected.datasets['emergency-facilities'].canonicalSha256, 'All emergency-facility values and source order');
  const directories = await server.ssrLoadModule('/src/data/disaster-data.ts');
  assert.equal(hash(directories.policeStations), expected.datasets['police-stations'].canonicalSha256);
  assert.equal(hash(directories.fireStations), expected.datasets['fire-stations'].canonicalSha256);
  assert.equal(createHash('sha256').update(await readFile('src/data/ordinances.json')).digest('hex'), expected.ordinances.rawSha256, 'Raw capture remains byte-identical');
  for (const [file, sha256] of Object.entries(expected.unchangedSourceFiles)) {
    assert.equal(createHash('sha256').update(await readFile(file)).digest('hex'), sha256, `Unchanged baseline source: ${file}`);
  }
  console.log('PASS: all barangay, official, emergency, police/fire records and untouched source files match the pinned repository baselines');
  const route = await server.ssrLoadModule('/src/pages/api/v1/metadata.json.ts');
  const metadata = await (await route.GET()).json();
  for (const name of datasets) {
    const original = await readFile(`src/data/${name}.json`, 'utf8');
    const originalHash = createHash('sha256').update(original).digest('hex');
    const changedHash = createHash('sha256').update(original + '\n').digest('hex');
    assert.notEqual(changedHash, originalHash);
    assert.equal(metadata.datasets[name].sourceRevision, `sha256:${changedHash}`, `${name} source revision follows raw bytes, not the stored capture checksum`);
  }
  console.log('PASS: API source revisions follow formatting-only raw file changes without manifest edits');
} finally {
  await server.close();
}
