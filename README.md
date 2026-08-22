# 🖥️ Admin Dashboard — Dorimuri

> **Admin Dashboard for managing users, roles & permissions, banners & ads, SEO metadata, and audit logs.**

---

## 📋 Table of Contents

1. [Overview](#1-overview)
2. [Core Features & Modules](#2-core-features--modules)
3. [Database Architecture & Functions Reference](#3-database-architecture--functions-reference)
4. [Project Structure](#4-project-structure)
5. [Getting Started & Setup Guide](#5-getting-started--setup-guide)
6. [API & Database Integration Notes](#6-api--database-integration-notes)

---

## 1. Overview

### Purpose

`admin-dorimuri` is the Admin Dashboard module for administrators to manage various aspects of the Dorimuri E-Commerce platform. It serves as the **control center** for:

- **User & Role Management** — Manage admin users and access control (RBAC)
- **Banner & Ads Management** — Manage banners, ads, and ad placements
- **SEO Management** — Manage per-page SEO metadata
- **Audit Logging** — Track and record all administrator activities

### Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD                        │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │
│  │   Auth   │  │  Users   │  │ Banners  │  │   SEO   │  │
│  │  & RBAC  │  │   Mgmt   │  │  & Ads   │  │  Mgmt   │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘  │
│       │              │              │              │       │
│  ┌────▼──────────────▼──────────────▼──────────────▼────┐ │
│  │              Drizzle ORM + PostgreSQL                │ │
│  └───────────────────────┬──────────────────────────────┘ │
│                          │                                │
│  ┌───────────────────────▼──────────────────────────────┐ │
│  │              Audit Log (tracks all changes)          │ │
│  └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌──────────────────────┐
              │  E-Commerce Backend  │
              │  (External System)   │
              └──────────────────────┘
```

**Tech Stack:**

| Technology | Details |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **ORM** | Drizzle ORM |
| **Database** | PostgreSQL 15+ |
| **UI Library** | shadcn/ui + Tailwind CSS v4 |
| **Validation** | Zod |
| **Testing** | Vitest (Unit) + Playwright (E2E) |

---

## 2. Core Features & Modules

### 2.1 Authentication & Authorization (RBAC)

A granular Role-Based Access Control system with fine-grained permissions per module:

| Role | Description | Permissions |
|---|---|---|
| **Super Admin** | Full access to all features | All 8 permissions |
| **Content Editor** | Manage banners and SEO content | `CAN_MANAGE_BANNERS`, `CAN_VIEW_BANNER_STATS`, `CAN_MANAGE_SEO`, `CAN_MANAGE_STRUCTURED_DATA` |
| **SEO Manager** | Manage SEO metadata only | `CAN_MANAGE_SEO`, `CAN_MANAGE_STRUCTURED_DATA` |
| **Banner Manager** | Manage banners and placements | `CAN_MANAGE_BANNERS`, `CAN_MANAGE_PLACEMENTS`, `CAN_VIEW_BANNER_STATS` |

**All Permissions in the System:**

| Permission Slug | Module | Description |
|---|---|---|
| `CAN_MANAGE_USERS` | user | Manage admin user accounts |
| `CAN_MANAGE_ROLES` | user | Manage roles and permissions |
| `CAN_VIEW_AUDIT_LOGS` | user | View audit log records |
| `CAN_MANAGE_BANNERS` | banner | Create, update, delete banners |
| `CAN_MANAGE_PLACEMENTS` | banner | Manage ad placement positions |
| `CAN_VIEW_BANNER_STATS` | banner | View banner impression and click statistics |
| `CAN_MANAGE_SEO` | seo | Manage SEO metadata per route |
| `CAN_MANAGE_STRUCTURED_DATA` | seo | Manage JSON-LD structured data |

### 2.2 User Management

- Full lifecycle management of admin users: create, edit, suspend/activate
- Many-to-Many role assignment (one user can have multiple roles)
- Tracks `last_login_at` and `is_active` status
- Password hashing (bcrypt/argon2) before storing in database

### 2.3 Banner & Ads Management

- Manage individual Banner/Ad records with **Responsive Media** support (Desktop & Mobile)
- 7 predefined Ad Placement positions: Top Header, Below Hero, Sidebar, In-Article, Sticky Footer, Pop-up/Modal, Before Footer
- **Schedule** support (start_date / end_date) and **Priority** ordering
- Built-in analytics: **Impression Count** and **Click Count** per banner

### 2.4 SEO Management

- Per-route SEO metadata management (one entry per routable path)
- Core Meta Tags: `meta_title`, `meta_description`, `meta_keywords`, `canonical_url`, `robots_tag`
- Open Graph Tags: `og_title`, `og_description`, `og_image`, `og_type`
- **JSON-LD Structured Data** support for rich search engine results

### 2.5 Audit Logs

- Records every action (CREATE, UPDATE, DELETE) performed by administrators
- Stores `old_values` and `new_values` as JSONB for change comparison
- Logs IP Address and User Agent for security auditing
- Optimized queries via indexes on `user_id`, `(target_entity, target_id)`, and `created_at`

---

## 3. Database Architecture & Functions Reference

### 3.1 Tables

| Table | Module | Description |
|---|---|---|
| `roles` | RBAC | User roles (e.g., Super Admin, Content Editor) |
| `permissions` | RBAC | Granular permissions, grouped by module |
| `role_permissions` | RBAC | Junction table: Role ↔ Permission (Many-to-Many) |
| `users` | User | Admin user accounts (email, password hash, profile, status) |
| `user_roles` | User | Junction table: User ↔ Role (Many-to-Many) |
| `audit_logs` | Audit | Activity log with old/new values for change tracking |
| `ad_placements` | Banner | Predefined banner placement positions (7 positions) |
| `banners` | Banner | Banner/ad records with media URLs and analytics counters |
| `seo_entries` | SEO | SEO metadata for each route path |

### 3.2 Indexes

| Index Name | Table | Columns | Purpose |
|---|---|---|---|
| `idx_audit_logs_user` | `audit_logs` | `user_id` | Query audit logs by user |
| `idx_audit_logs_target` | `audit_logs` | `(target_entity, target_id)` | Query audit logs by target entity |
| `idx_audit_logs_created_at` | `audit_logs` | `created_at` | Query audit logs by date range |
| `idx_banners_placement` | `banners` | `placement_id` | Filter banners by placement |
| `idx_banners_active` | `banners` | `(is_active, priority DESC)` | Fetch active banners sorted by priority |
| `idx_banners_schedule` | `banners` | `(start_date, end_date)` | Filter banners by schedule |
| `idx_seo_entries_route` | `seo_entries` | `route_path` | Lookup SEO entry by route path |

### 3.3 Constraints

| Constraint | Table | Description |
|---|---|---|
| `chk_banner_dates` | `banners` | Ensures `start_date < end_date` when both are provided |
| `CHECK (desktop_media_type IN ('image', 'video'))` | `banners` | Only allows image or video for desktop media |
| `CHECK (mobile_media_type IN ('image', 'video'))` | `banners` | Only allows image or video for mobile media |
| `CHECK (target_open_type IN ('_blank', '_self'))` | `banners` | Restricts link open behavior |
| `CHECK (robots_tag IN (...))` | `seo_entries` | Restricts robots tag to predefined values |

### 3.4 Seed Data

**Roles (4 entries):**
- Super Admin — Full access to everything
- Content Editor — Manages banners and SEO
- SEO Manager — Manages SEO metadata only
- Banner Manager — Manages banners and placements only

**Ad Placements (7 positions):**

| Name | Slug | Description |
|---|---|---|
| Top Header | `TOP_HEADER` | Sticky banner at the very top of every page |
| Below Hero | `BELOW_HERO` | Banner placed immediately after the hero section |
| Sidebar | `SIDEBAR` | Sidebar widget area on desktop layouts |
| In-Article | `IN_ARTICLE` | Banner inserted between article paragraphs |
| Sticky Footer | `FLOATING_FOOTER` | Floating bar pinned to the bottom of the viewport |
| Pop-up / Modal | `POPUP_MODAL` | Triggered after N seconds or on exit-intent |
| Before Footer | `BEFORE_FOOTER` | Full-width banner just above the site footer |

**SEO Entry (1 entry):**
- Homepage (`/`) with default meta tags

> **Note:** There are no Stored Procedures, Views, or Database Functions in the current schema — all business logic is processed at the Application Layer via Drizzle ORM.

---

## 4. Project Structure

```
admin-dorimuri/
├── .github/
│   └── workflows/
│       ├── jest.yml              # CI: Unit tests
│       └── playwright.yml        # CI: E2E tests
├── app/
│   ├── globals.css               # Global styles (Tailwind CSS v4)
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/
│   └── theme-provider.tsx        # Theme context provider
├── db/
│   ├── index.ts                  # Database connection (Drizzle)
│   └── schema/
│       ├── schema.ts             # Main schema barrel export
│       ├── rbac.ts               # roles, permissions, role_permissions
│       ├── audit.ts              # audit_logs
│       ├── banners.ts            # ad_placements, banners
│       └── seo.ts                # seo_entries
├── hooks/                        # Custom React hooks
├── lib/
│   ├── .gitkeep
│   └── utils.ts                  # Utility functions (cn, etc.)
├── tests/
│   ├── e2e/
│   │   └── example.spec.ts       # Playwright E2E test
│   └── unit/
│       └── example.spec.ts       # Vitest unit test
├── components.json               # shadcn/ui config
├── drizzle.config.ts             # Drizzle Kit config
├── eslint.config.mjs             # ESLint config
├── jest.config.ts                # Jest config (legacy)
├── next.config.ts                # Next.js config
├── package.json
├── playwright.config.ts          # Playwright config
├── postcss.config.mjs            # PostCSS config
├── tsconfig.json                 # TypeScript config
└── admin-dashboard-schema.sql    # Database schema (reference)
```

---

## 5. Getting Started & Setup Guide

### 5.1 Prerequisites

| Software | Version | Purpose |
|---|---|---|
| **Node.js** | ≥ 18 LTS | Runtime |
| **PostgreSQL** | ≥ 15 | Database |
| **npm** / **pnpm** | Latest | Package manager |
| **Docker** (optional) | Latest | Run PostgreSQL in a container |

### 5.2 Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd admin-dorimuri

# 2. Install dependencies
npm install

# 3. Copy .env.example to .env
cp .env.example .env
```

### 5.3 Environment Variables

Create a `.env` file from the template:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/admin_dashboard

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<your-secret-key>

# App
NODE_ENV=development
```

### 5.4 Database Setup

```bash
# Option 1: Run PostgreSQL via Docker
docker run -d \
  --name admin-pg \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=admin_dashboard \
  -p 5432:5432 \
  postgres:15

# Option 2: Import schema via psql
psql $DATABASE_URL -f admin-dashboard-schema.sql

# Option 3: Use Drizzle Kit (if migration files exist)
npx drizzle-kit push
```

> **Note:** The `admin-dashboard-schema.sql` file contains all CREATE TABLE statements, indexes, constraints, and seed data — it can be imported directly.

### 5.5 Run Development Server

```bash
# Start dev server
npm run dev

# Open browser at
# http://localhost:3000
```

### 5.6 Build & Production

```bash
# Build for production
npm run build

# Start production server
npm start
```

### 5.7 Testing

```bash
# Unit tests (Vitest)
npm run test

# E2E tests (Playwright)
npx playwright test

# Lint
npm run lint
```

---

## 6. API & Database Integration Notes

### 6.1 Querying Tables via Drizzle ORM

```typescript
import { db } from '@/db';
import { users, roles, user_roles } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Example: Fetch a user with their assigned roles
const userWithRoles = await db
  .select({
    user: users,
    role: roles,
  })
  .from(users)
  .innerJoin(user_roles, eq(users.id, user_roles.user_id))
  .innerJoin(roles, eq(user_roles.role_id, roles.id))
  .where(eq(users.email, 'admin@example.com'));
```

### 6.2 Writing Audit Logs

```typescript
import { db } from '@/db';
import { audit_logs } from '@/db/schema';

// Record an audit log entry after a CRUD operation
await db.insert(audit_logs).values({
  user_id: currentUserId,
  action: 'UPDATE',
  target_entity: 'banners',
  target_id: bannerId,
  old_values: { title: 'Old Title', is_active: true },
  new_values: { title: 'New Title', is_active: false },
  ip_address: requestIp,
  user_agent: userAgent,
});
```

### 6.3 Role-Based Access Control (RBAC) Implementation

```typescript
import { db } from '@/db';
import { permissions, role_permissions, roles, user_roles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// Check if a user has a specific permission
async function hasPermission(userId: number, permissionSlug: string): Promise<boolean> {
  const result = await db
    .select({ id: permissions.id })
    .from(permissions)
    .innerJoin(role_permissions, eq(permissions.id, role_permissions.permission_id))
    .innerJoin(user_roles, eq(role_permissions.role_id, user_roles.role_id))
    .where(
      and(
        eq(user_roles.user_id, userId),
        eq(permissions.slug, permissionSlug)
      )
    )
    .limit(1);

  return result.length > 0;
}

// Usage
const canManageBanners = await hasPermission(currentUserId, 'CAN_MANAGE_BANNERS');
```

### 6.4 Security Best Practices

| Practice | Implementation |
|---|---|
| **Password Hashing** | Use bcrypt (cost factor ≥ 12) or argon2id before storing in `users.password_hash` |
| **RBAC Enforcement** | Check permissions before every protected operation |
| **Audit Logging** | Record all changes to sensitive data (users, banners, seo_entries) in `audit_logs` |
| **Input Validation** | Validate all inputs with Zod schemas before writing to the database |
| **SQL Injection Prevention** | Always use Drizzle ORM parameterized queries — never concatenate strings |
| **CSRF Protection** | Enable Next.js CSRF protection for mutation endpoints |
| **Rate Limiting** | Limit requests per user/IP to prevent brute-force attacks |
| **Environment Variables** | Never commit `.env` files — use `.env.example` as a template |

### 6.5 Schema Reference

| File | Description |
|---|---|
| `admin-dashboard-schema.sql` | Full SQL schema (DDL + Seed Data) |
| `db/schema/rbac.ts` | Drizzle schema for Roles, Permissions |
| `db/schema/audit.ts` | Drizzle schema for Audit Logs |
| `db/schema/banners.ts` | Drizzle schema for Ad Placements, Banners |
| `db/schema/seo.ts` | Drizzle schema for SEO Entries |

---

> **Maintained by:** Dorimuri Team
> **Schema Version:** 1.0 (August 2026)
> **Database:** PostgreSQL 15+
