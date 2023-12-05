import { relations } from "drizzle-orm";
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().unique(),
  email: text("email").notNull(),
  username: text("username"),
});

export const usersRelations = relations(users, ({ many }) => ({
  storeUsers: many(storeUsers),
}));

export const stores = sqliteTable("stores", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  storeHash: text("store_hash").notNull().unique(),
  accessToken: text("access_token").notNull(),
  scope: text("scope").notNull(),
});

export const storesRelations = relations(stores, ({ many }) => ({
  storeUsers: many(storeUsers),
}));

export const storeUsers = sqliteTable(
  "store_users",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    storeId: integer("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    isAdmin: integer("is_admin", { mode: "boolean" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.storeId] }),
  }),
);

export const storeUsersRelations = relations(storeUsers, ({ one }) => ({
  store: one(stores, {
    fields: [storeUsers.storeId],
    references: [stores.id],
  }),
  user: one(users, {
    fields: [storeUsers.userId],
    references: [users.id],
  }),
}));
