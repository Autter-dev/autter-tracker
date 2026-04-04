import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CONFIG_DIR = path.join(os.homedir(), ".autter");
const CONFIG_PATH = path.join(CONFIG_DIR, "config.json");

interface CliConfig {
  serverUrl: string;
  clientId: string;
}

const DEFAULT_CONFIG: CliConfig = {
  serverUrl: "http://localhost:8787",
  clientId: "autter-cli",
};

function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  }
}

export function getConfig(): CliConfig {
  // Env vars take precedence
  const serverUrl = process.env["AUTTER_API_URL"];
  const clientId = process.env["AUTTER_CLIENT_ID"];

  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
    const stored = JSON.parse(raw) as Partial<CliConfig>;
    return {
      serverUrl: serverUrl ?? stored.serverUrl ?? DEFAULT_CONFIG.serverUrl,
      clientId: clientId ?? stored.clientId ?? DEFAULT_CONFIG.clientId,
    };
  } catch {
    return {
      serverUrl: serverUrl ?? DEFAULT_CONFIG.serverUrl,
      clientId: clientId ?? DEFAULT_CONFIG.clientId,
    };
  }
}

export function setConfig(updates: Partial<CliConfig>): void {
  ensureConfigDir();
  const current = getConfig();
  const merged = { ...current, ...updates };
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2) + "\n", {
    mode: 0o600,
  });
}

export function getConfigDir(): string {
  return CONFIG_DIR;
}
