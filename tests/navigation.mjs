import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4321';
const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'chrome' });
try {
  const page = await browser.newPage();
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(baseURL);
    const geometry = await page.getByRole('banner').evaluate((header) => {
      const button = header.querySelector('#hdr-mobile-menu-btn');
      const box = button.getBoundingClientRect();
      return { width: innerWidth, scrollWidth: document.documentElement.scrollWidth, buttonRight: box.right, buttonVisible: !!button.offsetParent };
    });
    assert.ok(geometry.scrollWidth <= width, `${width}px: document overflows to ${geometry.scrollWidth}px`);
    if (geometry.buttonVisible) {
      assert.ok(geometry.buttonRight <= width, `${width}px: menu button is outside viewport`);
      const toggle = page.getByRole('button', { name: 'Toggle navigation menu' });
      await toggle.click();
      assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
      await page.keyboard.press('Escape');
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
      assert.equal(await toggle.evaluate((el) => el === document.activeElement), true);
      assert.notEqual(await page.locator('body').evaluate((el) => el.style.overflow), 'hidden');
    }
  }
  const paths = await page.locator('a[href^="/"]').evaluateAll((links) => [...new Set(links.map((link) => new URL(link.href).pathname))]);
  for (const path of paths) {
    const response = await page.request.get(`${baseURL}${path}`);
    assert.ok(response.ok(), `${path}: returned ${response.status()}`);
  }
  const cityMenu = page.getByRole('navigation', { name: 'Main Navigation' }).locator('summary').first();
  await cityMenu.focus();
  await page.keyboard.press('Enter');
  assert.equal(await cityMenu.evaluate((el) => el.parentElement.open), true);
  await page.keyboard.press('Escape');
  assert.equal(await cityMenu.evaluate((el) => el.parentElement.open), false);
  assert.equal(await cityMenu.evaluate((el) => el === document.activeElement), true);
  const evidence = process.env.SCREENSHOT_DIR;
  if (evidence) {
    await mkdir(evidence, { recursive: true });
    await page.addStyleTag({ content: 'astro-dev-toolbar { display: none !important; }' });
    await page.screenshot({ path: `${evidence}/navigation-desktop.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 375, height: 900 });
  const toggle = page.getByRole('button', { name: 'Toggle navigation menu' });
  for (let visit = 0; visit < 2; visit++) {
    await toggle.click();
    const mobile = page.getByRole('navigation', { name: 'Mobile Navigation' });
    await mobile.locator('summary').filter({ hasText: /^Services/ }).click();
    if (evidence && visit === 0) await page.screenshot({ path: `${evidence}/navigation-mobile.png`, fullPage: false });
    await mobile.getByRole('link', { name: 'All Services', exact: true }).click();
    await page.waitForURL('**/services');
    assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    assert.notEqual(await page.locator('body').evaluate((el) => el.style.overflow), 'hidden');
    await page.getByRole('link', { name: 'Better Zamboanga City Homepage' }).click();
    await page.waitForURL(baseURL + '/');
  }
  await page.goto(baseURL + '/about');
  assert.equal(await page.getByRole('link', { name: 'Open an issue in the project repository' }).getAttribute('href'), 'https://github.com/BetterZamboangaCity-org/betterzamboangacity/issues');
  console.log(`PASS: navigation at 320, 375, 768, 1440px; ${paths.length} internal destinations; keyboard/Escape; repeated navigation; correction path`);
} finally {
  await browser.close();
}
