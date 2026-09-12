# The Adept Library

Gated, written-lesson learning area for [Adept Advisors](https://adeptadvisors.com). Access is included with the **Advisor on Call** subscription ($600/mo via Stripe) or granted manually (Working Session clients get 90 days). Runs at `members.adeptadvisors.com` on Vercel.

**Stack:** Next.js 16 (App Router, TypeScript) · Auth.js v5 (magic links via Resend, database sessions) · Neon Postgres + Drizzle · Stripe Checkout / Customer Portal / webhooks · MDX lessons on disk.

## Layout

```
auth.ts                      Auth.js config (Resend provider, Drizzle adapter)
db/schema.ts                 Auth.js tables + memberships + progress
db/index.ts                  Lazy Neon/Drizzle client
drizzle/                     Generated SQL migrations
lib/access.ts                getAccess(email) — the gating rule
lib/stripe.ts                Lazy Stripe client + subscription -> membership sync
lib/content.ts               Loads content/modules/** (modules, lessons, prev/next)
lib/actions.ts               Server actions: magic link, sign out, progress, admin grant
components/mdx/              <Prompt>, <Worksheet>, <Callout>
app/                         Pages and route handlers
content/modules/             Lessons (MDX)
```

## Local setup

```bash
npm install
cp .env.example .env        # fill in values (see below)
npm run db:migrate          # applies drizzle/*.sql to DATABASE_URL
npm run dev
```

`npm run build` succeeds with **no** env vars set; Stripe and the database are initialised lazily and return clear errors at request time if their variables are missing.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon Postgres connection string |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` / `NEXTAUTH_URL` | `https://members.adeptadvisors.com` (Auth.js reads `AUTH_URL`; `NEXTAUTH_URL` is an alias) |
| `AUTH_RESEND_KEY` | Resend API key |
| `AUTH_EMAIL_FROM` | e.g. `Adept Advisors <hello@adeptadvisors.com>` — domain must be verified in Resend |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_live_...` / `sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Signing secret of the webhook endpoint below |
| `STRIPE_PRICE_ADVISOR` | Price ID of the $600/mo Advisor on Call subscription |
| `ADMIN_EMAILS` | Comma-separated emails that always have access and can use `/admin` |
| `NEXT_PUBLIC_SITE_URL` | `https://members.adeptadvisors.com` (used for Stripe redirect URLs) |

## Service setup

### 1. Neon

1. Create a project and database. Copy the connection string (pooled is fine) into `DATABASE_URL`.
2. Run `npm run db:migrate` locally with that `DATABASE_URL` to create the tables.
3. Schema changes: edit `db/schema.ts`, run `npm run db:generate` (writes a new file in `drizzle/`), then `npm run db:migrate`.

### 2. Resend

1. Add and verify the `adeptadvisors.com` domain in Resend.
2. Create an API key → `AUTH_RESEND_KEY`.
3. Set `AUTH_EMAIL_FROM` to a sender on the verified domain.

### 3. Stripe

1. Create a product **Advisor on Call** with a recurring monthly price of $600. Copy the price ID (`price_...`) → `STRIPE_PRICE_ADVISOR`.
2. Enable the Customer Portal (Settings → Billing → Customer portal) and allow subscription cancellation.
3. Add a webhook endpoint:
   - URL: `https://members.adeptadvisors.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the signing secret → `STRIPE_WEBHOOK_SECRET`.
4. Local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook` and use the printed `whsec_...` as `STRIPE_WEBHOOK_SECRET`.

Checkout attaches the subscriber's signed-in email as `customer_email`, and the webhook keys `memberships` by that email, so members must sign in with the same email they pay with.

### 4. Vercel

1. Import the repo; framework preset Next.js, no special build settings.
2. Add every variable from the table above in Project → Settings → Environment Variables (Production, and Preview if you want previews to work against test-mode Stripe).
3. Domains → add `members.adeptadvisors.com` and create the CNAME Vercel shows at your DNS provider.
4. Set `AUTH_URL` and `NEXT_PUBLIC_SITE_URL` to `https://members.adeptadvisors.com`.

## Access rule

`lib/access.ts → getAccess(email)` allows access when any of these holds:

- email is in `ADMIN_EMAILS`;
- `memberships.status` is `active` or `past_due` **and** `current_period_end` is in the future;
- `memberships.status` is `granted` **and** `granted_until` is in the future.

Every `/library` route calls it: unauthenticated users go to `/login`, authenticated users without access go to `/join`.

## Granting manual access (Working Session clients)

1. Sign in with an email listed in `ADMIN_EMAILS`.
2. Open `/admin`, enter the client's email (the one they booked with) and the number of days (default 90), and submit.

This upserts a `memberships` row with `status = 'granted'`, `source = 'manual'`, and `granted_until = now + N days`. Re-granting extends from now. If the person later subscribes via Stripe, the webhook overwrites the row with `source = 'stripe'`.

Via SQL, if you prefer:

```sql
insert into memberships (user_email, status, source, granted_until)
values ('client@example.com', 'granted', 'manual', now() + interval '90 days')
on conflict (user_email) do update
  set status = 'granted', source = 'manual',
      granted_until = excluded.granted_until, updated_at = now();
```

## Adding lessons

```
content/modules/<nn>-<module-slug>/module.json        {"title", "summary", "order"}
content/modules/<nn>-<module-slug>/<nn>-<lesson>.mdx   frontmatter: title, summary, minutes, order
```

The leading `nn-` is stripped from URLs (`/library/<module-slug>/<lesson-slug>`). Modules and lessons sort by `order`, then by filename. Progress is stored per `module-slug/lesson-slug`, so renaming a slug resets completion for that lesson.

Available MDX components:

```mdx
<Prompt title="Name of the prompt">Text the reader can copy with one click.</Prompt>

<Worksheet title="Exercise name">
- Each list item becomes a checkbox.
- Another step.
</Worksheet>

<Callout kind="note">Aside.</Callout>
<Callout kind="warn">Warning.</Callout>
```

## Scripts

| Script | Does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint (`eslint-config-next`) |
| `npm run db:generate` | Generate a migration from `db/schema.ts` |
| `npm run db:migrate` | Apply migrations to `DATABASE_URL` |
