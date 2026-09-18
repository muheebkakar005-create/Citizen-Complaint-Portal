require('dotenv').config();
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const fs = require('fs');
const dns = require('dns');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Configure reliable DNS servers for Atlas SRV resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore in environments where setServers is restricted
}

// Disable Mongoose query buffering so errors fail fast instead of hanging 10s
mongoose.set('bufferCommands', false);

// --- Database connection (serverless-safe) ---
let dbConnectionPromise = null;

const ensureDBConnected = async (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  const rawUri = process.env.MONGODB_URI || '';
  const uri = rawUri.trim().replace(/^["']|["']$/g, '');

  if (!uri) {
    return res.status(500).json({
      success: false,
      message: 'MONGODB_URI is not set in environment variables on Vercel.',
    });
  }

  try {
    if (!dbConnectionPromise || mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
      dbConnectionPromise = mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
        socketTimeoutMS: 30000,
      });
    }
    await dbConnectionPromise;
    if (mongoose.connection.readyState === 1) {
      return next();
    }
    throw new Error(`MongoDB connection readyState is ${mongoose.connection.readyState}`);
  } catch (err) {
    dbConnectionPromise = null;
    console.error('[MongoDB] Connection failed:', err.message);
    return res.status(503).json({
      success: false,
      message: `Database connection error: ${err.message}`,
    });
  }
};

const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const aiRoutes = require('./routes/aiRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// --- Fix Vercel rewrites so that Express receives the true client path ---
app.use((req, res, next) => {
  // Log for debugging (remove in production once confirmed working)
  const debugHeaders = {
    'x-now-route-matches': req.headers['x-now-route-matches'],
    'x-matched-path': req.headers['x-matched-path'],
    'x-vercel-matched-path': req.headers['x-vercel-matched-path'],
    'x-rewrite-url': req.headers['x-rewrite-url'],
    'x-vercel-url': req.headers['x-vercel-url'],
    'req.url': req.url,
    'req.originalUrl': req.originalUrl,
  };
  console.log('[PathFix] Headers:', JSON.stringify(debugHeaders));

  let truePath = null;

  // 1. x-now-route-matches: "1=api%2Fcomplaints%2F<id>" for "/(.*)" capture group
  if (req.headers['x-now-route-matches']) {
    const routeMatches = req.headers['x-now-route-matches'];
    const nextPathMatch = routeMatches.match(/(?:^|&)nextPath=([^&]+)/);
    if (nextPathMatch) {
      truePath = decodeURIComponent(nextPathMatch[1]);
    } else {
      const param1Match = routeMatches.match(/(?:^|&)1=([^&]+)/);
      if (param1Match) {
        const decoded = decodeURIComponent(param1Match[1]);
        truePath = decoded.startsWith('/') ? decoded : '/' + decoded;
      }
    }
  }

  // 2. Fallback Vercel headers
  if (!truePath) {
    truePath =
      req.headers['x-matched-path'] ||
      req.headers['x-vercel-matched-path'] ||
      req.headers['x-rewrite-url'] ||
      req.headers['x-vercel-url'] ||
      null;
  }

  // 3. If x-matched-path or truePath is just the destination script, skip it
  if (
    truePath &&
    (truePath === 'api/index.js' ||
      truePath === '/api/index.js' ||
      truePath === '/api/index' ||
      truePath === 'api/index')
  ) {
    truePath = null;
  }

  if (truePath) {
    const cleanPath = truePath.split('?')[0];
    if (cleanPath && cleanPath !== req.url.split('?')[0]) {
      const queryIdx = req.url.indexOf('?');
      const query = queryIdx !== -1 ? req.url.slice(queryIdx) : '';
      req.url = cleanPath + query;
      console.log('[PathFix] Restored req.url to:', req.url);
    }
  }

  next();
});

// --- Core middleware ---
app.use(
  cors({
    origin(origin, callback) {
      // Allow all origins for the public complaint portal API
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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
app.get(['/api/health', '/health'], (req, res) => {
  res.status(200).json({ success: true, message: 'Citizen Complaint Portal API is running.' });
});

const { body } = require('express-validator');
const { signup, login, getMe } = require('./controllers/authController');
const { protect } = require('./middleware/authMiddleware');

const loginValidation = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const signupValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').notEmpty().withMessage('Confirm password is required'),
];

// --- Direct Auth Endpoints (registered explicitly on all path variants) ---
['/api/auth/login', '/api/login', '/auth/login', '/login'].forEach((p) => {
  app.all(p, ensureDBConnected, login);
});

['/api/auth/signup', '/api/signup', '/auth/signup', '/signup'].forEach((p) => {
  app.all(p, ensureDBConnected, signup);
});

['/api/auth/me', '/api/me', '/auth/me', '/me'].forEach((p) => {
  app.all(p, ensureDBConnected, protect, getMe);
});

app.use('/api/auth', ensureDBConnected, authRoutes);
app.use('/auth', ensureDBConnected, authRoutes);
app.use('/api', ensureDBConnected, authRoutes);
app.use('/', ensureDBConnected, authRoutes);

// --- Complaints & AI Endpoints ---
app.use('/api/complaints', ensureDBConnected, complaintRoutes);
app.use('/complaints', ensureDBConnected, complaintRoutes);

app.use('/api/ai', ensureDBConnected, aiRoutes);
app.use('/ai', ensureDBConnected, aiRoutes);

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
