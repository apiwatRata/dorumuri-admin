import { sql, desc } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./rbac";

// ─── Enums ──────────────────────────────────────────────────────────────────

export const mediaTypeEnum = pgEnum("media_type", ["image", "video"]);

export const targetOpenTypeEnum = pgEnum("target_open_type", ["_blank", "_self"]);

// ─── Predefined Ad Placements / Positions ───────────────────────────────────

export const adPlacements = pgTable("ad_placements", {
  id: serial().primaryKey(),
  name: varchar({ length: 128 }).notNull().unique(),
  slug: varchar({ length: 128 }).notNull().unique(),
  description: text(),
  isActive: boolean().notNull().default(true),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

// ─── Individual Banner / Ad Records ─────────────────────────────────────────

export const banners = pgTable(
  "banners",
  {
    id: serial().primaryKey(),
    placementId: integer("placement_id")
      .notNull()
      .references(() => adPlacements.id, { onDelete: "restrict" }),
    title: varchar({ length: 255 }).notNull(),
    altText: varchar("alt_text", { length: 255 }),
    targetLink: text("target_link"),

    // Media: support separate assets for desktop & mobile
    desktopMediaUrl: text("desktop_media_url"),
    desktopMediaType: mediaTypeEnum("desktop_media_type"),
    mobileMediaUrl: text("mobile_media_url"),
    mobileMediaType: mediaTypeEnum("mobile_media_type"),

    // Display behaviour
    targetOpenType: targetOpenTypeEnum("target_open_type")
      .notNull()
      .default("_blank"),
    isActive: boolean("is_active").notNull().default(true),
    priority: integer().notNull().default(0),
    startDate: timestamp("start_date", { withTimezone: true }),
    endDate: timestamp("end_date", { withTimezone: true }),

    // Basic analytics
    impressionCount: bigint("impression_count", { mode: "number" })
      .notNull()
      .default(0),
    clickCount: bigint("click_count", { mode: "number" })
      .notNull()
      .default(0),

    createdBy: integer("created_by")
      .references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_banners_placement").on(t.placementId),
    index("idx_banners_active").on(t.isActive, desc(t.priority)),
    index("idx_banners_schedule").on(t.startDate, t.endDate),
    check(
      "chk_banner_dates",
      sql`${t.startDate} IS NULL OR ${t.endDate} IS NULL OR ${t.startDate} < ${t.endDate}`,
    ),
  ],
);
