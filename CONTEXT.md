# Project context

## Purpose and terms

Better Zamboanga City is an independent, volunteer-maintained civic-information portal. It helps residents find city services, barangay records, officials, ordinances, emergency contacts, and public project information. It is not an official government website. Preserve that distinction in copy and design.

| Term | Meaning in this repository |
| --- | --- |
| Barangay | A local administrative unit. Directory records have stable IDs and URL slugs. |
| District | City district 1 or 2 in the barangay and project datasets. |
| Ordinance | A local legislative record. Categories include Regulatory, Revenue, and Appropriation. Its type is in `src/types/ordinance.ts`. |
| House bill | A national legislative record in the representative snapshots. It is separate from a city ordinance. |
| Emergency facility | A mapped hospital, police, fire, or rescue record with coordinates and contact information. |
| Snapshot | A frozen dataset with a recorded source/capture baseline. Capture integrity and civic accuracy are separate checks. |

## Architecture and entry points

- [package.json](package.json) defines the runtime and scripts. Node **>=22.12.0** is required. [package-lock.json](package-lock.json) pins npm dependencies.
- [astro.config.mjs](astro.config.mjs) configures Astro, React islands, Tailwind CSS through Vite, the public site origin, and the Vercel adapter.
- `src/pages/` defines routes. Most pages are prerendered. [government/barangays.astro](src/pages/government/barangays.astro) uses request rendering and the `slug` query parameter for detail pages.
- [Layout.astro](src/layouts/Layout.astro) owns shared metadata, `ClientRouter`, analytics, header/footer, and the `main#main-content` landmark. Check both first load and client navigation when changing shared behavior.
- `src/components/` contains Astro components and React islands. [ServicesDirectory.tsx](src/components/services/ServicesDirectory.tsx) contains the service catalog and filters. [ServiceSearch.tsx](src/components/ServiceSearch.tsx) handles the shared search entry.
- [global.css](src/styles/global.css) holds shared styles. Tailwind is configured through the Vite plugin; inspect that configuration before relying on the older `tailwind.config.mjs` file.
- [disaster-interactive.ts](src/scripts/disaster-interactive.ts) owns emergency map interactions and cleanup. `.gitignore` has a broad `scripts/` rule; use `git ls-files src/scripts` to discover this tracked file.
- `public/` contains assets served by URL. `src/content/` holds imported JSON/CSV snapshots; there is no configured Astro content collection schema yet.

## Current data access

[src/lib/civic-data.ts](src/lib/civic-data.ts) reads JSON for build/server rendering. [src/lib/civic-data-client.ts](src/lib/civic-data-client.ts) reads only the same-origin ordinance and emergency JSON assets. Its imports are types only. The two routes in `src/pages/data/` explicitly prerender those assets; no database or runtime API service is needed.

| Feature | Active data path |
| --- | --- |
| Barangays | `src/content/snapshots/barangays.json`, passed to the island by the server. Detail pages keep the existing name-based roster join and population precedence using `src/content/Barangay-officials/`. |
| Ordinances | `src/content/snapshots/ordinances.json` preserves all captured public records and category links. The server retains legacy normalization; the island reads `/data/ordinances.json`. |
| City officials | `src/content/city-officials/zamboanga_city_officials.json`, passed to the island by the page. |
| Emergency directory | `src/content/snapshots/emergency-facilities.json` feeds `/data/emergency-facilities.json`. Police/fire lists still use `src/data/disaster-data.ts`. Separate `src/content/hotlines/` snapshots do not replace those active lists. |
| Flood control | Components import `src/data/flood-control-data.ts`. Source CSV snapshots are in `src/content/Flood-control/`. |
| House representatives | Components import the bill snapshots in `src/content/congressman/`. |
| History and ethnic groups | Components contain local content. |
| Services | The catalog is embedded in `src/components/services/ServicesDirectory.tsx`. |

The ordinance capture contains 862 records: 745 Active, 83 Amended, 33 Repealed and one Reenacted. Its manifest identifies Ley de Zamboanga as the upstream source and records the capture interval and checksum. It covers the public read-policy view. Barangay and emergency data are preserved repository baselines, not exports of an unavailable main database. Existing civic-data conflicts remain for #16.

Ordinance record parity is compared by stable ID, preserving nested values, array order and nulls. Loader output uses year descending and ID ascending for ties. The previous database query had no specified tie order. A data refresh is a reviewed file update; read [README snapshot instructions](README.md#snapshot-provenance-and-updates) before changing a snapshot or its fixed oracle. There are no Supabase clients or database configuration in application paths.

## Civic-data rules

- For a new or corrected record, retain the publisher, source URL or document reference, source period, and actual verification date. Keep them with the dataset or in adjacent tracked documentation. Distinguish the record's year from the date someone checked it.
- Inspect the schema and all consumers before editing IDs, slugs, names, categories, phone numbers, or coordinates. Preserve stable identity and source meaning.
- Show unavailable or unverified information honestly. Keep unknown values distinct from zero and empty results distinct from a verified absence. Do not invent contacts, statistics, officials, or verification claims.
- Preserve source credits and check redistribution rights. A source comment, existing snapshot, successful fetch, or passing fixture test alone does not establish data accuracy.
- [Issue #16](https://github.com/BetterZamboangaCity-org/betterzamboangacity/issues/16) owns civic-data reconciliation. [Issue #17](https://github.com/BetterZamboangaCity-org/betterzamboangacity/issues/17) owns reproducible checks, CI, and dependency work. [Issue #18](https://github.com/BetterZamboangaCity-org/betterzamboangacity/issues/18) owns production launch acceptance.
