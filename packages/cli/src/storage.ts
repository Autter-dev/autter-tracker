import fs from "node:fs";
import path from "node:path";

import type { AiCommit, StorageData } from "./types";

export function getStorageDir(repoRoot: string): string {
  return path.join(repoRoot, ".autter");
}

export function getStoragePath(repoRoot: string): string {
  return path.join(repoRoot, ".autter", "commits.json");
}

function defaultStorage(): StorageData {
  return { version: 1, commits: [] };
}

export function readStorage(repoRoot: string): StorageData {
  const filePath = getStoragePath(repoRoot);
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as StorageData;
  } catch {
    return defaultStorage();
  }
}

export function writeStorage(repoRoot: string, data: StorageData): void {
  const dir = getStorageDir(repoRoot);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(getStoragePath(repoRoot), JSON.stringify(data, null, 2) + "\n");
}

export function addCommit(repoRoot: string, commit: AiCommit): void {
  const data = readStorage(repoRoot);
  const exists = data.commits.some((c) => c.fullHash === commit.fullHash);
  if (exists) return;

  data.commits.push(commit);
  writeStorage(repoRoot, data);
}

export function ensureStorageDir(repoRoot: string): void {
  const dir = getStorageDir(repoRoot);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function ensureGitignore(repoRoot: string): void {
  const gitignorePath = path.join(repoRoot, ".gitignore");
  const entry = ".autter/";

  try {
    const content = fs.readFileSync(gitignorePath, "utf-8");
    if (content.includes(entry)) return;
    const separator = content.endsWith("\n") ? "" : "\n";
    fs.appendFileSync(gitignorePath, `${separator}${entry}\n`);
  } catch {
    fs.writeFileSync(gitignorePath, `${entry}\n`);
  }
}
