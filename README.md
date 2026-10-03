# EduAssAI

A website for teachers and families to work through everyday tasks with
children who need extra support, including autistic children. The interface is
deliberately calm and predictable: large text and buttons, soft colors, no
timers or animations, and gentle feedback.

The interface is in **Spanish** by default and supports other languages
(English is included).

## Modules

| Module | Route | What it does |
| --- | --- | --- |
| Antes y después | `#/antes-despues` | The child puts two everyday actions in order (for example, socks before shoes). Cards can be read aloud with the 🔊 button. Parents and teachers can create their own situations with ARASAAC pictograms or their own photos (`#/antes-despues/crear`). |

Accounts are optional. Without one, custom situations are saved in the
browser; signed-in users get them saved privately in their account. See
[docs/backend.md](docs/backend.md).

## Pictograms

Pictures come from [ARASAAC](https://arasaac.org) through its public API,
called directly from the browser. The built-in situations look pictograms up by
keyword (see `scenarios.ts`) and fall back to an emoji when offline.

ARASAAC pictograms are by Sergio Palao, owned by the Government of Aragon and
licensed [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/):
non-commercial use only, with attribution (shown in the site footer).

## Project layout

```
frontend/                 React + TypeScript app (Vite), deployed to GitHub Pages
  src/i18n/               i18next setup and translations (locales/es.json, en.json)
  src/auth/               Optional sign-in (Supabase Auth)
  src/data/               Saving records: to the account (API) or the device
  src/components/         Shared UI (layout, language picker, read-aloud button)
  src/modules/<module>/   One folder per learning module
  src/pages/              Top-level pages (home)
backend/                  API (Hono + PostgreSQL), deployed to Cloudflare Workers
  src/collections.ts      Which records each module can store, and their schemas
  src/routes/             HTTP endpoints
  src/db/                 Database schema and connection (Drizzle ORM)
  drizzle/                Database migrations
docs/                     Architecture and setup notes
.github/workflows/        CI and deployment
.devcontainer/            GitHub Codespaces / Dev Containers setup
```

The backend, its data model and the one-time setup are described in
[docs/backend.md](docs/backend.md).

## Development

The easiest option needs no local setup: on GitHub, click **Code → Codespaces →
Create codespace**. Dependencies install automatically. Then run:

```bash
cd frontend
npm run dev        # start the app with live reload
npm test           # run the tests
npm run lint       # check the code
npm run build      # production build into frontend/dist

cd backend
npm run dev        # start the API on http://localhost:8787
npm test           # run the API tests (in-memory Postgres)
```

To work locally instead, install Node.js 22 and run the same commands.

## Adding content

- **A new before/after situation:** add an entry to
  `frontend/src/modules/before-after/scenarios.ts`, then add its texts under
  `scenarios.<id>` in every file in `frontend/src/i18n/locales/`.
- **A new language:** copy `es.json` to `<code>.json`, translate it, and register
  it in `LANGUAGES` in `frontend/src/i18n/index.ts`. A test checks that every
  language has the same keys as Spanish.
- **A new module:** create a folder under `src/modules/`, add its routes in
  `src/App.tsx`, and add a tile to `MODULES` in `src/pages/HomePage.tsx`. If it
  saves data, see "Data model" in [docs/backend.md](docs/backend.md).

## Deployment (GitHub Pages)

Every push to `main` runs the tests, deploys the API (once configured), builds
the site and publishes it to `https://<user>.github.io/eduassai/`.

One-time setup: in the repository go to **Settings → Pages** and set
**Source** to **GitHub Actions**.

The app uses hash URLs (`/#/antes-despues`) so links keep working on GitHub
Pages. If the repository is renamed, the build picks up the new name
automatically.
