# Memory — autter-tracker

Living document tracking architecture decisions, known limitations, and changes.

## Architecture Decisions

- **npm workspaces monorepo** — `packages/cli` (published CLI + library) and `packages/api` (serverless backend). Root `package.json` orchestrates builds and tests across workspaces.
- **Zero runtime dependencies (CLI)** — the CLI uses only Node.js built-ins including the built-in `fetch` API (Node 18+). No Better Auth client SDK — the device flow is implemented with raw HTTP calls.
- **Post-commit hook via npx** — the hook script calls `npx autter-tracker hook` rather than a direct path to `node_modules/.bin`. This works across monorepos, global installs, and different package managers.
- **Hook chaining** — `init` detects existing `post-commit` hooks and appends rather than overwriting. A `#autter-tracker:hook` marker identifies our section for clean removal.
- **Local-first storage** — tracking data lives in `.autter/commits.json` (gitignored). Remote sync is optional.
- **Deduplication by fullHash** — prevents duplicate entries when a hook fires multiple times on the same commit (e.g., amend). Server-side dedup uses a `(userId, fullHash)` unique index.
- **Silent hook failures** — the `hook` command catches all errors and exits cleanly so it never blocks a developer's commit.
- **OAuth 2.0 Device Authorization Grant (RFC 8628)** — CLI auth pattern. User authenticates in the browser by entering a short code. Tokens stored at `~/.autter/auth.json` with `0600` permissions.
- **Better Auth + device authorization plugin** — server-side auth library managing user, session, account, and deviceCode tables. Device codes expire in 30 minutes with 5-second polling intervals.
- **Hono on Cloudflare Workers** — lightweight serverless edge framework for the API.
- **Neon + Drizzle ORM** — serverless PostgreSQL with type-safe schema and migrations.
- **Doppler for secrets** — open-source repo, so no secrets are committed. `.env.example` documents required variables. Doppler CLI injects secrets at runtime.

## Known Limitations

- Only detects AI tools that leave signatures in commit messages. Tools that don't modify commit messages are invisible.
- `Generated-By:` as a fallback catches any tool but can't identify which specific AI.
- No retroactive scanning — only commits made after `init` are tracked. Could add a `scan` command in the future.
- CLI auth tests not yet implemented — auth module uses network calls that need mocking.
- API tests not yet implemented — needs test database setup.

## Changelog

| Date       | Change                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------- |
| 2026-04-04 | Add device authorization auth system, remote sync, teams, monorepo restructure            |
| 2026-04-04 | Complete redesign: git hook-based AI commit tracker replacing generic event tracker        |
