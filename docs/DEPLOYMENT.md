# Deployment & Infrastructure

This app is split across four independent services. None of them know about each other automatically — wiring them together is manual, and it's easy to change one and silently break another. This document exists so that doesn't happen.

**Read the "Change X → also update Y" table below before touching anything in production.** Most production incidents in this project so far have been exactly that: one service updated, a dependent one forgotten.

## Architecture

```
                       HTTPS
   Browser  ───────────────────────▶  Vercel
                                       (Next.js app: pages, Server Actions,
                                        API routes — all serverless functions)
                                          │              │
                          Postgres        │              │  Stripe API
                          (pooled conn.)  ▼              ▼  (create PaymentIntent)
                                     ┌─────────┐    ┌───────────┐
                                     │  Neon    │    │  Stripe    │
                                     │(Postgres)│    │(test mode) │
                                     └─────────┘    └─────┬─────┘
                                                            │ webhook
                                                            │ payment_intent.succeeded / .payment_failed
                                                            ▼
                                          POST https://<domain>/api/webhooks/stripe
                                          (back into the same Vercel deployment)

   Google OAuth  ◀── redirect ──▶  Vercel  (sign-in flow)
   Resend        ◀── API call ───  Vercel  (password reset, order confirmation emails)
```

Every arrow above is a place where a URL, secret, or ID is hardcoded into the *other* service's dashboard. Change an endpoint on one side and the other side doesn't find out — it just starts failing silently (Google) or gets ignored (Stripe webhook to a stale URL never arrives; the app never notices because it's a webhook, not a poll).

## Services

| Service                | Free tier used for                                            | Account                      |
| ---------------------- | ------------------------------------------------------------- | ---------------------------- |
| **Vercel**       | Hosting the Next.js app (Hobby plan)                          | vercel.com, linked to GitHub |
| **Neon**         | PostgreSQL (Free plan — 100 projects, 0.5GB/project)         | neon.tech                    |
| **Stripe**       | Payments,**test mode only** — no real charges possible | dashboard.stripe.com/test    |
| **Google Cloud** | OAuth "Sign in with Google"                                   | console.cloud.google.com     |
| **Resend**       | Transactional email (password reset, order confirmation)      | resend.com                   |

## Environment variables

Every variable in `.env.example` has to exist in two places: your local `.env` (not committed — see `.gitignore`) and Vercel's **Project → Settings → Environment Variables**. They are not shared or synced automatically.

| Variable                                        | Used for                                                                  | Where to get / rotate it                                                                                                                                                                                                        |
| ----------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                | Prisma's connection to Postgres                                           | Neon → Connect →**use the "Pooled connection" string for the app** (Vercel functions are serverless — many concurrent connections). Migrations should be run against the **direct** (non-pooled) string instead. |
| `AUTH_SECRET`                                 | Signs/encrypts Auth.js session JWTs                                       | `openssl rand -base64 32` — any 32+ byte random string                                                                                                                                                                       |
| `RESEND_API_KEY`                              | Sends password-reset and order-confirmation email                         | resend.com → API Keys                                                                                                                                                                                                          |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth sign-in                                                      | Google Cloud Console → APIs & Services → Credentials → your OAuth 2.0 Client ID                                                                                                                                              |
| `STRIPE_SECRET_KEY`                           | Server-side Stripe API calls (creating PaymentIntents)                    | Stripe Dashboard → Developers → API keys (**test mode**, `sk_test_...`)                                                                                                                                               |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`          | Client-side Stripe.js — deliberately public, ships in the browser bundle | same page as above,`pk_test_...`                                                                                                                                                                                              |
| `STRIPE_WEBHOOK_SECRET`                       | Verifies that incoming webhook requests really came from Stripe           | Stripe Dashboard → Developers → Webhooks → your endpoint →**Signing secret**. This value is unique **per endpoint** — recreating the endpoint gives you a new one.                                             |

## Change X → also update Y

| If you…                                                                                      | You must also…                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Change the production domain** (custom domain, or the `*.vercel.app` alias changes) | Add the new`https://<domain>/api/auth/callback/google` to Google Cloud Console's Authorized redirect URIs. Update the webhook endpoint URL in Stripe Dashboard → Webhooks. Neon needs nothing — it doesn't know about domains.                                                                                                                                                                               |
| **Change `prisma/schema.prisma` and generate a new migration**                        | Run`prisma migrate deploy` against Neon's **direct** connection string. **Vercel's build does not do this for you** — `npm run build` is just `next build`, it never touches the database. Forgetting this is the single most common way to take the whole site down (every page 500s because a table/column the code expects doesn't exist yet). Check first with `prisma migrate status`. |
| **Rotate any secret** (DB password, Stripe keys, `AUTH_SECRET`, Google client secret) | Update it in Vercel → Settings → Environment Variables, then**Redeploy** — env var changes don't apply to an already-running deployment.                                                                                                                                                                                                                                                                |
| **Add a new environment variable** (new Server Action needing a new external service)   | Add it to`.env.example` with a comment on where to get it (keep the existing convention), and add the same key to Vercel, then redeploy.                                                                                                                                                                                                                                                                       |
| **Change which Stripe events the webhook should react to**                              | Update "Events to send" on the endpoint in Stripe Dashboard,**and** update the `if (event.type === ...)` branches in `src/app/api/webhooks/stripe/route.ts` — Stripe will happily send an event your handler silently ignores.                                                                                                                                                                        |
| **Delete/reset the Neon project or database**                                           | Update`DATABASE_URL` in Vercel (the connection string changes), re-run every migration with `prisma migrate deploy`, then `prisma db seed`. Every existing session/cart/order is gone — this is a hard reset.                                                                                                                                                                                             |
| **Leave the Google OAuth consent screen in "Testing" publishing status**                | Only the email addresses added as test users in Google Cloud Console can complete sign-in — everyone else gets blocked before reaching the redirect. Fine for a demo, but worth knowing if a recruiter tries Google login and it silently fails.                                                                                                                                                                |

## First-time deploy (from a clean machine)

1. **Neon**: create a project, copy the **pooled** connection string.
2. Run migrations + seed against it once, from your machine:
   ```
   DATABASE_URL="<neon direct connection string>" npx prisma migrate deploy
   DATABASE_URL="<neon direct connection string>" npx prisma db seed
   ```
3. **Vercel**: import the GitHub repo, add every variable from the table above (pooled Neon string for `DATABASE_URL`), deploy.
4. **Google Cloud Console**: add `https://<vercel-domain>/api/auth/callback/google` as a second Authorized redirect URI (keep the `localhost` one for local dev).
5. **Stripe**: Dashboard → Webhooks → Add endpoint → `https://<vercel-domain>/api/webhooks/stripe`, subscribe to `payment_intent.succeeded` and `payment_intent.payment_failed`, copy the signing secret into Vercel's `STRIPE_WEBHOOK_SECRET`, redeploy.
6. Promote your own account to admin — there's no seeded admin user by design:
   ```sql
   UPDATE "User" SET role = 'ADMIN' WHERE email = 'you@example.com';
   ```

   (Run in Neon's SQL editor. Sign out and back in afterward — the role is baked into the session JWT at login time, not re-read on every request.)

## Troubleshooting

**Every page returns 500 right after a deploy**
Almost always a schema migration that wasn't applied to production. Check:

```
DATABASE_URL="<neon direct connection string>" npx prisma migrate status
```

If it lists pending migrations, apply them with `prisma migrate deploy` using the same connection string.

**"Error 400: redirect_uri_mismatch" on Google sign-in**
The current domain isn't in Google Cloud Console's Authorized redirect URIs list. Add `https://<domain>/api/auth/callback/google` — exact match, including the path.

**An order is created (visible in `/admin/orders`) but never leaves `PENDING`**
The Stripe webhook either isn't reaching the app or its signature doesn't verify. Check Stripe Dashboard → Webhooks → your endpoint → recent deliveries for the actual error, and confirm `STRIPE_WEBHOOK_SECRET` in Vercel matches *this specific endpoint's* signing secret — recreating the endpoint issues a new one.

**Local dev reload-loops or crashes, but `next build` is clean**
Known Turbopack + i18next interaction bug, dev-only. `package.json`'s `dev` script is pinned to `next dev --webpack` specifically to avoid this — don't remove that flag.

**Category/product names show in Russian regardless of locale, even though translations exist**
Translations were probably seeded/entered against your **local** database only. This isn't just a "run it on prod too" fix like a migration — `Category`/`Product` ids are `cuid()`s generated independently by each database's own seed run, so the same slug has a *different* id locally vs. on Neon. A translation row copied as-is (same `entityId`) silently matches nothing on prod. When copying seed-only data (not schema) between environments, join on a stable key like `slug`, remap to the target database's actual id, then upsert — never copy the `entityId` verbatim.

**`npx prisma generate` was run but the dev server still throws `Cannot read properties of undefined` for a new model**
`src/lib/prisma.ts` caches the client on `globalThis` for HMR. Restart `next dev` after regenerating the client — it doesn't pick up new models automatically.
