<<<<<<< HEAD
const path = require('path');
const fs = require('fs');
=======
>>>>>>> d31d5d8e01b81c4ae82f7b3fa58cbf901e2d1d32
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const aiRoutes = require('./routes/aiRoutes');
<<<<<<< HEAD
=======

>>>>>>> d31d5d8e01b81c4ae82f7b3fa58cbf901e2d1d32
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

<<<<<<< HEAD
// --- Core middleware ---
// CLIENT_URL can be a single origin or a comma-separated list (useful when
// you need both the Vite dev server and a deployed frontend URL to work).
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
=======
// ======================================================
// CORS
// ======================================================

const allowedOrigins = (
  process.env.CLIENT_URL ||
  'http://localhost:5173'
)
  .split(',')
  .map((origin) => origin.trim())
>>>>>>> d31d5d8e01b81c4ae82f7b3fa58cbf901e2d1d32
  .filter(Boolean);

app.use(
  cors({
<<<<<<< HEAD
    origin(origin, callback) {
      // Allow no-origin requests (curl, mobile apps, same-origin) and any
      // configured origin.
      if (!origin || allowedOrigins.includes(origin)) {
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

// --- API routes ---
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/ai', aiRoutes);

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
=======
    origin: function (origin, callback) {
      // Allow requests without an Origin header
      // such as curl, Postman, server-to-server requests, etc.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log('Blocked CORS origin:', origin);

      return callback(
        new Error(`CORS: origin ${origin} is not allowed.`)
      );
    },

    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS'
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization'
    ]
  })
);

// ======================================================
// BODY PARSING
// ======================================================

app.use(express.json({ limit: '10mb' }));

app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb'
  })
);

// ======================================================
// LOGGING
// ======================================================

if (process.env.NODE_ENV !== 'test') {
  app.use(
    morgan(
      process.env.NODE_ENV === 'production'
        ? 'combined'
        : 'dev'
    )
  );
}

// ======================================================
// HEALTH CHECK
// ======================================================

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Citizen Complaint Portal backend service.'
  });
});

// ======================================================
// API ROUTES
// ======================================================

app.use('/api/auth', authRoutes);

app.use('/api/complaints', complaintRoutes);

app.use('/api/ai', aiRoutes);

// ======================================================
// 404 + ERROR HANDLING
// ======================================================

app.use(notFound);

app.use(errorHandler);

// ======================================================
// EXPORT
// ======================================================

module.exports = app;
>>>>>>> d31d5d8e01b81c4ae82f7b3fa58cbf901e2d1d32
