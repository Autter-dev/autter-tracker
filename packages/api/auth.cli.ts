/**
 * Minimal Better Auth config for `npx auth@latest generate` only.
 * Not used at runtime — see `src/auth.ts`.
 */
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { deviceAuthorization } from "better-auth/plugins";

const db = {} as Parameters<typeof drizzleAdapter>[0];

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
  plugins: [
    deviceAuthorization({
      validateClient: () => true,
    }),
  ],
});
