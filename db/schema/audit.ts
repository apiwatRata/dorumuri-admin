import { integer, bigserial, pgTable, text, timestamp, varchar, jsonb, inet, index } from "drizzle-orm/pg-core";
import { users } from "./rbac";

// ─── Audit Log ──────────────────────────────────────────────────────────────

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: bigserial({ mode: "number" }).primaryKey(),
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "set null" }),
    action: varchar({ length: 64 }).notNull(),
    targetEntity: varchar({ length: 128 }).notNull(),
    targetId: integer("target_id"),
    oldValues: jsonb("old_values"),
    newValues: jsonb("new_values"),
    ipAddress: inet("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_audit_logs_user").on(t.userId),
    index("idx_audit_logs_target").on(t.targetEntity, t.targetId),
    index("idx_audit_logs_created_at").on(t.createdAt),
  ],
);
