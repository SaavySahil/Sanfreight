# Sanfreight Admin Backend

A Flask + SQLAlchemy API backing the admin panel in [`/admin`](../admin). It
serves news articles and job postings — the main Sanfreight Next.js site
(`/src/app/en/news` and `/src/app/en/job-offers`) reads from the public
endpoints of this API server-side.

Ported from an internal Exellar backend and rebranded/rewired for
Sanfreight; the models, routes, and auth flow are otherwise unchanged
(Applications/Content endpoints exist and still work, but nothing on the
Sanfreight site currently reads from them — Articles and Jobs are the two
models actually wired up). The Projects feature (construction-business
portfolio entries) was removed entirely — it had no relevance to a
logistics company.

## Local development

```bash
cd server
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # defaults to a local SQLite DB
python3 run.py                  # http://localhost:5000
```

On first run it auto-creates the database tables and seeds:
- An admin user — `admin@sanfreight.com` / `Admin@123` (**change this
  before deploying anywhere public**)
- A few default `ContentField` rows (homepage tagline, about summary, etc.)

### Seeding existing Sanfreight content

The 4 existing news articles and 2 existing job postings that used to live
only as static files were migrated in with:

```bash
# from the repo root, with this backend running locally
python3 scripts/migrate_legacy_content.py --email admin@sanfreight.com --password Admin@123
```

Re-run the same command with `--api https://your-deployed-backend.example.com`
once you deploy, to seed a fresh production database the same way.

## Deploying

This needs a real host that runs a persistent Python process (Vercel does
not run Flask/SQLAlchemy apps like this) — Render, Railway, Fly.io, or
similar all work. You'll need:

1. **A Postgres database.** Set `DATABASE_URL` to its connection string
   (`postgres://...` or `postgresql://...` — either works, the app
   normalizes it).
2. **Environment variables** on the hosting platform — see `.env.example`
   for the full list. At minimum: `FLASK_ENV=production`, `SECRET_KEY`
   (a long random string — do not reuse the dev default), `DATABASE_URL`.
3. **CORS**: the allow-list in `app/__init__.py` already covers
   `*.vercel.app`, `*.onrender.com`, `*.pages.dev`, `*.github.io`, and
   localhost. If Sanfreight ends up on a custom domain outside those, add
   it to the `_ALWAYS_ALLOWED` regex.
4. Point the two clients at the deployed URL:
   - `admin/.env.production` (or the admin panel's Vercel env var)
     `VITE_API_BASE`
   - The main Sanfreight Next.js site's `API_BASE_URL` environment
     variable (Vercel project settings — this repo's own `.env.example`
     documents it)

None of this infrastructure (database, hosting service, DNS) is
provisioned yet — the code is ready to point at it once it exists.
