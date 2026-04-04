import fs from "node:fs";
import path from "node:path";

import { getHooksDir, getRepoRoot, isGitRepo } from "../git";
import { getStorageDir } from "../storage";
import { green, red, yellow } from "../utils";

const HOOK_MARKER = "#autter-tracker:hook";

export function uninstallCommand(clean: boolean): void {
  if (!isGitRepo()) {
    process.stderr.write(red("Error: not inside a git repository.\n"));
    process.exitCode = 1;
    return;
  }

  const repoRoot = getRepoRoot();
  const hooksDir = path.resolve(repoRoot, getHooksDir());
  const hookPath = path.join(hooksDir, "post-commit");

  if (!fs.existsSync(hookPath)) {
    process.stdout.write(yellow("No post-commit hook found. Nothing to uninstall.\n"));
    return;
  }

  const content = fs.readFileSync(hookPath, "utf-8");
  if (!content.includes(HOOK_MARKER)) {
    process.stdout.write(
      yellow("post-commit hook does not contain autter-tracker. Nothing to uninstall.\n"),
    );
    return;
  }

  // Remove our section from the hook
  const lines = content.split("\n");
  const filtered: string[] = [];
  let skipping = false;

  for (const line of lines) {
    if (line.includes(HOOK_MARKER)) {
      skipping = true;
      continue;
    }
    if (skipping && line.startsWith("npx") && line.includes("autter-tracker")) {
      skipping = false;
      continue;
    }
    skipping = false;
    filtered.push(line);
  }

  const remaining = filtered.join("\n").trim();

  if (remaining === "#!/bin/sh" || remaining === "") {
    fs.unlinkSync(hookPath);
  } else {
    fs.writeFileSync(hookPath, remaining + "\n");
    fs.chmodSync(hookPath, 0o755);
  }

  if (clean) {
    const storageDir = getStorageDir(repoRoot);
    if (fs.existsSync(storageDir)) {
      fs.rmSync(storageDir, { recursive: true });
      process.stdout.write("Removed .autter/ tracking data.\n");
    }
  }

  process.stdout.write(green("Uninstalled") + " autter-tracker post-commit hook.\n");
}
