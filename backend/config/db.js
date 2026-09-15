<<<<<<< HEAD
const dns = require('dns');
const mongoose = require('mongoose');

// Ensure reliable SRV resolution on Windows for MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore if unsupported in environment
}

/**
 * Connects to MongoDB Atlas using the URI in the environment variables.
 * Exits the process if the connection fails, since the API is useless
 * without a database connection.
 */
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error(`[MongoDB] Connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Disconnected. Attempting to reconnect is handled by the driver.');
=======
const mongoose = require("mongoose");
const dns = require("dns");

// Force Node.js to use public DNS instead of the problematic local DNS.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in .env file");
    }

    console.log("[MongoDB] Connecting to MongoDB Atlas...");

    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(
      `[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`
    );

    mongoose.connection.on("error", (err) => {
      console.error(`[MongoDB] Connection error: ${err.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("[MongoDB] Disconnected.");
>>>>>>> d31d5d8e01b81c4ae82f7b3fa58cbf901e2d1d32
    });
  } catch (error) {
    console.error(`[MongoDB] Failed to connect: ${error.message}`);
    process.exit(1);
  }
};

<<<<<<< HEAD
module.exports = connectDB;
=======
module.exports = connectDB;
>>>>>>> d31d5d8e01b81c4ae82f7b3fa58cbf901e2d1d32
