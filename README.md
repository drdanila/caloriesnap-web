# CalorieSnap

Photograph your meal. Know what you eat.

A React PWA for meal image analysis using Claude AI and Firebase.

## Project structure

```
caloriesnap-web/
├─ web/                 # Frontend — React + TypeScript + Vite (PWA)
│  ├─ src/
│  ├─ public/
│  ├─ index.html
│  ├─ vite.config.ts
│  └─ package.json
├─ server/              # Backend — Express API on Cloud Run (Claude analysis)
│  ├─ server.js
│  ├─ Dockerfile
│  └─ package.json
├─ firebase.json        # Firebase Hosting + Firestore config
├─ firestore.rules      # Firestore security rules
├─ firestore.indexes.json
├─ .github/workflows/   # CI/CD (deploy frontend + server)
└─ package.json         # Root orchestrator scripts (dev / build / deploy)
```

## Docs / working in this repo

These four files form a connected set. **AI sessions: start at `CLAUDE.md`** — it is
auto-loaded and links to the rest.

- **[CLAUDE.md](CLAUDE.md)** — session entrypoint: CalorieSnap rules, practices, and features. Read every session; imports the debt backlog.
- **[PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)** — current architecture, services, data model, features, environment (≤1000 words).
- **[TECH_DEBT.md](TECH_DEBT.md)** — living tech-debt backlog; reviewed every session.
- **[AI_DEVELOPMENT_RULES.md](AI_DEVELOPMENT_RULES.md)** — generic development methodology.

## Setup

1. Copy the env template and fill in Firebase credentials:
   ```bash
   cp web/.env.example web/.env
   ```

2. Install dependencies (frontend and backend are separate):
   ```bash
   npm install --prefix web
   npm install --prefix server
   ```

3. Run the frontend locally (from repo root):
   ```bash
   npm run dev
   ```
   Opens http://localhost:3000

4. (Optional) Run the API server locally:
   ```bash
   npm run dev:server   # needs ANTHROPIC_API_KEY in the environment
   ```

## Environment variables

Frontend vars live in `web/.env` (or GitHub Secrets for CI/CD):

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=eatappmain-e7503
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_API_URL=            # URL of the Cloud Run API (defaults to localhost:8080)
```

The server needs `ANTHROPIC_API_KEY` and `STORAGE_BUCKET` (set as Cloud Run env
vars by CI; `STORAGE_BUCKET` falls back to the prod bucket if unset).

## Environments

Two isolated Firebase projects, each with its own Firestore/Auth/Storage/Hosting
and Cloud Run service:

| Env | Firebase project | Used for |
|-----|------------------|----------|
| **prod** | `eatappmain-e7503` | stable app, real users |
| **staging** | `caloriesnap-staging` | testing changes before prod |

Per-environment config lives in **GitHub Environments** (`production` / `staging`)
as secrets/variables; `.firebaserc` maps the `prod`/`staging` aliases.

## Deploy

CI (see `.github/workflows/deploy.yml`):

- **Open/update a PR → deploys to staging.**
- **Merge to `main` → deploys to prod.**

Each run builds the frontend with that environment's Firebase config, deploys
Hosting + Firestore/Storage rules, builds & pushes the server image, and deploys
Cloud Run.

Manual single-project deploy from repo root:
```bash
firebase deploy --project staging --only hosting,firestore:rules,firestore:indexes,storage
```

## Architecture

- **Frontend:** React + TypeScript + Vite (`web/`), deployed to Firebase Hosting
- **Backend:** Express API (`server/`) on Google Cloud Run
- **Database:** Firestore (`meals`, `userProfiles` collections)
- **AI:** Anthropic Claude API (called from the server)
- **Auth:** Firebase Google Sign-In (redirect on mobile, popup on desktop)

## Features

- 📸 Photograph meals or pick from gallery
- 🤖 Get instant AI nutrition analysis
- 📊 Personalized daily calorie + macro targets (profile-based)
- 📅 View meal history with stats
- 🔐 Google Sign-In authentication
