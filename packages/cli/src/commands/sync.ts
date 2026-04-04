import { isLoggedIn, authedFetch } from "../auth";
import { getRepoRoot, isGitRepo } from "../git";
import { readStorage } from "../storage";
import { bold, dim, green, red, yellow } from "../utils";

export async function syncCommand(): Promise<void> {
  if (!isGitRepo()) {
    process.stderr.write(red("Error: not inside a git repository.\n"));
    process.exitCode = 1;
    return;
  }

  if (!isLoggedIn()) {
    process.stderr.write(
      yellow("Not logged in.") + ' Run "autter-tracker login" first.\n',
    );
    process.exitCode = 1;
    return;
  }

  const repoRoot = getRepoRoot();
  const data = readStorage(repoRoot);

  if (data.commits.length === 0) {
    process.stdout.write(yellow("No AI commits to sync.") + "\n");
    process.stdout.write(dim("Track commits first with: autter-tracker init\n"));
    return;
  }

  process.stdout.write(dim(`Syncing ${data.commits.length} commits...`) + "\n");

  // Derive repo URL from git remote
  let repoUrl: string | undefined;
  try {
    const { execFileSync } = await import("node:child_process");
    repoUrl = execFileSync("git", ["remote", "get-url", "origin"], {
      encoding: "utf-8",
      stdio: "pipe",
    }).trim();
  } catch {
    // No remote — that's fine
  }

  const payload = {
    commits: data.commits.map((c) => ({
      hash: c.hash,
      fullHash: c.fullHash,
      message: c.message,
      author: c.author,
      date: c.date,
      aiTool: c.aiTool,
      displayName: c.displayName,
      matchedPattern: c.matchedPattern,
      repoUrl,
    })),
  };

  try {
    const res = await authedFetch("/api/sync", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      process.stderr.write(red(`Sync failed: ${res.status} ${text}`) + "\n");
      process.exitCode = 1;
      return;
    }

    const result = (await res.json()) as { synced: number; total: number };
    process.stdout.write(
      green("Synced") +
        ` ${bold(String(result.synced))} new commits` +
        dim(` (${result.total} total in payload)`) +
        "\n",
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(red(`Sync error: ${msg}`) + "\n");
    process.exitCode = 1;
  }
}
