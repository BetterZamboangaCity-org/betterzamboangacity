# Better Zamboanga City

Better Zamboanga City is an independent, volunteer-maintained civic-information portal under the [BetterGov.ph](https://bettergov.ph/) initiative. It aims to make verified public information, local records, and civic data across Zamboanga City accessible, searchable, and easy to understand.

> **Better Zamboanga City is not an official government website.** It is not owned, operated, endorsed, or approved by the City Government of Zamboanga or any public agency. Always verify time-sensitive transactions and legal matters directly with the responsible city department.

---

## 🚦 Project Status

**Work in Progress / Active Development.** 

The application architecture and static content pipeline are actively being constructed. Public records covering city identity, barangay rosters, public utilities, emergency hotlines, and local ordinances are staged and validated against our verification guidelines prior to live indexing.

### Roadmap & Next Steps

1. Configure the core Astro content collections schema for city documents and datasets.
2. Index verified Zamboanga City public directories and emergency hotlines.
3. Integrate interactive client islands for filtering services and barangay records.
4. Finalize automated accessibility (a11y), link integrity, and responsive layout audits.
5. Deploy preview builds and prepare for official directory verification.

---

## 🛠️ Technical Foundation

The project is built on **Astro** for structured content delivery and React for interactive components.

* **Framework:** [Astro](https://astro.build/) (Static Site Generation / Islands Architecture)
* **Content:** Repository JSON/CSV files; see [project context](CONTEXT.md).
* **Styling:** Tailwind CSS
* **Deployment:** Vercel

## Development and verification

Run commands from the repository root. Read [AGENTS.md](AGENTS.md) and [CONTEXT.md](CONTEXT.md) first.

### Setup

Use Node >=22.12.0 and npm. The lockfile is the dependency source for a clean install.

```sh
git clone https://github.com/BetterZamboangaCity-org/betterzamboangacity.git
cd betterzamboangacity
npm ci
```

For an existing checkout, inspect its status and use its root directory. Skip the clone steps.

Database credentials are not required. Server and build readers import repository JSON. The ordinance and emergency islands read the generated `/api/v1/ordinances.json` and `/api/v1/emergency-facilities.json` assets. See [project context](CONTEXT.md) for data boundaries.

[.env.example](.env.example) lists the optional public Carto setting. Preserve existing local environment files and keep credentials out of Git. Public configuration is browser-visible.

### Background server

Use the installed Astro CLI through npm. Preserve background mode (`astro dev --background`).

```sh
npm run astro -- dev status
npm run astro -- dev --background --host 127.0.0.1
npm run astro -- dev logs
npm run astro -- dev status
```

The default URL is `http://127.0.0.1:4321`. Read the reported URL. If a server is already running, verify its checkout and configuration before reuse. Coordinate with its owner before stopping it. After your work, stop the server you started and check cleanup:

```sh
npm run astro -- dev stop
npm run astro -- dev status
```

Run browser suites sequentially against the server you own. Their JSON fixtures run in the browser; they need no database or extra fixture server. Keep the Astro server lock and coordinate shared ports.

### Choose checks

| Changed area | Checks and evidence |
| --- | --- |
| Documentation | Check every command, relative link, and path against source and CLI help. Walk through discovery, check selection, server cleanup, and the handoff path. |
| Shared layout, navigation, search | Build, relevant metadata tests, `navigation.mjs`, and `service-intent.mjs`. Capture desktop/mobile and keyboard behavior. |
| Dialogs or focus behavior | `accessibility.mjs` with its local fixture configuration. |
| Emergency directory or map | `emergency-directory.mjs` with its own fixture configuration. |
| Metadata or barangay routing | Build and both metadata tests. The barangay test also has a source mode. |
| Civic data | Run `civic-data.mjs`, `data-assets.mjs`, `data-migration.mjs`, and `barangay-data.mjs`. Compare records and provenance; fixtures and parity do not verify real civic facts. |

#### Build and metadata

```sh
npm run build
node tests/data-assets.mjs --built
node tests/metadata.mjs
node tests/barangay-metadata.mjs
```

The metadata tests inspect `.vercel/output/static` and the built request handler under `.vercel/output/functions/_render.func`. Build the candidate first. For a source-only barangay routing check without a listening HTTP server:

```sh
node tests/barangay-metadata.mjs --source
```

There is currently no `npm run check` alias or checked-in CI workflow, although the PR template requests that alias. Record this gap instead of claiming it passed. [Issue #17](https://github.com/BetterZamboangaCity-org/betterzamboangacity/issues/17) owns the reproducible diagnostic command, dependencies, and CI. The `filter-officials` package script references an absent root script; it is not a working setup step.

#### Navigation and service intent

These suites need a running app. They default to installed Google Chrome. `BROWSER_CHANNEL` selects another installed Playwright channel. Set `BASE_URL` to the actual server URL if it differs from the default.

```sh
BASE_URL=http://127.0.0.1:4321 SCREENSHOT_DIR=.agents/handoffs/local-check/ui node tests/navigation.mjs
BASE_URL=http://127.0.0.1:4321 SCREENSHOT_DIR=.agents/handoffs/local-check/ui node tests/service-intent.mjs
```

#### Snapshot checks

Without a running server, check every ordinance against the fixed pre-migration record hashes, all migrated local datasets, and unchanged source files:

```sh
node tests/civic-data.mjs
```

With the background server running, check the two public JSON assets, directory/filter/error behavior, and all 98 barangay profiles:

```sh
node tests/data-assets.mjs
node tests/api-cors.mjs
node tests/data-migration.mjs
node tests/barangay-data.mjs
```

These use `BASE_URL` when the local server URL differs from `http://127.0.0.1:4321`. Browser checks use installed Google Chrome; `BROWSER_CHANNEL` can select another installed channel. The CORS test serves a small consumer page on a temporary local port and closes it after checking the real API. Astro blocks cross-site subresources during development; this test uses the same hostname with a different port to test cross-origin reads without disabling that protection. `TEST_EVIDENCE_DIR` controls the migration suite's screenshots. Record parity preserves known source conflicts and pending states; source reconciliation stays in #16.

### Accessibility fixtures

Run against the same background server. The suite replaces only `/api/v1/ordinances.json` in its browser. Components, keyboard behavior and Astro navigation remain real. External browser requests are blocked.

```sh
TEST_BASE_URL=http://127.0.0.1:4321 TEST_EVIDENCE_DIR=.agents/handoffs/local-check/accessibility node tests/accessibility.mjs
```

The test defaults to installed Google Chrome; `PLAYWRIGHT_CHANNEL` selects another installed channel. No fixture API, database variables or additional port is required.

### Emergency directory fixtures

The suite replaces only `/api/v1/emergency-facilities.json` in its browser. It retains hostile values, delayed/aborted reads, uncancellable stale responses, navigation cleanup, geolocation and map-failure cases.

```sh
EMERGENCY_TEST_URL=http://127.0.0.1:4321 EMERGENCY_TEST_OUTPUT=.agents/handoffs/local-check/emergency node tests/emergency-directory.mjs
```

It uses installed Google Chrome. The real-library case needs the Leaflet CDN; other cases use a controlled map stub. Inspect output images and report unavailable network coverage. Fixture results establish interaction behavior only.

### Data provenance and versions

`src/data/ordinances.json` preserves the captured public records and category relationships. Its adjacent `ordinances.manifest.json` records the upstream source, UTC capture interval, page counts, status counts, checksum and public-read scope. `repository.manifest.json` identifies the pinned repository baselines for barangays and emergency facilities. Existing city/roster/population files retain their paths. A frozen capture is not an administrative backup or agency verification.

The public, read-only API is generated at build time:

| URL | Response |
| --- | --- |
| `/api/v1/ordinances.json` | All 862 normalized ordinance records, as an array. |
| `/api/v1/barangays.json` | All 98 existing public barangay records, as an array. |
| `/api/v1/emergency-facilities.json` | All 22 emergency facilities, as an array. |
| `/api/v1/metadata.json` | API version, dataset URLs, record counts, capture dates, source details and revisions. |

```sh
curl http://127.0.0.1:4321/api/v1/metadata.json
curl http://127.0.0.1:4321/api/v1/ordinances.json
```

`v1` identifies the API structure. Correcting or adding records keeps `v1`; an incompatible response structure requires a new major API version. Each dataset's `revision` is `sha256:<digest>` of the exact UTF-8 JSON response body. `sourceRevision` identifies the raw source file instead. The two digests can differ because the ordinance response retains the existing normalization and deterministic ordering. Capture dates identify the source capture, not a new agency verification.

Keep canonical source filenames stable in `src/data/`. Git keeps their history; do not add dated copies or edit revision strings by hand. A reviewed data change followed by a new build/deployment generates the current revisions. These stable URLs use browser revalidation (`public, max-age=0, must-revalidate`), not long immutable caching. The responses allow public cross-origin reads without credentials. `vercel.json` applies the same headers when Vercel serves the generated static files. Verify deployed headers separately from local HTTP checks. This API has no writes, authentication, pagination or runtime database.

For a deliberate data update:

1. Confirm source completeness, redistribution permission and attribution before publishing a new export. Keep credentials out of records and logs.
2. Capture all pages with a stable unique key. Check exact totals and duplicate IDs. Compare two full reads for drift; retain raw fields and nulls. Replace files only after the full capture validates.
3. Compare the old and new records, relationships and status counts. Review civic corrections under #16. Record actual source/verification dates separately from capture dates.
4. Update manifests and fixed test expectations only for reviewed changes. `tests/fixtures/data-parity.json` and `barangay-profiles.json` are independent pre-migration oracles. Never generate expected records from the new production loader just to make a test pass.
5. Run snapshot, build, metadata and relevant browser checks. Review the full diff before publishing. Builds and app startup must stay independent of external database access.

### UI evidence and handoff

For a visible change, inspect desktop and mobile layouts, keyboard focus, empty/error states, and Astro client navigation. Record viewport sizes, URLs, and relevant states with screenshots. Identify browser and dev-server versus built-output coverage. Keep local images and logs in `.agents/handoffs/<issue-or-task>/`; publish selected evidence only within the authorized PR scope.

Use the candidate's base/head SHA or a local changed-file manifest in the handoff. Record exact commands and results, unavailable checks, review findings, remaining risks, and server cleanup. A local pass does not establish GitHub approval, civic-data verification, deployment, or launch acceptance.
