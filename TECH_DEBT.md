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
- **Log:** 2026-05-30 created.

### TD-02: No automated tests
- **What:** No test runner or specs anywhere in the repo.
- **Why it's debt:** Deterministic business logic (esp. `profileService.calculateTargets`) and Firestore-touching services can regress silently.
- **Trigger to address:** Before adding non-trivial logic to a service, or before changing the nutrition formula. Start with unit tests for `calculateTargets` (pure, easy to cover) and `mealService` mapping.
- **Priority:** med
- **Status:** Open
- **Log:** 2026-05-30 created.

### TD-03: Missing rule-mandated docs
- **What:** `AI_DEVELOPMENT_RULES.md` expects `ARCHITECTURE.md`, `DATA_MODEL.md`, `DEPLOYMENT.md`, `NUTRITION_LOGIC.md`; only `README.md` + `PROJECT_CONTEXT.md` exist.
- **Why it's debt:** Onboarding context is partly implicit; some rules reference docs that aren't there.
- **Trigger to address:** When `README.md` / `PROJECT_CONTEXT.md` stop being enough, or before onboarding another contributor. Likely fold most content into the two existing docs rather than create four thin files.
- **Priority:** low
- **Status:** Open
- **Log:** 2026-05-30 created.

### TD-04: Firebase SDK on v9
- **What:** `web` depends on `firebase@^9.23.0`; current major is much newer.
- **Why it's debt:** Misses fixes/perf; larger jumps get harder the longer we wait.
- **Trigger to address:** When touching Firebase init/auth/Firestore code anyway, or when a needed feature/fix requires a newer version. Test auth (popup + redirect) and Firestore reads after upgrading.
- **Priority:** low
- **Status:** Open
- **Log:** 2026-05-30 created.
