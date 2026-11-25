import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const base = process.env.BASE_URL || 'http://127.0.0.1:4321';
for (const [name, count] of [['ordinances', 862], ['emergency-facilities', 22]]) {
  let records;
  if (process.argv.includes('--built')) {
    records = JSON.parse(await readFile(`.vercel/output/static/data/${name}.json`, 'utf8'));
  } else {
    const response = await fetch(`${base}/data/${name}.json`);
    assert.equal(response.status, 200, `Repository ${name} asset exists`);
    assert.match(response.headers.get('content-type'), /application\/json/);
    records = await response.json();
  }
  assert.equal(records.length, count, `Complete ${name} snapshot`);
}
if (process.argv.includes('--built')) {
  const parity = JSON.parse(await readFile('tests/fixtures/data-parity.json', 'utf8'));
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
console.log('PASS: both complete repository JSON assets at the selected HTTP or static-build boundary');
