# PROJECT_CONTEXT.md

> Primary context source for future AI sessions (per
> [AI_DEVELOPMENT_RULES.md](AI_DEVELOPMENT_RULES.md)).
> Keep ≤1000 words and in sync with the implementation. Last updated: 2026-05-30.
>
> **Related docs:** [CLAUDE.md](CLAUDE.md) (session entrypoint: rules/practices/features) ·
> [TECH_DEBT.md](TECH_DEBT.md) (debt backlog) · [README.md](README.md) (human setup/deploy).

## What it is

**CalorieSnap** — a React PWA: photograph a meal, get instant AI nutrition
analysis, and track against personalized daily calorie/macro targets.

## Current architecture

Monorepo with two independent packages plus Firebase config at the root.

- **`web/`** — Frontend. React 19 + TypeScript + Vite, shipped as a PWA to
  **Firebase Hosting**. Deps are intentionally minimal: `firebase` v9,
  `lucide-react`, `react`/`react-dom`. Storybook documents the UI primitives.
- **`server/`** — Backend. A single Express app (`server/server.js`, ~216 lines)
  on **Google Cloud Run**. Exposes `POST /analyze`, which makes two
  `claude-sonnet-4-6` calls: (1) validate the image is food, (2) return
  structured nutrition. Uses `@anthropic-ai/sdk`; needs `ANTHROPIC_API_KEY`.
- **Database** — Firestore. **AI** — Anthropic Claude (server-side only).
  **Auth** — Firebase Google Sign-In.

### Frontend layout (`web/src/`) — type-based, flat

- `screens/` — `LoginScreen`, `MainScreen`, `HistoryScreen`, `ProfileScreen`.
- `services/` — `authService`, `mealService`, `profileService` (all business
  logic lives here; see Rule 5/6).
- `ui/` — ~28 design-system primitives (Button, Card, Modal, Badge, FormField,
  SegmentedControl, ProgressRing/Bar, Stat, BottomNav, LanguageToggle, …) with
  `.stories.tsx` and a single `index.ts` barrel.
- `components/` — app-specific composites (`ResultCard`, `Toast`, `InstallBanner`).
- `i18n/` — `I18nProvider` + `dictionaries.ts` (RU/EN, English default).
- `config/firebase.ts` — Firebase init. `styles/tokens.css` — design tokens.
- `hooks/useInstallPrompt.ts` — PWA install. `main.tsx` / `App.tsx` — entry/root.

## Main services

- **`authService`** — Google Sign-In via `signInWithPopup` by default; falls back
  to `signInWithRedirect` only in a standalone (installed) PWA, or when the popup
  is blocked. `completeRedirectSignIn()` runs on load. Dev-only anonymous sign-in
  (`signInDev`) for local work. `onAuthChange`, `signOut`.
- **`mealService`** — client-side image compression (canvas, max width 1920),
  upload, and Firestore CRUD on the `meals` collection (`addDoc`, query by user
  + `orderBy`, `deleteDoc`). Defines the `Meal` interface.
- **`profileService`** — Firestore CRUD on `userProfiles` and the **deterministic
  nutrition engine** `calculateTargets()` (pure function): Mifflin-St Jeor BMR →
  TDEE via `ACTIVITY_MULTIPLIERS` (sedentary 1.2, light 1.375, moderate 1.55,
  active 1.725, very_active 1.9) → goal correction (−500 kcal cut / +400 kcal
  bulk, ≥1 kg target delta) → 1200 kcal safety floor → macros (protein 1.8 g/kg,
  fat 25% of kcal, carbs = remainder). **Do not change this formula without an
  explicit request.**

## Data model (Firestore)

- **`meals/{mealId}`** — `userId`, `dishName`, `calories`, `protein`, `fat`,
  `carbs`, `fiber?`, `confidence`, `portionSize`, `ingredients?`, `notes?`,
  `imageUrl?`, `createdAt`. Owner-only access (rule keys off `userId`).
- **`userProfiles/{userId}`** — `userId`, `heightCm`, `weightKg`,
  `targetWeightKg`, `age`, `gender`(male|female), `activityLevel`, `updatedAt`.
  Doc id **is** the uid; owner-only access.

Security: `firestore.rules` enforces `request.auth.uid` ownership on both
collections (separate `create` check on `meals` against `request.resource`).

## Completed features

- Photograph / pick a meal → AI nutrition analysis (server `/analyze`).
- Personalized daily calorie + macro targets from the user profile.
- Meal history with stats; meal delete.
- Google Sign-In (popup desktop / redirect standalone-PWA).
- Unified **"bubble" design system** — tokens + UI primitives + Storybook.
- RU/EN i18n with English as the default; language flag toggle in the header.
- PWA install banner.

## Pending / future

- (none formally tracked in-repo; capture new work items here as they arise.)

## Known issues / technical debt

Authoritative, living backlog: **[TECH_DEBT.md](TECH_DEBT.md)** (reviewed every
session). At a glance: type-based (not feature-based) folder structure, no
automated tests, missing rule-mandated docs, Firebase SDK on v9.

## Environment configuration

Two isolated Firebase projects (each with own Firestore/Auth/Storage/Hosting +
Cloud Run service), mapped in `.firebaserc`:

| Env | Firebase project | Trigger |
|-----|------------------|---------|
| **prod** | `eatappmain-e7503` | merge to `main` |
| **staging** | `caloriesnap-staging` | open/update a PR |

CI/CD: `.github/workflows/deploy.yml` builds the frontend with the env's Firebase
config, deploys Hosting + Firestore/Storage rules, and builds/pushes/deploys the
Cloud Run server image. Per-env secrets live in GitHub Environments
(`production` / `staging`). Frontend config via `VITE_FIREBASE_*` and `VITE_API_URL`;
server needs `ANTHROPIC_API_KEY` and `STORAGE_BUCKET`. **No secrets are hardcoded.**
