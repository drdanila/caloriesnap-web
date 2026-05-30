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

The server needs `ANTHROPIC_API_KEY` (set as a Cloud Run env var / GitHub Secret).

## Deploy

CI deploys automatically on push to `main` (see `.github/workflows/deploy.yml`):
the frontend goes to Firebase Hosting and the server to Cloud Run.

Manual frontend deploy from repo root:
```bash
npm run deploy   # builds web/ and deploys hosting + firestore rules/indexes
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
