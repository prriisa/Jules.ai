import mongoose from "mongoose";
import { config } from "./env.js";

/**
 * Connects to the configured MongoDB database before the HTTP server starts.
 * @returns {Promise<void>} Resolves after the database connection is ready.
 * @throws {Error} When MongoDB cannot be reached.
 */
export const connectDatabase = async () => {
  await mongoose.connect(config.mongoUri);
  console.log("Connected to MongoDB.");
};