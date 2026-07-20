# Sanfreight Admin

A React (Vite) admin panel for managing Sanfreight's news articles and job
postings. Talks to the Flask API in [`/server`](../server) — see that
directory's README for backend setup.

Ported from an internal Exellar admin panel and rebranded/rewired for
Sanfreight; the UI and API shape are otherwise unchanged.

## Local development

```bash
cd admin
cp .env.example .env   # VITE_API_BASE=http://localhost:5000
npm install
npm run dev
```

Requires the backend (`/server`) running locally on the URL set in
`VITE_API_BASE` (default `http://localhost:5000`).

Default seeded login (created automatically on first backend startup):

- Email: `admin@sanfreight.com`
- Password: `Admin@123`

**Change this password (or delete/replace the seeded admin user) before
deploying anywhere reachable from the internet.**

## Deploying

This is a static Vite build (`npm run build` → `dist/`), deployable to
Vercel, Netlify, or any static host. `vercel.json` is already set up for a
Vercel deployment.

Set the `VITE_API_BASE` environment variable at deploy time to the URL of
your deployed backend (see `/server`'s README). The repo currently ships a
placeholder (`https://sanfreight-api.onrender.com`) that does not exist yet
— update `admin/.env.production` and/or the Vercel project's environment
variables once the backend is actually deployed somewhere.
