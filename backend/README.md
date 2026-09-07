# Citizen Complaint Portal — Backend API

A production-shaped REST API for a civic-tech complaint portal. Citizens report local
problems (roads, garbage, water, electricity), track and upvote them; officers
triage, update status, and get an AI-generated daily briefing.

This package is **backend only** (Node.js/Express/MongoDB). It exposes a REST API
that any frontend (React, Next.js, mobile, etc.) can consume.

## Features

- JWT authentication with bcrypt password hashing
- Two roles — `citizen` and `officer` — enforced server-side (role is never
  trusted from the client)
- Complaint CRUD with ownership rules (citizens can only edit/feedback their own)
- Dynamic, non-editable priority scoring: `score = upvotes*2 + daysSinceCreated`
- Duplicate-complaint detection support (filter by category + area + open status)
- One-vote-per-user upvoting
- Officer status updates + remarks, with automatic `feedbackPending` flagging on resolution
- Citizen 1–5 star feedback, restricted to the complaint owner, once per complaint
- Satisfaction statistics aggregation for the officer dashboard
- AI Daily Briefing via Google Gemini, with a **guaranteed local fallback** if
  the API key is missing or the call fails — the dashboard never breaks
- CSV export (`json2csv`) honoring the same search/filter params as the feed
- Optional Cloudinary + Multer image upload (app works fine without it)
- Centralized error handling with correct status codes (400/401/403/404/409/500)
- Demo seed script with realistic, varied complaints

## Tech Stack

| Layer          | Choice                                   |
|----------------|-------------------------------------------|
| Runtime        | Node.js 18+                               |
| Framework      | Express.js                                |
| Database       | MongoDB Atlas + Mongoose                  |
| Auth           | JWT + bcryptjs                            |
| Validation     | express-validator                         |
| AI             | Google Gemini (`@google/genai`)           |
| CSV            | json2csv                                  |
| Images         | Multer (memory) + Cloudinary (optional)   |

## Project Structure

```
backend/
├── app.js                    # Express app (middleware + route mounting)
├── server.js                 # Entry point (loads env, connects DB, listens)
├── config/
│   ├── db.js                 # MongoDB connection
│   └── cloudinary.js         # Optional Cloudinary config
├── controllers/
│   ├── authController.js     # signup, login, getMe
│   ├── complaintController.js# create/list/mine/export/get/upvote/status/feedback
│   └── aiController.js       # stats aggregation + Gemini briefing
├── middleware/
│   ├── authMiddleware.js     # protect, optionalAuth
│   ├── officerMiddleware.js  # officerOnly, citizenOnly
│   ├── errorMiddleware.js    # notFound, centralized errorHandler
│   └── uploadMiddleware.js   # multer config + validation
├── models/
│   ├── User.js
│   └── Complaint.js
├── routes/
│   ├── authRoutes.js
│   ├── complaintRoutes.js
│   └── aiRoutes.js
├── services/
│   ├── geminiService.js      # AI briefing + local fallback
│   ├── csvService.js         # CSV generation
│   └── imageUploadService.js # Cloudinary upload streaming
├── utils/
│   ├── ApiError.js
│   ├── generateToken.js
│   └── priorityCalculator.js # the dynamic priority formula
├── seed/
│   ├── seedData.js           # demo users + 18 realistic complaints
│   └── seed.js                # run to populate the database
├── .env.example
└── package.json
```

## 1. Install dependencies

```bash
cd backend
npm install
```

## 2. Set up MongoDB Atlas

1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Create a database user (username/password)
3. Add your IP (or `0.0.0.0/0` for a hackathon demo) to the network access list
4. Copy the connection string — it looks like:
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/citizen-complaint-portal?retryWrites=true&w=majority`

## 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in `.env`:

```
PORT=5000
NODE_ENV=development
MONGODB_URI=<your Atlas connection string>
JWT_SECRET=<a long random string>
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=<your Gemini API key, optional>
GEMINI_MODEL=gemini-2.5-flash
CLOUDINARY_CLOUD_NAME=<optional>
CLOUDINARY_API_KEY=<optional>
CLOUDINARY_API_SECRET=<optional>
```

- **Gemini is optional.** If `GEMINI_API_KEY` is blank or the call fails, the
  `/api/ai/officer-summary` endpoint automatically returns a locally computed
  summary instead of erroring.
- **Cloudinary is optional.** If not configured, complaints can still be
  created — image upload is silently skipped instead of failing the request.

### Getting a Gemini API key
Visit https://aistudio.google.com/app/apikey, create a key, and paste it into `GEMINI_API_KEY`.

## 4. Seed the database (demo data)

```bash
npm run seed
```

This creates:

- 1 officer account
- 5 citizen accounts
- 18 complaints across all categories, areas, statuses, ages, and upvote counts
  (including resolved complaints with feedback already given, so the
  satisfaction stats and AI briefing have real data to summarize)

Printed to the console after seeding:

```
Officer -> email: officer@civicportal.gov | password: Officer@123
Citizen -> email: ayesha@example.com     | password: Citizen@123
Citizen -> email: bilal@example.com      | password: Citizen@123
... (5 total)
```

To wipe the database without reseeding: `npm run seed:destroy`

## 5. Run the server

```bash
npm run dev     # nodemon, auto-restart on changes
# or
npm start       # plain node
```

Server starts on `http://localhost:5000` (or your `PORT`). Health check:

```bash
curl http://localhost:5000/api/health
```

## API Documentation

All responses are JSON: `{ success: boolean, message?, ...data }`.
Protected routes require `Authorization: Bearer <token>`.

### Auth

| Method | Route              | Access  | Description                          |
|--------|--------------------|---------|---------------------------------------|
| POST   | `/api/auth/signup` | Public  | Register a citizen (`role` is always forced to `citizen`) |
| POST   | `/api/auth/login`  | Public  | Login, returns `{ token, user }`     |
| GET    | `/api/auth/me`     | Private | Return the current authenticated user |

**Signup body:** `{ name, email, password, confirmPassword }`
**Login body:** `{ email, password }`
JWT payload: `{ userId, role }`.

### Complaints

| Method | Route                              | Access            | Description |
|--------|--------------------------------------|-------------------|-------------|
| POST   | `/api/complaints`                  | Citizen           | Create complaint (JSON body with `imageUrl` string, or multipart/form-data with an `image` file) |
| GET    | `/api/complaints`                  | Public            | Search/filter/sort feed |
| GET    | `/api/complaints/duplicates`       | Public            | Pre-submission duplicate check by `category` + `area` |
| GET    | `/api/complaints/mine`             | Citizen           | Complaints filed by the logged-in user |
| GET    | `/api/complaints/export`           | Officer           | CSV download honoring active filters |
| GET    | `/api/complaints/stats/dashboard`  | Officer           | Aggregated dashboard statistics (no AI call) |
| GET    | `/api/complaints/stats/satisfaction` | Officer         | Citizen feedback / satisfaction analytics |
| GET    | `/api/complaints/:id`              | Public            | Full complaint detail |
| PATCH  | `/api/complaints/:id/upvote`       | Citizen           | Upvote (one vote per user) |
| PATCH  | `/api/complaints/:id/status`       | Officer           | Update `status` and/or `officerRemark` |
| PATCH  | `/api/complaints/:id/feedback`     | Citizen (owner)   | Submit `feedbackRating` (1-5) + optional `feedbackComment` |
| DELETE | `/api/complaints/:id`              | Owner or Officer  | Delete a complaint |

**Create complaint body:** `{ title, description, category, area, imageUrl? }`.
`imageUrl` can be a base64 data URL (what the bundled frontend sends) or a
plain URL string; it's optional either way. `category` must be one of
`Road | Garbage | Water | Electricity | Other`.
Every complaint in API responses includes a flat `createdBy` (string user id),
`creatorName`, `creatorEmail`, `upvotedBy` (array of string user ids), and,
when a token is sent, `hasUpvoted`/`isOwner` booleans relative to the caller.

**Query params on `GET /api/complaints` (and `/export`):**
- `search` — matches title/description/area (case-insensitive)
- `category` — exact match
- `area` — partial match
- `status` — comma-separated: `pending,in-progress,resolved`
- `priority` — comma-separated: `LOW,MEDIUM,HIGH,CRITICAL` (computed dynamically)
- `sort` — `newest` (default) | `upvotes` | `priority`
- `page`, `limit` — pagination (defaults: page 1, limit 100)

**Duplicate-detection endpoint (used by the frontend before submit):**
```
GET /api/complaints/duplicates?category=Road&area=Downtown
```
Returns open (`pending`/`in-progress`) complaints in the same category whose
area loosely matches. If `hasDuplicates` is true, show the user "A similar
complaint already exists" with options to upvote the existing one or submit
anyway.

**Update status body:** `{ status?, officerRemark? }` — setting `status: "resolved"`
automatically sets `feedbackPending: true` on the complaint.

**Feedback body:** `{ feedbackRating: 1-5, feedbackComment? }` — rejected with
403 if you're not the owner, 400 if the complaint isn't resolved yet, 409 if
feedback was already given.

### AI

| Method | Route                      | Access  | Description |
|--------|-----------------------------|---------|-------------|
| POST   | `/api/ai/officer-summary`  | Officer | Aggregates live stats, asks Gemini for a 3-5 sentence briefing, returns `{ summary, isAiGenerated, generatedAt, stats }` |

### Priority Scoring (computed on every read, never stored as trusted input)

```
priorityScore = upvotes * 2 + daysSinceCreated

score < 5    -> LOW
score 5-15   -> MEDIUM
score 16-30  -> HIGH
score > 30   -> CRITICAL
```

### Error format

```json
{ "success": false, "message": "Human-readable explanation" }
```

| Status | Meaning                                   |
|--------|--------------------------------------------|
| 400    | Invalid input / validation failure          |
| 401    | Missing/invalid/expired JWT                 |
| 403    | Authenticated, but wrong role / not the owner |
| 404    | Resource or route not found                 |
| 409    | Conflict (duplicate email, duplicate upvote, duplicate feedback) |
| 500    | Unexpected server error                     |

## Security Notes

- Passwords are hashed with bcrypt (`select: false` on the schema field, and
  stripped from all JSON responses as defense-in-depth).
- `role` and `createdBy` are **never** read from the request body — `role` is
  hardcoded to `citizen` on signup, and `createdBy` always comes from the
  verified JWT (`req.user._id`).
- Officer-only routes are protected by `protect` (auth) **and** `officerOnly`
  (role check) — a valid citizen JWT gets a 403, not a 401, on those routes.
- The Gemini API key and Cloudinary secret live only in backend environment
  variables and are never sent to the client.
- CORS is restricted to `CLIENT_URL`.

## Deployment (Render / Railway)

1. Push this backend to its own GitHub repo (or a `backend/` subfolder).
2. Create a new Web Service pointing at it.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all variables from `.env.example` in the host's environment variable
   settings (use your real MongoDB Atlas URI, a strong `JWT_SECRET`, your
   deployed frontend's URL as `CLIENT_URL`, and your Gemini/Cloudinary keys
   if you have them).
6. After deploying, run the seed script once via the platform's shell/console:
   `npm run seed`.

## Demo Accounts (after seeding)

| Role    | Email                        | Password      |
|---------|-------------------------------|----------------|
| Officer | officer@civicportal.gov      | Officer@123    |
| Citizen | ayesha@example.com           | Citizen@123    |
| Citizen | bilal@example.com            | Citizen@123    |
| Citizen | sara@example.com             | Citizen@123    |
| Citizen | hamza@example.com            | Citizen@123    |
| Citizen | fatima@example.com           | Citizen@123    |

## Future Improvements

- Real-time updates via Socket.io (e.g. live status changes on the feed)
- Rate limiting on auth + upvote endpoints
- Refresh tokens / token rotation
- Geolocation (lat/lng) on complaints for map-based views
- Automated tests (Jest + Supertest) wired into CI
