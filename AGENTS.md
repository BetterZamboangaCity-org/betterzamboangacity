# Repository instructions

## Start here

1. Read [CONTEXT.md](CONTEXT.md) before changing code or civic records. It maps the domain, active data sources, and snapshot boundaries.
2. Read the issue and trace its callers. Check `git status --short` and the current branch. Preserve existing changes and use this checkout. Create a worktree only when the user requests one.
3. For setup, servers, checks, or UI evidence, read [README development guide](README.md#development-and-verification). Read [CONTRIBUTING.md](CONTRIBUTING.md) for contribution coordination.

## Make the change

- Keep each change within its issue. Reuse existing components, types, and data loaders when they fit.
- Use short active sentences and the domain terms in CONTEXT.md.
- For civic records, follow the provenance and missing-data rules in CONTEXT.md. Keep source data, fallback data, and test fixtures distinct.
- Coordinate file ownership and shared test ports before concurrent work. Run fixture suites one at a time.
- Follow the user's scope for delegation and Git actions. Commit and push only when the user explicitly asks. Treat PR publication, merge, deployment, and production writes as separate actions that need authorization.

## Verify and hand off

- Select checks from the development guide for the changed behavior. Record actual results and unavailable checks. Use desktop/mobile and keyboard evidence for UI changes.
- Review the complete candidate against **Standards** (repository guidance and existing patterns) and **Spec** (issue acceptance criteria). Record the base/head SHA, or HEAD plus the changed-file list for local work.
- Distinguish self-review, independent review, formal GitHub approval, and production acceptance. Keep temporary task restrictions and PR status in the task record.
- Write a concise local `.agents/handoffs/<issue-or-task>/handoff.md`. Include changes, candidate identity, checks, evidence paths, risks, and next steps. This directory is ignored; shared guidance belongs in tracked documentation.

## Astro references

Consult the relevant guide before changing these areas:

- [Pages, routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Astro components](https://docs.astro.build/en/basics/astro-components/)
- [React islands](https://docs.astro.build/en/guides/framework-components/)
- [Content collections](https://docs.astro.build/en/guides/content-collections/)
- [Styles or Tailwind](https://docs.astro.build/en/guides/styling/)
- [Languages](https://docs.astro.build/en/guides/internationalization/)
