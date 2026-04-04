import { eq, and, sql } from "drizzle-orm";
import { Hono } from "hono";

import { commits, teams, teamMembers } from "../db/schema";
import type { Env } from "../types";

const app = new Hono<{ Bindings: Env }>();

// Create a new team
app.post("/", async (c) => {
  const user = c.get("user" as never) as { id: string };
  const db = c.get("db" as never) as ReturnType<
    typeof import("../db").createDb
  >;

  const body = await c.req.json<{ name: string; slug: string }>();

  if (!body.name || !body.slug) {
    return c.json({ error: "name and slug are required" }, 400);
  }

  if (!/^[a-z0-9-]+$/.test(body.slug)) {
    return c.json(
      { error: "slug must contain only lowercase letters, numbers, and hyphens" },
      400,
    );
  }

  const [team] = await db
    .insert(teams)
    .values({
      name: body.name,
      slug: body.slug,
      createdBy: user.id,
    })
    .returning();

  if (!team) {
    return c.json({ error: "failed to create team" }, 500);
  }

  // Add creator as owner
  await db.insert(teamMembers).values({
    teamId: team.id,
    userId: user.id,
    role: "owner",
  });

  return c.json({ team }, 201);
});

// List teams for the authenticated user
app.get("/", async (c) => {
  const user = c.get("user" as never) as { id: string };
  const db = c.get("db" as never) as ReturnType<
    typeof import("../db").createDb
  >;

  const memberships = await db
    .select({
      teamId: teamMembers.teamId,
      role: teamMembers.role,
      teamName: teams.name,
      teamSlug: teams.slug,
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(teamMembers.userId, user.id));

  return c.json({ teams: memberships });
});

// Add a member to a team (requires owner/admin role)
app.post("/:teamId/members", async (c) => {
  const user = c.get("user" as never) as { id: string };
  const db = c.get("db" as never) as ReturnType<
    typeof import("../db").createDb
  >;
  const teamId = c.req.param("teamId");

  // Verify caller is owner or admin
  const membership = await db
    .select()
    .from(teamMembers)
    .where(
      and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, user.id)),
    );

  const callerRole = membership[0]?.role;
  if (callerRole !== "owner" && callerRole !== "admin") {
    return c.json({ error: "forbidden: must be owner or admin" }, 403);
  }

  const body = await c.req.json<{ userId: string; role?: string }>();
  if (!body.userId) {
    return c.json({ error: "userId is required" }, 400);
  }

  const role = body.role ?? "member";
  if (!["member", "admin"].includes(role)) {
    return c.json({ error: "role must be member or admin" }, 400);
  }

  await db
    .insert(teamMembers)
    .values({
      teamId,
      userId: body.userId,
      role,
    })
    .onConflictDoNothing();

  return c.json({ added: true });
});

// Get team stats (aggregate AI commit stats for all team members)
app.get("/:teamId/stats", async (c) => {
  const user = c.get("user" as never) as { id: string };
  const db = c.get("db" as never) as ReturnType<
    typeof import("../db").createDb
  >;
  const teamId = c.req.param("teamId");

  // Verify caller is a team member
  const membership = await db
    .select()
    .from(teamMembers)
    .where(
      and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, user.id)),
    );

  if (membership.length === 0) {
    return c.json({ error: "forbidden: not a team member" }, 403);
  }

  // Get all team member user IDs
  const members = await db
    .select({ userId: teamMembers.userId })
    .from(teamMembers)
    .where(eq(teamMembers.teamId, teamId));

  const memberIds = members.map((m) => m.userId);

  if (memberIds.length === 0) {
    return c.json({ breakdown: [], totalCommits: 0 });
  }

  const result = await db
    .select({
      aiTool: commits.aiTool,
      displayName: commits.displayName,
      count: sql<number>`count(*)`,
    })
    .from(commits)
    .where(sql`${commits.userId} = ANY(${memberIds})`)
    .groupBy(commits.aiTool, commits.displayName)
    .orderBy(sql`count(*) desc`);

  const total = result.reduce((sum, r) => sum + Number(r.count), 0);

  return c.json({ breakdown: result, totalCommits: total });
});

export { app as teamRoutes };
