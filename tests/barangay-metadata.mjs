import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { attributes, checkMetadata } from './metadata.mjs';

const canonical = 'https://www.betterzamboangacity.org/government/barangays';
let close = async () => {};
let render;
// Use repository fallback records. This test must not depend on a live database.
for (const key of ['PUBLIC_SUPABASE_URL', 'PUBLIC_SUPABASE_ANON_KEY', 'PUBLIC_ORDINANCES_SUPABASE_URL', 'PUBLIC_ORDINANCES_SUPABASE_ANON_KEY']) process.env[key] = '';

try {
  if (process.argv.includes('--source')) {
    const { createServer } = await import('vite');
    const { getViteConfig } = await import('astro/config');
    const { experimental_AstroContainer } = await import('astro/container');
    const config = await getViteConfig({ server: { middlewareMode: true, hmr: false }, optimizeDeps: { noDiscovery: true }, logLevel: 'error' })({ mode: 'test', command: 'serve' });
    const server = await createServer({ ...config, configFile: false });
    close = () => server.close();
    const { default: page } = await server.ssrLoadModule('/src/pages/government/barangays.astro');
    const { default: react } = await server.ssrLoadModule('@astrojs/react/server.js');
    const container = await experimental_AstroContainer.create({
      astroConfig: { site: 'https://www.betterzamboangacity.org' },
      renderers: [{ name: '@astrojs/react', ssr: react }],
    });
    container.addClientRenderer({ name: '@astrojs/react', entrypoint: '@astrojs/react/client.js' });
    render = (request) => container.renderToResponse(page, { request, partial: false });
  } else {
    const directory = '.vercel/output/functions/_render.func';
    const config = JSON.parse(await readFile(`${directory}/.vc-config.json`, 'utf8'));
    const { default: handler } = await import(pathToFileURL(`${process.cwd()}/${directory}/${config.handler}`));
    render = (request) => handler.fetch(request);
  }
  for (const query of ['?slug=not-a-barangay', '?slug=', '?slug=%3Cscript%3E']) {
    const response = await render(new Request(`https://preview.example/government/barangays${query}`));
    assert.equal(response.status, 404, `${query}: missing record must return 404`);
    const html = await response.text();
    checkMetadata(html, canonical);
    assert.deepEqual(attributes(html, 'meta', 'name', 'robots').map((item) => item.content), ['noindex, follow']);
    assert.match(html, /Barangay not found/);
    assert.match(html, /href="\/government\/barangays"/);
    assert.doesNotMatch(html, /<h1[^>]*>\s*Barangay Ayala/);
  }
  for (const [query, expectedSlug, name] of [
    ['?slug=ayala', 'ayala', 'Ayala'],
    ['?utm_source=test&slug=baliwasan&search=other&district=2#section', 'baliwasan', 'Baliwasan'],
    ['/?slug=ayala&slug=baliwasan', 'ayala', 'Ayala'],
  ]) {
    const response = await render(new Request(`https://preview.example/government/barangays${query}`));
    assert.equal(response.status, 200);
    const html = await response.text();
    const description = checkMetadata(html, `${canonical}?slug=${expectedSlug}`);
    assert.ok(description.includes(name));
    assert.match(html, new RegExp(`<h1[^>]*>\\s*Barangay ${name}\\s*</h1>`));
    assert.equal(attributes(html, 'meta', 'name', 'robots').length, 0);
  }
  const response = await render(new Request('https://preview.example/government/barangays?search=ayala&utm_source=test'));
  assert.equal(response.status, 200);
  const html = await response.text();
  checkMetadata(html, canonical);
  assert.match(html, /<title>Barangay Directory \| Better Zamboanga City<\/title>/);
  assert.equal(attributes(html, 'meta', 'name', 'robots').length, 0);
  console.log(`PASS: ${process.argv.includes('--source') ? 'source' : 'built handler'} barangay metadata for directory, two records, missing records, duplicate slug, tracking, filters, and trailing slash`);
} finally {
  await close();
}
