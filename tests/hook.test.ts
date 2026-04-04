import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as git from "../src/git";
import { runHook } from "../src/hook";
import { readStorage } from "../src/storage";

vi.mock("../src/git", () => ({
  getRepoRoot: vi.fn(),
  getLatestCommit: vi.fn(),
  getCommitBody: vi.fn(),
}));

describe("runHook", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "autter-hook-"));
    vi.mocked(git.getRepoRoot).mockReturnValue(tmpDir);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("stores AI commit when detected", () => {
    vi.mocked(git.getLatestCommit).mockReturnValue({
      hash: "abc1234",
      fullHash: "abc1234567890",
      message: "fix: bug",
      author: "Dev",
      date: "2026-04-04T10:00:00Z",
    });
    vi.mocked(git.getCommitBody).mockReturnValue(
      "fix: bug\n\nCo-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>",
    );

    runHook();

    const data = readStorage(tmpDir);
    expect(data.commits).toHaveLength(1);
    expect(data.commits[0]!.aiTool).toBe("claude-code");
  });

  it("does not store non-AI commit", () => {
    vi.mocked(git.getLatestCommit).mockReturnValue({
      hash: "def5678",
      fullHash: "def5678901234",
      message: "chore: update readme",
      author: "Human",
      date: "2026-04-04T11:00:00Z",
    });
    vi.mocked(git.getCommitBody).mockReturnValue("chore: update readme");

    runHook();

    const data = readStorage(tmpDir);
    expect(data.commits).toHaveLength(0);
  });

  it("writes to stderr when AI commit detected", () => {
    vi.mocked(git.getLatestCommit).mockReturnValue({
      hash: "abc1234",
      fullHash: "abc1234567890",
      message: "fix: bug",
      author: "Dev",
      date: "2026-04-04T10:00:00Z",
    });
    vi.mocked(git.getCommitBody).mockReturnValue("fix: bug\n\nGenerated-By: Cursor");

    const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);

    runHook();

    expect(stderrSpy).toHaveBeenCalled();
    const output = stderrSpy.mock.calls[0]![0] as string;
    expect(output).toContain("Cursor");
    stderrSpy.mockRestore();
  });
});
