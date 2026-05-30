# CLAUDE.md — CalorieSnap playbook

> **Read this at the start of every session.** It is auto-loaded into context.
> This file is the CalorieSnap-specific list of **rules, practices, and features**.
> Generic methodology: [AI_DEVELOPMENT_RULES.md](AI_DEVELOPMENT_RULES.md). Current
> architecture & state: [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md). Debt backlog:
> imported at the bottom from [TECH_DEBT.md](TECH_DEBT.md).

## Session-start checklist
1. Read this file and skim [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) (current state).
2. **Review the tech-debt backlog** (imported below). For **each open item**, decide:
   - **Address now** if you're already touching that area, or it's cheap and reduces risk.
   - **Defer** otherwise — and record the decision + date in `TECH_DEBT.md`.
3. Only then start the task. After a major task, update `PROJECT_CONTEXT.md` and log any new debt in `TECH_DEBT.md`.

## Project rules (CalorieSnap-specific)
- **Business logic lives in services only** (`authService`, `mealService`, `profileService`). Screens/components display data — no formulas, no DB calls in UI.
- **The nutrition formula is LOCKED.** Mifflin-St Jeor in `profileService.calculateTargets` (pure function); activity multipliers 1.2 / 1.375 / 1.55 / 1.725 / 1.9; goal correction −500 / +400 kcal; 1200 kcal floor. Do **not** change without an explicit request. The LLM never invents calorie/macro numbers — the server returns meal values, the service computes targets.
- **Reuse the design system** in [web/src/ui/](web/src/ui/) (Button, Card, Modal, Badge, FormField, SegmentedControl, ProgressRing/Bar, Stat, BottomNav, …). Check `ui/index.ts` before building any new primitive.
- **i18n is mandatory.** Every user-facing string goes through `I18nProvider` + `dictionaries.ts`, in **both** `ru` and `en`. Default language is English.
- **Auth flow is intentional.** `signInWithPopup` is the default; `signInWithRedirect` only in a standalone (installed) PWA or when the popup is blocked. Don't "simplify" `authService`.
- **Environment separation.** Never deploy experimental work to prod. PR → staging (`caloriesnap-staging`); merge to `main` → prod (`eatappmain-e7503`). Secrets only via env / GitHub Environments — never hardcoded.
- **Firestore discipline.** Collections are `meals` and `userProfiles`, owner-only by uid. Reuse field names from the TS interfaces in the services; don't invent synonyms.
- **Server.** Single Express app; `POST /analyze` calls `claude-sonnet-4-6` twice (validate image, then analyze). Keep the model id current with the latest capable Claude.
- **Keep docs in sync.** Update `PROJECT_CONTEXT.md` and `TECH_DEBT.md` when architecture or debt changes.

## Practices
- Think before coding: search for an existing component/service/util before adding one.
- Typed inputs/outputs; avoid `any`. Every feature handles loading / empty / error / success states.
- Log important operations (auth, onboarding, nutrition calc, API failures).
- Final report after a major task: summary, changed files, architecture impact, risks, manual test steps, future improvements.

## Features (today)
- Photo / gallery → AI nutrition analysis (server `/analyze`).
- Personalized daily calorie + macro targets (profile-based, deterministic).
- Meal history with stats; delete a meal.
- Google Sign-In (popup desktop / redirect standalone PWA).
- Unified "bubble" design system + Storybook.
- RU/EN i18n (EN default), header flag language toggle.
- PWA install banner.

Full detail: [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md).

---

## Tech-debt backlog (review every session — see step 2)
@TECH_DEBT.md
