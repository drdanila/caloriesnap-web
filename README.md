# CalorieSnap Web

Photograph your meal. Know what you eat.

A React PWA for meal image analysis using Claude AI and Firebase.

## Setup

1. Copy `.env.example` to `.env` and fill in Firebase credentials:
   ```bash
   cp .env.example .env
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run locally:
   ```bash
   npm run dev
   ```
   Opens http://localhost:3000

## Firebase Setup

The app uses the **same Firebase project** as the React Native version:
- **Project ID:** `eatappmain-e7503`
- **Cloud Functions:** `analyzeMeal` (backend)
- **Firestore:** `meals` collection (same schema)
- **Auth:** Google Sign-In

## Environment Variables

Add these to `.env` (or GitHub Secrets for CI/CD):

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=eatappmain-e7503
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_GOOGLE_CLIENT_ID=
```

## Deploy

```bash
npm run deploy
```

This builds the app and deploys to Firebase Hosting.

## Architecture

- **Frontend:** React + TypeScript + Vite
- **Backend:** Firebase Cloud Functions (Node.js)
- **Database:** Firestore
- **AI:** Anthropic Claude API (called via Cloud Function)
- **Hosting:** Firebase Hosting

## Features

- 📸 Photograph meals or pick from gallery
- 🤖 Get instant AI nutrition analysis
- 📊 Track daily calories and macros
- 📅 View meal history with stats
- 🔐 Google Sign-In authentication
