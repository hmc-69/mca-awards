# Farewell Awards 2026 🏆

> A full-stack mobile-first voting web app with black & gold UI, Firebase backend, FingerprintJS anti-duplicate voting, and an admin dashboard.

---

## Project Structure

```
mca-awards/
├── frontend/     # Vite + React + TailwindCSS + Framer Motion
└── backend/      # Node.js + Express + Firebase Admin
```

---

## Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) → Create project (or use existing)
2. Enable **Firestore Database** (Start in production mode)
3. Go to **Project Settings → Service Accounts** → Generate new private key → Download JSON
4. Copy the values into `backend/.env`

### 2. Backend

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
copy .env.example .env
# → Edit .env with your Firebase credentials from the downloaded JSON

# Start the API server
npm start
# or for auto-reload during development:
npm run dev
```

The API will be running at `http://localhost:3001`

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Environment Variables (backend/.env)

| Variable | Where to find it |
|-|-|
| `FIREBASE_PROJECT_ID` | Firebase JSON → `project_id` |
| `FIREBASE_CLIENT_EMAIL` | Firebase JSON → `client_email` |
| `FIREBASE_PRIVATE_KEY` | Firebase JSON → `private_key` (keep the quotes!) |
| `ADMIN_SECRET` | Any password you choose (default: `farewell2026admin`) |
| `PORT` | Leave as `3001` |

---

## Pages

| Route | Page |
|-|-|
| `/` | Landing Page |
| `/vote` | Voting Page (10 award categories) |
| `/success` | Submission Success + receipt |
| `/admin` | Admin Dashboard (password-protected) |

### Admin Access

Navigate to `http://localhost:5173/admin` and enter password `farewell2026admin`
— or shortcut: `http://localhost:5173/admin?secret=farewell2026admin`

---

## API Endpoints

| Method | Endpoint | Description |
|-|-|-|
| `POST` | `/api/votes` | Submit votes (dedup via FingerprintJS) |
| `GET` | `/api/results` | Aggregated top nominees per category |
| `GET` | `/api/votes` | All votes (admin, header: `x-admin-secret`) |
| `GET` | `/api/health` | Health check |

---

## How Duplicate Prevention Works

1. **FingerprintJS** generates a unique `visitorId` in the browser (based on browser/device fingerprint)
2. On submission, `visitorId` is sent to the backend
3. Backend uses `visitorId` as the **Firestore document ID** in the `votes` collection
4. Firestore rejects duplicate doc writes → `409 Conflict` returned
5. Additionally, `localStorage['voted'] = 'true'` prevents re-opening the voting form

---

## Firestore Security Rules

In Firebase Console → Firestore → Rules, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /votes/{visitorId} {
      allow read, write: if false; // all access via backend only
    }
  }
}
```
# mca-awards
