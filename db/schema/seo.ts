import { integer, pgEnum, pgTable, index, serial, text, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { users } from "./rbac";

// ─── Enums ──────────────────────────────────────────────────────────────────

export const robotsTagEnum = pgEnum("robots_tag", [
  "index,follow",
  "noindex,follow",
  "index,nofollow",
  "noindex,nofollow",
]);

// ─── One row per routable page / path ───────────────────────────────────────

export const seoEntries = pgTable(
  "seo_entries",
  {
    id: serial().primaryKey(),
    routePath: varchar("route_path", { length: 512 }).notNull().unique(),

    // Core meta
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDescription: text("meta_description"),
    metaKeywords: text("meta_keywords"),
    canonicalUrl: text("canonical_url"),
    robotsTag: robotsTagEnum("robots_tag").default("index,follow"),

    // Open Graph
    ogTitle: varchar("og_title", { length: 255 }),
    ogDescription: text("og_description"),
    ogImage: text("og_image"),
    ogType: varchar("og_type", { length: 64 }).default("website"),

    // Structured Data (JSON-LD)
    structuredData: jsonb("structured_data"),

    createdBy: integer("created_by")
      .references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_seo_entries_route").on(t.routePath)],
);
