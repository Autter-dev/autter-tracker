# Agent Guide — autter-tracker

This file helps AI agents working on this codebase understand its structure, conventions, and workflows.

## Project Overview

`autter-tracker` is a CLI tool + library that detects AI-assisted git commits via a post-commit hook and tracks them locally. Zero runtime dependencies — uses only Node.js built-ins.

## Directory Structure

```
autter-tracker/
├── src/
│   ├── cli.ts              # CLI entry point (bin), dispatches commands
│   ├── index.ts            # Programmatic API re-exports
│   ├── types.ts            # TypeScript interfaces (AiCommit, StorageData, etc.)
│   ├── detector.ts         # AI pattern matching engine (BUILTIN_PATTERNS)
│   ├── git.ts              # Git shell helpers (execFileSync wrappers)
│   ├── hook.ts             # Post-commit hook logic
│   ├── storage.ts          # Local JSON storage (.autter/commits.json)
│   ├── utils.ts            # Terminal formatting (colors, truncate, pad)
│   └── commands/
│       ├── init.ts         # Install post-commit hook
│       ├── stats.ts        # Show AI commit statistics
│       ├── log.ts          # Show recent AI commits
│       └── uninstall.ts    # Remove hook
├── tests/
│   ├── detector.test.ts    # AI detection pattern tests
│   ├── storage.test.ts     # JSON storage tests (uses real temp dirs)
│   ├── git.test.ts         # Git helper tests (mocked execFileSync)
│   ├── hook.test.ts        # Hook integration tests (mocked git module)
│   └── utils.test.ts       # Utility function tests
├── tsconfig.json           # TypeScript configuration (Node.js target)
├── tsup.config.ts          # Dual build: library (CJS+ESM) + CLI (CJS with shebang)
├── vitest.config.ts        # Test config with 80% coverage thresholds
├── .eslintrc.json          # ESLint with strict TypeScript rules
└── .prettierrc             # Code formatting rules
```

## Key Commands

| Command                 | Purpose                        |
| ----------------------- | ------------------------------ |
| `npm run build`         | Build library + CLI to dist/   |
| `npm test`              | Run test suite                 |
| `npm run test:coverage` | Run tests with V8 coverage     |
| `npm run lint`          | Lint source and test files     |
| `npm run format`        | Format all files with Prettier |
| `npm run typecheck`     | Run tsc with no emit           |

## Conventions

- **Zero dependencies** — only `node:fs`, `node:path`, `node:child_process`, `node:util` at runtime.
- **Git interactions** — always use `execFileSync` (not `exec`) to avoid shell injection. Located in `src/git.ts`.
- **Tests** — `detector.test.ts` and `utils.test.ts` are pure unit tests. `storage.test.ts` uses real temp directories. `git.test.ts` and `hook.test.ts` mock `execFileSync` or the git module.
- **Exports** — public API in `src/index.ts`. CLI in `src/cli.ts`. Commands are not directly exported.

## Adding a New AI Tool Pattern

1. Add a new `AiPattern` entry to `BUILTIN_PATTERNS` in `src/detector.ts`.
2. Add test cases in `tests/detector.test.ts`.
3. Update the table in `README.md`.

## Build Output

tsup produces:

- `dist/index.js` + `dist/index.mjs` — library (CJS + ESM)
- `dist/index.d.ts` — TypeScript declarations
- `dist/cli.js` — CLI binary with `#!/usr/bin/env node` shebang
