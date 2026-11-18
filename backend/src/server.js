import app from "./app.js";
import { config } from "./config/env.js";
import { connectDatabase } from "./config/db.js";

/**
 * Connects to MongoDB and starts the HTTP server.
 * @returns {Promise<void>} Resolves when the listener is ready.
 * @throws {Error} When database startup fails.
 */
const startServer = async () => {
  await connectDatabase();
  app.listen(config.port, () => {
    console.log(`Jules API listening on port ${config.port}.`);
  });
};

startServer().catch((error) => {
  console.error("Server startup failed.", error);
  process.exitCode = 1;
});