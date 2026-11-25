import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const base = process.env.BASE_URL || 'http://127.0.0.1:4321';
const evidence = process.env.TEST_EVIDENCE_DIR || '.agents/handoffs/issue-15/data-ui';
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'chrome' });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.setDefaultTimeout(8000);
  const databaseRequests = [];
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.hostname.endsWith('.supabase.co')) databaseRequests.push(url.origin + url.pathname);
    return ['localhost', '127.0.0.1'].includes(url.hostname) ? route.continue() : route.abort();
  });
  await page.goto(`${base}/ordinances/regulatory-ordinances`, { waitUntil: 'domcontentloaded' });
  await page.getByText('Page 1 of 87 (862 total entries)', { exact: true }).waitFor({ timeout: 8000 });
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByText('Page 2 of 87 (862 total entries)', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Previous', exact: true }).click();
  await page.getByRole('button', { name: /^Business & Trade/ }).click();
  await page.getByText('Page 1 of 22 (218 total entries)', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Years', exact: true }).click();
  await page.getByRole('button', { name: /^Year 2026\b/ }).click();
  await page.getByText('Page 1 of 3 (22 total entries)', { exact: true }).waitFor();
  await page.getByRole('button', { name: /^Overall Directory/ }).click();
  await page.locator('#ordinance-search').fill('__no_snapshot_match__');
  await page.getByRole('heading', { name: 'No Ordinances Found', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Reset Filters', exact: true }).click();
  await page.getByText('Page 1 of 87 (862 total entries)', { exact: true }).waitFor();
  assert.equal((await page.locator('tbody tr').first().locator('td').first().innerText()).trim(), 'No. 948');
  await page.getByRole('button', { name: 'Ordinance No.', exact: true }).click();
  assert.equal((await page.locator('tbody tr').first().locator('td').first().innerText()).trim(), 'No. 1');
  await page.getByRole('button', { name: 'Ordinance No.', exact: true }).click();
  await page.addStyleTag({ content: 'astro-dev-toolbar { display:none !important; }' });
  await page.evaluate(() => new Promise(resolve => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); requestAnimationFrame(() => requestAnimationFrame(resolve)); }));
  await page.screenshot({ path: `${evidence}/ordinances-desktop.png`, fullPage: true });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.evaluate(() => new Promise(resolve => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); requestAnimationFrame(() => requestAnimationFrame(resolve)); }));
  await page.screenshot({ path: `${evidence}/ordinances-mobile.png`, fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.route('**/data/emergency-facilities.json', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify([
    { id: 'fixture-only', name: 'Fixture-only Hospital', category: 'hospital', catLabel: 'HOSPITAL', lat: 6.92, lng: 122.07, phone: '911', address: 'Fixture Road' },
  ]) }));
  await page.goto(`${base}/contact/disaster`, { waitUntil: 'domcontentloaded' });
  await page.getByText('Fixture-only Hospital', { exact: true }).waitFor({ timeout: 8000 });
  assert.equal(await page.locator('.facility-card').count(), 1);
  await page.route('**/data/ordinances.json', route => route.fulfill({ status: 503, contentType: 'application/json', body: '[]' }));
  await page.goto(`${base}/ordinances/regulatory-ordinances`, { waitUntil: 'domcontentloaded' });
  await page.getByText('Ordinance records are unavailable. Try again later.', { exact: true }).waitFor({ timeout: 8000 });
  const [ordinanceRecord] = await (await page.request.get(`${base}/data/ordinances.json`)).json();
  for (const field of ['active_status', 'date_enacted', 'date_approved']) {
    await page.route('**/data/ordinances.json', route => route.fulfill({
      contentType: 'application/json', body: JSON.stringify([{ ...ordinanceRecord, [field]: { unexpected: true } }]),
    }));
    await page.goto(`${base}/ordinances/regulatory-ordinances`, { waitUntil: 'domcontentloaded' });
    await page.getByText('Ordinance records are unavailable. Try again later.', { exact: true }).waitFor();
    assert.deepEqual(errors, [], `Malformed ${field} must not reach React`);
  }
  await page.route('**/data/ordinances.json', route => route.fulfill({ contentType: 'application/json', body: '[]' }));
  await page.goto(`${base}/ordinances/regulatory-ordinances`, { waitUntil: 'domcontentloaded' });
  await page.getByText('No ordinance records are included in this snapshot.', { exact: true }).waitFor({ timeout: 8000 });
  await page.route('**/data/ordinances.json', route => route.fulfill({ contentType: 'application/json', body: '[{"official_title":null}]' }));
  await page.goto(`${base}/ordinances/regulatory-ordinances`, { waitUntil: 'domcontentloaded' });
  await page.getByText('Ordinance records are unavailable. Try again later.', { exact: true }).waitFor({ timeout: 8000 });
  await page.route('**/data/emergency-facilities.json', route => route.fulfill({ status: 503, contentType: 'application/json', body: '[]' }));
  await page.goto(`${base}/contact/disaster`, { waitUntil: 'domcontentloaded' });
  await page.getByText('Emergency facility data is unavailable. Use the static contacts below.', { exact: true }).waitFor({ timeout: 8000 });
  assert.equal(await page.locator('#map-counter-text').textContent(), 'Emergency facility data unavailable');
  await page.route('**/data/emergency-facilities.json', route => route.fulfill({ contentType: 'application/json', body: '[]' }));
  await page.goto(`${base}/contact/disaster`, { waitUntil: 'domcontentloaded' });
  await page.getByText('No emergency facilities are included in this snapshot.', { exact: true }).waitFor();
  await page.route('**/data/emergency-facilities.json', route => route.fulfill({ contentType: 'application/json', body: '[{"id":"bad","lat":null}]' }));
  await page.goto(`${base}/contact/disaster`, { waitUntil: 'domcontentloaded' });
  await page.getByText('Emergency facility data is unavailable. Use the static contacts below.', { exact: true }).waitFor();
  await page.addStyleTag({ content: 'astro-dev-toolbar { display:none !important; }' });
  await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }));
  await page.screenshot({ path: `${evidence}/data-unavailable-desktop.png`, fullPage: true });
  await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
  await page.getByText('862 City Ordinances', { exact: true }).waitFor({ timeout: 8000 });
  await page.goto(`${base}/government/barangays`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !document.querySelector('astro-island[client="load"][ssr]'));
  await page.getByText(/of 98 barangays/).waitFor();
  await page.getByRole('combobox', { name: /^District:/ }).selectOption('1');
  await page.getByText(/of 38 barangays/).waitFor();
  await page.getByRole('combobox', { name: /^District:/ }).selectOption('all');
  await page.getByRole('combobox', { name: /^Category:/ }).selectOption('Urban');
  await page.getByText(/of 29 barangays/).waitFor();
  await page.getByRole('textbox', { name: 'Search barangays', exact: true }).fill('__no_snapshot_match__');
  await page.getByText(/of 0 barangays/).waitFor();
  await page.getByRole('button', { name: 'Clear barangay search', exact: true }).click();
  await page.getByText(/of 29 barangays/).waitFor();
  await page.goto(`${base}/zamboanga-city/officials`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !document.querySelector('astro-island[client="load"][ssr]'));
  await page.getByText(/Showing 18 official records/).waitFor();
  await page.getByRole('button', { name: /^All Years/ }).click();
  await page.getByText(/Showing 118 official records/).waitFor();
  await page.getByRole('button', { name: 'Mayor', exact: true }).click();
  await page.getByText(/Showing 7 official records/).waitFor();
  await page.getByRole('button', { name: '2001 Election', exact: true }).click();
  await page.getByText(/Showing 1 official records/).waitFor();
  await page.getByRole('textbox', { name: 'Search city officials', exact: true }).fill('__no_snapshot_match__');
  await page.getByRole('heading', { name: 'No Officials Found', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Clear city official search', exact: true }).click();
  await page.getByText(/Showing 1 official records/).waitFor();
  assert.deepEqual(databaseRequests, []);
  assert.deepEqual(errors, []);
  console.log('PASS: snapshot directory, category/year/search/sort/page/reset, home count, JSON failure/malformed/empty states; no database requests or page errors');
} finally {
  await browser.close();
}
