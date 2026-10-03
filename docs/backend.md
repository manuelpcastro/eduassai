# Backend and accounts

Accounts are **optional**. Every module works without one, and anything a user
creates is saved in their browser. Signing in saves it privately in their
account so it's available on any device.

## Architecture

```
Browser (GitHub Pages)                Cloudflare Workers            Supabase (free)
┌───────────────────┐  sign in/up   ┌──────────────────────────────────────────────┐
│ frontend (React)  │──────────────▶│ Supabase Auth (accounts, emails, tokens)      │
│                   │               └──────────────────────────────────────────────┘
│                   │  REST + token  ┌─────────────────┐  SQL   ┌──────────────────┐
│                   │──────────────▶│ backend (Hono)  │───────▶│ PostgreSQL        │
└───────────────────┘               │ checks token,   │        │ schema "app"      │
                                    │ validates data  │        └──────────────────┘
                                    └─────────────────┘
```

- **frontend/** only talks to Supabase to sign in. All data goes through our API.
- **backend/** is a TypeScript API built with [Hono](https://hono.dev). It checks
  the user's access token on every request, validates what is stored, and only
  ever reads or writes the signed-in user's rows. The same code runs on
  Cloudflare Workers (production) and Node (local development), so it can move
  to a container or VM later without a rewrite.
- **PostgreSQL** holds the data in its own `app` schema, which Supabase does not
  expose through its automatic public API: only the backend can reach it.
  Schema changes are versioned migrations in `backend/drizzle/` (Drizzle ORM).

Everything used is free: GitHub Pages, Cloudflare Workers free plan (100,000
requests a day), and Supabase free plan (500 MB database, 50,000 monthly users).
Free Supabase projects pause after a week without activity, so the API runs a
tiny daily query (a Cloudflare cron) to keep it awake during school holidays.

## Data model: records shared by all modules

There is one table, `app.records`:

| column | meaning |
| --- | --- |
| `id` | UUID, chosen by the client so saves can be retried safely |
| `owner_id` | the user's id from their sign-in token |
| `module`, `kind` | which collection it belongs to, e.g. `beforeAfter` / `situation` |
| `data` | the record itself, as JSON |
| `created_at`, `updated_at` | timestamps |

A module adds a new kind of record without touching the database:

1. **Backend:** add its schema to `backend/src/collections.ts`. The API rejects
   unknown collections and anything that doesn't match the schema, and caps how
   many records each user can have.
2. **Frontend:** declare a `Collection` and use `useRecords(collection)`
   (see `frontend/src/modules/before-after/situations.ts`). It saves to the
   account when signed in and to the device otherwise.

If a module ever needs relational queries (for example, reports across many
records), give it its own table next to `records` with the same `owner_id`
column, and add a migration (`npm run db:generate` in `backend/`).

## API

All `/v1` routes need `Authorization: Bearer <Supabase access token>`.

| method | path | |
| --- | --- | --- |
| GET | `/health` | no sign-in needed |
| GET | `/v1/records/:module/:kind` | the user's records in a collection |
| PUT | `/v1/records/:module/:kind/:id` | create or replace, body `{ "data": … }` |
| DELETE | `/v1/records/:module/:kind/:id` | delete |

## One-time setup

Until these steps are done the site keeps working, just without accounts.

### 1. Supabase (accounts and database)

1. Create a free account at <https://supabase.com> and a new project. Choose a
   region in the EU (for example Frankfurt), since the users are in Spain.
2. **Authentication → URL Configuration:** set **Site URL** to
   `https://manuelpcastro.github.io/eduassai/` and add
   `http://localhost:5173/**` to **Redirect URLs**.
3. **Authentication → Emails:** optionally translate the confirmation email to Spanish.
4. Note down:
   - **Project URL** (Project Settings → API), e.g. `https://abcd.supabase.co`
   - **Publishable key** (Project Settings → API Keys), starts with `sb_publishable_`
   - **Database connection string:** the **Connect** button → *Transaction
     pooler*, with your database password filled in.

### 2. Cloudflare (the API)

1. Create a free account at <https://dash.cloudflare.com>.
2. Open **Workers & Pages** once so Cloudflare assigns your `workers.dev`
   subdomain. The API will be at `https://eduassai-api.<subdomain>.workers.dev`.
3. **My Profile → API Tokens → Create Token**, template **Edit Cloudflare Workers**.
4. Note your **Account ID** (shown on the Workers & Pages overview).

### 3. GitHub (connects it all)

In the repository: **Settings → Secrets and variables → Actions**.

| type | name | value |
| --- | --- | --- |
| Secret | `CLOUDFLARE_API_TOKEN` | the token from step 2 |
| Secret | `CLOUDFLARE_ACCOUNT_ID` | the account ID from step 2 |
| Secret | `DATABASE_URL` | the connection string from step 1 |
| Variable | `SUPABASE_URL` | the project URL |
| Variable | `SUPABASE_PUBLISHABLE_KEY` | the publishable key |
| Variable | `API_URL` | `https://eduassai-api.<subdomain>.workers.dev` |

Then run **Actions → Deploy → Run workflow**. It applies the database
migrations, deploys the API, and rebuilds the site with accounts switched on.
If the site isn't served from `manuelpcastro.github.io`, update
`ALLOWED_ORIGINS` in `backend/wrangler.toml`.

## Local development

```bash
cd backend && npm run dev     # API on http://localhost:8787
cd frontend && npm run dev    # site on http://localhost:5173
```

Without configuration the API uses a temporary in-memory database and the site
runs without accounts. To try accounts locally, copy `backend/.env.example` to
`backend/.env` and `frontend/.env.example` to `frontend/.env.local` and fill in
the Supabase values.

## Privacy

**Photos never leave the device.** A photo added to a situation is stored in
that browser only (`frontend/src/lib/photos.ts`). Records hold just the photo's
id, even when saved to an account, and the API rejects any record that carries
image data. On another device the card shows a placeholder, and the editor asks
for a new picture.

What signed-in users store in Supabase is their email (for signing in) and
their records: situation titles, card texts and ARASAAC pictogram numbers.
Before sharing the site widely, add a privacy notice saying so, and how to
delete an account.
