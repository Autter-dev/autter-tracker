# autter-tracker

Detects AI-assisted git commits and tracks them locally — with optional remote sync, team dashboards, and device-based authentication. Install as a dev dependency, run `init`, and every commit made by Claude Code, GitHub Copilot, Cursor, Windsurf, Devin, Aider, Cody, Gemini, or Amazon Q is automatically logged.

## How It Works

1. A `post-commit` git hook runs after every commit
2. The hook inspects the commit message for AI tool signatures (co-author trailers, `Generated-By` tags, etc.)
3. Detected AI commits are stored locally in `.autter/commits.json` (gitignored)
4. Optionally, authenticate and sync commits to the autter server for team dashboards and cross-machine stats

## Installation

```bash
npm install --save-dev autter-tracker
```

## Setup

```bash
npx autter-tracker init
```

This installs a `post-commit` hook and creates the `.autter/` tracking directory. If a `post-commit` hook already exists, it appends rather than overwriting.

## Commands

### `autter-tracker init`

Installs the post-commit hook in the current repository.

### `autter-tracker stats`

Shows AI commit statistics — total counts, percentage of AI commits, and breakdown by tool.

```
  AI Commit Statistics

  Total commits in repo:  142
  AI-assisted commits:    37 (26.1%)
  Tracking since:         3/15/2026 — 4/4/2026

  Breakdown by tool
  Claude Code           22  ████████████
  GitHub Copilot         9  █████
  Cursor                 6  ███
```

### `autter-tracker log`

Shows recent AI-detected commits. Use `--limit` / `-n` to control how many.

```bash
npx autter-tracker log -n 10
```

### `autter-tracker login`

Authenticates with the autter server using the OAuth 2.0 Device Authorization flow. The CLI displays a code, opens your browser, and waits for you to approve.

```bash
npx autter-tracker login
```

### `autter-tracker logout`

Clears stored authentication tokens.

### `autter-tracker status`

Shows current auth and sync status — whether you're logged in, how many commits are synced, and last sync time.

### `autter-tracker sync`

Pushes locally tracked AI commits to the autter server. Requires authentication.

```bash
npx autter-tracker sync
```

### `autter-tracker uninstall`

Removes the post-commit hook. Add `--clean` to also delete the `.autter/` data directory.

```bash
npx autter-tracker uninstall --clean
```

## Authentication

autter-tracker uses the **OAuth 2.0 Device Authorization Grant** (RFC 8628) for CLI authentication:

1. Run `autter-tracker login`
2. A code is displayed and your browser opens automatically
3. Log in and enter the code to authorize
4. The CLI receives a token and stores it securely at `~/.autter/auth.json` (permissions `0600`)

Tokens are stored per-user, not per-repo. Once logged in, `sync` works across all your repositories.

### Configuration

The CLI defaults to `https://api.autter.dev`. Override with:

- Environment variable: `AUTTER_API_URL=https://my-instance.com`
- Config file: `~/.autter/config.json`

## Detected AI Tools

| Tool           | Detection Method                                                                       |
| -------------- | -------------------------------------------------------------------------------------- |
| Claude Code    | `Co-Authored-By: Claude`, `Generated-By: PostHog Code`, `Generated with [Claude Code]` |
| GitHub Copilot | `Co-Authored-By: Copilot`, `github-copilot[bot]`                                       |
| Cursor         | `Generated-By: Cursor`, `[Cursor]`                                                     |
| Windsurf       | `Co-Authored-By: Windsurf`, `Codeium`                                                  |
| Devin          | `Co-Authored-By: Devin`, `devin-ai`                                                    |
| Aider          | `aider:` prefix, `Co-Authored-By: aider`                                               |
| Cody           | `Co-Authored-By: Cody`, `Sourcegraph`                                                  |
| Gemini         | `Co-Authored-By: Gemini`                                                               |
| Amazon Q       | `Co-Authored-By: Amazon Q`                                                             |
| Unknown AI     | Any `Generated-By:` trailer                                                            |

## Programmatic API

```typescript
import { detectAiTool, readStorage, BUILTIN_PATTERNS } from "autter-tracker";

// Detect AI tool from a commit message
const result = detectAiTool("fix: bug\n\nCo-Authored-By: Claude");
// { tool: "claude-code", displayName: "Claude Code", matchedPattern: "..." }

// Read stored commits
const data = readStorage("/path/to/repo");
console.log(data.commits);

// Check auth status
import { isLoggedIn, getConfig } from "autter-tracker";
console.log(isLoggedIn()); // true/false
console.log(getConfig());  // { serverUrl, clientId }
```

## Project Structure

This is an npm workspaces monorepo:

```
autter-tracker/
├── packages/
│   ├── cli/              # CLI tool + library (published as "autter-tracker")
│   └── api/              # Serverless API (Hono + Better Auth + Drizzle + Neon)
├── .env.example          # Required environment variables (no secrets)
├── doppler.yaml          # Doppler secret management config
└── package.json          # Workspaces root
```

## Self-Hosting the API

The API server runs on Cloudflare Workers with Neon PostgreSQL.

1. Copy `.env.example` and fill in your secrets
2. Set up a [Neon](https://neon.tech) database
3. Configure [Doppler](https://doppler.com) or set secrets via `wrangler secret put`
4. Deploy: `npm run deploy -w @autter/api`

See `.env.example` for the full list of required secrets.

## Development

```bash
npm install              # Install all workspace dependencies
npm run build            # Build all packages
npm test                 # Run all tests
npm run typecheck        # Typecheck all packages

# Per-package
npm run build -w autter-tracker    # Build CLI only
npm run test -w autter-tracker     # Test CLI only
npm run dev -w @autter/api         # Run API dev server
```

## License

MIT
