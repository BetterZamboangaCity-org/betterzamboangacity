// Start Astro normally. Replace only the same-origin repository JSON read.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const base = process.env.EMERGENCY_TEST_URL || 'http://127.0.0.1:4321';
const output = process.env.EMERGENCY_TEST_OUTPUT || '/tmp/betterzc-emergency-20261113';
await mkdir(output, { recursive: true });
const hostile = '<img src=x onerror="window.__executed=true">';
const records = [
  { id: 'hospital', name: 'Central Hospital', category: 'hospital', catLabel: 'HOSPITAL', lat: 6.92, lng: 122.07, phone: '(062) 991-1111', address: 'Central Road' },
  { id: 'police', name: 'West Police', category: 'police', catLabel: 'POLICE', lat: 6.96, lng: 121.95, phone: '0917-111-2222', address: 'West Road' },
  { id: `hostile\" ${hostile}`, name: hostile, category: 'hospital', catLabel: 'HOSPITAL', lat: 6.93, lng: 122.08, phone: `javascript:alert(1) ${hostile}`, address: hostile },
  { id: 'invalid', name: 'No Coordinates', category: 'hospital', catLabel: 'HOSPITAL', lat: 0, lng: 0, phone: '911', address: 'Unknown location' },
  { id: 'range', name: 'Out of Range', category: 'hospital', catLabel: 'HOSPITAL', lat: 95, lng: 190, phone: '911', address: 'Unknown location' },
];
let delayData = false;
let dataRequests = 0;
let abortedRequests = 0;
const delayed = [];
const databaseRequests = [];

async function releaseDelayed() {
  await Promise.all(delayed.splice(0).map(route => route.fulfill({ contentType: 'application/json', body: JSON.stringify([
    { ...records[0], name: 'STALE FACILITY' },
  ]) }).catch(error => { if (!route.request().failure()) throw error; })));
}

const stub = `
window.__maps = { created: 0, removed: 0, instances: [] };
window.L = {
  map(container) {
    const map = { container, layers: new Set(), flyCalls: 0,
      setView() { return this; }, hasLayer(layer) { return this.layers.has(layer); },
      removeLayer(layer) { this.layers.delete(layer); return this; },
      flyTo() { this.flyCalls++; return this; },
      remove() { window.__maps.removed++; this.container.replaceChildren(); this.layers.clear(); }
    };
    window.__maps.created++; window.__maps.instances.push(map); return map;
  },
  control: { zoom() { return { addTo() {} }; } },
  tileLayer() { return { addTo() {} }; }, divIcon(value) { return value; },
  marker(coords) { return { coords, map: null, popup: null,
    addTo(map) { this.map = map; map.layers.add(this); return this; },
    bindPopup(content) { this.popup = content; return this; },
    setPopupContent(content) { this.popup = content; return this; },
    openPopup() {
      this.map.container.querySelector('.leaflet-popup')?.remove();
      const node = document.createElement('div'); node.className = 'leaflet-popup';
      if (this.popup instanceof HTMLElement) node.append(this.popup);
      else node.innerHTML = this.popup;
      this.map.container.append(node); return this;
    }
  }; }
};`;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const log = [];
async function fresh({ leaflet = 'stub' } = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.addInitScript(() => {
    window.__clipboard = [];
    window.__geo = [];
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText(value) { window.__clipboard.push(value); return Promise.resolve(); } } });
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: { getCurrentPosition(success, error, options) { window.__geo.push({ success, error, options }); } } });
  });
  const page = await context.newPage();
  page.on('request', request => {
    const url = new URL(request.url());
    if (url.hostname.endsWith('.supabase.co')) databaseRequests.push(url.origin + url.pathname);
  });
  page.on('requestfailed', request => {
    if (new URL(request.url()).pathname === '/api/v1/emergency-facilities.json' && request.failure()?.errorText === 'net::ERR_ABORTED') abortedRequests++;
  });
  await page.route('**/api/v1/emergency-facilities.json', async route => {
    assert.equal(route.request().method(), 'GET', 'The directory must only read data.');
    dataRequests++;
    if (delayData) { delayed.push(route); return; }
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(records) });
  });
  page.setDefaultTimeout(10000);
  page.setDefaultNavigationTimeout(15000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  if (leaflet !== 'real') await page.route('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', async route => {
    if (leaflet === 'failure') await route.abort();
    else await route.fulfill({ contentType: 'application/javascript', body: stub, headers: { 'access-control-allow-origin': '*' } });
  });
  // The browser validates SRI for the real library. The deterministic stub has its own contents.
  if (leaflet !== 'real') await context.addInitScript(() => {
    const append = Element.prototype.append;
    Element.prototype.append = function (...nodes) {
      for (const node of nodes) if (node instanceof HTMLScriptElement && node.src.includes('/leaflet.js')) node.removeAttribute('integrity');
      return append.apply(this, nodes);
    };
  });
  return { context, page, errors };
}
async function ready(page) {
  await page.waitForFunction(() => document.querySelectorAll('.facility-card').length === 5);
}
async function waitForRequest(before) {
  for (let attempts = 0; attempts < 150 && dataRequests === before; attempts++) {
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  assert.ok(dataRequests > before, 'The directory must request emergency facilities.');
}
async function toHome(page) {
  await page.locator('header a[href="/"]').first().click();
  await page.waitForURL(`${base}/`, { waitUntil: 'commit' });
  await page.waitForFunction(() => !document.getElementById('disaster-directory'));
}
async function toContact(page) {
  await page.locator('a[href="/contact/disaster"]').first().click();
  await page.waitForURL(`${base}/contact/disaster`, { waitUntil: 'commit' });
}
async function check(name, callback) {
  console.log(`RUN ${name}`);
  await callback();
  log.push(`PASS ${name}`);
  console.log(log.at(-1));
}

try {
  await check('direct load, safe list and popup, coordinate and URL constraints', async () => {
    const { context, page, errors } = await fresh();
    await page.goto(`${base}/contact/disaster`); await ready(page);
    await page.waitForFunction(() => window.__maps?.created === 1);
    assert.equal(await page.locator('#facility-sidebar-list img').count(), 0);
    assert.equal(await page.locator('#facility-sidebar-list .facility-card').filter({ hasText: hostile }).count(), 1);
    assert.equal(await page.evaluate(() => window.__executed), undefined);
    assert.equal(await page.evaluate(() => window.__maps.instances[0].layers.size), 3);
    const invalid = page.locator('.facility-card').filter({ hasText: 'No Coordinates' });
    assert.equal(await invalid.locator('a').filter({ hasText: 'Directions' }).count(), 0);
    assert.equal(await page.locator('.facility-card').filter({ hasText: 'Out of Range' }).locator('a').filter({ hasText: 'Directions' }).count(), 0);
    const hostileCard = page.locator('.facility-card').filter({ hasText: hostile });
    assert.equal(await hostileCard.locator('a[href^="tel:"]').count(), 0);
    await hostileCard.locator('button').click();
    assert.equal(await page.locator('.leaflet-popup img').count(), 0);
    assert.ok((await page.locator('.leaflet-popup').textContent()).includes(hostile));
    assert.equal(await page.evaluate(() => window.__executed), undefined);
    const links = await page.locator('.facility-card a').evaluateAll(nodes => nodes.map(node => node.href));
    for (const href of links) assert.ok(/^tel:\+?\d+$/.test(href) || href.startsWith('https://www.google.com/maps/dir/?api=1&destination='));
    assert.deepEqual(errors, []); await context.close();
  });

  await check('repeated Astro navigation, consistent filters, accordions, one clipboard handler', async () => {
    const { context, page, errors } = await fresh();
    await page.goto(`${base}/`);
    for (let visit = 1; visit <= 3; visit++) {
      await toContact(page); await ready(page);
      await page.waitForFunction(count => window.__maps?.created === count, visit);
      await page.locator('[data-map-filter="police"]').click();
      assert.equal(await page.locator('.facility-card').count(), 1);
      assert.equal(await page.evaluate(() => window.__maps.instances.at(-1).layers.size), 1);
      await page.locator('[data-map-filter="all"]').click();
      await page.locator('#map-search-input').fill('0917-111');
      assert.equal(await page.locator('.facility-card').count(), 1);
      assert.equal(await page.evaluate(() => window.__maps.instances.at(-1).layers.size), 1);
      await page.locator('#map-search-input').fill('Central Hospital');
      assert.equal(await page.locator('.facility-card').count(), 1);
      await page.locator('#map-search-input').fill('');
      await page.locator('#police-search').fill('Vitali');
      assert.equal(await page.locator('.police-card:visible').count(), 1);
      await page.locator('#police-search').fill('');
      await page.locator('.police-filter-btn[data-filter="West Coast"]').click();
      assert.equal(await page.locator('.police-card:visible').count(), 3);
      await page.locator('#fire-search').fill('Tetuan');
      assert.equal(await page.locator('.fire-card:visible').count(), 1);
      const details = page.locator('#disaster-directory details').first();
      await details.locator('summary').click(); assert.equal(await details.getAttribute('open'), null);
      await details.locator('summary').click();
      await page.locator('[data-copy-phone="911"]').first().click();
      await page.waitForFunction(count => window.__clipboard.length === count, visit);
      assert.equal(await page.locator('#directory-status').textContent(), 'Phone number copied.');
      await toHome(page);
      assert.equal(await page.evaluate(() => window.__maps.removed), visit);
    }
    assert.deepEqual(errors, []); await context.close();
  });

  await check('geolocation success, denied, unavailable, timeout, late callback disposal', async () => {
    const { context, page, errors } = await fresh();
    await page.goto(`${base}/contact/disaster`); await ready(page);
    for (const [code, message] of [[1, 'denied'], [2, 'unavailable'], [3, 'timed out']]) {
      await page.locator('#geo-locate-btn').click();
      await page.evaluate(code => window.__geo.at(-1).error({ code }), code);
      assert.ok((await page.locator('#user-geo-status').textContent()).includes(message));
      assert.equal(await page.locator('#geo-locate-btn').isEnabled(), true);
    }
    await page.locator('#geo-locate-btn').click();
    await page.evaluate(() => window.__geo.at(-1).success({ coords: { latitude: 6.96, longitude: 121.95 } }));
    assert.ok((await page.locator('.facility-card').first().textContent()).includes('West Police'));
    assert.ok((await page.locator('.facility-card a').filter({ hasText: 'Directions' }).first().getAttribute('href')).includes('origin=6.96%2C121.95'));
    await page.locator('#geo-locate-btn').click();
    await toHome(page); await toContact(page); await ready(page);
    await page.evaluate(() => { window.__geo.at(-1).success({ coords: { latitude: 7, longitude: 122 } }); window.__geo.at(-1).error({ code: 1 }); });
    assert.equal(await page.locator('#user-geo-status').textContent(), '');
    assert.deepEqual(errors, []); await context.close();
  });

  await check('pending facility request aborts and cannot populate a later page', async () => {
    delayData = true;
    const before = dataRequests;
    const { context, page, errors } = await fresh();
    await page.goto(`${base}/contact/disaster`);
    await waitForRequest(before);
    await toHome(page);
    delayData = false;
    await toContact(page); await ready(page);
    await releaseDelayed();
    assert.equal(await page.getByText('STALE FACILITY').count(), 0);
    assert.ok(abortedRequests > 0);
    assert.deepEqual(errors, []); await context.close();
  });

  await check('late Leaflet completion does not create a stale map', async () => {
    const { context, page, errors } = await fresh();
    let release;
    await page.unroute('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');
    await page.route('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', async route => {
      await new Promise(resolve => { release = resolve; });
      await route.fulfill({ contentType: 'application/javascript', body: stub, headers: { 'access-control-allow-origin': '*' } });
    });
    await page.goto(`${base}/contact/disaster`, { waitUntil: 'domcontentloaded' }); await ready(page);
    await toHome(page); release();
    await page.waitForFunction(() => !!window.L);
    assert.equal(await page.evaluate(() => window.__maps.created), 0);
    await toContact(page); await ready(page);
    await page.waitForFunction(() => window.__maps.created === 1);
    assert.deepEqual(errors, []); await context.close();
  });

  await check('late response stays ignored when the transport cannot cancel', async () => {
    delayData = true;
    const before = dataRequests;
    const { context, page, errors } = await fresh();
    await context.addInitScript(() => {
      const fetch = window.fetch;
      window.__uncancellableCompleted = 0;
      window.fetch = (input, options) => String(input).includes('/api/v1/emergency-facilities.json')
        ? fetch(input, { ...options, signal: undefined }).then(response => { window.__uncancellableCompleted++; return response; })
        : fetch(input, options);
    });
    await page.goto(`${base}/contact/disaster`);
    await waitForRequest(before);
    await toHome(page);
    delayData = false;
    await toContact(page); await ready(page);
    await releaseDelayed();
    await page.waitForFunction(() => window.__uncancellableCompleted === 2);
    assert.equal(await page.getByText('STALE FACILITY').count(), 0);
    assert.equal(await page.locator('.facility-card').count(), 5);
    assert.deepEqual(errors, []); await context.close();
  });

  await check('Leaflet failure preserves list, filters, static copy and geolocation errors', async () => {
    const { context, page, errors } = await fresh({ leaflet: 'failure' });
    await page.goto(`${base}/contact/disaster`); await ready(page);
    await page.waitForFunction(() => document.querySelector('#directory-status').textContent.includes('Map unavailable'));
    await page.locator('#map-search-input').fill('West Police');
    assert.equal(await page.locator('.facility-card').count(), 1);
    await page.locator('[data-copy-phone="911"]').first().click();
    await page.waitForFunction(() => window.__clipboard.length === 1);
    await page.locator('#geo-locate-btn').click();
    await page.evaluate(() => window.__geo[0].error({ code: 1 }));
    assert.ok((await page.locator('#user-geo-status').textContent()).includes('denied'));
    await page.locator('#fire-search').fill('Tetuan');
    assert.equal(await page.locator('.fire-card:visible').count(), 1);
    assert.deepEqual(errors, []); await context.close();
  });

  await check('real Leaflet browser load and desktop/mobile evidence', async () => {
    const { context, page, errors } = await fresh({ leaflet: 'real' });
    await page.goto(`${base}/contact/disaster`); await ready(page);
    await page.waitForSelector('#leaflet-emergency-map .leaflet-pane', { state: 'attached', timeout: 30000 });
    assert.ok(await page.locator('#leaflet-emergency-map').evaluate(node => node.clientWidth > 0 && node.clientHeight > 0));
    await page.locator('.facility-card button').first().click();
    await page.waitForSelector('.leaflet-popup');
    assert.equal(await page.locator('.leaflet-popup img').count(), 0);
    await page.locator('#map-search-input').fill('West Police');
    assert.equal(await page.locator('.leaflet-marker-icon').count(), 1);
    await page.locator('#map-search-input').fill('');
    await page.addStyleTag({ content: 'astro-dev-toolbar { display:none !important; }' });
    await page.locator('#disaster-directory').screenshot({ path: `${output}/desktop.png` });
    await page.locator('section').filter({ has: page.locator('#leaflet-emergency-map') }).screenshot({ path: `${output}/desktop-map.png` });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.locator('#disaster-directory').screenshot({ path: `${output}/mobile-375.png` });
    await page.locator('section').filter({ has: page.locator('#leaflet-emergency-map') }).screenshot({ path: `${output}/mobile-375-map.png` });
    assert.deepEqual(errors, []); await context.close();
  });
  assert.deepEqual(databaseRequests, [], 'No database requests');
} finally {
  await browser.close();
  delayed.length = 0;
  await writeFile(`${output}/regressions.log`, `${log.join('\n')}\n`);
}
