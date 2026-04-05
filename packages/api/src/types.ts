export interface Env {
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  DATABASE_URL: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  RESEND_REPLY_TO_EMAIL?: string;
  VALID_CLIENT_IDS?: string;
}

export interface SyncCommit {
  hash: string;
  fullHash: string;
  message: string;
  author: string;
  date: string;
  aiTool: string;
  displayName: string;
  matchedPattern: string;
  repoUrl?: string;
}
