import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { chromium } from 'playwright';

const base = new URL(process.env.BASE_URL || 'http://127.0.0.1:4321');
// A separate port tests browser CORS without bypassing Astro's cross-site dev protection.
const origin = createServer((_, response) => response.end('<!doctype html><title>Public API consumer</title>'));
await new Promise(resolve => origin.listen(0, '127.0.0.1', resolve));
let browser;
try {
  browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'chrome' });
  const page = await browser.newPage();
  await page.goto(`http://${base.hostname}:${origin.address().port}`);
  const result = await page.evaluate(async api => {
    const metadata = await (await fetch(`${api}/api/v1/metadata.json`, { credentials: 'omit' })).json();
    const barangays = await (await fetch(`${api}${metadata.datasets.barangays.url}`, { credentials: 'omit' })).json();
    return { version: metadata.apiVersion, rows: barangays.length };
  }, base.origin);
  assert.deepEqual(result, { version: 'v1', rows: 98 });
  console.log('PASS: another browser origin reads real v1 metadata and barangay JSON with native CORS enforcement');
} finally {
  await browser?.close();
  await new Promise(resolve => origin.close(resolve));
}
