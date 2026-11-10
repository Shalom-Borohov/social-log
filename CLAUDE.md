# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

מפגשים: a personal, offline-only iPhone PWA for logging meetups with friends (who, when, where, how long, how it was). Hebrew, RTL. There is no server or account: all data lives in IndexedDB on the device, and a JSON backup file can be exported and imported.

## Commands

- `npm run dev`: Vite dev server at `http://localhost:5173/social-log/`.
  - The app uses a hash router, so deep links look like `/social-log/#/tabs/friends`.
- `npm test`: the whole Vitest suite (jsdom, `--maxWorkers=25%`).
  - One file: `npx vitest run test/unit/repo.test.ts`
- `npm run lint`: oxlint.
- `npm run build`: `tsc -b && vite build`. This is the type check; there is no separate `tsc` script.

Every PR that ships raises `version` in `package.json` (minor for features, patch for fixes) and adds a release to `src/appUpdate/changelog.ts` with short Hebrew lines under `features` and `fixes`.

CI (`.github/workflows/ci.yml`) runs lint, test and build on PRs. `deploy.yml` deploys to GitHub Pages on every push to `main`, with base path `/social-log/`.

## Sources of truth

- `docs/specs/2026-11-08-social-log-design.md`: numbered product decisions, assumptions and colour tokens.
  - New behaviour is added there as a new numbered decision: "(added YYYY-MM-DD, extends/clarifies N)".
  - Check it before changing any rating, ring, nudge, count or navigation rule.
- `PRODUCT.md`: product principles.

## Architecture

Imports go downward only: `pages` → `data` / `domain` → `copy`. `Tabs`, `pages/settings` and `recovery` also import `appUpdate`.

- **`src/domain/`**: pure functions over people, groups and meetups, with no React and no Dexie. Types live in `types.ts`.
- **`src/domain/logicalDay.ts`**: dates are `'YYYY-MM-DD'` strings everywhere; convert only through `parseIsoDate` / `toIsoDate` (noon-pinned). A day rolls over at 03:00.
- **`src/data/`**: the Dexie database `social-log` with tables `people`, `groups` and `meetups`. Every write goes through `repo.ts`. Pages read through the hooks in `hooks.ts` (`useLiveQuery`) and derive everything else in render.
- **`src/data/backup.ts`**: the valibot schema for the backup file. It stays `version: 1`; new fields must be optional.
- **`src/pages/<feature>/`**: calendar, friends, log, settings. Each has its own `copy.ts` and CSS.
- **`src/copy/`** and each page's `copy.ts`: every user-visible string is an `as const` copy constant. Don't inline Hebrew text in components.
- **UI**: Ionic React in iOS mode; overlays use the Ionic hooks. Plain CSS with tokens in `theme.css`. Indigo means only the מעולה rating; actions use ink. Ratings are never shown by colour alone.
- **`src/recovery/`**: an error boundary above `IonApp` with a plain screen that can still export/import a backup and apply a waiting update.
- **`src/appUpdate/`**: the update bar, the "מה חדש" sheet and `changelog.ts`.

## Tests

- Tests live in `test/unit` (domain and data) and `test/ui` (pages rendered with `renderAt(path)`).
- Storage isn't mocked: `fake-indexeddb` backs the real Dexie db. Call `resetDb` in `beforeEach`.
- Use `freezeDate` (in `test/helpers/clock.ts`) to pin "today".
- jsdom has no layout, so check CSS changes in a browser.
