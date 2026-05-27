# FOBOH Pricing Challenge

A pricing profile tool for food and beverage suppliers. Suppliers can build pricing
profiles — pick products, apply a fixed or percentage adjustment, preview the new
prices, and save.
That's the bit I spent most of my thinking on, and it's what most of this README is about.

---

## Setup

You'll need two terminals.

**Backend** (runs on port 3001):
```bash
cd backend
npm install
npm run dev
```
Swagger API docs are at http://localhost:3001/api-docs

**Frontend** (runs on port 5173):
```bash
cd frontend
npm install
npm run dev
```
Then open http://localhost:5173

My AI conversation transcripts are in the `/transcripts` folder — one file per build step.

---

## Project structure
```txt
  foboh/
  ├── backend/
  │   ├── src/
  │   │   ├── resolvers/
  │   │   │   └── priceResolver.ts   # precedence logic — the heart of this
  │   │   ├── routes/                # products, profiles, resolve, customers
  │   │   ├── data/seed.ts           # products + profiles from the brief
  │   │   ├── types/                 # shared TypeScript interfaces
  │   │   └── index.ts               # Express app + Swagger setup
  │   └── package.json
  ├── frontend/
  │   ├── src/
  │   │   ├── components/            # ProductTable, PriceChecker, etc.
  │   │   ├── pages/PricingProfile.tsx
  │   │   └── api/client.ts          # backend calls
  │   └── package.json
  ├── transcripts/                   # AI conversation logs, one per build step
  └── README.md
```


---

## The problem I actually had to solve

The basic pricing flow is straightforward. Pick products, apply an adjustment, save.
The brief even gives you the formulas. If that were the whole task there wouldn't be
much to talk about.

The real problem is overlapping profiles. Here's the scenario from the brief:

- Profile A: 10% off all Wine, for the "Independent Retailers" group
- Profile B: $15 off all Sparkling Wine, for the "VIP" group
- Profile C: a custom $95 price on one specific wine, just for "Bondi Cellars"

Bondi Cellars is in both groups and has the custom price. They order the one wine that
all three profiles touch. So three different prices are technically valid:

- Profile A gives $108 (10% off $120)
- Profile B gives $105 ($15 off $120)
- Profile C gives $95 (the custom price)

The system has to pick one. And it has to pick the same one every time, instantly,
without a human in the loop — because the whole point of FOBOH is removing manual work,
not adding a person who approves prices all day.

So I needed a rule.

---

## My precedence rule: specificity wins

When more than one profile applies, the most specific one wins. I rank specificity
like this:

1. A profile for one specific customer (most specific)
2. A profile for a customer group
3. A profile for a whole category or everyone (least specific)

In the scenario, Profile C is tied to a single named customer, so it's the most
specific. Bondi Cellars pays $95.

**If two profiles are equally specific**, the one that gives the customer the lower
price wins. The reasoning there: if a supplier set up two group-level discounts that
both apply, they've effectively agreed to both, and the customer should get the better
deal. The tiebreaker only kicks in within the same specificity level — it never lets a
broad discount beat a specific one.

I wrote the resolver so it doesn't just return a number. It returns the price, which
profile won, and a plain-English reason. If a supplier ever asks "why is this customer
paying this?", the system can answer.

---

## Why specificity, and not the other options

I genuinely considered a few different rules before landing here. Walking through why
I rejected the others is probably the most useful way to explain why I picked this one.

**Lowest price always wins.** Simple, and great for the buyer. But it ignores what the
supplier actually wants. Imagine a supplier runs a temporary 30% off promotion on all
wine. Under "lowest wins," that promo would blow straight through a carefully negotiated
contract price for a key account. The supplier loses money silently and stops trusting
the tool. That's a dealbreaker.

**Stack all the discounts.** 10% off, then $15 off, then the custom price, all on top of
each other. Buyers would love it. Margins would evaporate. Nobody runs a wholesale
business like this.

**Let the supplier set a priority number on every profile.** Maximum control, but it
pushes all the complexity onto the user. Now every supplier has to hold the whole
conflict-resolution model in their head while setting up profiles. Bad experience.

Specificity-wins is the one that matches how suppliers actually think. A price you set
for one named customer is a deliberate decision — usually a negotiated deal, sometimes
tied to a contract or bundled with other terms. A group discount is a broader, more
casual offer. The specific decision should beat the general one. It's predictable, it's
explainable in one sentence, and it respects what the supplier meant.

---


## What I'd do next

These are deliberately left out of thesubmission, not forgotten.

**Let suppliers override the rule per profile (Configurations).** The most interesting extension. Right
now specificity-wins is the single system-wide rule. In reality, different suppliers
have different commercial philosophies. We can give a configuration screen to allow the supplier to set whether 
they want a default behaviour/rule (specifity), or the lowest price. So, while checking the price of a product 
for a customer, according to the configurations set, the profile will be selected.

**A manual approval workflow for sensitive accounts.** For high-value customers, a
supplier might want a human to confirm the price before it goes live. I'd let them flag
a profile as "needs approval" — the resolver would still return a deterministic
recommended price, just marked as pending until someone signs off. The key is that this
sits *on top of* the automatic rule as an optional escape valve.

**Proactive nudges instead of silent behaviour.** Following the cheaper-category-discount
edge case — rather than the system quietly keeping the custom price, it could tell the
supplier: "Bondi Cellars is on a $95 custom price but would qualify for $84 under your
new wine promotion. Want to update them?" That keeps the decision with the supplier but
makes sure they're not leaving money on the table by accident.

**Profile expiry and scheduling.** Promotions are usually time-bound. I'd add start and
end dates so a profile automatically activates and deactivates, and the resolver would
skip anything outside its active window. Right now everything is permanent until deleted.

---


## One case worth calling out

What if a category discount is actually cheaper than the customer-specific price? Say
30% off all wine brings it to $84, but Bondi Cellars has a custom price of $95.
Specificity-wins means they still pay $95 — the more expensive one.

That feels wrong at first glance, but I think it's correct. A custom price isn't always
about being cheaper. It might be a contracted rate the supplier guaranteed in writing.
It might come bundled with free freight or longer payment terms. It might be a
deliberate stable price the customer asked for so their costs don't bounce around with
every promotion. If the system silently overrode that with a temporary promo price, it
would be breaking the supplier's own agreements without asking.

The supplier always has an easy out — if they want the cheaper price to apply, they just
remove or update the custom profile. The system shouldn't make that call for them.

---

## Small decisions I made on purpose

These are the little things the brief mentioned, and what I chose for each:

**Negative prices.** A big enough discount could push a price below zero. I floor it at
$0.01 rather than $0, because a literal $0 can get misread as "free" by downstream
systems. I also surface a warning in the UI before saving, so the supplier knows it
happened rather than finding out later.

**Rounding.** Everything rounds to two decimal places (cents). Percentage adjustments
in particular can produce long decimals, and prices should look like prices.

**"All products" over time.** When a profile targets "all products," I treat that as all
products that exist when the profile is created — not products added later. Automatically
applying an old discount to brand new products felt like the kind of silent behaviour
that surprises people. New products should be a deliberate choice.

**Deleted products.** If a product inside a profile gets deleted, the resolver just skips
it rather than throwing an error. One missing product shouldn't break pricing for
everything else in the profile.


---

## How it's built

**Backend** is Node.js, TypeScript, and Express, with an in-memory store seeded with the
products and profiles from the brief. The resolver logic lives in its own file, separate
from the routes, because it's the most important part and I wanted it easy to find and
test. Everything's documented with Swagger so you can poke at the endpoints directly.

Main endpoints:
- `GET /products` — list and filter products
- `GET/POST/PUT/DELETE /profiles` — manage pricing profiles
- `GET /resolve?customerId=X&productId=Y` — the resolver. Returns the price, the winning
  profile, and why it won.

**Frontend** is React with TypeScript and Tailwind, styled to match FOBOH's own pricing
screen. Beyond the required flow, I added a small "Price Checker" panel — you pick a
customer and a product, and it shows you the resolved price and which profile won. That's
really there to make the precedence logic visible, since it's the part of the system
that's hard to see otherwise.

I kept the data model deliberately simple. A profile has an optional `customerId`, an
optional `groupIds`, and if neither is set it applies to everyone. That's the whole
targeting model.

---


