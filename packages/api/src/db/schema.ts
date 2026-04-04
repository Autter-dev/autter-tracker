import {
  pgTable,
  text,
  timestamp,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export * from "./auth-schema";

// ── App tables ──

export const commits = pgTable(
  "commits",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    repoUrl: text("repo_url"),
    hash: text("hash").notNull(),
    fullHash: text("full_hash").notNull(),
    message: text("message").notNull(),
    author: text("author").notNull(),
    date: timestamp("date", { withTimezone: true }).notNull(),
    aiTool: text("ai_tool").notNull(),
    displayName: text("display_name").notNull(),
    matchedPattern: text("matched_pattern").notNull(),
    syncedAt: timestamp("synced_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("commits_user_hash_idx").on(table.userId, table.fullHash),
  ],
);

export const teams = pgTable("teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const teamMembers = pgTable(
  "team_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    role: text("role").notNull().default("member"), // "owner" | "admin" | "member"
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("team_members_team_user_idx").on(table.teamId, table.userId),
  ],
);
