import fs from "node:fs";
import path from "node:path";

import { getConfigDir, getConfig } from "./config";

// ── Token storage ──────────────────────────────────────────────────────

interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  userId?: string;
  email?: string;
}

function getTokenPath(): string {
  return path.join(getConfigDir(), "auth.json");
}

function ensureConfigDir(): void {
  const dir = getConfigDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  }
}

export function readTokens(): TokenData | null {
  try {
    const raw = fs.readFileSync(getTokenPath(), "utf-8");
    return JSON.parse(raw) as TokenData;
  } catch {
    return null;
  }
}

export function writeTokens(tokens: TokenData): void {
  ensureConfigDir();
  fs.writeFileSync(getTokenPath(), JSON.stringify(tokens, null, 2) + "\n", {
    mode: 0o600,
  });
}

export function clearTokens(): void {
  try {
    fs.unlinkSync(getTokenPath());
  } catch {
    // Already gone
  }
}

export function isLoggedIn(): boolean {
  const tokens = readTokens();
  if (!tokens) return false;
  if (tokens.expiresAt && new Date(tokens.expiresAt) < new Date()) {
    return false;
  }
  return true;
}

// ── Device Authorization Flow ──────────────────────────────────────────

interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete?: string;
  expires_in: number;
  interval: number;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in?: number;
}

interface TokenErrorResponse {
  error: string;
  error_description?: string;
}

export async function requestDeviceCode(): Promise<DeviceCodeResponse> {
  const { serverUrl, clientId } = getConfig();
  console.log("serverUrl", serverUrl);
  console.log("clientId", clientId);
  const url = `${serverUrl}/api/auth/device/code`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
    }),
  });

  console.log("res", res);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to request device code: ${res.status} ${text}`);
  }

  return res.json() as Promise<DeviceCodeResponse>;
}

export async function pollForToken(
  deviceCode: string,
  interval: number,
  expiresIn: number,
): Promise<TokenData> {
  const { serverUrl, clientId } = getConfig();
  const url = `${serverUrl}/api/auth/device/token`;
  const deadline = Date.now() + expiresIn * 1000;
  let pollInterval = interval;

  while (Date.now() < deadline) {
    await sleep(pollInterval * 1000);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        device_code: deviceCode,
        client_id: clientId,
      }),
    });

    if (res.ok) {
      const data = (await res.json()) as TokenResponse;
      const tokens: TokenData = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_in
          ? new Date(Date.now() + data.expires_in * 1000).toISOString()
          : undefined,
      };
      return tokens;
    }

    const error = (await res.json()) as TokenErrorResponse;

    if (error.error === "authorization_pending") {
      continue;
    }

    if (error.error === "slow_down") {
      pollInterval += 5;
      continue;
    }

    if (error.error === "expired_token") {
      throw new Error("Device code expired. Please run login again.");
    }

    if (error.error === "access_denied") {
      throw new Error("Authorization was denied by the user.");
    }

    throw new Error(
      `Token request failed: ${error.error} — ${error.error_description ?? ""}`,
    );
  }

  throw new Error("Device code expired. Please run login again.");
}

// ── API Client ─────────────────────────────────────────────────────────

export async function authedFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const tokens = readTokens();
  if (!tokens) {
    throw new Error("Not logged in. Run: autter-tracker login");
  }

  const { serverUrl } = getConfig();
  const url = `${serverUrl}${path}`;

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${tokens.accessToken}`);
  headers.set("Content-Type", "application/json");

  return fetch(url, { ...options, headers });
}

// ── Helpers ────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
