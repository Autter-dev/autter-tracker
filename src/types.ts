export interface AiCommit {
  hash: string;
  fullHash: string;
  message: string;
  author: string;
  date: string;
  aiTool: string;
  displayName: string;
  matchedPattern: string;
}

export interface StorageData {
  version: 1;
  commits: AiCommit[];
}

export interface AiPattern {
  tool: string;
  displayName: string;
  patterns: RegExp[];
}

export interface DetectionResult {
  tool: string;
  displayName: string;
  matchedPattern: string;
}
