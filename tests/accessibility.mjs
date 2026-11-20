import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createServer } from 'node:http';
import { chromium } from 'playwright';

// Start Astro with PUBLIC_SUPABASE_URL and PUBLIC_ORDINANCES_SUPABASE_URL set to
// http://127.0.0.1:4322, and both public anon keys set to test-key.
// Only the external read response is replaced. All components and event paths are real.
const baseURL = process.env.TEST_BASE_URL || 'http://localhost:4321';
const evidence = resolve(process.env.TEST_EVIDENCE_DIR || '.agents/handoffs/launch-2026-11-13/accessibility');
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome' });
const page = await browser.newPage();
page.setDefaultTimeout(8000);
page.setDefaultNavigationTimeout(30000);
const errors = [];
const reactErrors = [];
let fixtureReads = 0;
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => {
  if (message.type() === 'error' && /React|hook|static flag|Rendered (fewer|more)/i.test(message.text())) {
    reactErrors.push(message.text());
  }
});
await page.route('**/*', route => {
  const url = new URL(route.request().url());
  return ['localhost', '127.0.0.1'].includes(url.hostname) ? route.continue() : route.abort();
});
const ordinanceFixture = [{
    ordinance_number: 'Ordinance No. 999', ordinance_year: 2026,
    official_title: 'Test ordinance for accessible public records',
    authors: [], articles_and_sections: [], categories: ['Regulatory'],
    eli5_summary: 'Long public record. '.repeat(180),
    fines: [{ offense_level: 'First offense', penalty: 'Written notice' }],
}];
const fixtureServer = createServer((request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', '*');
  response.setHeader('Content-Type', 'application/json');
  if (request.method === 'OPTIONS') return response.end();
  if (request.method !== 'GET') { response.statusCode = 405; return response.end('[]'); }
  const ordinances = request.url.startsWith('/rest/v1/ordinances?');
  if (ordinances) fixtureReads += 1;
  response.end(JSON.stringify(ordinances ? ordinanceFixture : []));
});
await new Promise(resolve => fixtureServer.listen(4322, '127.0.0.1', resolve));

async function visit(path) {
  await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !document.querySelector('astro-island[client="load"][ssr]'));
}

async function dialogCycle(trigger, closeName, screenshotName) {
  await page.evaluate(() => { document.body.style.overflow = 'auto'; });
  const dialog = page.getByRole('dialog', { name: /\S/ });
  const open = async () => {
    await trigger.focus();
    await page.keyboard.press('Enter');
    await dialog.waitFor({ state: 'visible' });
    await page.waitForFunction(() => document.querySelector('dialog')?.contains(document.activeElement));
    assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
  };
  const closed = async () => {
    await dialog.waitFor({ state: 'detached' });
    await page.waitForFunction(() => document.body.style.overflow === 'auto');
    assert.equal(await trigger.evaluate(element => element === document.activeElement), true, 'Trigger focus returns');
  };

  await open();
  assert.equal(await page.getByRole('button', { name: 'Close modal', exact: true }).evaluate(element => element === document.activeElement), true, 'Close button receives initial focus');
  // Both keyboard directions must stay among dialog controls.
  for (const key of ['Tab', 'Shift+Tab']) {
    for (let step = 0; step < 8; step += 1) {
      await page.keyboard.press(key);
      assert.equal(await dialog.evaluate(element => element.contains(document.activeElement)), true, `${key} stays in dialog`);
    }
  }
  assert.equal(await trigger.evaluate(element => { element.focus(); return element === document.activeElement; }), false, 'Background cannot receive focus');
  await dialog.locator('h2, h3').first().click();
  assert.equal(await dialog.count(), 1, 'Content click keeps dialog open');
  const geometry = await dialog.evaluate(element => {
    const panel = element.firstElementChild;
    const box = panel.getBoundingClientRect();
    return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: innerWidth, height: innerHeight, fitsContent: panel.scrollWidth <= panel.clientWidth + 1 };
  });
  assert.ok(geometry.left >= 0 && geometry.right <= geometry.width, 'Panel fits viewport width');
  assert.ok(geometry.top >= 0 && geometry.bottom <= geometry.height, 'Panel fits viewport height');
  assert.ok(geometry.fitsContent, 'Panel has no horizontal content clipping');
  const scroll = await dialog.evaluate(element => {
    const content = [element.firstElementChild, ...element.querySelectorAll('*')].find(child => child.scrollHeight > child.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(child).overflowY));
    if (!content) return null;
    content.scrollTop = content.scrollHeight;
    return content.scrollTop;
  });
  if (screenshotName.startsWith('ordinance')) assert.ok(scroll > 0, 'Long ordinance content scrolls');
  if (scroll !== null) assert.ok(scroll > 0, 'Overflow content scrolls');
  const hideToolbar = await page.addStyleTag({ content: 'astro-dev-toolbar { display: none !important; }' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => !document.getAnimations().some(animation =>
    animation.playState === 'running' && animation.effect.getComputedTiming().endTime !== Infinity));
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.screenshot({ path: resolve(evidence, `${screenshotName}.png`), animations: 'disabled' });
  await hideToolbar.evaluate(element => element.remove());
  await page.getByRole('button', { name: closeName, exact: true }).click();
  await closed();
  await open();
  await page.keyboard.press('Escape');
  await closed();
  await open();
  await page.mouse.click(2, 2);
  await closed();
  await page.evaluate(() => { document.body.style.overflow = ''; });
  console.log(`PASS ${screenshotName}: keyboard, names, inert background, focus/overflow restore, button/Escape/backdrop, geometry/scroll`);
}

try {
  for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await visit('/zamboanga-city/house-of-representatives');
    const representative = page.getByRole('button', { name: 'View records for Chua-Tai, Katrina Reiko' });
    await representative.focus();
    await page.keyboard.press(width === 375 ? 'Space' : 'Enter');
    const history = page.getByRole('button', { name: 'History', exact: true }).first();
    await history.waitFor();
    await dialogCycle(history, 'Close Window', `bill-${width}`);
    await visit('/services');
    await dialogCycle(page.getByRole('button', { name: /View Services/ }).first(), 'Close Window', `service-${width}`);
    await visit('/ordinances/regulatory-ordinances');
    await dialogCycle(page.getByRole('button', { name: 'Quick Preview', exact: true }).filter({ visible: true }).first(), 'Close Preview', `ordinance-${width}`);

    for (const [path, searchName] of [
      ['/services', 'Search city services'],
      ['/ordinances/regulatory-ordinances', 'Search ordinances'],
      ['/government/barangays', 'Search barangays'],
      ['/zamboanga-city/officials', 'Search city officials'],
      ['/zamboanga-city/house-of-representatives?district=district-1', 'Search bills'],
    ]) {
      await visit(path);
      const search = page.getByRole('textbox', { name: searchName, exact: true }).filter({ visible: true });
      await search.fill('test');
      await page.getByRole('button', { name: /^Clear .*search$/i }).filter({ visible: true }).click();
      assert.equal(await search.inputValue(), '');
      assert.equal(await page.getByRole('main').count(), 1, `${path} has one main landmark`);
      for (const role of ['textbox', 'combobox']) {
        assert.equal(await page.getByRole(role).filter({ visible: true }).count(), await page.getByRole(role, { name: /\S/ }).filter({ visible: true }).count(), `Every visible ${role} has a name`);
      }
      console.log(`PASS ${path} at ${width}: named inputs, selects, clear button, one main`);
    }
  }
  for (const path of ['/', '/zamboanga-city/history', '/zamboanga-city/flood-control', '/contact/disaster', '/ordinances/appropriation-ordinances', '/ordinances/revenue-ordinances']) {
    await visit(path);
    assert.equal(await page.getByRole('main').count(), 1, `${path} has one main landmark`);
    for (const role of ['textbox', 'combobox']) {
      assert.equal(await page.getByRole(role).filter({ visible: true }).count(), await page.getByRole(role, { name: /\S/ }).filter({ visible: true }).count(), `${path}: every visible ${role} has a name`);
    }
    console.log(`PASS ${path}: one main`);
  }
  await visit('/zamboanga-city/history');
  await page.getByRole('link', { name: 'All Services', exact: true }).click();
  await page.waitForURL('**/services');
  await page.waitForFunction(() => !document.querySelector('astro-island[client="load"][ssr]'));
  await page.evaluate(() => {
    document.body.style.overflow = 'auto';
    window.accessibilityDialogBody = document.body;
  });
  await page.getByRole('button', { name: /View Services/ }).first().click();
  await page.getByRole('dialog').waitFor({ state: 'visible' });
  await page.goBack();
  await page.waitForURL('**/zamboanga-city/history');
  await page.waitForFunction(() => window.accessibilityDialogBody && document.body !== window.accessibilityDialogBody);
  await page.waitForFunction(() => window.accessibilityDialogBody.style.overflow === 'auto');
  assert.equal(await page.evaluate(() => document.body.style.overflow), '', 'Dialog teardown does not overwrite the new page body');
  assert.equal(await page.evaluate(() => window.accessibilityDialogBody.isConnected), false, 'Astro swapped the old body');
  assert.equal(await page.getByRole('dialog').count(), 0);
  console.log('PASS open dialog -> browser Back: Astro body swap, original-body overflow restored, new body unchanged');
  assert.ok(fixtureReads >= 2, 'Ordinance assertions used the deterministic external read fixture');
  assert.deepEqual(errors, [], 'No page errors');
  assert.deepEqual(reactErrors, [], 'No React hook errors');
  console.log(`PASS all accessibility checks; fixture reads=${fixtureReads}; page errors=0; React hook errors=0`);
} finally {
  await browser.close();
  await new Promise(resolve => fixtureServer.close(resolve));
}
