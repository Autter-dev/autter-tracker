import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { deviceAuthorization } from "better-auth/plugins";

import type { Database } from "./db";

export interface AuthEnv {
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  DATABASE_URL: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  VALID_CLIENT_IDS?: string;
}

export function createAuth(db: Database, env: AuthEnv) {
  const validClients = new Set(
    (env.VALID_CLIENT_IDS ?? "autter-cli").split(",").map((s) => s.trim()),
  );

  return betterAuth({
    database: drizzleAdapter(db, { provider: "pg" }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    basePath: "/api/auth",

    emailAndPassword: {
      enabled: true,
    },

    socialProviders: {
      ...(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
        ? {
            github: {
              clientId: env.GITHUB_CLIENT_ID,
              clientSecret: env.GITHUB_CLIENT_SECRET,
            },
          }
        : {}),
    },

    plugins: [
      deviceAuthorization({
        expiresIn: "30m",
        interval: "5s",
        userCodeLength: 8,
        deviceCodeLength: 40,
        verificationUri: "/device",
        validateClient: (clientId: string) => validClients.has(clientId),
      }),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;
