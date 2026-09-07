require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`[Server] Citizen Complaint Portal API running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });

  // Graceful shutdown & crash safety - don't let unhandled rejections
  // silently kill the process without a log during a live demo.
  process.on('unhandledRejection', (err) => {
    console.error('[UnhandledRejection]', err);
    server.close(() => process.exit(1));
  });

  process.on('SIGTERM', () => {
    console.log('[Server] SIGTERM received. Shutting down gracefully.');
    server.close(() => process.exit(0));
  });
};

startServer();
