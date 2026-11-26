import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4321';
const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'chrome' });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const hydrationErrors = [];
  page.on('console', (message) => {
    if (/hydration|hydrating|server rendered/i.test(message.text())) hydrationErrors.push(message.text());
  });
  page.on('pageerror', (error) => hydrationErrors.push(error.message));
  const queryInput = () => page.getByRole('textbox', { name: 'Search city services', exact: true });
  const categoryHeadings = () => page.locator('#main-content').getByRole('heading', { level: 3 }).allTextContents();
  const checkSearch = async (path, search, expected) => {
    await page.goto(baseURL + path);
    await queryInput().waitFor();
    await page.waitForFunction((value) => document.querySelector('input[aria-label="Search city services"]')?.value === value, search);
    assert.equal(await queryInput().inputValue(), search);
    assert.deepEqual(await categoryHeadings(), [expected]);
  };
  await checkSearch('/services?search=birth%20certificate', 'birth certificate', 'Certificates & Vital Records');
  await checkSearch('/services?q=business%20permit', 'business permit', 'Business, Trade & Investment');
  await page.reload();
  await page.waitForFunction(() => document.querySelector('input[aria-label="Search city services"]')?.value === 'business permit');
  assert.deepEqual(await categoryHeadings(), ['Business, Trade & Investment']);
  const categories = [
    ['vital-records', 'Certificates & Vital Records'],
    ['business-trade', 'Business, Trade & Investment'],
    ['social-services', 'Social Services & Assistance'],
    ['health-wellness', 'Health & Wellness'],
    ['taxation-payments', 'Taxation & Payments'],
    ['agriculture-economic', 'Agriculture & Economic Development'],
    ['infrastructure-public-works', 'Infrastructure & Public Works'],
    ['education-scholarship', 'Education & Scholarship'],
    ['public-safety', 'Public Safety & Security'],
    ['environment-resources', 'Environment & Natural Resources'],
    ['Business, Trade and Investment', 'Business, Trade & Investment'],
    ['Certificates and Vital Records', 'Certificates & Vital Records'],
    ['Health and Wellness', 'Health & Wellness'],
  ];
  for (const [category, title] of categories) {
    await page.goto(`${baseURL}/services?category=${encodeURIComponent(category)}`);
    await page.getByRole('status').filter({ hasText: '1 matching category' }).waitFor();
    assert.deepEqual(await categoryHeadings(), [title]);
  }
  await checkSearch('/services?search=tax&q=birth', 'tax', 'Taxation & Payments');
  await page.goto(baseURL + '/services?search=unlisted-service');
  await page.getByRole('heading', { name: 'No indexed services found' }).waitFor();
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
  assert.equal((await categoryHeadings()).length, 10);
  assert.equal(new URL(page.url()).search, '');
  await page.goto(baseURL + '/services?category=not-a-real-category');
  await page.getByRole('heading', { name: 'No indexed services found' }).waitFor();
  assert.match(await page.getByRole('status').textContent(), /not-a-real-category/);
  await page.getByRole('button', { name: 'Browse all services', exact: true }).click();
  await queryInput().fill('health certificate');
  assert.equal(new URL(page.url()).searchParams.get('search'), 'health certificate');
  await page.reload();
  await page.waitForFunction(() => document.querySelector('input[aria-label="Search city services"]')?.value === 'health certificate');
  assert.deepEqual(await categoryHeadings(), ['Health & Wellness']);

  await page.goto(baseURL);
  await page.getByRole('textbox', { name: 'Search for city services', exact: true }).fill('birth certificate');
  await page.getByRole('button', { name: 'Submit search', exact: true }).click();
  await page.waitForURL((url) => url.pathname === '/services' && url.searchParams.get('search') === 'birth certificate');
  await page.waitForFunction(() => document.querySelector('input[aria-label="Search city services"]')?.value === 'birth certificate');
  assert.deepEqual(await categoryHeadings(), ['Certificates & Vital Records']);
  await page.goBack();
  await page.getByRole('textbox', { name: 'Search for city services', exact: true }).waitFor();
  await page.goForward();
  await page.waitForFunction(() => document.querySelector('input[aria-label="Search city services"]')?.value === 'birth certificate');
  assert.deepEqual(await categoryHeadings(), ['Certificates & Vital Records']);

  await page.goto(baseURL);
  await page.getByRole('textbox', { name: 'Search for city services', exact: true }).fill('birth');
  await page.getByRole('link', { name: /Civil Registry & Birth Certificate/ }).click();
  await page.waitForFunction(() => document.querySelector('input[aria-label="Search city services"]')?.value === 'birth');
  assert.deepEqual(await categoryHeadings(), ['Certificates & Vital Records']);
  await page.goto(baseURL);
  await page.getByRole('link', { name: 'Health Certificate', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('input[aria-label="Search city services"]')?.value === 'health certificate');
  assert.deepEqual(await categoryHeadings(), ['Health & Wellness']);

  const cards = [
    ['Health & Wellness', 'health-wellness', 'Health & Wellness'],
    ['Business Permits & Trade', 'business-trade', 'Business, Trade & Investment'],
    ['Certificates & Vital Records', 'vital-records', 'Certificates & Vital Records'],
  ];
  for (const [name, category, title] of cards) {
    await page.goto(baseURL);
    await page.getByRole('link').filter({ has: page.getByRole('heading', { name, exact: true }) }).click();
    await page.waitForURL(`**/services?category=${category}`);
    await page.getByRole('status').filter({ hasText: '1 matching category' }).waitFor();
    assert.deepEqual(await categoryHeadings(), [title]);
  }
  await page.goto(baseURL + '/services?category=business-trade');
  await page.getByRole('status').filter({ hasText: 'Business, Trade & Investment' }).waitFor();
  // Category navigation stays useful when Astro swaps a page at the same path.
  await page.locator('footer').getByRole('link', { name: 'Certificates and Vital Records', exact: true }).click();
  await page.getByRole('status').filter({ hasText: 'Certificates & Vital Records' }).waitFor();
  assert.deepEqual(await categoryHeadings(), ['Certificates & Vital Records']);
  await page.goBack();
  await page.getByRole('status').filter({ hasText: 'Business, Trade & Investment' }).waitFor();
  assert.deepEqual(await categoryHeadings(), ['Business, Trade & Investment']);

  await page.goto(baseURL);
  const serviceLinks = await page.getByRole('navigation', { name: 'Main Navigation' })
    .locator('a[href*="/services?category="]').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  assert.deepEqual(serviceLinks, categories.slice(0, 10).map(([id]) => `/services?category=${id}`));
  await page.goto(baseURL + '/services?search=health%20certificate');
  await page.waitForFunction(() => document.querySelector('input[aria-label="Search city services"]')?.value === 'health certificate');
  assert.deepEqual(await categoryHeadings(), ['Health & Wellness']);
  const evidence = process.env.SCREENSHOT_DIR;
  if (evidence) {
    await mkdir(evidence, { recursive: true });
    await page.addStyleTag({ content: 'astro-dev-toolbar { display: none !important; }' });
    await page.screenshot({ path: `${evidence}/services-desktop.png`, fullPage: true });
    await page.setViewportSize({ width: 375, height: 900 });
    const content = page.locator('#main-content');
    const bounds = await content.boundingBox();
    assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= 375, 'Service content fits mobile viewport');
    await page.screenshot({ path: `${evidence}/services-mobile.png`, fullPage: true });
    await queryInput().fill('unknown-service');
    await page.getByRole('heading', { name: 'No indexed services found' }).waitFor();
    await content.screenshot({ path: `${evidence}/services-empty-mobile.png` });
  }
  assert.deepEqual(hydrationErrors, [], 'No hydration warnings or uncaught page errors');
  console.log('PASS: search/q precedence, 13 category URLs, reload/clear/unknown, home submit/suggestion/popular/cards, Astro navigation/back/forward; no hydration warnings or page errors');
} finally {
  await browser.close();
}
