import type { AiPattern, DetectionResult } from "./types";

export const BUILTIN_PATTERNS: AiPattern[] = [
  {
    tool: "claude-code",
    displayName: "Claude Code",
    patterns: [
      /Co-Authored-By:.*Claude/i,
      /Co-Authored-By:.*noreply@anthropic\.com/i,
      /Generated with \[Claude Code\]/i,
      /Generated-By:\s*PostHog Code/i,
      /Generated-By:\s*Claude/i,
    ],
  },
  {
    tool: "github-copilot",
    displayName: "GitHub Copilot",
    patterns: [
      /Co-Authored-By:.*Copilot/i,
      /Co-Authored-By:.*github-copilot/i,
      /Co-Authored-By:.*noreply@github\.com.*copilot/i,
    ],
  },
  {
    tool: "cursor",
    displayName: "Cursor",
    patterns: [/Generated-By:\s*Cursor/i, /\[Cursor\]/i, /cursor-ai/i, /Co-Authored-By:.*Cursor/i],
  },
  {
    tool: "windsurf",
    displayName: "Windsurf",
    patterns: [
      /Co-Authored-By:.*Windsurf/i,
      /Generated-By:\s*Windsurf/i,
      /Co-Authored-By:.*Codeium/i,
      /\[Windsurf\]/i,
    ],
  },
  {
    tool: "devin",
    displayName: "Devin",
    patterns: [/Co-Authored-By:.*Devin/i, /Generated-By:\s*Devin/i, /devin-ai/i],
  },
  {
    tool: "aider",
    displayName: "Aider",
    patterns: [/aider:/i, /Co-Authored-By:.*aider/i, /\[aider\]/i],
  },
  {
    tool: "cody",
    displayName: "Cody",
    patterns: [/Co-Authored-By:.*Cody/i, /Sourcegraph.*Cody/i, /Generated-By:\s*Cody/i],
  },
  {
    tool: "gemini",
    displayName: "Gemini",
    patterns: [/Co-Authored-By:.*Gemini/i, /Generated-By:\s*Gemini/i, /Jules.*google/i],
  },
  {
    tool: "amazon-q",
    displayName: "Amazon Q",
    patterns: [/Co-Authored-By:.*Amazon Q/i, /Generated-By:\s*Amazon Q/i],
  },
  {
    tool: "unknown-ai",
    displayName: "Unknown AI",
    patterns: [/Generated-By:\s*.+/i],
  },
];

export function detectAiTool(
  commitMessage: string,
  extraPatterns: AiPattern[] = [],
): DetectionResult | null {
  const allPatterns = [...extraPatterns, ...BUILTIN_PATTERNS];

  for (const entry of allPatterns) {
    for (const pattern of entry.patterns) {
      if (pattern.test(commitMessage)) {
        return {
          tool: entry.tool,
          displayName: entry.displayName,
          matchedPattern: pattern.source,
        };
      }
    }
  }

  return null;
}
