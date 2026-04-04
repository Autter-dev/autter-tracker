import { defineConfig } from "drizzle-kit";

// drizzle-kit picks drivers in order: `pg` before `@neondatabase/serverless`.
// DevDependency `pg` makes `migrate` / `studio` use TCP (local Postgres or Neon URL).
// Runtime in Workers stays on neon-http via `src/db/index.ts`.
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DRIZZLE_DATABASE_URL ?? process.env.DATABASE_URL!,
  },
});
