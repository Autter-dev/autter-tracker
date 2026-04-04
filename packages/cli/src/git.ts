import { execFileSync } from "node:child_process";

export function isGitRepo(): boolean {
  try {
    execFileSync("git", ["rev-parse", "--is-inside-work-tree"], {
      stdio: "pipe",
    });
    return true;
  } catch {
    return false;
  }
}

export function getRepoRoot(): string {
  return execFileSync("git", ["rev-parse", "--show-toplevel"], {
    encoding: "utf-8",
    stdio: "pipe",
  }).trim();
}

export function getHooksDir(): string {
  return execFileSync("git", ["rev-parse", "--git-path", "hooks"], {
    encoding: "utf-8",
    stdio: "pipe",
  }).trim();
}

export interface CommitInfo {
  hash: string;
  fullHash: string;
  message: string;
  author: string;
  date: string;
}

const FIELD_SEP = "\x1f";
const RECORD_FORMAT = `%h${FIELD_SEP}%H${FIELD_SEP}%s${FIELD_SEP}%an${FIELD_SEP}%aI`;

export function getLatestCommit(): CommitInfo {
  const raw = execFileSync("git", ["log", "-1", `--format=${RECORD_FORMAT}`], {
    encoding: "utf-8",
    stdio: "pipe",
  }).trim();

  const [hash, fullHash, message, author, date] = raw.split(FIELD_SEP);
  return {
    hash: hash!,
    fullHash: fullHash!,
    message: message!,
    author: author!,
    date: date!,
  };
}

export function getCommitBody(hashOrRef: string): string {
  return execFileSync("git", ["log", "-1", "--format=%B", hashOrRef], {
    encoding: "utf-8",
    stdio: "pipe",
  }).trim();
}

export function getTotalCommitCount(): number {
  try {
    const count = execFileSync("git", ["rev-list", "--count", "HEAD"], {
      encoding: "utf-8",
      stdio: "pipe",
    }).trim();
    return parseInt(count, 10);
  } catch {
    return 0;
  }
}
