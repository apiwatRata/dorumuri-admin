import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

// ─── Roles (e.g., Super Admin, Editor, SEO Manager) ────────────────────────

export const roles = pgTable("roles", {
  id: serial().primaryKey(),
  name: varchar({ length: 64 }).notNull().unique(),
  slug: varchar({ length: 64 }).notNull().unique(),
  description: text(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

// ─── Granular Permissions ───────────────────────────────────────────────────

export const permissions = pgTable("permissions", {
  id: serial().primaryKey(),
  name: varchar({ length: 128 }).notNull().unique(),
  slug: varchar({ length: 128 }).notNull().unique(),
  module: varchar({ length: 64 }).notNull(),
  description: text(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

// ─── Many-to-Many: Role ↔ Permission ────────────────────────────────────────

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: integer("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: integer("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.roleId, t.permissionId] }),
  }),
);

// ─── Users ──────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: serial().primaryKey(),
  email: varchar({ length: 255 }).notNull().unique(),
  passwordHash: varchar({ length: 255 }).notNull(),
  firstName: varchar({ length: 128 }),
  lastName: varchar({ length: 128 }),
  avatarUrl: text(),
  isActive: boolean().notNull().default(true),
  lastLoginAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

// ─── Many-to-Many: User ↔ Role ──────────────────────────────────────────────

export const userRoles = pgTable(
  "user_roles",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: integer("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.roleId] }),
  }),
);
