# Architecture

## Project structure

```
src/
  app/[locale]/    Routes — pages + Server Actions live next to the pages that use them
  app/api/          Route handlers: NextAuth catch-all, register, password reset, Stripe webhook
  components/       UI — components/ui (shadcn primitives), components/admin, components/account
  lib/              Core logic: auth, cart, checkout, promo codes, admin actions — the layer
                     everything else calls into, never the other way around
  locales/          ru/en/de translation dictionaries (react-i18next)
prisma/
  schema.prisma     Single source of truth for the data model
  migrations/        One directory per migration — applied to prod via `prisma migrate deploy`
```

The dependency direction is strict: `components` and `app` call into `lib`; `lib` never imports from either. Server Actions that mutate data live in `lib/*-actions.ts` files, and each starts with an ownership/role check (`requireAdmin()`, session-scoped Prisma queries) before touching the database — never trust a client-supplied id alone.

## Key decisions

- **Guest cart via an httpOnly `cartId` cookie**, merged into the account cart on login (`getOrCreateCart()` in `src/lib/cart.ts`). Reading (`getCart()`) and writing (`getOrCreateCart()`) are separate functions because Next.js forbids setting cookies during a plain page render — only Server Actions/Route Handlers can, so the read path has to stay pure.
- **Orders snapshot data at time of purchase**, not live references: `OrderItem` stores `productName`/`priceAmount`; `Order` stores `promoCode`/`discountAmount` as a plain string+number, not a foreign key to `PromoCode`. Editing or deleting a promo code later never rewrites order history.
- **Promo codes require login**, and `PromoCodeRedemption` (`@@unique([promoCodeId, userId])`) enforces one redemption per user at the database level, not just in application code. The redemption row is written by the Stripe webhook on `payment_intent.succeeded` — not at order creation — so an abandoned or failed checkout never burns a use.
- **Stripe is the source of truth for payment state.** Totals are always recomputed server-side from the database at checkout, never trusted from the client. The signature-verified webhook — not the client-side redirect after `confirmPayment()` — is what flips an order `PENDING → PAID`, decrements stock, and clears the cart.
- **No seeded admin account.** Promoting a user to `ADMIN` is a manual SQL update after normal registration (see `docs/DEPLOYMENT.md`) — a default admin with a known password is a real risk in a repo anyone can read.
- **Payment UI is Stripe's own embedded Payment Element**, not a hand-built card form — raw card fields would mean the app's own server sees the PAN, which is a PCI-scope problem this project deliberately avoids.

## Data that lives outside the schema — sync it manually

Two things aren't covered by `prisma migrate deploy` and need to be moved to production by hand when they change: catalog seed data (`prisma/seed.ts`) and per-locale `Translation` rows. Both are keyed by database ids that are freshly generated (`cuid()`) every time a database is seeded — the same product has a *different* id locally than on the production Neon database, even though the `slug` is identical. Copying rows verbatim by id silently matches nothing on the other side. When moving this kind of data between environments, join on `slug` and remap to the target database's actual id before writing.

## Full deployment/infra docs

Environment variables, which external service needs updating when you change what, and the incident-shaped troubleshooting list: [`DEPLOYMENT.md`](DEPLOYMENT.md).
