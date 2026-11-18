import mongoose from "mongoose";
import { config } from "./config.js";
import { createApp } from "./app.js";

async function start() {
  try {
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Could not connect to MongoDB:", err.message);
    process.exit(1);
  }

  createApp().listen(config.port, () =>
    console.log(`Server running on port ${config.port}`)
  );
}

start();
