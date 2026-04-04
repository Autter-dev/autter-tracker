# Agent Guide — autter-tracker

This file is intended for AI agents working on this codebase. It describes the project structure, conventions, and workflows needed to contribute effectively.

## Project Overview

`autter-tracker` is a TypeScript npm package that provides lightweight, pluggable event tracking with batching and retry logic.

## Directory Structure

```
autter-tracker/
├── src/
│   ├── index.ts           # Public API re-exports
│   ├── tracker.ts         # Core Tracker class (batching, retry, lifecycle)
│   ├── types.ts           # All TypeScript interfaces and types
│   ├── utils.ts           # Utility functions (ID generation, sleep, now)
│   └── plugins/
│       ├── index.ts           # Plugin barrel exports
│       ├── console-plugin.ts  # Logs events to console
│       ├── timestamp-plugin.ts# Enriches events with timing data
│       └── filter-plugin.ts   # Allow/block list filtering
├── tests/
│   ├── tracker.test.ts    # Core tracker tests
│   ├── plugins.test.ts    # Plugin tests
│   └── utils.test.ts      # Utility tests
├── tsconfig.json          # TypeScript configuration
├── tsup.config.ts         # Build configuration (CJS + ESM)
├── vitest.config.ts       # Test configuration with coverage thresholds
├── .eslintrc.json         # ESLint rules
├── .prettierrc            # Prettier formatting rules
└── package.json           # Dependencies and scripts
```

## Key Commands

| Command                 | Purpose                         |
| ----------------------- | ------------------------------- |
| `npm run build`         | Build CJS + ESM output to dist/ |
| `npm test`              | Run the test suite              |
| `npm run test:coverage` | Run tests with V8 coverage      |
| `npm run lint`          | Lint source and test files      |
| `npm run lint:fix`      | Auto-fix lint issues            |
| `npm run format`        | Format all files with Prettier  |
| `npm run typecheck`     | Run tsc with no emit            |

## Conventions

- **No `any`** — the ESLint config warns on `@typescript-eslint/no-explicit-any`. Use `unknown` and narrow.
- **Imports** — use path aliases relative to `src/`. Imports are sorted by group with `eslint-plugin-import`.
- **Tests** — each source file has a corresponding test file in `tests/`. Use Vitest with `vi.fn()` for mocks.
- **Plugins** — every plugin is a factory function (`create*Plugin`) returning `TrackerPlugin`. It must have a unique `name` and a `process` function.
- **Exports** — all public API surfaces are re-exported from `src/index.ts`. Internal helpers should not be exported.

## Adding a New Plugin

1. Create `src/plugins/my-plugin.ts` with a `createMyPlugin()` factory function.
2. Re-export it from `src/plugins/index.ts`.
3. Re-export it from `src/index.ts`.
4. Add tests in `tests/plugins.test.ts` (or a new file for complex plugins).

## Coverage Thresholds

The project enforces 80% coverage across branches, functions, lines, and statements. All PRs must maintain this.

## Build Output

`tsup` produces:

- `dist/index.js` — CommonJS
- `dist/index.mjs` — ESM
- `dist/index.d.ts` — TypeScript declarations
