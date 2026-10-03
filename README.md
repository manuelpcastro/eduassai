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
| Antes y después | `#/antes-despues` | The child puts two everyday actions in order (for example, socks before shoes). Cards can be read aloud with the 🔊 button. |

## Project layout

```
frontend/                 React + TypeScript app (Vite)
  src/i18n/               i18next setup and translations (locales/es.json, en.json)
  src/components/         Shared UI (layout, language picker, read-aloud button)
  src/modules/<module>/   One folder per learning module
  src/pages/              Top-level pages (home)
.github/workflows/        CI and the GitHub Pages deployment
.devcontainer/            GitHub Codespaces / Dev Containers setup
```

There's no backend yet. When one is needed it can live in a `backend/`
folder next to `frontend/`.

## Development

The easiest option needs no local setup: on GitHub, click **Code → Codespaces →
Create codespace**. Dependencies install automatically. Then run:

```bash
cd frontend
npm run dev        # start the app with live reload
npm test           # run the tests
npm run lint       # check the code
npm run build      # production build into frontend/dist
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
  `src/App.tsx`, and add a tile to `MODULES` in `src/pages/HomePage.tsx`.

## Deployment (GitHub Pages)

Every push to `main` runs the tests, builds the site and publishes it to
`https://<user>.github.io/eduassai/`.

One-time setup: in the repository go to **Settings → Pages** and set
**Source** to **GitHub Actions**.

The app uses hash URLs (`/#/antes-despues`) so links keep working on GitHub
Pages. If the repository is renamed, the build picks up the new name
automatically.
