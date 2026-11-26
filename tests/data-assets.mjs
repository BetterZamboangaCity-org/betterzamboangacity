import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';

const base = process.env.BASE_URL || 'http://127.0.0.1:4321';
const built = process.argv.includes('--built');
const parity = JSON.parse(await readFile('tests/fixtures/data-parity.json', 'utf8'));
const canonicalHash = value => createHash('sha256').update(JSON.stringify(value, (_, item) => item && typeof item === 'object' && !Array.isArray(item)
  ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item)).digest('hex');
async function asset(name) {
  if (built) return readFile(`.vercel/output/static/api/v1/${name}.json`, 'utf8');
  const response = await fetch(`${base}/api/v1/${name}.json`);
  assert.equal(response.status, 200, `Public v1 ${name} asset exists`);
  assert.match(response.headers.get('content-type'), /application\/json/);
  assert.equal(response.headers.get('access-control-allow-origin'), '*', 'Public read-only API permits browser consumers');
  assert.equal(response.headers.get('access-control-allow-credentials'), null, 'Public API does not enable credentialed cross-origin reads');
  assert.equal(response.headers.get('cache-control'), 'public, max-age=0, must-revalidate', 'Stable v1 URLs revalidate');
  return response.text();
}
const metadata = JSON.parse(await asset('metadata'));
assert.equal(metadata.apiVersion, 'v1');
assert.deepEqual(Object.keys(metadata.datasets).sort(), ['barangays', 'emergency-facilities', 'ordinances']);
for (const [name, count] of [['ordinances', 862], ['barangays', 98], ['emergency-facilities', 22]]) {
  const text = await asset(name);
  const records = JSON.parse(text);
  assert.ok(Array.isArray(records), 'Record endpoints retain array responses');
  assert.equal(records.length, count, `Complete ${name} dataset`);
  const info = metadata.datasets[name];
  assert.equal(info.url, `/api/v1/${name}.json`);
  assert.equal(info.recordCount, count);
  assert.equal(info.revision, `sha256:${createHash('sha256').update(text).digest('hex')}`, 'Revision identifies exact served UTF8 JSON bytes');
  const source = await readFile(`src/data/${name}.json`);
  assert.equal(info.sourceRevision, `sha256:${createHash('sha256').update(source).digest('hex')}`, 'Source revision identifies raw file bytes');
  assert.ok(Number.isFinite(Date.parse(info.capturedAt)), 'Capture date is source metadata');
  if (name === 'ordinances') {
    assert.equal(new Set(records.map(record => record.id)).size, count);
    for (const record of records) assert.equal(canonicalHash(record), parity.ordinances.normalizedById[record.id], `Public legacy parity: ${record.id}`);
  } else {
    assert.equal(canonicalHash(records), parity.datasets[name].canonicalSha256, `Complete public ${name} parity`);
  }
}
if (!built) {
  assert.equal((await fetch(`${base}/api/v2/metadata.json`)).status, 404, 'Unknown API versions do not silently serve v1');
}
if (process.argv.includes('--built')) {
  const ids = Object.keys(parity.ordinances.normalizedById);
  const markers = [ids[0], ids[Math.floor(ids.length / 2)], ids.at(-1)];
  const root = '.vercel/output/static';
  for (const file of await readdir(root, { recursive: true })) {
    if (!file.endsWith('.js')) continue;
    const text = await readFile(`${root}/${file}`, 'utf8');
    assert.doesNotMatch(text, /@supabase|\.supabase\.co|PUBLIC_(?:ORDINANCES_)?SUPABASE/, `No database client/config: ${file}`);
    assert.ok(!markers.some(id => text.includes(id)), `Ordinance corpus stays out of browser JS: ${file}`);
  }
}
console.log('PASS: API v1 arrays, metadata, exact-byte revisions, complete counts and build isolation at the selected boundary');
