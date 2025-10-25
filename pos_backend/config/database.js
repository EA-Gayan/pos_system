const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  // Reuse connection in both dev and prod
  if (isConnected) {
    console.log("Using existing MongoDB connection");
    return;
  }

  // Prevent multiple connections during hot reload
  if (mongoose.connection.readyState >= 1) {
    isConnected = true;
    return;
  }

  try {
    mongoose.set("strictQuery", false);

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
    });

    isConnected = conn.connection.readyState === 1;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    isConnected = false;
    throw error; // Don't exit in dev or prod
  }
};

module.exports = connectDB;
