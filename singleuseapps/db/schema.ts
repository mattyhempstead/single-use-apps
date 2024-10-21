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
