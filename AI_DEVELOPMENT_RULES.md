# AI_DEVELOPMENT_RULES.md

> Generic development methodology for this project. CalorieSnap-specific rules,
> practices, and features live in [CLAUDE.md](CLAUDE.md) (auto-loaded each session).
> Current state: [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md). Debt backlog: [TECH_DEBT.md](TECH_DEBT.md).

## Project Mission

This project is designed for long-term growth, maintainability, and scalability.

Primary objectives:

1. Fast feature delivery.
2. Predictable architecture.
3. Minimal technical debt.
4. Easy onboarding for future AI sessions.
5. Deterministic business logic.
6. Efficient token usage.

Every new development session must start by reading and following this document.

---

# Development Principles

## Rule 1: Think Before Coding

Before implementing any feature:

* Analyze the existing architecture.
* Search for reusable components.
* Search for reusable services.
* Search for existing business logic.
* Avoid creating duplicates.

Always prefer extension over replacement.

---

## Rule 2: Preserve Architecture

Never:

* Rewrite working modules without request.
* Replace existing patterns without justification.
* Change folder structure arbitrarily.
* Introduce new frameworks.

Every architectural change must explain:

* Why it is needed.
* Benefits.
* Risks.
* Migration impact.

---

## Rule 3: Component-Driven Development

UI must be built from reusable components.

Before creating:

* Button
* Input
* Modal
* Card
* Form
* Loader
* Notification
* Dialog
* Badge
* Select

Search for an existing implementation.

If a component already exists:

USE IT.

Do not create duplicates.

---

## Rule 4: Feature-Based Structure

Organize code by business domains.

Preferred structure:

```
/features
  /auth
  /profile
  /nutrition
  /recommendations
  /subscription

/shared
  /ui
  /api
  /hooks
  /utils
  /types
```

Avoid dumping logic into:

* components/
* pages/
* utils/

---

## Rule 5: Business Logic Never Lives In UI

React components must never contain:

* calorie formulas
* recommendation formulas
* API logic
* database logic

Components display data only.

All calculations belong to services.

---

## Rule 6: Service Layer

All business logic must live in services.

Examples:

* nutritionService
* userService
* recommendationService
* analyticsService

UI → Service → Database/API

Never:

UI → Database

---

## Rule 7: LLM Safety Rules

The LLM must never invent:

* calorie values
* macro values
* user statistics
* calculated metrics

All numerical values must come from deterministic calculations.

The LLM may only:

* explain
* summarize
* personalize
* simplify

---

## Rule 8: Type Safety

Always:

* create interfaces
* create types
* avoid any

Every API response should have a type.

Every service should have typed input/output.

---

## Rule 9: Error Handling

Every feature must handle:

* loading state
* success state
* empty state
* error state

Never leave users with silent failures.

---

## Rule 10: Logging

Important operations must be logged.

Examples:

* authentication
* onboarding
* subscription actions
* nutrition calculations
* API failures

Prefer structured logs.

---

## Rule 11: Security

Never expose:

* API keys
* Firebase secrets
* environment values

Always use:

environment variables

Never hardcode credentials.

---

## Rule 12: Stage and Production Separation

Maintain:

* Stage Environment
* Production Environment

Separate:

* Firebase projects
* API endpoints
* analytics
* configuration

Never deploy experimental features directly to production.

---

## Rule 13: Database Discipline

Before creating:

* collection
* table
* field

Check existing schema.

Avoid:

* userName
* username
* name
* fullName

for the same meaning.

Use consistent naming.

---

## Rule 14: Documentation First

Whenever architecture changes:

Update documentation.

Minimum documentation:

* ARCHITECTURE.md
* DATA_MODEL.md
* DEPLOYMENT.md
* NUTRITION_LOGIC.md

Documentation must remain synchronized with implementation.

---

## Rule 15: Open Source Before Custom Training

Always prefer:

1. Existing APIs
2. Existing datasets
3. Existing models

Before suggesting:

* fine tuning
* custom training
* custom AI models

Explain why existing solutions are insufficient.

---

# Nutrition Module Rules

## Core Formula

Use **Mifflin-St Jeor** for BMR calculations.

Do not replace formula without explicit request.

## Activity Factors

* sedentary = 1.2
* light = 1.375
* moderate = 1.55
* active = 1.725
* very_active = 1.9

## Goal Logic

* maintain
* fat_loss
* muscle_gain

These goals are calculated deterministically.

The LLM must never modify calculated targets.

---

# Token Optimization Rules

At the start of every session:

1. Read this document.
2. Read architecture documentation.
3. Summarize project state in less than 300 words.
4. Identify affected modules only.
5. Avoid scanning unrelated code.
6. Reuse existing code whenever possible.
7. Minimize generated code.
8. Modify existing files before creating new files.

---

# Development Workflow

For every task:

1. Understand request.
2. Analyze existing implementation.
3. Identify reusable components.
4. Create implementation plan.
5. Implement.
6. Run validation.
7. Update documentation.
8. Provide final report.

---

# Required Final Report Format

After every completed task provide:

1. Summary
2. Changed files
3. Architecture impact
4. Risks
5. Manual testing steps
6. Future improvements

---

# Project Memory Generation

At the end of every major task automatically update [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md).

Include:

* Current architecture
* Main services
* Data model
* Completed features
* Pending features
* Known issues
* Technical debt
* Environment configuration

Maximum size: 1000 words.

This file becomes the primary context source for future AI sessions.

---

# Golden Rule

Do not optimize for speed.

Optimize for:

* Predictability
* Maintainability
* Scalability
* Reusability
* Low technical debt
* Long-term product growth
