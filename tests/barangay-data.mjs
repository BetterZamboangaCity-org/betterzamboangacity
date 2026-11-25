import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const expected = JSON.parse(await readFile('tests/fixtures/barangay-profiles.json', 'utf8'));
const base = process.env.BASE_URL || 'http://127.0.0.1:4321';
const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'chrome' });
try {
  const page = await browser.newPage({ viewport: expected.viewport });
  const databaseRequests = [];
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.hostname.endsWith('.supabase.co')) databaseRequests.push(url.origin + url.pathname);
    return ['localhost', '127.0.0.1'].includes(url.hostname) ? route.continue() : route.abort();
  });
  for (const profile of expected.profiles) {
    const response = await page.goto(`${base}/government/barangays?slug=${encodeURIComponent(profile.slug)}`, { waitUntil: 'domcontentloaded' });
    assert.equal(response.status(), 200);
    const text = (await page.locator('main').innerText()).replace(/\s+/g, ' ').trim();
    assert.equal(createHash('sha256').update(text).digest('hex'), profile.textSha256, `Public profile parity: ${profile.slug}`);
    if (profile.slug === 'ayala') {
      assert.ok(text.includes('MERCELITO ACAIN OLVINAR'), 'Existing exact-name roster join');
      assert.ok(text.includes('22,542'), 'Existing population precedence, pending source reconciliation in #16');
    }
    if (profile.slug === 'camino-nuevo') {
      assert.ok(text.includes('Punong Barangay Roster Pending'));
      assert.ok(text.includes('SK Chairperson Roster Pending'));
    }
  }
  const missing = await page.goto(`${base}/government/barangays?slug=unknown-migration-record`, { waitUntil: 'domcontentloaded' });
  assert.equal(missing.status(), 404);
  assert.ok((await page.locator('main').innerText()).includes('Barangay not found'));
  assert.deepEqual(databaseRequests, []);
  console.log('PASS: all 98 public profiles preserve names, roster/pending states and population; unknown identity is 404');
} finally {
  await browser.close();
}
