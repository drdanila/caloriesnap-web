# PROJECT_CONTEXT.md

> Primary context source for future AI sessions (per
> [AI_DEVELOPMENT_RULES.md](AI_DEVELOPMENT_RULES.md)).
> Keep ≤1000 words and in sync with the implementation. Last updated: 2026-05-31.
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
- **`server/`** — Backend. A single Express app (`server/server.js`)
  on **Google Cloud Run**. Exposes `POST /analyze`, which makes two
  `claude-sonnet-4-6` calls: (1) validate the image is food, (2) return
  **evidence-first** structured nutrition via a **forced tool call**
  (`record_meal_analysis` `input_schema` — no more regex JSON parsing). A system
  prompt enforces the AI-config spec: report only what's visible (no inferred
  oils/cooking/spices), calorie **range** when confidence isn't high, `"unknown"`
  portion below 80% confidence, poor-image → lower confidence, and concise text
  (≤1 summary / ≤3 recommendations / ≤2 warnings). Uses `@anthropic-ai/sdk`;
  needs `ANTHROPIC_API_KEY`. Low-confidence/poor-image results are **flagged, not
  blocked** — they still save.
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
- `lib/` — pure presentation helpers (`nutrition.ts`: `confidenceBand`,
  `formatCalories`, `isLowConfidence`, `hasPortion`) shared by `ResultCard` +
  `HistoryScreen`. Covered by Vitest (`nutrition.test.ts`, run with `npm test`).
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

- **`meals/{mealId}`** — `userId`, `dishName`, `calories` (canonical point value
  = totals anchor), `caloriesMin?`/`caloriesMax?`, `protein`, `fat`, `carbs`,
  `fiber?`, `confidence`, `healthScore?`, `portionSize` (string|null when
  unknown), `ingredients?`, `allergens?`, `tags?`, `mealType?`
  (breakfast|lunch|dinner|snack|unknown), `imageQuality?` (good|poor), `summary?`,
  `recommendations?`, `warnings?`, `notes?` (legacy), `imageUrl?`, `createdAt`.
  All analysis fields beyond the originals are **optional/additive** (old docs
  stay valid; no migration). Owner-only access (rule keys off `userId`).
- **`userProfiles/{userId}`** — `userId`, `heightCm`, `weightKg`,
  `targetWeightKg`, `age`, `gender`(male|female), `activityLevel`, `updatedAt`.
  Doc id **is** the uid; owner-only access.

Security: `firestore.rules` enforces `request.auth.uid` ownership on both
collections (separate `create` check on `meals` against `request.resource`).

## Completed features

- Photograph / pick a meal → **evidence-first** AI nutrition analysis (server
  `/analyze`): calorie ranges + confidence bands, health score, allergens, tags,
  meal type, and concise summary/recommendations/warnings; low-confidence meals
  are flagged with a retake prompt but still saved.
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
session). At a glance: type-based (not feature-based) folder structure; automated
tests still thin (Vitest now covers `lib/nutrition.ts` only); missing rule-mandated
docs; Firebase SDK on v9; server `/analyze` normalization untested.

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
