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

---

## Attribution: AI-generated codebase

**This application was produced entirely with the help of artificial intelligence (AI coding assistants). The human maintainer did not manually write any line of application source code**—generation, structuring, and iteration were done through AI-assisted workflows.
