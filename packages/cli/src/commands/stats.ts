import { getRepoRoot, getTotalCommitCount, isGitRepo } from "../git";
import { readStorage } from "../storage";
import { bold, cyan, dim, green, red, yellow } from "../utils";

export function statsCommand(): void {
  if (!isGitRepo()) {
    process.stderr.write(red("Error: not inside a git repository.\n"));
    process.exitCode = 1;
    return;
  }

  const repoRoot = getRepoRoot();
  const data = readStorage(repoRoot);
  const totalRepo = getTotalCommitCount();
  const aiCount = data.commits.length;

  if (aiCount === 0) {
    process.stdout.write(yellow("No AI commits tracked yet.") + "\n");
    process.stdout.write(dim('Run "autter-tracker init" to start tracking.\n'));
    return;
  }

  const pct = totalRepo > 0 ? ((aiCount / totalRepo) * 100).toFixed(1) : "N/A";

  // Group by tool
  const byTool = new Map<string, { displayName: string; count: number }>();
  for (const c of data.commits) {
    const existing = byTool.get(c.aiTool);
    if (existing) {
      existing.count++;
    } else {
      byTool.set(c.aiTool, { displayName: c.displayName, count: 1 });
    }
  }

  const sorted = [...byTool.values()].sort((a, b) => b.count - a.count);

  // Date range
  const dates = data.commits.map((c) => new Date(c.date).getTime());
  const earliest = new Date(Math.min(...dates)).toLocaleDateString();
  const latest = new Date(Math.max(...dates)).toLocaleDateString();

  process.stdout.write("\n" + bold("  AI Commit Statistics") + "\n\n");
  process.stdout.write(`  Total commits in repo:  ${bold(String(totalRepo))}\n`);
  process.stdout.write(`  AI-assisted commits:    ${green(String(aiCount))} ${dim(`(${pct}%)`)}\n`);
  process.stdout.write(`  Tracking since:         ${dim(earliest)} — ${dim(latest)}\n\n`);
  process.stdout.write(bold("  Breakdown by tool") + "\n");

  for (const entry of sorted) {
    const bar = "\u2588".repeat(Math.max(1, Math.round((entry.count / aiCount) * 20)));
    process.stdout.write(
      `  ${cyan(entry.displayName.padEnd(18))} ${String(entry.count).padStart(4)}  ${dim(bar)}\n`,
    );
  }

  process.stdout.write("\n");
}
