import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const origin = 'https://www.betterzamboangacity.org';
const output = '.vercel/output/static';
const decode = (value) => value.replaceAll('&amp;', '&').replaceAll('&#39;', "'").replaceAll('&quot;', '"');
export function attributes(html, tag, key, value) {
  return [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'g'))]
    .map(([element]) => Object.fromEntries([...element.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, name, content]) => [name, decode(content)])))
    .filter((attrs) => attrs[key] === value);
}

export function checkMetadata(html, canonical) {
  assert.deepEqual(attributes(html, 'link', 'rel', 'canonical').map((item) => item.href), [canonical]);
  assert.deepEqual(attributes(html, 'meta', 'property', 'og:url').map((item) => item.content), [canonical]);
  assert.deepEqual(attributes(html, 'meta', 'property', 'og:image').map((item) => item.content), [`${origin}/images/og-image.png`]);
  assert.deepEqual(attributes(html, 'meta', 'name', 'twitter:image').map((item) => item.content), [`${origin}/images/og-image.png`]);
  const descriptions = attributes(html, 'meta', 'name', 'description');
  assert.equal(descriptions.length, 1);
  assert.ok(descriptions[0].content.length > 30);
  assert.deepEqual(attributes(html, 'meta', 'property', 'og:description').map((item) => item.content), [descriptions[0].content]);
  return descriptions[0].content;
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const routes = [];
  const descriptions = new Set();
  for (const file of await readdir(output, { recursive: true })) {
    if (!file.endsWith('.html') || file === 'ordinances/index.html') continue;
    const route = `/${file.replace(/(?:^|\/)index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, '')}`;
    const description = checkMetadata(await readFile(path.join(output, file), 'utf8'), origin + route);
    assert.ok(!descriptions.has(description), `Repeated description on ${route}`);
    descriptions.add(description);
    routes.push(route);
  }
  assert.ok(routes.includes('/') && routes.includes('/services'));
  const image = await readFile(path.join(output, 'images/og-image.png'));
  assert.equal(image.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(image.readUInt32BE(16), 1200);
  assert.equal(image.readUInt32BE(20), 630);
  for (const asset of ['images/ZC.svg', 'images/og-image.png']) {
    assert.ok((await stat(path.join(output, asset))).size > 0);
  }

  const sitemap = await readFile(path.join(output, 'sitemap.xml'), 'utf8');
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => decode(url));
  assert.deepEqual(locations.sort(), [...routes, '/government/barangays'].map((route) => origin + route).sort());
  assert.equal(new Set(locations).size, locations.length);
  assert.ok(locations.every((url) => !new URL(url).search && !new URL(url).hash));
  const robots = await readFile(path.join(output, 'robots.txt'), 'utf8');
  assert.match(robots, /^User-agent: \*/m);
  assert.match(robots, /^Allow: \/$/m);
  assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`));
  console.log(`PASS: metadata on ${routes.length} static pages, PNG dimensions, sitemap, and robots`);
}
