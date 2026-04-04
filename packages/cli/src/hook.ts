import { detectAiTool } from "./detector";
import { getCommitBody, getLatestCommit, getRepoRoot } from "./git";
import { addCommit } from "./storage";
import type { AiCommit } from "./types";
import { cyan, dim } from "./utils";

export function runHook(): void {
  const repoRoot = getRepoRoot();
  const commit = getLatestCommit();
  const body = getCommitBody(commit.fullHash);

  const result = detectAiTool(body);
  if (!result) return;

  const aiCommit: AiCommit = {
    hash: commit.hash,
    fullHash: commit.fullHash,
    message: commit.message,
    author: commit.author,
    date: commit.date,
    aiTool: result.tool,
    displayName: result.displayName,
    matchedPattern: result.matchedPattern,
  };

  addCommit(repoRoot, aiCommit);

  process.stderr.write(
    `${dim("[autter]")} AI commit detected: ${cyan(result.displayName)} ${dim(`(${commit.hash})`)}\n`,
  );
}
