# Setup & Deployment Guide

This guide covers everything you need to get autter-tracker running locally and deployed to production. Because this is an open-source project, **no secrets are committed to the repo** — all sensitive values are managed via environment variables, [Doppler](https://doppler.com), or Cloudflare Worker secrets.

---

## Prerequisites

- **Node.js** >= 18
- **npm** (ships with Node)
- A **[Neon](https://neon.tech)** PostgreSQL database (free tier works)
- A **[Cloudflare](https://dash.cloudflare.com)** account (for deploying the API)
- *(Optional)* A **[Doppler](https://doppler.com)** account for secrets management
- *(Optional)* A **GitHub OAuth App** for social login

---

## 1. Clone & Install

```bash
git clone https://github.com/sagnikghosh/autter-tracker.git
cd autter-tracker
npm install
```

This installs dependencies for both workspace packages (`packages/cli` and `packages/api`).

---

## 2. Environment Variables

You can manage secrets with **Doppler** (recommended) or a plain **`.env`** file.

### Option A: Doppler (recommended)

Doppler keeps secrets synced across your team and environments. The repo includes a `doppler.yaml` that maps to project `autter-tracker`, config `dev`.

1. Install the Doppler CLI: <https://docs.doppler.com/docs/install-cli>
2. Login and set up:
   ```bash
   doppler login
   doppler setup          # Picks up doppler.yaml → project: autter-tracker, config: dev
   ```
3. Add your secrets:
   ```bash
   doppler secrets set BETTER_AUTH_SECRET="$(openssl rand -base64 32)"
   doppler secrets set BETTER_AUTH_URL="http://localhost:8787"
   doppler secrets set DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/autter?sslmode=require"
   ```
4. *(Optional)* Add GitHub OAuth secrets:
   ```bash
   doppler secrets set GITHUB_CLIENT_ID="..."
   doppler secrets set GITHUB_CLIENT_SECRET="..."
   ```
5. Prefix commands with `doppler run --` to inject secrets:
   ```bash
   doppler run -- npm run dev -w @autter/api
   doppler run -- npx drizzle-kit migrate
   doppler run -- npx autter-tracker login
   ```

> **Tip:** You can verify your secrets are loaded with `doppler secrets`.

### Option B: Plain `.env` file

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

### Required Variables

| Variable | Description | How to get it |
|---|---|---|
| `BETTER_AUTH_SECRET` | 32+ char secret for signing tokens | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Public URL of your API | `http://localhost:8787` locally, `https://api.autter.dev` in prod |
| `DATABASE_URL` | Neon PostgreSQL connection string | Neon dashboard → Connection Details → copy the pooled URL |

### Optional Variables

| Variable | Description |
|---|---|
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret |
| `VALID_CLIENT_IDS` | Comma-separated OAuth client IDs (default: `autter-cli`) |

### Generating a GitHub OAuth App

1. Go to <https://github.com/settings/developers>
2. Click **New OAuth App**
3. Set **Authorization callback URL** to `{BETTER_AUTH_URL}/api/auth/callback/github`
4. Copy the Client ID and Client Secret into your env

---

## 3. Database Setup

### Create a Neon Database

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project (e.g., `autter`)
3. Copy the connection string — it looks like:
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/autter?sslmode=require
   ```
4. Paste it as `DATABASE_URL` in your `.env`

### Run Migrations

> **Important:** Drizzle commands must be run from `packages/api/` (where `drizzle.config.ts` lives). Running from the repo root will fail with "drizzle.config.json file does not exist".

```bash
cd packages/api
npx drizzle-kit generate   # Generate migration SQL from the schema
npx drizzle-kit migrate    # Apply migrations to your Neon database
```

Or with Doppler:

```bash
cd packages/api
doppler run -- npx drizzle-kit generate
doppler run -- npx drizzle-kit migrate
```

You can inspect your database with:

```bash
cd packages/api
npx drizzle-kit studio     # or: doppler run -- npx drizzle-kit studio
```

> **Note:** Better Auth auto-creates its own tables (`user`, `session`, `account`, `device_code`) on first request. The Drizzle schema only defines the custom tables (`commits`, `teams`, `team_members`).

---

## 4. Local Development

### Run the API Server

```bash
npm run dev -w @autter/api
```

Or with Doppler:

```bash
doppler run -- npm run dev -w @autter/api
```

This starts a local Cloudflare Workers dev server at `http://localhost:8787`. Wrangler reads variables from `wrangler.toml` and secrets from `.env` (or Doppler when prefixed).

### Build & Test the CLI

```bash
npm run build -w autter-tracker   # Build the CLI
npm run test -w autter-tracker    # Run tests
```

### Test the CLI Against Local API

Point the CLI at your local server:

```bash
export AUTTER_API_URL=http://localhost:8787
npx autter-tracker login
```

Or create `~/.autter/config.json`:

```json
{
  "serverUrl": "http://localhost:8787",
  "clientId": "autter-cli"
}
```

### Full Build (All Packages)

```bash
npm run build        # Build everything
npm test             # Test everything
npm run typecheck    # Typecheck everything
npm run lint         # Lint everything
```

---

## 5. Secrets Management

Since this is open-source, contributors and self-hosters need a safe way to manage secrets. For local development, use **Doppler** or a **`.env` file** as described in [Section 2](#2-environment-variables).

For production deployments, use **Cloudflare Wrangler Secrets**:

```bash
cd packages/api
wrangler secret put BETTER_AUTH_SECRET
wrangler secret put DATABASE_URL
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
wrangler secret put VALID_CLIENT_IDS
```

---

## 6. Deploy to Production

### Deploy the API (Cloudflare Workers)

```bash
cd packages/api

# Set secrets first (one-time, or when they change)
wrangler secret put BETTER_AUTH_SECRET
wrangler secret put DATABASE_URL
# ... other secrets

# Deploy
npm run deploy
```

The API will be live at the URL Cloudflare assigns (or your custom domain like `api.autter.dev`).

### Custom Domain

1. In the Cloudflare dashboard, go to **Workers & Pages → your worker → Settings → Domains**
2. Add your custom domain (e.g., `api.autter.dev`)
3. Update `BETTER_AUTH_URL` in `wrangler.toml` to match

### Run Migrations in Production

```bash
DATABASE_URL="your-production-connection-string" npx drizzle-kit migrate
```

Or with Doppler:

```bash
doppler run --config prd -- npx drizzle-kit migrate
```

### Publish the CLI to npm

```bash
cd packages/cli
npm run build
npm publish
```

Users install with:

```bash
npm install --save-dev autter-tracker
npx autter-tracker init
```

---

## 7. Auth Architecture

Understanding the auth flow helps with debugging and self-hosting:

```
CLI (autter-tracker login)
  │
  ├─ POST /api/auth/device/code  →  Gets { user_code, device_code }
  │
  ├─ Opens browser → user visits /device, enters the code, logs in
  │
  ├─ Polls POST /api/auth/device/token every 5s
  │
  └─ Receives { access_token, refresh_token }
       └─ Stored at ~/.autter/auth.json (mode 0600)
```

- **Better Auth** handles all auth routes under `/api/auth/**`
- The **Device Authorization Grant** (RFC 8628) is used so the CLI never handles user credentials
- Tokens are stored per-user at `~/.autter/auth.json` with `0600` permissions (owner-only read/write)
- The config directory `~/.autter/` is created with `0700` permissions

### Security Notes for Self-Hosters

- **`BETTER_AUTH_SECRET`** must be at least 32 characters and cryptographically random
- **Never commit** `.env` files or secrets to the repo
- **`VALID_CLIENT_IDS`** controls which OAuth clients can request device codes — keep this restricted
- The API uses **CORS** with an allowlist: only `https://app.autter.dev`, `localhost:3000`, and `localhost:5173` are permitted (CLI requests have no `Origin` header and are allowed)
- Database connections use **Neon's serverless driver** which connects over HTTPS, not raw TCP

---

## 8. Project Structure Reference

```
autter-tracker/
├── packages/
│   ├── cli/                    # Published as "autter-tracker" on npm
│   │   ├── src/
│   │   │   ├── cli.ts          # CLI entry point (arg parsing, command dispatch)
│   │   │   ├── auth.ts         # Device auth flow + token storage
│   │   │   ├── config.ts       # CLI config (~/.autter/config.json)
│   │   │   ├── detector.ts     # AI tool detection from commit messages
│   │   │   ├── storage.ts      # Local .autter/commits.json read/write
│   │   │   ├── hook.ts         # post-commit git hook installer
│   │   │   ├── git.ts          # Git operations
│   │   │   └── commands/       # Individual CLI commands
│   │   ├── tests/
│   │   ├── tsup.config.ts      # Build config (CJS + ESM output)
│   │   └── package.json
│   └── api/                    # Deployed as Cloudflare Worker
│       ├── src/
│       │   ├── index.ts        # Hono app, routing, CORS
│       │   ├── auth.ts         # Better Auth config (device flow, GitHub OAuth)
│       │   ├── db/
│       │   │   ├── schema.ts   # Drizzle schema (commits, teams, team_members)
│       │   │   └── index.ts    # Neon + Drizzle client factory
│       │   ├── middleware/
│       │   │   └── auth.ts     # Session validation middleware
│       │   ├── routes/
│       │   │   ├── sync.ts     # POST /api/sync, GET /api/sync/status|stats
│       │   │   └── teams.ts    # CRUD teams, add members, team stats
│       │   └── types.ts
│       ├── drizzle.config.ts
│       ├── wrangler.toml
│       └── package.json
├── .env.example                # Template for required env vars
├── doppler.yaml                # Doppler project/config mapping
├── .github/workflows/ci.yml   # CI: lint, typecheck, test, build (Node 18/20/22)
└── package.json                # Workspaces root
```

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `wrangler dev` fails with missing bindings | Make sure `.env` has all required variables, or use `doppler run -- wrangler dev` |
| `drizzle-kit migrate` connection error | Check `DATABASE_URL` is correct and Neon project is active |
| `autter-tracker login` hangs | Ensure the API server is running and `AUTTER_API_URL` points to it |
| Better Auth tables missing | They are auto-created on first auth request — hit any `/api/auth/*` endpoint |
| CORS errors in browser | Add your origin to the allowed list in `packages/api/src/index.ts` |
| `permission denied` on `~/.autter/auth.json` | Check file permissions: should be `0600`. Delete and re-run `login` |
