// Load env vars first (needed both locally via server.js AND on Vercel via app.js)
require('dotenv').config();

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// --- Database connection (serverless-safe) ---
// Cache the promise so we connect once per container lifetime, not once per request.
// Each incoming request awaits this promise before hitting any route handler.
let dbConnectionPromise = null;

const ensureDBConnected = async (req, res, next) => {
  try {
    if (!dbConnectionPromise) {
      dbConnectionPromise = mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000, // fail fast on Vercel cold start
        socketTimeoutMS: 45000,
      });
    }
    await dbConnectionPromise;
    next();
  } catch (err) {
    console.error('[MongoDB] Connection failed:', err.message);
    res.status(503).json({ success: false, message: 'Database unavailable. Please try again.' });
  }
};

const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const aiRoutes = require('./routes/aiRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// --- Core middleware ---
// CLIENT_URL can be a single origin or a comma-separated list (useful when
// you need both the Vite dev server and a deployed frontend URL to work).
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow no-origin requests (curl, mobile apps, same-origin) and any
      // configured origin. Also allow any *.vercel.app subdomain so that
      // Vercel preview deployments can reach the backend without env changes.
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^https:\/\/.*\.vercel\.app$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: origin ${origin} is not allowed.`));
    },
    credentials: true,
  })
);
// Limit is higher than the default because the frontend submits complaint
// photos as base64 data URLs inside the JSON body, not multipart uploads.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Citizen Complaint Portal API is running.' });
});

// --- API routes (all require DB connection) ---
app.use('/api/auth', ensureDBConnected, authRoutes);
app.use('/api/complaints', ensureDBConnected, complaintRoutes);
app.use('/api/ai', ensureDBConnected, aiRoutes);

// --- Optionally serve the built frontend as static files ---
// If ../frontend/dist exists (i.e. `npm run build` was run in the frontend
// project) this lets a single backend process serve the whole app in
// production. In local dev, the Vite dev server handles the frontend
// separately and this block is simply skipped.
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// --- 404 + centralized error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
