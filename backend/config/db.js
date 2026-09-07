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
    });
  } catch (error) {
    console.error(`[MongoDB] Failed to connect: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;