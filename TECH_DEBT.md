# TECH_DEBT.md — CalorieSnap

> Living backlog of known nuances / shortcuts that we may want to fix later.
> **Reviewed at the start of every session** (imported by [CLAUDE.md](CLAUDE.md)). For each
> **Open** item, decide whether to address it now or defer — and record the decision
> in its **Log** line with a date. Close items when done; don't delete the history.
>
> **Related docs:** [CLAUDE.md](CLAUDE.md) (rules/practices/features) ·
> [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) (current state) ·
> [AI_DEVELOPMENT_RULES.md](AI_DEVELOPMENT_RULES.md) (generic methodology).

**Status legend:** `Open` · `Deferred` (decided not now) · `Done` (resolved) ·
**Priority:** `low` / `med` / `high`.

### Entry template (copy for new debt)
```
### TD-NN: <short title>
- **What:** <the shortcut / nuance>
- **Why it's debt:** <cost / risk if left>
- **Trigger to address:** <the condition that should make us fix it>
- **Priority:** low | med | high
- **Status:** Open
- **Log:** YYYY-MM-DD created.
```

---

### TD-01: Folder structure is type-based, not feature-based
- **What:** Frontend is grouped by kind (`screens/`, `services/`, `ui/`, `components/`) instead of the `/features/{auth,profile,nutrition,…}` layout from Rule 4.
- **Why it's debt:** As features grow, related code spreads across folders; harder to navigate and to keep a feature self-contained.
- **Trigger to address:** When the app gains a 2nd–3rd substantial feature area, or when a change repeatedly spans many folders. Migrate one feature at a time.
- **Priority:** low (fine at current size)
- **Status:** Open
- **Log:** 2026-05-30 created. 2026-05-31 deferred — AI-analysis upgrade added one small `lib/` (presentation helpers); structure still fine at this size.

### TD-02: No automated tests
- **What:** No test runner or specs anywhere in the repo.
- **Why it's debt:** Deterministic business logic (esp. `profileService.calculateTargets`) and Firestore-touching services can regress silently.
- **Trigger to address:** Before adding non-trivial logic to a service, or before changing the nutrition formula. Start with unit tests for `calculateTargets` (pure, easy to cover) and `mealService` mapping.
- **Priority:** med
- **Status:** Open
- **Log:** 2026-05-30 created. 2026-05-31 **partially addressed** — added Vitest (`npm test`) + 11 unit tests for the new `web/src/lib/nutrition.ts` presentation helpers (`confidenceBand`, `formatCalories`, `isLowConfidence`, `hasPortion`). Still untested: `calculateTargets`, `mealService` mapping, and the server `/analyze` normalization caps → keep Open.

### TD-03: Missing rule-mandated docs
- **What:** `AI_DEVELOPMENT_RULES.md` expects `ARCHITECTURE.md`, `DATA_MODEL.md`, `DEPLOYMENT.md`, `NUTRITION_LOGIC.md`; only `README.md` + `PROJECT_CONTEXT.md` exist.
- **Why it's debt:** Onboarding context is partly implicit; some rules reference docs that aren't there.
- **Trigger to address:** When `README.md` / `PROJECT_CONTEXT.md` stop being enough, or before onboarding another contributor. Likely fold most content into the two existing docs rather than create four thin files.
- **Priority:** low
- **Status:** Open
- **Log:** 2026-05-30 created. 2026-05-31 deferred — folded the new analysis behavior/fields into `PROJECT_CONTEXT.md` instead of spinning up separate docs.

### TD-04: Firebase SDK on v9
- **What:** `web` depends on `firebase@^9.23.0`; current major is much newer.
- **Why it's debt:** Misses fixes/perf; larger jumps get harder the longer we wait.
- **Trigger to address:** When touching Firebase init/auth/Firestore code anyway, or when a needed feature/fix requires a newer version. Test auth (popup + redirect) and Firestore reads after upgrading.
- **Priority:** low
- **Status:** Open
- **Log:** 2026-05-30 created. 2026-05-31 deferred — AI-analysis upgrade didn't touch Firebase init/auth; the new meal fields are additive and SDK-agnostic.

### TD-05: Server `/analyze` normalization is untested
- **What:** The new evidence-first pipeline added non-trivial normalization in `server/server.js` (calorie-range clamping `min ≤ calories ≤ max`, `healthScore` 0–100, `mealType`/`imageQuality` enum coercion, array defaults, `recommendations`/`warnings` slicing, `portionSize`→null). There is no test runner in `server/`.
- **Why it's debt:** This logic guards what gets written to the prod `meals` collection; a regression could persist malformed data for real users.
- **Trigger to address:** When extracting the normalization into a pure function, or next time the schema changes. Extract `normalizeAnalysis(input)` and unit-test it (Vitest now exists in `web/`; mirror it in `server/`).
- **Priority:** med
- **Status:** Open
- **Log:** 2026-05-31 created (during the AI-analysis upgrade; deferred extracting/testing to keep the diff focused).
