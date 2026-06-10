# Productionising FOBOH Pricing — Multi-Tenant Persistence + Auth

**Date:** 2026-06-04
**Status:** Approved design, ready for implementation plan
**Slice scope:** Items #1 (multi-tenant) + #2 (auth/authz) from the productionisation list. Item #3 (full pricing domain from the brief image) chains after as its own cycle.

---

## Goal

Take the in-memory take-home demo and productionise the data + access layer: real persistence (MongoDB), multi-tenancy (one platform, many supplier orgs), and real authentication/authorization. The existing specificity-wins resolver — the core decision the challenge was judged on — is preserved verbatim; only its data source changes.

Purpose: a credible, fully-explainable production slice to send FOBOH as a follow-up, doubling as a portfolio/learning piece. Optimised for **depth and explainability over breadth** — one coherent slice you can defend line by line beats several stubbed subsystems.

---

## Decisions locked (and why)

| Decision | Choice | Why |
|---|---|---|
| Database | **MongoDB + Mongoose** | Matches FOBOH job description (free signal); document model fits profiles with embedded arrays; prior multi-tenant Mongo experience. |
| Tenancy model | **Shared DB + `tenantId` on every doc, with upgrade seam** | Industry default (Slack/Shopify/GitHub). Scales to many tenants, sane ops. `isolationMode` field + connection seam lets a high-compliance tenant be promoted to a dedicated DB later without touching business logic. |
| Tenant resolution | **Subdomain selects + JWT proves** | `acme.foboh.app` selects the tenant; the signed JWT's `tenantId` claim proves membership. Forgery-proof. |
| Auth | **In this slice** — bcrypt passwords, single short-lived JWT | Tenant resolution is only meaningful with real auth, so they ship together. Refresh tokens deferred (noted, not built). |
| Architecture | **Layered + middleware seam (Approach A)** | Tenant/auth are middleware; an explicit `forTenant()` helper is the single enforcement choke point; business logic is tenant-oblivious. Cleanest to explain and test. |

**Rejected alternatives (interview-ready reasoning):**
- *DB-per-tenant routed by domain*: strong physical isolation but connection-pool explosion, migrations × N, no cross-tenant analytics. Reserved for the 1% compliance customer, not the default.
- *Per-tenant connection registry now (Approach B)*: pre-wires the physical upgrade but adds connection-caching complexity before any dedicated-DB customer exists.
- *Mongoose plugin auto-scoping (Approach C)*: least code but hides enforcement — bad when a reviewer asks "show me where tenancy lives."

---

## Section 1 — Data model & tenancy

**New top-level entities:**

- **Tenant** (supplier org): `{ _id, name, slug, isolationMode: 'shared' | 'dedicated', createdAt }`
  - `slug` is the subdomain (`acme` → `acme.foboh.app`).
  - `isolationMode` is the upgrade seam — read by the data/connection layer; always `'shared'` today.
- **User**: `{ _id, tenantId, email, passwordHash, role: 'owner' | 'staff', createdAt }`
  - Belongs to exactly one tenant (no multi-org users yet).

**Existing entities gain `tenantId`** (indexed, required) on every document: `Product`, `Customer`, `CustomerGroup`, `PricingProfile`. All other fields unchanged from the current types.

**Indexes:**
- Compound `{ tenantId: 1, <lookupField>: 1 }` on each collection so the tenancy filter is always the index prefix.
- Unique constraints become compound: **SKU is unique per tenant**, not globally (two suppliers may both sell SKU `HGVPIN21`). Same for any other previously-global unique field.

**Enforcement choke point — `forTenant(ctx)`:**
A single helper wrapping Mongoose model access. Every read/write derives `tenantId` from `ctx` (never from the request body). One file, one place to audit. A query that bypasses it is the defect to catch in review. This is the answer to "where is tenancy enforced?" and the seam that makes a future dedicated-DB upgrade a one-file change.

---

## Section 2 — Tenant resolution + auth flow

**Middleware pipeline (order is security-critical):**

1. **`resolveTenant`** — read subdomain from `Host` header → look up `Tenant` by `slug` → attach `req.tenant`. Not found → `404`.
   - Local dev: subdomain via `X-Tenant-Slug` header or `acme.localhost`; Vite proxy forwards the header.
2. **`authenticate`** — read `Authorization: Bearer <jwt>` → verify signature → decode `{ userId, tenantId, role }` → attach `req.user`. Invalid/expired/missing → `401`.
3. **`authorizeTenant`** — assert `req.user.tenantId === req.tenant._id`. Critical cross-tenant guard: a valid Acme token cannot be replayed against `globex.foboh.app`. Mismatch → `403`.
4. Build `ctx = { tenantId, userId, role }` → `req.context`. Everything downstream uses only `ctx`.

**Auth endpoints** (public — skip middleware 2 & 3, still tenant-scoped via 1):
- `POST /auth/register` — first user of a tenant becomes `owner`. Tenant creation itself is seed/admin for now; self-serve signup is a later slice.
- `POST /auth/login` — email + password → bcrypt compare → issue short-lived JWT carrying `{ userId, tenantId, role }`. Refresh tokens deferred (noted, not built).

**Why subdomain + JWT both:** the subdomain *selects* a tenant; the signed JWT *proves* the user belongs to it. Selection alone is forgeable; the signed claim is not.

---

## Section 3 — Backend layers + resolver port

**Layer structure:**
```
routes/      thin: parse request, call service, shape response. no logic.
services/    business logic. takes ctx + args, returns data. tenant-oblivious.
models/      Mongoose schemas + forTenant(ctx) scoped helper.
middleware/  resolveTenant, authenticate, authorizeTenant.
resolvers/   priceResolver — ported: async, tenant-scoped.
lib/         jwt, password (bcrypt), db connection.
```

**Resolver port (the substantive change):**
- Becomes `async`; signature `resolvePrice(ctx, customerId, productId)`.
- Fetches customer, product, candidate profiles via `forTenant(ctx)` — all auto-scoped to `tenantId`. A profile from another supplier physically cannot enter the candidate set.
- **Core specificity-wins logic is frozen** — audience-ranked precedence (customer > group > everyone), lowest-price tiebreak within a tier, recency tiebreak. Only the data source swaps (arrays → scoped queries).
- Remove `console.log` debugging.
- Edge cases preserved: deleted product skipped, `$0.01` floor, round-to-cents, recency tiebreak.
- **Query efficiency:** candidate profiles fetched with `{ tenantId, productIds: productId }` plus customer-match pushed into the query where possible — not fetch-all-then-filter-in-JS.

---

## Section 4 — Frontend changes (minimal, deliberate)

- **Login page** — email + password → store JWT (memory + localStorage for demo; README notes httpOnly cookie for true prod).
- **API client** — one interceptor injects `Authorization: Bearer` + `X-Tenant-Slug` on every call; `401` → redirect to login.
- **Auth context** — holds user/tenant/role, gates routes; existing pages wrapped behind it.
- **Existing pricing UI + PriceChecker unchanged** — now hit authed, tenant-scoped endpoints.

---

## Section 5 — Testing, seed, migration

- **Seed**: 2 tenants (`acme`, `globex`), each with own products/customers/groups/profiles + one owner user. Two tenants is the proof — logging into Acme cannot see Globex data.
- **Tests** (high-signal for reviewers):
  - Resolver: brief scenario still returns **$95** — proves the port didn't break core logic.
  - **Tenant isolation**: Acme `ctx` querying Globex's product → empty. Proves the choke point.
  - Auth: bad password → `401`; cross-tenant token → `403`.
- **Migration note**: in-memory → Mongo documented in README as the productionisation narrative.

---

## Out of scope (chains as later slices)

- Item #3: full pricing domain / every rule type from the brief image.
- Self-serve tenant signup.
- Refresh tokens / token rotation.
- Configurable per-profile conflict resolution, approval workflows, profile scheduling/expiry (already noted in current README's "What I'd do next").
- Actual dedicated-DB promotion (seam designed, not exercised).

---

## Definition of done

- Two seeded tenants, isolated; login works per tenant.
- All pricing endpoints authed + tenant-scoped via `ctx`.
- Resolver returns $95 for the brief scenario, async, tenant-scoped.
- Isolation + auth tests pass.
- README updated with the productionisation story.
