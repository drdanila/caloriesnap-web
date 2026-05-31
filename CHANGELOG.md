# Changelog

All notable, **big** developments in CalorieSnap are recorded here — features,
architecture, infra, and major quality work. This is the human-readable history of
"what shipped and when". Day-to-day fixes live in git; this file is the milestone view.

Format loosely follows [Keep a Changelog](https://keepachangelog.com/); the project
uses Firebase environments (PR → **staging**, merge to `main` → **prod**), so an
entry is "released" once it has merged to `main`.

> **How to maintain (read this before closing a session):** after any sizeable task,
> add a bullet under **[Unreleased]** in the right category (Added / Changed / Fixed /
> Quality). When that work merges to `main`, rename the section to a version + date.
> Keep entries short and outcome-focused — link the PR/issue number when there is one.
> Versions below **1.0.0** were reconstructed from git history on 2026-05-31.

---

## [Unreleased]

_Nothing yet._

## [1.0.1] – 2026-05-31 — Testing & CI hardening

### Quality — Testing & CI
- **Service & server logic now unit-tested** (closes TD-02 + TD-05):
  - `web`: `profileService.calculateTargets` (locked Mifflin–St Jeor — BMR ±offset,
    all 5 activity multipliers, −500/+400 goal correction + boundaries, 1200 kcal
    floor, macro formulas) and the new pure `mealService.mapMealDoc` (Firestore
    Timestamp→Date, missing-`createdAt` fallback, id override, passthrough).
  - `server`: extracted the `/analyze` normalization into pure
    `server/lib/normalizeAnalysis.js` and added a Vitest runner + 22 cases (calorie/
    macro clamps, `min ≤ calories ≤ max`, confidence defaults/bounds, `healthScore`
    clamp, array defaults & rec/warning caps, enum coercion, `portionSize`→null).
- **Tests run as deploy gates** in `.github/workflows/deploy.yml`: web `npm test` in
  the lint job; a new `server-test` job gates `server-deploy`.
- `server/Dockerfile` now copies `lib/` into the image; `server/package-lock.json`
  regenerated with npm 10 to keep cross-platform native binaries for CI `npm ci`.

---

## [1.0.0] – 2026-05-31 — Evidence-first AI analysis
- **Evidence-first meal analysis** (#5): the model reports only what's visible (no
  inferred oils/cooking/spices), via a **forced tool call** with a strict
  `input_schema` (replaced regex JSON parsing). Adds calorie **ranges**, a 0–100
  **confidence** score, `healthScore`, structured `mealType`/`imageQuality`,
  ingredients/allergens/tags, and concise summary/recommendations/warnings.
- Low-confidence / poor-image results are **flagged, not blocked** — they still save.
- Vitest introduced in `web/` with the first unit tests (`lib/nutrition.ts` helpers).

## [0.4.0] – 2026-05-30 — Design system, i18n & docs
- **Unified "bubble" design system** (#4): ~28 reusable UI primitives + design tokens,
  documented in **Storybook**.
- **RU/EN internationalization** via `I18nProvider` + `dictionaries.ts`; language
  toggle moved to the header as a flag; **English set as the default** for all users.
- **AI session playbook** added: `CLAUDE.md`, `PROJECT_CONTEXT.md`, `TECH_DEBT.md`,
  `AI_DEVELOPMENT_RULES.md`.

## [0.3.0] – 2026-05-30 — Environments & infrastructure
- **Prod/staging separation** (#2): two Firebase projects with CI — PR → staging,
  merge to `main` → prod; per-env secrets via GitHub Environments.
- **Multi-site hosting** (#3): prod also serves the branded `caloriesnapapp` site.
- **Frontend/backend split** into `web/` and `server/`; **Docker** added for the
  Cloud Run API.
- **Auth hardening**: `signInWithPopup` by default, `signInWithRedirect` only in an
  installed/standalone PWA; resolve redirect before registering the auth listener.
- CI/CD parallelized and optimized (smart conditional builds, vendor code-splitting).

## [0.2.0] – 2026-05-30 — Profiles & meal management
- **User profiles** with **personalized daily calorie + macro targets** (deterministic
  Mifflin–St Jeor in `profileService`).
- **Meal management**: delete meals, expandable cards, server-side image upload to
  Firebase Storage, date navigation, meal times, meal-count fixes.

## [0.1.0] – 2026-05-29 — Initial MVP
- Photo / gallery → **AI nutrition analysis** via the Express `/analyze` endpoint.
- Firestore persistence with **owner-only security rules**; meal history.
- Initial UI polish: toast notifications, Russian language, image uploads, CORS, favicon.
