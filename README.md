# Leaf & Cup

A full-stack e-commerce demo — a tea shop built to portfolio quality: catalog, cart, checkout with real Stripe payments, an admin panel, and full i18n (ru/en/de).

**Live demo:** https://leaf-cup-roan.vercel.app

> Portfolio / educational project. Payments run in Stripe **test mode** — no real money moves and nothing ships.

## Features

- **Catalog** — categories, product pages, pagination, per-locale translated content
- **Cart** — guest (cookie-based) and account carts, merged automatically on login
- **Checkout** — Stripe embedded Payment Element, server-computed totals, webhook-driven order fulfillment
- **Promo codes** — percent/fixed discounts, per-account single-use enforcement, admin CRUD
- **Accounts** — email/password + Google OAuth, password reset via email, profile/avatar, saved addresses, favorites, order history
- **Admin panel** — products, categories, orders, promo codes; role-gated at the middleware and page level
- **i18n** — Russian (default), English, German, with a real per-product translation table

## Stack

Next.js 16 (App Router, TypeScript) · Tailwind v4 + shadcn/ui · PostgreSQL via Prisma 7 · Auth.js v5 (Credentials + Google) · Stripe · Resend · i18next · Vercel + Neon (both free-tier)

## Getting Started

```bash
npm install
cp .env.example .env
# fill in .env — see comments in the file for where each key comes from
npm run db:up          # local Postgres via docker-compose
npm run db:migrate      # apply migrations
npx prisma db seed      # demo categories/products
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Command | Does |
|---|---|
| `npm run dev` | Dev server (Webpack, not Turbopack — see [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md#troubleshooting)) |
| `npm run build` / `npm start` | Production build / run |
| `npm run lint` | ESLint |
| `npm run db:up` / `db:migrate` / `db:studio` | Local Postgres lifecycle |

## Docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — project structure, layering, key decisions
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — **read before touching production.** Env vars, and which of Vercel/Neon/Stripe/Google needs updating when you change what.
