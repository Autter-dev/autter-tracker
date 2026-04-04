# autter-tracker

Detects AI-assisted git commits and tracks them locally. Install as a dev dependency, run `init`, and every commit made by Claude Code, GitHub Copilot, Cursor, Windsurf, Devin, Aider, Cody, Gemini, or Amazon Q is automatically logged.

## How It Works

1. A `post-commit` git hook runs after every commit
2. The hook inspects the commit message for AI tool signatures (co-author trailers, `Generated-By` tags, etc.)
3. Detected AI commits are stored locally in `.autter/commits.json` (gitignored)

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

### `autter-tracker uninstall`

Removes the post-commit hook. Add `--clean` to also delete the `.autter/` data directory.

```bash
npx autter-tracker uninstall --clean
```

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
```

## Development

```bash
npm install
npm run build
npm test
npm run test:coverage
npm run lint
npm run format
npm run typecheck
```

## License

MIT
