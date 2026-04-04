import fs from "node:fs";
import path from "node:path";

import { getHooksDir, getRepoRoot, isGitRepo } from "../git";
import { ensureGitignore, ensureStorageDir } from "../storage";
import { bold, green, red, yellow } from "../utils";

const HOOK_MARKER = "#autter-tracker:hook";
const HOOK_SCRIPT = `
${HOOK_MARKER}
npx --yes autter-tracker hook
`;

export function initCommand(): void {
  if (!isGitRepo()) {
    process.stderr.write(red("Error: not inside a git repository.\n"));
    process.exitCode = 1;
    return;
  }

  const repoRoot = getRepoRoot();
  const hooksDir = path.resolve(repoRoot, getHooksDir());
  const hookPath = path.join(hooksDir, "post-commit");

  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
  }

  if (fs.existsSync(hookPath)) {
    const existing = fs.readFileSync(hookPath, "utf-8");
    if (existing.includes(HOOK_MARKER)) {
      process.stdout.write(yellow("autter-tracker hook is already installed.\n"));
      return;
    }
    // Append to existing hook
    fs.appendFileSync(hookPath, HOOK_SCRIPT);
  } else {
    fs.writeFileSync(hookPath, `#!/bin/sh\n${HOOK_SCRIPT}`);
  }

  fs.chmodSync(hookPath, 0o755);

  ensureStorageDir(repoRoot);
  ensureGitignore(repoRoot);

  process.stdout.write(
    green("Installed") +
      ` autter-tracker post-commit hook.\n` +
      bold("AI commits will now be tracked automatically.\n"),
  );
}
