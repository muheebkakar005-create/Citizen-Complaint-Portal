# Citizen Complaint Portal — Full Stack

A civic-tech platform where citizens report local problems (roads, garbage,
water, electricity), track and upvote them, and government officers triage,
update status, and view an AI-generated daily briefing.

```
.
├── backend/    Express + MongoDB (Mongoose) REST API
└── frontend/   React + Vite + Tailwind single-page app
```

The frontend talks to the backend exclusively through `/api/*` routes. In
development, Vite proxies those requests to the backend for you — the
browser only ever sees one origin, so there's nothing to configure.

## 1. Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster (or any MongoDB connection string)

## 2. Backend setup

```bash
cd backend
npm install
```

A `.env` file has **already been created for you** in `backend/.env`,
pre-filled with the MongoDB connection string you provided, plus a randomly
generated `JWT_SECRET`. Open it and check two things before you run anything:

1. **`MONGODB_URI`** — confirm it's correct. It's currently set to:
   `mongodb+srv://<user>:<password>@cluster0.lmwrcmw.mongodb.net/citizen-complaint-portal?...`
   (a database name of `citizen-complaint-portal` was added since the URI
   you shared didn't include one — Atlas will create it automatically on
   first write).
2. **Atlas Network Access** — in the Atlas dashboard, under *Network Access*,
   make sure the IP address you'll be running this from is allow-listed (or
   temporarily add `0.0.0.0/0` while you're developing). Without this, the
   connection will time out no matter how correct the URI is.

> ⚠️ **About that database password**: it was pasted directly into our chat,
> which means it's no longer just-yours-and-Atlas's. It's wired into
> `backend/.env` (which is git-ignored) so the app works out of the box, but
> once you've confirmed everything runs, it's worth rotating that database
> user's password in Atlas (Database Access → edit user → Edit Password) and
> updating `.env` with the new one. Also never commit `.env` — the
> `.gitignore` already excludes it.

Then seed some demo data and start the API:

```bash
npm run seed   # creates 1 officer + 5 citizens + ~15 demo complaints
npm run dev    # starts the API on http://localhost:5000 (nodemon, auto-reload)
```

You should see `[MongoDB] Connected: ...` in the terminal. If instead you see
a connection error, it's almost always the Network Access allow-list above.

Demo accounts (also printed by the seed script):

| Role    | Email                     | Password      |
|---------|---------------------------|---------------|
| Officer | officer@civicportal.gov   | Officer@123   |
| Citizen | ayesha@example.com        | Citizen@123   |
| Citizen | bilal@example.com         | Citizen@123   |

## 3. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
npm run dev    # starts on http://localhost:5173
```

Open http://localhost:5173 — the app is now fully connected: sign up, log
in as a citizen or officer (see demo accounts above), file complaints,
upvote, and use the officer dashboard.

## 4. Optional: Google Gemini AI briefing

The officer dashboard's "AI Daily Briefing" works out of the box using a
local, deterministic summary — no API key required. To get real Gemini-
generated summaries instead, get a key from
[Google AI Studio](https://aistudio.google.com/apikey) and set it in
`backend/.env`:

```
GEMINI_API_KEY=your-key-here
```

Restart the backend after adding it. If the key is missing, invalid, or the
call fails for any reason, the app automatically falls back to the local
summary — the dashboard never breaks because of this.

## 5. Optional: image uploads via Cloudinary

By default, complaint photos are sent by the frontend as inline base64 data
URLs and stored directly on the complaint document — no extra setup needed.
If you'd rather store images on Cloudinary instead, add these to
`backend/.env` and the backend will automatically prefer a real file upload
over the base64 fallback:

```
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## 6. Production build

```bash
cd frontend
npm run build        # outputs frontend/dist
```

The backend (`backend/app.js`) automatically detects `frontend/dist` and, if
present, serves the built frontend as static files alongside the API — so in
production you can run just the backend as a single process:

```bash
cd backend
NODE_ENV=production npm start
```

Make sure `CLIENT_URL` in `backend/.env` matches wherever your frontend is
actually served from if you deploy the two separately instead.

## Project structure reference

See `backend/README.md` for a full breakdown of the API's architecture,
routes, and design decisions (priority scoring, role enforcement, error
handling, etc.).
