import mongoose from "mongoose";
import { logger } from "./logger.js";

/**
 * Database Configuration and Connection Management
 *
 * This module provides production-ready MongoDB connection management for the SaaS application.
 * It includes connection pooling, retry logic, health monitoring, and graceful shutdown handling.
 *
 * Key Features:
 * - Environment variable validation
 * - Connection pooling for performance
 * - Automatic retry on connection failures
 * - Real-time connection monitoring
 * - Graceful shutdown handling
 * - Production-optimized settings
 *
 * Security Considerations:
 * - SSL enabled in production
 * - Connection timeouts for security
 * - Proper error handling without exposing sensitive data
 */

/**
 * Database Connection Manager Class
 *
 * Handles all aspects of MongoDB connection lifecycle including:
 * - Connection establishment with retry logic
 * - Connection monitoring and health checks
 * - Event handling for connection states
 * - Graceful disconnection
 */
class Database {
  constructor() {
    this.isConnected = false; // Connection status flag
    this.connection = null; // Mongoose connection instance
  }

  /**
   * Validates Required Environment Variables
   *
   * Ensures all necessary database configuration is present before attempting connection.
   * This prevents runtime errors and provides clear feedback for configuration issues.
   *
   * @throws {Error} When required environment variables are missing
   */
  validateEnvironment() {
    const requiredEnvVars = ["DATABASE_URL", "DATABASE_NAME"];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }
  }

  /**
   * MongoDB Connection Options Configuration
   *
   * Returns optimized connection settings based on environment.
   * Production settings prioritize security and performance.
   *
   * @returns {Object} Mongoose connection configuration object
   */
  getConnectionOptions() {
    const isProduction = process.env.NODE_ENV === "production";

    return {
      // Connection Pool Settings - Optimize for concurrent requests
      maxPoolSize: isProduction ? 10 : 5, // Max connections in pool (higher for prod)
      minPoolSize: 2, // Minimum connections to maintain
      maxIdleTimeMS: 30000, // Close idle connections after 30 seconds

      // Timeout Settings - Prevent hanging connections
      serverSelectionTimeoutMS: 5000, // Server selection timeout (5 seconds)
      socketTimeoutMS: 45000, // Socket operation timeout (45 seconds)

      // Buffer Settings - Control mongoose buffering behavior
      bufferCommands: false, // Disable mongoose buffering for immediate error feedback

      // Retry Settings - Handle network issues gracefully
      retryWrites: true, // Retry write operations on failure
      retryReads: true, // Retry read operations on failure

      // Production Security Settings
      ...(isProduction && {
        ssl: true, // Enable SSL/TLS encryption
        tlsAllowInvalidCertificates: false, // Reject invalid certificates
      }),
    };
  }

  /**
   * Build Complete MongoDB Connection URI
   *
   * Constructs the full connection string from environment variables.
   * Handles URL formatting to ensure proper concatenation.
   *
   * @returns {string} Complete MongoDB connection URI
   */
  buildConnectionUri() {
    const { DATABASE_URL, DATABASE_NAME } = process.env;
    const baseUrl = DATABASE_URL.endsWith("/")
      ? DATABASE_URL.slice(0, -1)
      : DATABASE_URL;

    return `${baseUrl}/${DATABASE_NAME}`;
  }

  /**
   * Setup MongoDB Connection Event Listeners
   *
   * Monitors connection state changes and logs important events.
   * Handles graceful shutdown signals for clean application termination.
   *
   * Events Monitored:
   * - connected: Successful connection establishment
   * - error: Connection failures and errors
   * - disconnected: Connection loss
   * - reconnected: Automatic reconnection success
   */
  setupEventListeners() {
    // Connection established successfully
    mongoose.connection.on("connected", () => {
      this.isConnected = true;
      logger.info("MongoDB connected successfully", {
        database: process.env.DATABASE_NAME,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
      });
    });

    // Connection errors (network issues, authentication, etc.)
    mongoose.connection.on("error", (error) => {
      this.isConnected = false;
      logger.error("MongoDB connection error", {
        error: error.message,
        stack: error.stack,
      });
    });

    // Connection lost (network issues, server restart, etc.)
    mongoose.connection.on("disconnected", () => {
      this.isConnected = false;
      logger.warn("MongoDB disconnected");
    });

    // Automatic reconnection successful
    mongoose.connection.on("reconnected", () => {
      this.isConnected = true;
      logger.info("MongoDB reconnected");
    });

    // Graceful shutdown handlers for clean application termination
    process.on("SIGINT", this.gracefulShutdown.bind(this)); // Ctrl+C
    process.on("SIGTERM", this.gracefulShutdown.bind(this)); // Docker/Kubernetes termination
  }

  /**
   * Connect to MongoDB with Automatic Retry Logic
   *
   * Attempts to establish database connection with exponential backoff retry.
   * Essential for production environments where temporary connection issues occur.
   *
   * @param {number} maxRetries - Maximum number of retry attempts (default: 5)
   * @param {number} retryDelay - Delay between retries in milliseconds (default: 2000)
   * @returns {Promise<void>}
   * @throws {Error} When all retry attempts are exhausted
   */
  async connectWithRetry(maxRetries = 5, retryDelay = 2000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(
          `Attempting to connect to MongoDB (attempt ${attempt}/${maxRetries})`
        );

        const uri = this.buildConnectionUri();
        const options = this.getConnectionOptions();

        await mongoose.connect(uri, options);
        this.connection = mongoose.connection;

        logger.info("Database connection established successfully");
        return;
      } catch (error) {
        logger.error(`Database connection attempt ${attempt} failed`, {
          error: error.message,
          attempt,
          maxRetries,
        });

        if (attempt === maxRetries) {
          throw new Error(
            `Failed to connect to database after ${maxRetries} attempts: ${error.message}`
          );
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }

  /**
   * Gracefully shutdown database connection
   */
  async gracefulShutdown() {
    try {
      logger.info("Closing database connection...");
      await mongoose.connection.close();
      logger.info("Database connection closed successfully");
      process.exit(0);
    } catch (error) {
      logger.error("Error during database shutdown", { error: error.message });
      process.exit(1);
    }
  }

  /**
   * Check database connection health
   * @returns {Object} Connection health status
   */
  getHealthStatus() {
    const connection = mongoose.connection;

    return {
      isConnected: this.isConnected,
      readyState: connection.readyState,
      database: connection.db?.databaseName || null,
      host: connection.host || null,
      name: connection.name || null,
      models: Object.keys(mongoose.models).length,
    };
  }

  /**
   * Initialize database connection
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      // Validate environment variables
      this.validateEnvironment();

      // Set up event listeners
      this.setupEventListeners();

      // Connect with retry logic
      await this.connectWithRetry();
    } catch (error) {
      logger.error("Database initialization failed", {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}

// Create singleton instance
const database = new Database();

/**
 * Initialize database connection
 * @returns {Promise<void>}
 */
export async function databaseConfig() {
  await database.initialize();
}

/**
 * Get database health status
 * @returns {Object} Connection health information
 */
export function getDatabaseHealth() {
  return database.getHealthStatus();
}

/**
 * Close database connection
 * @returns {Promise<void>}
 */
export async function closeDatabaseConnection() {
  await database.gracefulShutdown();
}

// Export the database instance for advanced usage
export { database };
