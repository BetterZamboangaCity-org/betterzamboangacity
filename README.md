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
* **Content:** Imported JSON/CSV snapshots and current Supabase reads; see [project context](CONTEXT.md).
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

[.env.example](.env.example) lists the current public configuration. Create `.env` only if needed and preserve any existing file. `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` configure the main data client. The `PUBLIC_ORDINANCES_SUPABASE_*` pair configures a separate ordinance client; it falls back to the main client when omitted. `PUBLIC_CARTO_API_KEY` is also listed in the example.

Treat `PUBLIC_*` values as browser-visible. Use only keys intended for public read access. Keep secrets and local environment files out of Git. Without database configuration, loaders use their local or empty fallbacks. That mode supports local UI work but does not supply complete civic data.

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

Restart your server when changing fixture environment variables. Run the fixture setups below sequentially. Do not bypass the Astro server lock to start competing servers in this checkout.

### Choose checks

| Changed area | Checks and evidence |
| --- | --- |
| Documentation | Check every command, relative link, and path against source and CLI help. Walk through discovery, check selection, server cleanup, and the handoff path. |
| Shared layout, navigation, search | Build, relevant metadata tests, `navigation.mjs`, and `service-intent.mjs`. Capture desktop/mobile and keyboard behavior. |
| Dialogs or focus behavior | `accessibility.mjs` with its local fixture configuration. |
| Emergency directory or map | `emergency-directory.mjs` with its own fixture configuration. |
| Metadata or barangay routing | Build and both metadata tests. The barangay test also has a source mode. |
| Civic data | Trace consumers and compare records to sources. Add focused checks for changed identities, malformed records, and missing-data behavior. UI fixtures cannot verify real contacts. |

#### Build and metadata

```sh
npm run build
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

#### Accessibility fixtures

This suite starts and closes its own read-only fixture API at `127.0.0.1:4322`. Port 4322 must be free. Start Astro with this configuration, then run the test. If your server is already running with other configuration, stop it first.

```sh
PUBLIC_SUPABASE_URL=http://127.0.0.1:4322 PUBLIC_SUPABASE_ANON_KEY=test-key PUBLIC_ORDINANCES_SUPABASE_URL=http://127.0.0.1:4322 PUBLIC_ORDINANCES_SUPABASE_ANON_KEY=test-key npm run astro -- dev --background --host 127.0.0.1 --port 4321
TEST_BASE_URL=http://127.0.0.1:4321 TEST_EVIDENCE_DIR=.agents/handoffs/local-check/accessibility node tests/accessibility.mjs
npm run astro -- dev stop
npm run astro -- dev status
```

The test defaults to installed Google Chrome; `PLAYWRIGHT_CHANNEL` can select another installed channel. Browser requests to external hosts are blocked in this suite. The synthetic ordinance fixture exercises the real components and focus behavior.

#### Emergency directory fixtures

This suite starts and closes its own read-only fixture API at `127.0.0.1:4391`. Port 4391 must be free. Use a fresh Astro server on port 4327:

```sh
PUBLIC_SUPABASE_URL=http://127.0.0.1:4391 PUBLIC_SUPABASE_ANON_KEY=fixture-anon-key PUBLIC_ORDINANCES_SUPABASE_URL=http://127.0.0.1:4391 PUBLIC_ORDINANCES_SUPABASE_ANON_KEY=fixture-anon-key npm run astro -- dev --background --host 127.0.0.1 --port 4327
EMERGENCY_TEST_URL=http://127.0.0.1:4327 EMERGENCY_TEST_OUTPUT=.agents/handoffs/local-check/emergency node tests/emergency-directory.mjs
npm run astro -- dev stop
npm run astro -- dev status
```

This suite uses installed Google Chrome. Its real-library case needs network access to the Leaflet CDN. Other cases use a controlled map stub and hostile synthetic records. Report a network failure as a coverage gap. Inspect the output images; synthetic fixture results establish interaction behavior only.

### UI evidence and handoff

For a visible change, inspect desktop and mobile layouts, keyboard focus, empty/error states, and Astro client navigation. Record viewport sizes, URLs, and relevant states with screenshots. Identify browser and dev-server versus built-output coverage. Keep local images and logs in `.agents/handoffs/<issue-or-task>/`; publish selected evidence only within the authorized PR scope.

Use the candidate's base/head SHA or a local changed-file manifest in the handoff. Record exact commands and results, unavailable checks, review findings, remaining risks, and server cleanup. A local pass does not establish GitHub approval, civic-data verification, deployment, or launch acceptance.
