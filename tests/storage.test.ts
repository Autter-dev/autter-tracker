import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  addCommit,
  ensureGitignore,
  ensureStorageDir,
  readStorage,
  writeStorage,
} from "../src/storage";
import type { AiCommit, StorageData } from "../src/types";

function makeCommit(overrides: Partial<AiCommit> = {}): AiCommit {
  return {
    hash: "abc1234",
    fullHash: "abc1234567890",
    message: "fix: bug",
    author: "Test",
    date: "2026-04-04T10:00:00Z",
    aiTool: "claude-code",
    displayName: "Claude Code",
    matchedPattern: "Co-Authored-By:.*Claude",
    ...overrides,
  };
}

describe("storage", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "autter-test-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  describe("readStorage", () => {
    it("returns default when file does not exist", () => {
      const data = readStorage(tmpDir);
      expect(data).toEqual({ version: 1, commits: [] });
    });

    it("reads existing storage file", () => {
      const dir = path.join(tmpDir, ".autter");
      fs.mkdirSync(dir);
      const stored: StorageData = { version: 1, commits: [makeCommit()] };
      fs.writeFileSync(path.join(dir, "commits.json"), JSON.stringify(stored));

      const data = readStorage(tmpDir);
      expect(data.commits).toHaveLength(1);
      expect(data.commits[0]!.hash).toBe("abc1234");
    });

    it("returns default for corrupted JSON", () => {
      const dir = path.join(tmpDir, ".autter");
      fs.mkdirSync(dir);
      fs.writeFileSync(path.join(dir, "commits.json"), "{{not json");

      const data = readStorage(tmpDir);
      expect(data).toEqual({ version: 1, commits: [] });
    });
  });

  describe("writeStorage", () => {
    it("creates directory and writes file", () => {
      const data: StorageData = { version: 1, commits: [makeCommit()] };
      writeStorage(tmpDir, data);

      const raw = fs.readFileSync(path.join(tmpDir, ".autter", "commits.json"), "utf-8");
      const parsed = JSON.parse(raw) as StorageData;
      expect(parsed.commits).toHaveLength(1);
    });
  });

  describe("addCommit", () => {
    it("adds a new commit", () => {
      addCommit(tmpDir, makeCommit());
      const data = readStorage(tmpDir);
      expect(data.commits).toHaveLength(1);
    });

    it("deduplicates by fullHash", () => {
      addCommit(tmpDir, makeCommit());
      addCommit(tmpDir, makeCommit());
      const data = readStorage(tmpDir);
      expect(data.commits).toHaveLength(1);
    });

    it("adds different commits", () => {
      addCommit(tmpDir, makeCommit({ fullHash: "aaa" }));
      addCommit(tmpDir, makeCommit({ fullHash: "bbb" }));
      const data = readStorage(tmpDir);
      expect(data.commits).toHaveLength(2);
    });
  });

  describe("ensureStorageDir", () => {
    it("creates .autter directory", () => {
      ensureStorageDir(tmpDir);
      expect(fs.existsSync(path.join(tmpDir, ".autter"))).toBe(true);
    });

    it("is idempotent", () => {
      ensureStorageDir(tmpDir);
      ensureStorageDir(tmpDir);
      expect(fs.existsSync(path.join(tmpDir, ".autter"))).toBe(true);
    });
  });

  describe("ensureGitignore", () => {
    it("creates .gitignore with .autter/ entry", () => {
      ensureGitignore(tmpDir);
      const content = fs.readFileSync(path.join(tmpDir, ".gitignore"), "utf-8");
      expect(content).toContain(".autter/");
    });

    it("appends to existing .gitignore", () => {
      fs.writeFileSync(path.join(tmpDir, ".gitignore"), "node_modules/\n");
      ensureGitignore(tmpDir);
      const content = fs.readFileSync(path.join(tmpDir, ".gitignore"), "utf-8");
      expect(content).toContain("node_modules/");
      expect(content).toContain(".autter/");
    });

    it("does not duplicate entry", () => {
      fs.writeFileSync(path.join(tmpDir, ".gitignore"), ".autter/\n");
      ensureGitignore(tmpDir);
      const content = fs.readFileSync(path.join(tmpDir, ".gitignore"), "utf-8");
      const matches = content.match(/\.autter\//g);
      expect(matches).toHaveLength(1);
    });
  });
});
