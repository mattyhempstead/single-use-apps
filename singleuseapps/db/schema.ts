import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  userId: uuid("user_id").defaultRandom().primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  email: text("email"),
});

export type UsersSelect = typeof usersTable.$inferSelect;
export type UsersInsert = typeof usersTable.$inferInsert;

export const projectsTable = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.userId, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  sourceCode: text("source_code").notNull(),
});

export type ProjectsSelect = typeof projectsTable.$inferSelect;
export type ProjectsInsert = typeof projectsTable.$inferInsert;
