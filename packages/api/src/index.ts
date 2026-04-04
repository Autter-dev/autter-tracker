import { Hono } from "hono";
import { cors } from "hono/cors";

import { createAuth } from "./auth";
import { createDb } from "./db";
import { requireAuth } from "./middleware/auth";
import { devicePage } from "./pages/device";
import { syncRoutes } from "./routes/sync";
import { teamRoutes } from "./routes/teams";
import type { Env } from "./types";

const app = new Hono<{ Bindings: Env }>();

// Inject db and auth into context for all routes
app.use("*", async (c, next) => {
  const db = createDb(c.env.DATABASE_URL);
  const auth = createAuth(db, c.env);
  c.set("db" as never, db);
  c.set("auth" as never, auth);
  return next();
});

// CORS — allow CLI and web clients
app.use(
  "/api/*",
  cors({
    origin: (origin) => {
      // Allow requests with no origin (CLI tools) or from the app domain
      if (!origin) return "*";
      const allowed = [
        "https://app.autter.dev",
        "http://localhost:3000",
        "http://localhost:5173",
      ];
      return allowed.includes(origin) ? origin : "";
    },
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// Device authorization page (browser-facing)
app.get("/device", devicePage);

// Better Auth handles all /api/auth/* routes (login, register, device flow, sessions)
app.on(["POST", "GET"], "/api/auth/**", async (c) => {
  const auth = c.get("auth" as never) as ReturnType<typeof createAuth>;
  return auth.handler(c.req.raw);
});

// Protected API routes — require authentication
app.use("/api/sync/*", requireAuth);
app.use("/api/teams/*", requireAuth);

app.route("/api/sync", syncRoutes);
app.route("/api/teams", teamRoutes);

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

export default app;
