# Trip Calculator

A web app for estimating **fuel cost** for a trip in **Ukraine**. Enter distance manually or build a route on the map (point A → optional intermediate stops → point B). Currency is **UAH**. You can optionally split the total among a number of people.

The UI defaults to **Ukrainian**; **English** is available via the language switcher.

## Getting started

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## OpenRouteService API key

Map routing and address search (biased to Ukraine) use **OpenRouteService** (free tier with a daily request limit).

1. Sign up and create a key: [openrouteservice.org — Dev Dashboard / Sign up](https://openrouteservice.org/dev/#/signup).
2. In the project root, create a `.env` file from `.env.example`:

   ```bash
   cp .env.example .env
   ```

3. Set **`VITE_ORS_API_KEY`** to your key (single line, no quotes).

4. Restart `npm run dev`.

Without a key, the app still runs: you can enter distance manually, but routing and address search stay disabled.

## Tests

```bash
npm run test:run
```

Core logic is covered in `src/lib` and `src/hooks` (cost calculation, per-person split, calculator hook).

## Tech stack

Vite, React, TypeScript, Tailwind CSS, MUI, Leaflet / react-leaflet, i18next, Vitest, ESLint.

## Map tiles

Map tiles © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.

## GitHub Pages

This repo includes [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml). It builds on every push to `main` and publishes the `dist` folder to GitHub Pages.

### One-time setup (repository settings)

1. **GitHub** → your repo → **Settings** → **Pages**.
2. Under **Build and deployment** → **Source**, choose **GitHub Actions** (not “Deploy from a branch”).
3. **Secrets and variables** → **Actions** → **New repository secret**:
   - Name: `VITE_ORS_API_KEY`  
   - Value: your OpenRouteService API key (same as in local `.env`).  
   If you skip this, the deployed site still loads, but map routing and search will not work until the secret is set.

After the first successful workflow run, open **Settings → Pages** again: GitHub shows the public URL (usually `https://<username>.github.io/<repository-name>/`).

### Local build with the same base path as Pages

Project sites are served under `/<repo-name>/`. CI sets `GITHUB_PAGES_BASE` automatically. To reproduce locally:

```bash
GITHUB_PAGES_BASE=/your-repo-name/ npm run build
npm run preview
```

Replace `your-repo-name` with your GitHub repository name.

---

## Attribution: AI-generated codebase

**This application was produced entirely with the help of artificial intelligence (AI coding assistants). The human maintainer did not manually write any line of application source code**—generation, structuring, and iteration were done through AI-assisted workflows.
