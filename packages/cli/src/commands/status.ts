import { isLoggedIn, readTokens, authedFetch } from "../auth";
import { getConfig } from "../config";
import { bold, cyan, dim, green, red, yellow } from "../utils";

export async function statusCommand(): Promise<void> {
  const config = getConfig();

  process.stdout.write("\n" + bold("  autter-tracker status") + "\n\n");
  process.stdout.write(`  Server:  ${dim(config.serverUrl)}\n`);

  if (!isLoggedIn()) {
    process.stdout.write(`  Auth:    ${yellow("not logged in")}\n`);
    process.stdout.write(dim('\n  Run "autter-tracker login" to authenticate.\n\n'));
    return;
  }

  const tokens = readTokens();
  process.stdout.write(`  Auth:    ${green("logged in")}\n`);

  if (tokens?.email) {
    process.stdout.write(`  Account: ${cyan(tokens.email)}\n`);
  }

  // Try to fetch sync status from server
  try {
    const res = await authedFetch("/api/sync/status");
    if (res.ok) {
      const data = (await res.json()) as {
        totalCommits: number;
        lastSyncedAt: string | null;
      };
      process.stdout.write(`  Synced:  ${bold(String(data.totalCommits))} commits\n`);
      if (data.lastSyncedAt) {
        const lastSync = new Date(data.lastSyncedAt).toLocaleString();
        process.stdout.write(`  Last:    ${dim(lastSync)}\n`);
      }
    }
  } catch {
    process.stdout.write(dim("  (could not reach server)") + "\n");
  }

  process.stdout.write("\n");
}
