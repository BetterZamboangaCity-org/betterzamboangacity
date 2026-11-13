import type { APIRoute } from 'astro';

const pages = import.meta.glob('./**/*.astro');

export const GET: APIRoute = ({ site }) => {
  const urls = Object.keys(pages)
    .filter((file) => !file.includes('[') && !/\/(404|500)\.astro$/.test(file))
    // /ordinances redirects to its regulatory category.
    .filter((file) => file !== './ordinances/index.astro')
    .map((file) => file.replace(/^\.\//, '/').replace(/(?:\/index)?\.astro$/, '').replace(/^\/index$/, '/') || '/')
    .sort()
    .map((pathname) => `<url><loc>${new URL(pathname, site).href}</loc></url>`)
    .join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
