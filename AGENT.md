# Agent Guide — autter-tracker

This file helps AI agents working on this codebase understand its structure, conventions, and workflows.

## Project Overview

`autter-tracker` is a monorepo containing a CLI tool + library for detecting AI-assisted git commits, and a serverless API for remote sync, team dashboards, and device-based authentication.

## Directory Structure

```
autter-tracker/                        # npm workspaces monorepo
├── packages/
│   ├── cli/                           # CLI tool + library (published as "autter-tracker")
│   │   ├── src/
│   │   │   ├── cli.ts                 # CLI entry point (bin), dispatches commands
│   │   │   ├── index.ts               # Programmatic API re-exports
│   │   │   ├── types.ts               # TypeScript interfaces (AiCommit, StorageData, etc.)
│   │   │   ├── detector.ts            # AI pattern matching engine (BUILTIN_PATTERNS)
│   │   │   ├── git.ts                 # Git shell helpers (execFileSync wrappers)
│   │   │   ├── hook.ts                # Post-commit hook logic
│   │   │   ├── storage.ts             # Local JSON storage (.autter/commits.json)
│   │   │   ├── utils.ts               # Terminal formatting (colors, truncate, pad)
│   │   │   ├── auth.ts                # Device auth flow client + token storage (~/.autter/auth.json)
│   │   │   ├── config.ts              # CLI configuration (server URL, client ID)
│   │   │   └── commands/
│   │   │       ├── init.ts            # Install post-commit hook
│   │   │       ├── stats.ts           # Show AI commit statistics
│   │   │       ├── log.ts             # Show recent AI commits
│   │   │       ├── login.ts           # OAuth 2.0 Device Authorization flow
│   │   │       ├── logout.ts          # Clear stored tokens
│   │   │       ├── status.ts          # Show auth and sync status
│   │   │       ├── sync.ts            # Push local commits to server
│   │   │       └── uninstall.ts       # Remove hook
│   │   ├── tests/
│   │   │   ├── detector.test.ts       # AI detection pattern tests
│   │   │   ├── storage.test.ts        # JSON storage tests (uses real temp dirs)
│   │   │   ├── git.test.ts            # Git helper tests (mocked execFileSync)
│   │   │   ├── hook.test.ts           # Hook integration tests (mocked git module)
│   │   │   └── utils.test.ts          # Utility function tests
│   │   ├── tsconfig.json
│   │   ├── tsup.config.ts             # Dual build: library (CJS+ESM) + CLI (CJS with shebang)
│   │   └── vitest.config.ts           # Test config with 80% coverage thresholds
│   └── api/                           # Serverless API (Cloudflare Workers)
│       ├── src/
│       │   ├── index.ts               # Hono app entry point
│       │   ├── auth.ts                # Better Auth config + device authorization plugin
│       │   ├── types.ts               # Env and payload types
│       │   ├── db/
│       │   │   ├── index.ts           # Neon serverless Postgres connection
│       │   │   └── schema.ts          # Drizzle schema (commits, teams, teamMembers)
│       │   ├── routes/
│       │   │   ├── sync.ts            # Commit sync endpoints (POST/GET)
│       │   │   └── teams.ts           # Team CRUD + stats endpoints
│       │   └── middleware/
│       │       └── auth.ts            # Session verification middleware
│       ├── drizzle.config.ts          # Drizzle migration config
│       ├── tsconfig.json
│       └── wrangler.toml              # Cloudflare Workers deployment config
├── .env.example                       # Required environment variables (no secrets)
├── doppler.yaml                       # Doppler secret management config
├── package.json                       # Workspaces root
├── .eslintrc.json                     # Shared ESLint config
├── .prettierrc                        # Shared Prettier config
└── .editorconfig                      # Shared editor config
```

## Key Commands

| Command                              | Purpose                                |
| ------------------------------------ | -------------------------------------- |
| `npm run build`                      | Build all packages                     |
| `npm test`                           | Run all tests                          |
| `npm run typecheck`                  | Typecheck all packages                 |
| `npm run build -w autter-tracker`    | Build CLI only                         |
| `npm run test -w autter-tracker`     | Run CLI tests only                     |
| `npm run typecheck -w @autter/api`   | Typecheck API only                     |
| `npm run dev -w @autter/api`         | Run API dev server (wrangler)          |
| `npm run db:generate -w @autter/api` | Generate Drizzle migrations            |

## Conventions

### CLI Package (`packages/cli/`)
- **Zero runtime dependencies** — only `node:fs`, `node:path`, `node:child_process`, `node:util` at runtime. Auth uses the built-in `fetch` API (Node 18+).
- **Git interactions** — always use `execFileSync` (not `exec`) to avoid shell injection. Located in `src/git.ts`.
- **Tests** — `detector.test.ts` and `utils.test.ts` are pure unit tests. `storage.test.ts` uses real temp directories. `git.test.ts` and `hook.test.ts` mock `execFileSync` or the git module.
- **Exports** — public API in `src/index.ts`. CLI in `src/cli.ts`. Commands are not directly exported.
- **Token storage** — auth tokens stored at `~/.autter/auth.json` with `0600` file permissions. Config at `~/.autter/config.json`.
- **Async commands** — `login`, `status`, `sync` are async. They use the `runAsync()` wrapper in `cli.ts`.

### API Package (`packages/api/`)
- **Better Auth** handles user/session/account/deviceCode tables automatically. Custom tables (commits, teams, teamMembers) are in `src/db/schema.ts`.
- **Device Authorization** — RFC 8628 flow. CLI requests device code, user approves in browser, CLI polls for token.
- **Secrets** — never committed. Managed via Doppler or `wrangler secret put`. See `.env.example`.
- **Drizzle ORM** — type-safe queries. Migrations via `drizzle-kit generate`.
- **Hono framework** — lightweight, runs on Cloudflare Workers edge.

## Adding a New AI Tool Pattern

1. Add a new `AiPattern` entry to `BUILTIN_PATTERNS` in `packages/cli/src/detector.ts`.
2. Add test cases in `packages/cli/tests/detector.test.ts`.
3. Update the table in `README.md`.

## Adding a New API Endpoint

1. Create or extend a route file in `packages/api/src/routes/`.
2. Register it in `packages/api/src/index.ts`.
3. Add `requireAuth` middleware if the endpoint needs authentication.

## Build Output

CLI (tsup):
- `dist/index.js` + `dist/index.mjs` — library (CJS + ESM)
- `dist/index.d.ts` — TypeScript declarations
- `dist/cli.js` — CLI binary with `#!/usr/bin/env node` shebang

API (wrangler):
- Bundled and deployed to Cloudflare Workers
