import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { deviceAuthorization, emailOTP } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";

import type { Database } from "./db";
import * as dbSchema from "./db/schema";
import { otpSignInEmail } from "./emails/otp-signin";

export interface AuthEnv {
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

export function createAuth(db: Database, env: AuthEnv) {
  const validClients = new Set(
    (env.VALID_CLIENT_IDS ?? "autter-cli").split(",").map((s) => s.trim()),
  );

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: dbSchema.user,
        session: dbSchema.session,
        account: dbSchema.account,
        verification: dbSchema.verification,
        deviceCode: dbSchema.deviceCode,
      },
    }),
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
      ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
        ? {
            google: {
              clientId: env.GOOGLE_CLIENT_ID,
              clientSecret: env.GOOGLE_CLIENT_SECRET,
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
      emailOTP({
        sendVerificationOTP: async ({ email, otp, type }) => {
          const expiresInMinutes = 10;

          if (!env.RESEND_API_KEY) {
            console.log(`[OTP] ${type} code for ${email}: ${otp}`);
            return;
          }

          const from =
            env.RESEND_FROM_EMAIL ?? "Autter Updates <update@hello.autter.dev>";
          const replyTo =
            env.RESEND_REPLY_TO_EMAIL ?? "Autter Team <hi@autter.dev>";

          const html = otpSignInEmail({
            email,
            otp,
            expiresInMinutes,
            appUrl: env.BETTER_AUTH_URL,
          });

          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from,
              reply_to: replyTo,
              to: email,
              subject: `${otp} is your autter.dev sign-in code`,
              html,
              text: `Your verification code is: ${otp}\n\nThis code expires in ${expiresInMinutes} minutes.`,
            }),
          });
        },
        otpLength: 6,
        expiresIn: 600,
      }),
      passkey({
        rpName: "autter",
        rpID: env.BETTER_AUTH_URL
          ? new URL(env.BETTER_AUTH_URL).hostname
          : "localhost",
        origin: env.BETTER_AUTH_URL || "http://localhost:8787",
      }),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;
