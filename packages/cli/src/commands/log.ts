import { getRepoRoot, isGitRepo } from "../git";
import { readStorage } from "../storage";
import { bold, cyan, dim, red, truncate, yellow } from "../utils";

export function logCommand(limit: number): void {
  if (!isGitRepo()) {
    process.stderr.write(red("Error: not inside a git repository.\n"));
    process.exitCode = 1;
    return;
  }

  const repoRoot = getRepoRoot();
  const data = readStorage(repoRoot);

  if (data.commits.length === 0) {
    process.stdout.write(yellow("No AI commits tracked yet.\n"));
    return;
  }

  // Show most recent first
  const commits = [...data.commits].reverse().slice(0, limit);

  process.stdout.write("\n" + bold("  Recent AI Commits") + "\n\n");

  for (const c of commits) {
    const date = new Date(c.date).toLocaleDateString();
    process.stdout.write(
      `  ${yellow(c.hash)}  ${dim(date)}  ${cyan(c.displayName.padEnd(16))}  ${truncate(c.message, 50)}\n`,
    );
  }

  if (data.commits.length > limit) {
    process.stdout.write(dim(`\n  ... and ${data.commits.length - limit} more\n`));
  }

  process.stdout.write("\n");
}
