# Memory — autter-tracker

Living document tracking architecture decisions, known limitations, and changes.

## Architecture Decisions

- **Zero runtime dependencies** — all functionality uses Node.js built-ins only. This minimises install size and supply chain risk since the package runs as a git hook on every commit.
- **Post-commit hook via npx** — the hook script calls `npx autter-tracker hook` rather than a direct path to `node_modules/.bin`. This works across monorepos, global installs, and different package managers.
- **Hook chaining** — `init` detects existing `post-commit` hooks and appends rather than overwriting. A `#autter-tracker:hook` marker identifies our section for clean removal.
- **Local-only storage** — tracking data lives in `.autter/commits.json`, gitignored by default. No network calls, no external services.
- **Deduplication by fullHash** — prevents duplicate entries when a hook fires multiple times on the same commit (e.g., amend).
- **Silent hook failures** — the `hook` command catches all errors and exits cleanly so it never blocks a developer's commit.

## Known Limitations

- Only detects AI tools that leave signatures in commit messages. Tools that don't modify commit messages are invisible.
- `Generated-By:` as a fallback catches any tool but can't identify which specific AI.
- No retroactive scanning — only commits made after `init` are tracked. Could add a `scan` command in the future.

## Changelog

| Date       | Change                                                                              |
| ---------- | ----------------------------------------------------------------------------------- |
| 2026-04-04 | Complete redesign: git hook-based AI commit tracker replacing generic event tracker |
