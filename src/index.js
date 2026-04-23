/**
 * Main Application Entry Point
 *
 * This file serves as the primary entry point for the SaaS application.
 * It handles server initialization, database connection, and graceful startup.
 *
 * Features:
 * - Environment variable loading
 * - Database connection initialization
 * - Server startup with error handling
 * - Graceful process management
 */

import dotenv from "dotenv";
import app from "./app.js";
import { databaseConfig } from "./config/database.js";

// Load environment variables from .env file
// This must be done before any other imports that depend on env vars
dotenv.config();

const PORT = process.env.PORT || 8080;

/**
 * Initializes and starts the Express server
 *
 * This function handles the complete server startup process:
 * 1. Establishes database connection
 * 2. Starts the HTTP server on specified port
 * 3. Provides startup feedback and error handling
 *
 * @async
 * @function startServer
 * @returns {Promise<void>}
 */
async function startServer() {
  try {
    // Initialize database connection first
    // This ensures DB is ready before accepting requests
    await databaseConfig();

    // Start the Express server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    // Log critical startup errors
    console.error("Failed to start server:", error);

    // Exit with error code to indicate startup failure
    // This is important for container orchestration and monitoring
    process.exit(1);
  }
}

// Initiate server startup
startServer();
