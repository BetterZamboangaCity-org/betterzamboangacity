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
  async function assertOrdinanceCredit() {
    const source = page.getByRole('link', { name: 'Ley De Zamboanga', exact: true });
    assert.equal(await source.getAttribute('href'), 'https://zamboangacity-ordinance.vercel.app/');
    await page.getByText(/^Snapshot captured \d{4}-\d{2}-\d{2} from$/).waitFor();
    await page.getByText('Created & Maintained by Chex', { exact: true }).waitFor();
  }
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
  await page.route('**/api/v1/emergency-facilities.json', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify([
    { id: 'fixture-only', name: 'Fixture-only Hospital', category: 'hospital', catLabel: 'HOSPITAL', lat: 6.92, lng: 122.07, phone: '911', address: 'Fixture Road' },
  ]) }));
  await page.goto(`${base}/contact/disaster`, { waitUntil: 'domcontentloaded' });
  await page.getByText('Fixture-only Hospital', { exact: true }).waitFor({ timeout: 8000 });
  assert.equal(await page.locator('.facility-card').count(), 1);
  await page.route('**/api/v1/ordinances.json', route => route.fulfill({ status: 503, contentType: 'application/json', body: '[]' }));
  await page.goto(`${base}/ordinances/regulatory-ordinances`, { waitUntil: 'domcontentloaded' });
  await page.getByText('Ordinance records are unavailable. Try again later.', { exact: true }).waitFor({ timeout: 8000 });
  await assertOrdinanceCredit();
  await page.addStyleTag({ content: 'astro-dev-toolbar { display:none !important; }' });
  await page.evaluate(() => new Promise(resolve => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); requestAnimationFrame(() => requestAnimationFrame(resolve)); }));
  await page.screenshot({ path: `${evidence}/ordinance-error-desktop.png`, fullPage: true });
  await page.setViewportSize({ width: 375, height: 812 });
  await assertOrdinanceCredit();
  await page.screenshot({ path: `${evidence}/ordinance-error-mobile.png`, fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  const [ordinanceRecord] = await (await page.request.get(`${base}/api/v1/ordinances.json`)).json();
  for (const [field, value] of [
    ['ordinance_year', 'not-a-year'],
    ['ordinance_year', '2026e0'],
    ['ordinance_year', '0x7EA'],
    ['ordinance_year', ''],
    ['ordinance_year', 0],
    ['ordinance_year', 2026.5],
    ['active_status', { unexpected: true }],
    ['date_enacted', { unexpected: true }],
    ['date_approved', { unexpected: true }],
  ]) {
    await page.route('**/api/v1/ordinances.json', route => route.fulfill({
      contentType: 'application/json', body: JSON.stringify([{ ...ordinanceRecord, [field]: value }]),
    }));
    await page.goto(`${base}/ordinances/regulatory-ordinances`, { waitUntil: 'domcontentloaded' });
    await page.getByText('Ordinance records are unavailable. Try again later.', { exact: true }).waitFor();
    await assertOrdinanceCredit();
    assert.deepEqual(errors, [], `Malformed ${field} must not reach React`);
  }
  for (const year of [String(ordinanceRecord.ordinance_year), ` ${ordinanceRecord.ordinance_year} `]) {
    await page.route('**/api/v1/ordinances.json', route => route.fulfill({
      contentType: 'application/json', body: JSON.stringify([{ ...ordinanceRecord, ordinance_year: year, date_approved: null }]),
    }));
    await page.goto(`${base}/ordinances/regulatory-ordinances`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Quick Preview', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Years', exact: true }).click();
    await page.getByRole('button', { name: new RegExp(`^Year ${ordinanceRecord.ordinance_year}\\s+1$`) }).click();
    assert.equal(await page.getByRole('button', { name: 'Quick Preview', exact: true }).count(), 1, 'Year badge and selected desktop results agree');
    if (year.startsWith(' ')) {
      await page.addStyleTag({ content: 'astro-dev-toolbar { display:none !important; }' });
      await page.evaluate(() => new Promise(resolve => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); requestAnimationFrame(() => requestAnimationFrame(resolve)); }));
      await page.screenshot({ path: `${evidence}/ordinance-year-desktop.png`, fullPage: true });
    }
    await page.setViewportSize({ width: 375, height: 812 });
    await page.getByRole('button', { name: `${ordinanceRecord.ordinance_year} 1`, exact: true }).click();
    assert.equal(await page.getByRole('button', { name: 'Quick Preview', exact: true }).count(), 1, 'Year badge and selected mobile results agree');
    if (year.startsWith(' ')) await page.screenshot({ path: `${evidence}/ordinance-year-mobile.png`, fullPage: true });
    await page.setViewportSize({ width: 1280, height: 900 });
  }
  await page.route('**/api/v1/ordinances.json', route => route.fulfill({ contentType: 'application/json', body: '[]' }));
  await page.goto(`${base}/ordinances/regulatory-ordinances`, { waitUntil: 'domcontentloaded' });
  await page.getByText('No ordinance records are included in this snapshot.', { exact: true }).waitFor({ timeout: 8000 });
  await assertOrdinanceCredit();
  await page.addStyleTag({ content: 'astro-dev-toolbar { display:none !important; }' });
  await page.evaluate(() => new Promise(resolve => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); requestAnimationFrame(() => requestAnimationFrame(resolve)); }));
  await page.screenshot({ path: `${evidence}/ordinance-empty-desktop.png`, fullPage: true });
  await page.setViewportSize({ width: 375, height: 812 });
  await assertOrdinanceCredit();
  await page.screenshot({ path: `${evidence}/ordinance-empty-mobile.png`, fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.route('**/api/v1/ordinances.json', route => route.fulfill({ contentType: 'application/json', body: '[{"official_title":null}]' }));
  await page.goto(`${base}/ordinances/regulatory-ordinances`, { waitUntil: 'domcontentloaded' });
  await page.getByText('Ordinance records are unavailable. Try again later.', { exact: true }).waitFor({ timeout: 8000 });
  await page.route('**/api/v1/emergency-facilities.json', route => route.fulfill({ status: 503, contentType: 'application/json', body: '[]' }));
  await page.goto(`${base}/contact/disaster`, { waitUntil: 'domcontentloaded' });
  await page.getByText('Emergency facility data is unavailable. Use the static contacts below.', { exact: true }).waitFor({ timeout: 8000 });
  assert.equal(await page.locator('#map-counter-text').textContent(), 'Emergency facility data unavailable');
  await page.route('**/api/v1/emergency-facilities.json', route => route.fulfill({ contentType: 'application/json', body: '[]' }));
  await page.goto(`${base}/contact/disaster`, { waitUntil: 'domcontentloaded' });
  await page.getByText('No emergency facilities are included in this snapshot.', { exact: true }).waitFor();
  await page.route('**/api/v1/emergency-facilities.json', route => route.fulfill({ contentType: 'application/json', body: '[{"id":"bad","lat":null}]' }));
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
