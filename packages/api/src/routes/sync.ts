import { eq, and, sql } from "drizzle-orm";
import { Hono } from "hono";

import { commits } from "../db/schema";
import type { Env, SyncCommit } from "../types";

const sync = new Hono<{ Bindings: Env }>();

// Push local commits to the server
sync.post("/", async (c) => {
  const user = c.get("user" as never) as { id: string };
  const db = c.get("db" as never) as ReturnType<
    typeof import("../db").createDb
  >;

  const body = await c.req.json<{ commits: SyncCommit[] }>();

  if (!Array.isArray(body.commits) || body.commits.length === 0) {
    return c.json({ error: "commits array is required" }, 400);
  }

  if (body.commits.length > 500) {
    return c.json({ error: "max 500 commits per request" }, 400);
  }

  let synced = 0;

  for (const commit of body.commits) {
    try {
      await db
        .insert(commits)
        .values({
          userId: user.id,
          hash: commit.hash,
          fullHash: commit.fullHash,
          message: commit.message,
          author: commit.author,
          date: new Date(commit.date),
          aiTool: commit.aiTool,
          displayName: commit.displayName,
          matchedPattern: commit.matchedPattern,
          repoUrl: commit.repoUrl ?? null,
        })
        .onConflictDoNothing();
      synced++;
    } catch {
      // Skip duplicates silently
    }
  }

  return c.json({ synced, total: body.commits.length });
});

// Get sync status for the authenticated user
sync.get("/status", async (c) => {
  const user = c.get("user" as never) as { id: string };
  const db = c.get("db" as never) as ReturnType<
    typeof import("../db").createDb
  >;

  const result = await db
    .select({
      count: sql<number>`count(*)`,
      lastSync: sql<string>`max(${commits.syncedAt})`,
    })
    .from(commits)
    .where(eq(commits.userId, user.id));

  const row = result[0];

  return c.json({
    totalCommits: Number(row?.count ?? 0),
    lastSyncedAt: row?.lastSync ?? null,
  });
});

// Get commit stats breakdown for the authenticated user
sync.get("/stats", async (c) => {
  const user = c.get("user" as never) as { id: string };
  const db = c.get("db" as never) as ReturnType<
    typeof import("../db").createDb
  >;

  const result = await db
    .select({
      aiTool: commits.aiTool,
      displayName: commits.displayName,
      count: sql<number>`count(*)`,
    })
    .from(commits)
    .where(eq(commits.userId, user.id))
    .groupBy(commits.aiTool, commits.displayName)
    .orderBy(sql`count(*) desc`);

  return c.json({ breakdown: result });
});

export { sync as syncRoutes };
