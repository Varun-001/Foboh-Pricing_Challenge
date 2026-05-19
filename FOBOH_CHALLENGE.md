# FOBOH Engineering Challenge — Full Context & Build Guide

> Drop this file into your project root. In Claude Code, type:
> "@FOBOH_CHALLENGE.md read this for full context before we start"

---

## Who you are

Varun Goel — full-stack software engineer, Melbourne, ~3 years experience.
Stack: React, TypeScript, Node.js, GraphQL, REST APIs, PostgreSQL, AWS.
Completing a take-home engineering challenge for FOBOH — a food & beverage
wholesale automation startup in Australia.

---

## What FOBOH does

FOBOH automates order management for food and beverage suppliers. Suppliers receive
orders via email, WhatsApp, and spreadsheets and manually re-enter them into
accounting software like Xero and MYOB. FOBOH's AI agents parse incoming messages
and push structured data directly into the supplier's systems.

---

## What the challenge is — plain English

Build a Pricing Profile tool for food and beverage suppliers.

A supplier sells products (wine, beer, spirits) to many customers. Different customers
get different prices — some get $5 off, some get 10% off a category, some have a
custom negotiated price. These are called "pricing profiles."

The supplier needs a UI to:
1. Browse and filter their product catalogue (title, SKU, sub-category, segment, brand)
2. Select products into a pricing profile — including select-all
3. Apply a price adjustment — fixed ($) or dynamic (%) — increase or decrease
4. Preview the new calculated prices before saving
5. Save the profile via a backend API

---

## Price calculation rules

```
Fixed:   New Price = Base Price [+/-] Adjustment
Dynamic: New Price = Base Price [+/-] (Adjustment% x Base Price)
```

- New price must NEVER be negative — floor at $0.01
- Always round to 2 decimal places

---

## The hard part — overlapping profiles

In real wholesale, a customer can belong to multiple groups, meaning multiple pricing
profiles can apply to the same product for the same customer simultaneously.

### Scenario from the brief:
- Profile A: 10% off all Wine → "Independent Retailers" group
- Profile B: $15 off all Sparkling Wine → "VIP" group
- Profile C: Custom $95 on Koyama Methode Brut Nature NV → single customer "Bondi Cellars"

Bondi Cellars is in BOTH groups. They order Koyama Methode Brut Nature NV (base $120).
Three profiles match. What do they pay?

### Seed data (from the brief):

| Title                          | SKU        | Brand              | Sub-cat          | Segment | Base Price |
|---|---|---|---|---|---|
| High Garden Pinot Noir 2021    | HGVPIN21   | High Garden        | Wine Red         | Wine    | $279.06    |
| Koyama Methode Brut Nature NV  | KOYBRUNNV6 | Koyama Wines       | Wine Sparkling   | Wine    | $120.00    |
| Koyama Riesling 2018           | KOYNR1837  | Koyama Wines       | Wine Port/Dessert| Wine    | $215.04    |
| Koyama Tussock Riesling 2019   | KOYRIE19   | Koyama Wines       | Wine White       | Wine    | $215.04    |
| Lacoute-Godbillon Brut Cru NV  | LACBNATNV6 | Lacoute-Godbillon  | Wine Sparkling   | Wine    | $409.32    |

---

## Precedence rule — Varun's decision (do NOT let Claude Code invent its own)

**Specificity wins.** When multiple profiles apply to the same customer and product,
the most specific profile takes precedence:

1. Customer-specific profile (targets a single named customer) → highest priority
2. Sub-category profile (e.g. Sparkling Wine) → middle priority
3. Category/segment profile (e.g. all Wine) → lowest priority

**Tiebreaker:** If two profiles are at the same specificity level, the one giving
the customer the lowest final price wins — because in wholesale, the intent of
overlapping discounts is to benefit the buyer, and the supplier accepted both.

**Applied to the scenario:**
- Profile C → customer-specific → $95 → WINS
- Profile B → sub-category → $105 → loses
- Profile A → category → $108 → loses

Bondi Cellars pays $95.

Resolver must return: `{ price, sourceProfileId, profileName, reason }`

This rule must appear word-for-word in the README.

---

## Tech stack

```
Backend:   Node.js + TypeScript + Express
API docs:  swagger-jsdoc + swagger-ui-express (OpenAPI)
Frontend:  React + TypeScript + Vite
Styling:   Tailwind CSS
Storage:   In-memory only — no database needed
```

---

## Design reference — match and polish FOBOH's own UI

The brief includes a screenshot of FOBOH's actual product. Replicate it closely,
then polish further — clean typography, subtle shadows, smooth hover states.

**Layout:**
- Dark teal sidebar (#0F6E56) with nav: Dashboard, Orders, Customers, Products,
  Pricing, Freight (NEW badge), Integrations, Settings
- FOBOH logo top-left of sidebar
- White main content area with breadcrumb: Pricing Profile > Setup a Profile
- Cancel + Save as Draft buttons top-right

**Pricing Profile wizard — 3 steps shown as expandable sections:**
1. Basic Pricing Profile — name + description, green "Completed" badge when done
2. Select Product Pricing — search + filters + product table + adjustment + preview
3. Assign Customers to Pricing Profile — "Not Started" badge

**Product table columns:**
checkbox | image placeholder | title + SKU | brand | sub-category | base price

**Price adjustment controls (inside step 2):**
- Scope radio: One Product / Multiple Products / All Products
- Search bar + dropdowns: Product/SKU, Category, Segment, Brand
- Adjustment type radio: Fixed ($) / Dynamic (%)
- Direction radio: Increase + / Decrease -
- Number input for adjustment value
- "Refresh New Price Table" button

**Preview table columns:**
checkbox | Product Title | SKU Code | Category | Global Wholesale Price | Adjustment | New Price

**Colour palette — add to tailwind.config.js:**
```js
colors: {
  'foboh-teal':       '#0F6E56',
  'foboh-teal-dark':  '#085041',
  'foboh-teal-light': '#1D9E75',
  'foboh-teal-bg':    '#E1F5EE',
}
```

---

## Extras to include (beyond the brief)

Do NOT add these until all core requirements are working. Then add in order.

### High priority:

**1. Price Checker UI panel**
Small interactive section: pick a customer + product → calls GET /resolve →
shows final price, which profile won, and the reason string.
This visually demos the hardest part of the challenge. Very high signal to reviewers.

**2. Price change highlighting in preview table**
New price lower than base → green text. Higher → amber text.
FOBOH's own screenshot has this. Mirroring it shows you studied their product.

**3. Toast notifications**
Success toast on profile save. Error toast with message on failure.

**4. Confirmation dialog before delete**
"Are you sure you want to delete this profile?" One modal.

**5. Empty states**
"No products match your filters" — not a blank table.
"No profiles yet — create one above" on the profile list.

**6. Inline validation on price adjustment**
If the adjustment would make any price go negative, show an inline error
before save. Don't just silently floor it — explain why.

### Medium priority (add if time allows):

**7. Profile list page**
After saving, list all profiles with edit/delete. Makes it feel like a real product.

**8. Debounced search**
300ms debounce on the search input. One line of code, shows performance awareness.

**9. localStorage persistence**
Profiles survive server restarts during demo. Note in README:
"used for demo convenience — production would use PostgreSQL."

---

## Edge cases — handle deliberately, mention every one in README

| Edge case                            | Decision                                              |
|---|---|
| New price goes negative              | Floor at $0.01, show inline error explaining why      |
| Rounding                             | Math.round to 2 decimal places (cents)                |
| "All Products" scope                 | Products existing at creation time — not future ones  |
| Deleted product in a profile         | Exclude silently from resolver — do not throw         |
| Adjustment = 0                       | Allow — valid no-op                                   |
| Two profiles same specificity + price| Pick most recently created profile                    |

---

## Commit conventions — human readable, one per step

Format: `type: what you built and why if not obvious`

Types: `feat` `fix` `chore` `style` `refactor` `docs`

Good commits:
```
chore: initialise backend and frontend folder structure
chore: add TypeScript config and Express + Swagger dependencies
feat: add TypeScript interfaces for Product, Profile, Customer, ResolvedPrice
feat: seed in-memory store with products, customers, and overlapping profiles
feat: implement specificity-wins precedence resolver with reason field
feat: add GET /products endpoint with search and filter query params
feat: add CRUD endpoints for pricing profiles
feat: add GET /resolve endpoint — returns price, winning profile, and reason
feat: expose all endpoints via Swagger UI at /api-docs
chore: scaffold React frontend with Vite, TypeScript, and Tailwind
feat: build dark teal sidebar matching FOBOH design reference
feat: build product filter bar with debounced search and dropdowns
feat: build product table with checkboxes and select-all
feat: add price adjustment controls — fixed/dynamic, increase/decrease
feat: build price preview table with green and amber price highlighting
feat: wire save profile to POST /profiles API
feat: add success and error toast notifications
feat: build profile list page with edit and delete actions
feat: add confirmation dialog before deleting a profile
feat: build Price Checker panel — shows resolved price and winning profile
fix: floor negative prices at $0.01 with inline validation message
style: polish UI — empty states, hover states, spacing, design alignment
docs: write README with setup, precedence rule, trade-offs, and next steps
```

Never do this:
```
fix stuff / wip / update / final / final v2
```

---

## Project structure

```
foboh-pricing/
├── backend/
│   ├── src/
│   │   ├── data/
│   │   │   └── seed.ts           # products, customers, profiles, in-memory store
│   │   ├── routes/
│   │   │   ├── products.ts       # GET /products with filters
│   │   │   ├── profiles.ts       # GET, POST, PUT, DELETE /profiles
│   │   │   └── resolve.ts        # GET /resolve?customerId=X&productId=Y
│   │   ├── resolvers/
│   │   │   └── priceResolver.ts  # precedence logic — most important file
│   │   ├── types/
│   │   │   └── index.ts          # all TypeScript interfaces
│   │   └── index.ts              # Express entry point + Swagger setup
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── ProductTable.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   ├── PriceAdjustmentForm.tsx
│   │   │   ├── PricePreviewTable.tsx
│   │   │   ├── PriceChecker.tsx
│   │   │   ├── ProfileList.tsx
│   │   │   └── Toast.tsx
│   │   ├── pages/
│   │   │   └── PricingProfile.tsx
│   │   ├── api/
│   │   │   └── client.ts         # all API calls to backend
│   │   └── types/
│   │       └── index.ts          # shared types (mirror backend)
│   ├── tailwind.config.js
│   ├── package.json
│   └── vite.config.ts
├── transcripts/                  # Claude Code session exports — submit with code
│   ├── transcript-01-scaffold.md
│   ├── transcript-02-types.md
│   └── ...
└── README.md
```

---

## Step-by-step build order

Build ONE step at a time. Commit after each step. Export transcript after each step.
Do NOT ask Claude Code to build everything at once — you will lose track and
won't be able to explain it in the technical interview.

---

### STEP 1 — Project scaffold
What you learn: how to set up a TypeScript Node.js project from scratch.

```bash
mkdir foboh-pricing && cd foboh-pricing
git init
mkdir transcripts

mkdir backend && cd backend
npm init -y
npm install express cors swagger-jsdoc swagger-ui-express
npm install -D typescript ts-node-dev @types/express @types/node @types/cors
npx tsc --init
mkdir -p src/data src/routes src/resolvers src/types
```

Commit: `chore: initialise backend folder structure with TypeScript and Express`
Export: `/export transcripts/transcript-01-scaffold.md`

---

### STEP 2 — TypeScript interfaces
What you learn: define the shape of your data before writing any logic.
Think of interfaces as a contract — every part of the app agrees on the same shape.

Create `backend/src/types/index.ts`:
- `Product` — id, title, sku, brand, subCategory, segment, basePrice
- `PricingProfile` — id, name, description, productIds, adjustment,
  adjustmentType ('fixed'|'dynamic'), direction ('increase'|'decrease'),
  scope ('customer'|'group'|'category'), targetId, createdAt
- `Customer` — id, name, groupIds
- `ResolvedPrice` — price, sourceProfileId, profileName, reason

Commit: `feat: add TypeScript interfaces for Product, Profile, Customer, ResolvedPrice`
Export: `/export transcripts/transcript-02-types.md`

---

### STEP 3 — Seed data and in-memory store
What you learn: how to set up test data and a simple data layer without a database.

Create `backend/src/data/seed.ts`:
- All 5 products from the brief with exact SKUs and prices
- 3 customers: Bondi Cellars (in both groups), one Independent Retailer, one VIP
- The 3 overlapping profiles from the scenario (Profile A, B, C)
- Export a simple store object with typed arrays

Commit: `feat: seed in-memory store with products, customers, and overlapping profiles`
Export: `/export transcripts/transcript-03-seed.md`

---

### STEP 4 — Precedence resolver (most important step)
What you learn: the core business logic of the whole challenge.
This is the file they will look at most closely.

Create `backend/src/resolvers/priceResolver.ts`:
1. Accept customerId and productId
2. Find all profiles where the product is included
3. Filter to profiles that apply to this customer (direct or via group)
4. Calculate new price for each matching profile
5. Assign specificity score: customer=3, sub-category=2, category=1
6. Sort by score descending, tiebreak by lowest price
7. Return winner with reason string like:
   "Customer-specific profile 'Bondi Cellars Special' applied — highest specificity"

Prompt to use in Claude Code:
"Implement the price resolver in src/resolvers/priceResolver.ts using the
specificity-wins precedence rule from FOBOH_CHALLENGE.md. Do not invent your
own rule — implement exactly what is specified in that file."

Commit: `feat: implement specificity-wins precedence resolver with reason field`
Export: `/export transcripts/transcript-04-resolver.md`

---

### STEP 5 — Backend API routes + Swagger
What you learn: how to structure Express routes and self-document them with Swagger.

Build one route file at a time. Add Swagger JSDoc comment block above every endpoint.

products.ts:   GET /products?title=&sku=&brand=&subCategory=&segment=
profiles.ts:   GET /profiles, POST /profiles, PUT /profiles/:id, DELETE /profiles/:id
resolve.ts:    GET /resolve?customerId=X&productId=Y

Wire all routes in src/index.ts. Swagger UI available at /api-docs.
Test every endpoint in Swagger UI before touching the frontend.

Commits:
```
feat: add GET /products endpoint with search and filter query params
feat: add CRUD endpoints for pricing profiles
feat: add GET /resolve endpoint returning resolved price and reason
feat: mount all routes and expose Swagger UI at /api-docs
```
Export: `/export transcripts/transcript-05-routes.md`

---

### STEP 6 — React frontend scaffold
What you learn: how Vite + React + Tailwind fit together and how to configure a
custom colour palette.

```bash
cd ../frontend
npm create vite@latest . -- --template react-ts
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install axios
```

Add FOBOH colours to tailwind.config.js (see Design Reference section above).

Add proxy to vite.config.ts so frontend talks to backend without CORS issues:
```ts
server: { proxy: { '/api': 'http://localhost:3001' } }
```

Commit: `chore: scaffold React frontend with Vite, TypeScript, and Tailwind`
Export: `/export transcripts/transcript-06-frontend-scaffold.md`

---

### STEP 7 — Sidebar navigation
What you learn: fixed layout with Tailwind, matching a real design spec.

Build Sidebar.tsx:
- bg-foboh-teal-dark full height
- FOBOH logo top-left
- Nav items with Heroicons or similar, active highlight on Pricing
- NEW badge on Freight

Commit: `feat: build dark teal sidebar matching FOBOH design reference`
Export: `/export transcripts/transcript-07-sidebar.md`

---

### STEP 8 — Filter bar
What you learn: controlled inputs, debouncing, lifting state up.

Build FilterBar.tsx:
- Text input with 300ms debounce
- Dropdowns populated from product data: Category, Segment, Brand
- Emits filter state to parent via props

Commit: `feat: build product filter bar with debounced search and dropdowns`
Export: `/export transcripts/transcript-08-filterbar.md`

---

### STEP 9 — Product table with checkboxes
What you learn: checkbox state with a Set, select-all derived logic.

Build ProductTable.tsx:
- Renders filtered products
- Checkbox per row + select-all in header
- Selected IDs stored as Set<string> in parent state
- Selected rows highlighted

Commit: `feat: build product table with individual and select-all checkbox selection`
Export: `/export transcripts/transcript-09-product-table.md`

---

### STEP 10 — Price adjustment controls
What you learn: radio button groups, controlled number input, real-time state.

Build PriceAdjustmentForm.tsx:
- Scope radio: One Product / Multiple Products / All Products
- Type radio: Fixed ($) / Dynamic (%)
- Direction radio: Increase + / Decrease -
- Number input for adjustment value
- Inline error message if calculated price would go negative

Commit: `feat: add price adjustment form with fixed/dynamic and increase/decrease`
Export: `/export transcripts/transcript-10-adjustment-form.md`

---

### STEP 11 — Price preview table
What you learn: derived data rendering, conditional styling.

Build PricePreviewTable.tsx:
- Shows selected products with calculated new prices
- Columns: Product Title | SKU | Base Price | Adjustment | New Price
- New price < base → green (text-green-600)
- New price > base → amber (text-amber-600)
- Floored at $0.01 → red + small note

Commit: `feat: build price preview table with colour-coded price changes`
Export: `/export transcripts/transcript-11-preview-table.md`

---

### STEP 12 — Wire save to API
What you learn: POST from React, handling async responses, typed API client.

Create api/client.ts with typed functions for all endpoints.
Wire Save button to POST /profiles.
Add Toast.tsx for success/error feedback.

Commits:
```
feat: add typed API client for all backend endpoints
feat: wire save profile button to API with toast notifications
```
Export: `/export transcripts/transcript-12-save-api.md`

---

### STEP 13 — Profile list and delete
What you learn: fetching a list on mount, confirm dialogs, DELETE requests.

Build ProfileList.tsx:
- Fetch GET /profiles on mount
- Display name, product count, adjustment summary
- Edit pre-fills the form
- Delete shows confirmation modal then calls DELETE /profiles/:id

Commit: `feat: add profile list page with edit and delete confirmation`
Export: `/export transcripts/transcript-13-profile-list.md`

---

### STEP 14 — Price Checker panel
What you learn: calling the resolver endpoint and presenting structured results.

Build PriceChecker.tsx:
- Customer dropdown + product dropdown
- Check Price button → GET /resolve
- Shows: final price, winning profile name, reason string
- Handles no-match gracefully

Commit: `feat: build Price Checker panel — shows resolved price and winning profile`
Export: `/export transcripts/transcript-14-price-checker.md`

---

### STEP 15 — Polish pass
What you learn: the difference between working and finished.

- Empty states everywhere (no results, no profiles)
- Hover states on all interactive elements
- Consistent card padding and spacing
- Verify it matches the FOBOH design screenshot
- Quick check nothing breaks when you delete a product from a profile

Commit: `style: final polish — empty states, hover states, spacing and alignment`
Export: `/export transcripts/transcript-15-polish.md`

---

### STEP 16 — README
Three paragraphs as they requested. Be specific, not generic.

Para 1 — Setup:
```
cd backend && npm install && npm run dev    # http://localhost:3001
cd frontend && npm install && npm run dev   # http://localhost:5173
Swagger UI: http://localhost:3001/api-docs
```

Para 2 — Precedence rule + judgment calls:
Write the specificity-wins rule verbatim. Then one sentence per edge case:
"I floored negative prices at $0.01 rather than $0 because zero could be
interpreted as free in downstream systems."

Para 3 — What I'd do next (be specific):
- Persist profiles to PostgreSQL with full price change audit trail for compliance
- Let suppliers configure conflict resolution per profile (stack vs override)
- Webhook notifications when an active profile affecting a customer changes
- Profile versioning so historical pricing decisions are always recoverable

Commit: `docs: add README with setup, precedence rule, trade-offs, and next steps`
Export: `/export transcripts/transcript-16-readme.md`

---

## How to export Claude Code transcripts — step by step

FOBOH explicitly requires your AI conversation transcripts submitted with the code.
This is how they assess how you directed AI, what you accepted, and what you changed.

### The right habit: export after every session

At the end of each Claude Code session in VS Code, type in the Claude panel:
```
/export transcripts/transcript-XX-stepname.md
```

Example names:
```
/export transcripts/transcript-04-resolver.md
/export transcripts/transcript-09-product-table.md
```

This writes a plain text transcript of everything — your prompts and Claude's
responses — directly into your project folder.

### Accessing session history in VS Code

Click the "Session history" button at the top of the Claude Code panel.
You can browse by time (Today, Yesterday, Last 7 days) or search by keyword.
Click any session to resume it, then /export from within it.

### If you forget to export — raw file backup

Claude Code stores every conversation locally at:
```
~/.claude/projects/<your-project-folder>/
```
These are .jsonl files. To convert them to readable markdown:
```bash
pip install claude-conversation-extractor
claude-extract
```
Select the session, it outputs a clean markdown file.

### What to submit

Your repo should have a /transcripts folder with one file per build step.
In your README, add one line under Setup:
"AI transcripts are in /transcripts — one file per build step."

---

## README structure (copy this as a template)

```markdown
# FOBOH Pricing Challenge

## Setup
cd backend && npm install && npm run dev    # runs on port 3001
cd frontend && npm install && npm run dev   # runs on port 5173
Swagger UI available at http://localhost:3001/api-docs

## Precedence rule and trade-offs

When multiple pricing profiles apply to the same customer and product, I apply a
specificity-wins rule: customer-specific profiles take priority over sub-category
profiles, which take priority over broad category profiles. If two profiles share
the same specificity level, the one resulting in the lower price for the customer
wins — because in wholesale the intent of overlapping discounts is to benefit the
buyer. The resolver returns the final price, the winning profile name, and a
human-readable reason string explaining which rule applied.

Judgment calls: I floored negative prices at $0.01 rather than $0 because zero
could be read as free in downstream systems. I scoped All Products profiles to
products existing at creation time — retroactively applying discounts to new
products requires explicit intent, not silent inheritance. Deleted products are
excluded silently from resolution rather than throwing, because a missing product
shouldn't break pricing for other items in a profile. Rounding is always to 2
decimal places (Math.round to cents). If two profiles tie on specificity and price,
the most recently created profile wins.

## What I'd do next

Persist profiles to PostgreSQL with a full price change audit trail — in regulated
food wholesale, suppliers need to show what price a customer was quoted and when.
Allow suppliers to configure conflict resolution behaviour per profile (stack with
other discounts vs override all others), rather than a system-wide rule. Add webhook
notifications so downstream systems are alerted when an active profile affecting a
customer is updated. Profile versioning so historical pricing decisions are always
recoverable — useful for disputes and compliance.

AI transcripts are in /transcripts — one file per build step.
```

---

## What they are scoring — priority order

1. Your precedence rule — unambiguous, commercially grounded, code matches README
2. How you directed AI — transcripts show judgment, not just output
3. Small deliberate choices — rounding, floors, deleted products, edge cases
4. Code quality — sensible types, clean boundaries, error handling

Working code is the floor. The reasoning is what wins it.

---

## How to start right now

1. Save this file as FOBOH_CHALLENGE.md in a new folder called foboh-pricing
2. Open that folder in VS Code
3. Run: git init && mkdir transcripts
4. Open the Claude Code panel (Cmd+Shift+P → Claude Code)
5. Type this exact first message:

---

@FOBOH_CHALLENGE.md

Read this file carefully before doing anything. It has full context about the
project, the business problem, the precedence rule I have already decided on,
and the exact step-by-step build order I want to follow.

Start with Step 1 only: scaffold the backend folder structure with TypeScript,
Express, swagger-jsdoc, and swagger-ui-express. Create package.json, tsconfig.json,
and the empty folder structure shown in the project structure section.
Do not write any logic yet. Just the skeleton.

---

6. Review everything Claude Code creates. Make sure you understand each file.
7. Commit: git add . && git commit -m "chore: initialise backend folder structure with TypeScript and Express"
8. Export: /export transcripts/transcript-01-scaffold.md
9. Move to Step 2.

One step. One commit. One transcript export. Every single time.
