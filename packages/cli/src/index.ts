export { detectAiTool, BUILTIN_PATTERNS } from "./detector";
export { readStorage, addCommit } from "./storage";
export { runHook } from "./hook";
export { isLoggedIn, readTokens, authedFetch } from "./auth";
export { getConfig, setConfig } from "./config";
export type { AiCommit, AiPattern, DetectionResult, StorageData } from "./types";
