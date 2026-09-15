<<<<<<< HEAD
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
=======
>>>>>>> d31d5d8e01b81c4ae82f7b3fa58cbf901e2d1d32
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
