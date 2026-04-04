import { describe, it, expect } from "vitest";

import { BUILTIN_PATTERNS, detectAiTool } from "../src/detector";
import type { AiPattern } from "../src/types";

describe("detectAiTool", () => {
  describe("Claude Code", () => {
    it("detects Co-Authored-By Claude trailer", () => {
      const msg = "fix: resolve bug\n\nCo-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>";
      const result = detectAiTool(msg);
      expect(result).not.toBeNull();
      expect(result!.tool).toBe("claude-code");
    });

    it("detects anthropic email in Co-Authored-By", () => {
      const msg = "feat: add button\n\nCo-Authored-By: bot <noreply@anthropic.com>";
      const result = detectAiTool(msg);
      expect(result!.tool).toBe("claude-code");
    });

    it("detects Generated with [Claude Code] footer", () => {
      const msg = "chore: update deps\n\nGenerated with [Claude Code]";
      const result = detectAiTool(msg);
      expect(result!.tool).toBe("claude-code");
    });

    it("detects Generated-By: PostHog Code", () => {
      const msg = "fix: login\n\nGenerated-By: PostHog Code\nTask-Id: abc-123";
      const result = detectAiTool(msg);
      expect(result!.tool).toBe("claude-code");
    });
  });

  describe("GitHub Copilot", () => {
    it("detects Copilot co-author", () => {
      const msg = "feat: add auth\n\nCo-Authored-By: GitHub Copilot <copilot@github.com>";
      const result = detectAiTool(msg);
      expect(result!.tool).toBe("github-copilot");
    });

    it("detects github-copilot in co-author", () => {
      const msg = "fix: bug\n\nCo-Authored-By: github-copilot[bot]";
      const result = detectAiTool(msg);
      expect(result!.tool).toBe("github-copilot");
    });
  });

  describe("Cursor", () => {
    it("detects Generated-By: Cursor", () => {
      const msg = "refactor: cleanup\n\nGenerated-By: Cursor";
      const result = detectAiTool(msg);
      expect(result!.tool).toBe("cursor");
    });

    it("detects [Cursor] tag", () => {
      const msg = "feat: new feature [Cursor]";
      const result = detectAiTool(msg);
      expect(result!.tool).toBe("cursor");
    });
  });

  describe("Windsurf", () => {
    it("detects Windsurf co-author", () => {
      const msg = "feat: ui\n\nCo-Authored-By: Windsurf";
      const result = detectAiTool(msg);
      expect(result!.tool).toBe("windsurf");
    });

    it("detects Codeium co-author", () => {
      const msg = "fix: typo\n\nCo-Authored-By: Codeium AI";
      const result = detectAiTool(msg);
      expect(result!.tool).toBe("windsurf");
    });
  });

  describe("Devin", () => {
    it("detects Devin co-author", () => {
      const msg = "feat: api\n\nCo-Authored-By: Devin AI";
      const result = detectAiTool(msg);
      expect(result!.tool).toBe("devin");
    });
  });

  describe("Aider", () => {
    it("detects aider: prefix", () => {
      const msg = "aider: updated login flow";
      const result = detectAiTool(msg);
      expect(result!.tool).toBe("aider");
    });

    it("detects aider co-author", () => {
      const msg = "fix: route\n\nCo-Authored-By: aider";
      const result = detectAiTool(msg);
      expect(result!.tool).toBe("aider");
    });
  });

  describe("Cody", () => {
    it("detects Cody co-author", () => {
      const msg = "refactor: types\n\nCo-Authored-By: Cody (Sourcegraph)";
      const result = detectAiTool(msg);
      expect(result!.tool).toBe("cody");
    });
  });

  describe("Gemini", () => {
    it("detects Gemini co-author", () => {
      const msg = "fix: layout\n\nCo-Authored-By: Gemini";
      const result = detectAiTool(msg);
      expect(result!.tool).toBe("gemini");
    });
  });

  describe("Amazon Q", () => {
    it("detects Amazon Q co-author", () => {
      const msg = "feat: lambda\n\nCo-Authored-By: Amazon Q Developer";
      const result = detectAiTool(msg);
      expect(result!.tool).toBe("amazon-q");
    });
  });

  describe("Unknown AI", () => {
    it("detects generic Generated-By trailer", () => {
      const msg = "chore: stuff\n\nGenerated-By: SomeNewAI v2";
      const result = detectAiTool(msg);
      expect(result!.tool).toBe("unknown-ai");
    });
  });

  describe("human commits", () => {
    it("returns null for plain commit message", () => {
      expect(detectAiTool("fix: resolved login bug")).toBeNull();
    });

    it("returns null for commit with human co-author", () => {
      const msg = "feat: pair programming\n\nCo-Authored-By: John Doe <john@example.com>";
      expect(detectAiTool(msg)).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(detectAiTool("")).toBeNull();
    });
  });

  describe("custom patterns", () => {
    it("detects custom AI tool patterns", () => {
      const custom: AiPattern[] = [
        {
          tool: "internal-ai",
          displayName: "Internal AI",
          patterns: [/INTERNAL-AI-GENERATED/],
        },
      ];
      const result = detectAiTool("feat: thing\n\nINTERNAL-AI-GENERATED", custom);
      expect(result!.tool).toBe("internal-ai");
    });

    it("custom patterns take precedence over built-in", () => {
      const custom: AiPattern[] = [
        {
          tool: "custom-claude",
          displayName: "Custom Claude",
          patterns: [/Co-Authored-By:.*Claude/i],
        },
      ];
      const msg = "fix: x\n\nCo-Authored-By: Claude";
      const result = detectAiTool(msg, custom);
      expect(result!.tool).toBe("custom-claude");
    });
  });

  describe("case insensitivity", () => {
    it("matches regardless of case", () => {
      const msg = "fix: x\n\nco-authored-by: claude sonnet";
      const result = detectAiTool(msg);
      expect(result!.tool).toBe("claude-code");
    });
  });

  it("BUILTIN_PATTERNS is non-empty", () => {
    expect(BUILTIN_PATTERNS.length).toBeGreaterThan(5);
  });
});
