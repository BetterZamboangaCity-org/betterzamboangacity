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
| Fallback | A bundled record or empty result used when a remote read is unavailable. `isMock` is the existing loader flag; it does not establish whether a record is verified. |

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

[src/lib/supabase.ts](src/lib/supabase.ts) creates the main and ordinance Supabase clients from public environment variables. Read [the development guide](docs/development.md) for local configuration. Reads can occur at build time, per request, and in browser islands. Trace the consumer before changing a loader.

| Feature | Active path and local data |
| --- | --- |
| Barangays | Supabase loader with `src/data/barangay-data.ts` fallback. Detail pages also use `src/content/Barangay-officials/` JSON for officials and population. |
| Ordinances | `OrdinanceExplorer.tsx` reads Supabase. The loader returns an empty result when remote data is unavailable. There is no complete bundled ordinance dataset. |
| City officials | The page reads the Supabase loader. Its fallback is `src/content/city-officials/zamboanga_city_officials.json`. |
| Emergency directory | The map reads Supabase with `src/data/disaster-data.ts` fallback. Police/fire lists also import that local module. `src/content/hotlines/` contains separate snapshots; inspect consumers before assuming they drive the page. |
| Flood control | Components import `src/data/flood-control-data.ts`. Source CSV snapshots are in `src/content/Flood-control/`. A Supabase loader exists but has no active caller. |
| House representatives | Components import the bill snapshots in `src/content/congressman/`. |
| History and ethnic groups | Components contain local content. Supabase helpers exist but have no active callers. |
| Services | The catalog is embedded in `src/components/services/ServicesDirectory.tsx`. |

[Issue #15](https://github.com/BetterZamboangaCity-org/betterzamboangacity/issues/15) plans the move to repository JSON. That migration is future work. Keep current reads and response contracts until their consumers are migrated and verified.

## Civic-data rules

- For a new or corrected record, retain the publisher, source URL or document reference, source period, and actual verification date. Keep them with the dataset or in adjacent tracked documentation. Distinguish the record's year from the date someone checked it.
- Inspect the schema and all consumers before editing IDs, slugs, names, categories, phone numbers, or coordinates. Preserve stable identity and source meaning.
- Show unavailable or unverified information honestly. Keep unknown values distinct from zero and empty results distinct from a verified absence. Do not invent contacts, statistics, officials, or verification claims.
- Preserve source credits and check redistribution rights. A source comment, existing snapshot, successful fetch, or passing fixture test alone does not establish data accuracy.
- [Issue #16](https://github.com/BetterZamboangaCity-org/betterzamboangacity/issues/16) owns civic-data reconciliation. [Issue #17](https://github.com/BetterZamboangaCity-org/betterzamboangacity/issues/17) owns reproducible checks, CI, and dependency work. [Issue #18](https://github.com/BetterZamboangaCity-org/betterzamboangacity/issues/18) owns production launch acceptance.
