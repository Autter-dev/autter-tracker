import type { Context, Next } from "hono";

import type { Env } from "../types";

export async function requireAuth(c: Context<{ Bindings: Env }>, next: Next) {
  const auth = c.get("auth" as never) as ReturnType<
    typeof import("../auth").createAuth
  >;

  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: "unauthorized" }, 401);
  }

  c.set("session" as never, session.session);
  c.set("user" as never, session.user);

  return next();
}
