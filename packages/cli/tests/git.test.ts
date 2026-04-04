import * as childProcess from "node:child_process";

import { describe, it, expect, vi, afterEach } from "vitest";

import {
  isGitRepo,
  getRepoRoot,
  getHooksDir,
  getLatestCommit,
  getCommitBody,
  getTotalCommitCount,
} from "../src/git";

vi.mock("node:child_process", () => ({
  execFileSync: vi.fn(),
}));

const mockExecFileSync = vi.mocked(childProcess.execFileSync);

describe("git helpers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("isGitRepo", () => {
    it("returns true when git succeeds", () => {
      mockExecFileSync.mockReturnValue("true\n" as never);
      expect(isGitRepo()).toBe(true);
    });

    it("returns false when git fails", () => {
      mockExecFileSync.mockImplementation(() => {
        throw new Error("not a git repo");
      });
      expect(isGitRepo()).toBe(false);
    });
  });

  describe("getRepoRoot", () => {
    it("returns trimmed path", () => {
      mockExecFileSync.mockReturnValue("/home/user/project\n" as never);
      expect(getRepoRoot()).toBe("/home/user/project");
    });
  });

  describe("getHooksDir", () => {
    it("returns trimmed hooks path", () => {
      mockExecFileSync.mockReturnValue(".git/hooks\n" as never);
      expect(getHooksDir()).toBe(".git/hooks");
    });
  });

  describe("getLatestCommit", () => {
    it("parses formatted commit output", () => {
      const sep = "\x1f";
      const output = `abc1234${sep}abc1234567890abcdef${sep}fix: login bug${sep}Jane Doe${sep}2026-04-04T10:00:00+00:00\n`;
      mockExecFileSync.mockReturnValue(output as never);

      const commit = getLatestCommit();
      expect(commit.hash).toBe("abc1234");
      expect(commit.fullHash).toBe("abc1234567890abcdef");
      expect(commit.message).toBe("fix: login bug");
      expect(commit.author).toBe("Jane Doe");
      expect(commit.date).toBe("2026-04-04T10:00:00+00:00");
    });
  });

  describe("getCommitBody", () => {
    it("returns trimmed commit body", () => {
      mockExecFileSync.mockReturnValue("fix: bug\n\nCo-Authored-By: Claude\n" as never);
      expect(getCommitBody("abc")).toBe("fix: bug\n\nCo-Authored-By: Claude");
    });
  });

  describe("getTotalCommitCount", () => {
    it("returns parsed count", () => {
      mockExecFileSync.mockReturnValue("42\n" as never);
      expect(getTotalCommitCount()).toBe(42);
    });

    it("returns 0 on error", () => {
      mockExecFileSync.mockImplementation(() => {
        throw new Error("no commits");
      });
      expect(getTotalCommitCount()).toBe(0);
    });
  });
});
